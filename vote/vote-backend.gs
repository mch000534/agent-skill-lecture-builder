// 課堂投票後端 — Google Apps Script
//
// 部署方式：
//   1. 在 Google 試算表建立新試算表，命名「課堂投票」
//   2. 點「擴充功能 > Apps Script」，貼上此程式碼，儲存
//   3. 點「部署 > 新增部署作業」，選「網路應用程式」
//      執行身分：我自己 / 存取對象：所有人（包含匿名）
//   4. 複製 Web App URL，貼入課程頁的投票 Widget 設定欄
//
// 資料模型（3 張表）：
//   Sessions : sessionId, lectureSlug, createdAt, currentQid
//   Questions: sessionId, qid, question, options(JSON), answerId
//   Votes    : sessionId, qid, choice, timestamp, hash
//
// 去重規則：(sessionId, qid, hash) 為唯一鍵。同一裝置同一題只能投一次，
//          不同題可各投一次；學生端以 softHash(sessionId + UA) 產生 hash。

var SHEET_SESSIONS  = 'sessions';
var SHEET_QUESTIONS = 'questions';
var SHEET_VOTES     = 'votes';

// --- Sheet helpers --------------------------------------------------------

function ensureSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length) sheet.appendRow(headers);
  }
  return sheet;
}

function sessionsSheet()  { return ensureSheet(SHEET_SESSIONS,  ['sessionId','lectureSlug','createdAt','currentQid']); }
function questionsSheet() { return ensureSheet(SHEET_QUESTIONS, ['sessionId','qid','question','options','answerId']); }
function votesSheet()     { return ensureSheet(SHEET_VOTES,     ['sessionId','qid','choice','timestamp','hash']); }

function findRow(sheet, predicates) {
  // predicates: array of { col: 0-based-index, eq: value }
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    var ok = true;
    for (var k = 0; k < predicates.length; k++) {
      if (rows[i][predicates[k].col] !== predicates[k].eq) { ok = false; break; }
    }
    if (ok) return { index: i + 1, data: rows[i] }; // index is 1-based
  }
  return null;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- Router ---------------------------------------------------------------

function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = p.action || 'question';
  var sid = p.s || '';
  var result;
  switch (action) {
    case 'current':   result = getCurrent(sid, p.hash || ''); break;
    case 'questions': result = listQuestions(sid);            break;
    case 'results':   result = getResults(sid, p.qid || '');  break;
    case 'question':  result = legacyGetQuestion(sid);        break; // 舊 API
    default:          result = { ok: false, error: 'unknown action' };
  }
  return jsonResponse(result);
}

function doPost(e) {
  var data;
  try { data = JSON.parse(e.postData.contents); } catch (ex) {
    return jsonResponse({ ok: false, error: 'invalid JSON' });
  }
  var result;
  switch (data.action) {
    case 'open':       result = openSession(data);       break;
    case 'register':   result = registerQuestion(data);  break;
    case 'setCurrent': result = setCurrentQuestion(data); break;
    case 'reset':      result = resetVotes(data);        break;
    case 'vote':       result = submitVote(data);        break;
    case 'create':     result = legacyCreate(data);      break; // 舊 API
    default:           result = { ok: false, error: 'unknown action' };
  }
  return jsonResponse(result);
}

// --- 新 API ---------------------------------------------------------------

// 開啟 lecture session；已存在則直接回傳。lectureSlug 僅紀錄用。
function openSession(data) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (e) { return { ok: false, error: 'busy' }; }
  try {
    var sheet = sessionsSheet();
    var sid = data.sessionId;
    if (!sid) return { ok: false, error: 'sessionId required' };
    if (findRow(sheet, [{ col: 0, eq: sid }])) return { ok: true };
    sheet.appendRow([sid, data.lectureSlug || '', new Date().toISOString(), '']);
    return { ok: true };
  } finally { try { lock.releaseLock(); } catch (e) {} }
}

// 把一題加入 session 的 question set（冪等：同 (sessionId, qid) 已存在就不寫）。
function registerQuestion(data) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (e) { return { ok: false, error: 'busy' }; }
  try {
    var sid = data.sessionId;
    var qid = data.qid;
    if (!sid || !qid) return { ok: false, error: 'sessionId and qid required' };
    var sheet = questionsSheet();
    if (findRow(sheet, [{ col: 0, eq: sid }, { col: 1, eq: qid }])) return { ok: true };
    sheet.appendRow([
      sid,
      qid,
      data.question || '',
      JSON.stringify(data.options || []),
      (data.answerId !== null && data.answerId !== undefined) ? String(data.answerId) : ''
    ]);
    return { ok: true };
  } finally { try { lock.releaseLock(); } catch (e) {} }
}

// 切換目前啟動的題目；qid 為空字串或 null 表示「停用」（學生顯示等待中）。
function setCurrentQuestion(data) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (e) { return { ok: false, error: 'busy' }; }
  try {
    var sheet = sessionsSheet();
    var sid = data.sessionId;
    var qid = data.qid || '';
    var found = findRow(sheet, [{ col: 0, eq: sid }]);
    if (!found) return { ok: false, error: 'no session' };
    sheet.getRange(found.index, 4).setValue(qid);
    return { ok: true, qid: qid };
  } finally { try { lock.releaseLock(); } catch (e) {} }
}

// 學生端 polling：回傳 { ok, qid, question, options, answerId, votedByMe }。
// votedByMe 以 query 帶的 hash 判定（同 sessionId+qid+hash 出現在 votes 表即為已投）。
function getCurrent(sid, hash) {
  var sSheet = sessionsSheet();
  var sess = findRow(sSheet, [{ col: 0, eq: sid }]);
  if (!sess) return { ok: false, error: 'no session' };
  var currentQid = sess.data[3];
  if (!currentQid) return { ok: true, qid: null };

  var qSheet = questionsSheet();
  var q = findRow(qSheet, [{ col: 0, eq: sid }, { col: 1, eq: currentQid }]);
  if (!q) return { ok: true, qid: null };

  var opts;
  try { opts = JSON.parse(q.data[3]); } catch (e) { opts = []; }

  var votedByMe = false;
  if (hash) {
    var vSheet = votesSheet();
    votedByMe = !!findRow(vSheet, [
      { col: 0, eq: sid },
      { col: 1, eq: currentQid },
      { col: 4, eq: hash }
    ]);
  }

  return {
    ok: true,
    qid: currentQid,
    question: q.data[2],
    options: opts,
    answerId: q.data[4],
    votedByMe: votedByMe
  };
}

// 列出 session 內所有題目（講者 widget 用）。
function listQuestions(sid) {
  var sheet = questionsSheet();
  var rows = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === sid) {
      var opts;
      try { opts = JSON.parse(rows[i][3]); } catch (e) { opts = []; }
      list.push({ qid: rows[i][1], question: rows[i][2], options: opts, answerId: rows[i][4] });
    }
  }
  var sess = findRow(sessionsSheet(), [{ col: 0, eq: sid }]);
  return { ok: true, currentQid: sess ? sess.data[3] : '', questions: list };
}

// 清空該 session 的所有投票（講者「重置」按鈕）。
function resetVotes(data) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (e) { return { ok: false, error: 'busy' }; }
  try {
    var sheet = votesSheet();
    var rows = sheet.getDataRange().getValues();
    var toDelete = [];
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.sessionId) toDelete.push(i + 1); // 1-based
    }
    // 由下而上刪除避免 row index 偏移
    for (var j = toDelete.length - 1; j >= 0; j--) {
      sheet.deleteRow(toDelete[j]);
    }
    return { ok: true, deleted: toDelete.length };
  } finally { try { lock.releaseLock(); } catch (e) {} }
}

// 投票：key 為 (sessionId, qid, hash)。
function submitVote(data) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (e) { return { ok: false, error: 'busy' }; }
  try {
    var sid = data.sessionId;
    var qid = data.qid;
    if (!sid || !qid) return { ok: false, error: 'sessionId and qid required' };

    // 拒絕「已暫停」或「已切到別題」的遲到投票：以 session.currentQid 為準。
    var sess = findRow(sessionsSheet(), [{ col: 0, eq: sid }]);
    if (!sess) return { ok: false, error: 'session not found' };
    var currentQid = sess.data[3];
    if (!currentQid) return { ok: false, paused: true, qid: qid };
    if (currentQid !== qid) return { ok: false, paused: true, qid: qid, currentQid: currentQid };

    var sheet = votesSheet();
    var hash = data.hash || '';
    if (hash) {
      if (findRow(sheet, [{ col: 0, eq: sid }, { col: 1, eq: qid }, { col: 4, eq: hash }])) {
        return { ok: false, duplicate: true };
      }
    }
    sheet.appendRow([sid, qid, data.choice, new Date().toISOString(), hash]);
    return { ok: true };
  } finally { try { lock.releaseLock(); } catch (e) {} }
}

// 取得某題的結果；qid 省略時使用 session.currentQid。
function getResults(sid, qid) {
  var sess = findRow(sessionsSheet(), [{ col: 0, eq: sid }]);
  if (!sess) return { ok: false, counts: [] };
  var effectiveQid = qid || sess.data[3];
  if (!effectiveQid) return { ok: true, counts: [], answerId: '' };

  var q = findRow(questionsSheet(), [{ col: 0, eq: sid }, { col: 1, eq: effectiveQid }]);
  if (!q) return { ok: true, counts: [], answerId: '' };

  var opts;
  try { opts = JSON.parse(q.data[3]); } catch (e) { opts = []; }
  var counts = new Array(opts.length).fill(0);

  var vSheet = votesSheet();
  var vRows = vSheet.getDataRange().getValues();
  for (var j = 1; j < vRows.length; j++) {
    if (vRows[j][0] === sid && vRows[j][1] === effectiveQid) {
      var c = parseInt(vRows[j][2]);
      if (!isNaN(c) && c >= 0 && c < counts.length) counts[c]++;
    }
  }
  return { ok: true, counts: counts, answerId: q.data[4], qid: effectiveQid };
}

// --- 舊 API 向後相容層 ---------------------------------------------------
// 既有的講者 widget 用 create/question/results/vote 四個 action，假設「一個
// sessionId 對應一個題目」。為了讓還沒更新的講者端能繼續運作，此處把舊 API
// 對應到 (sessionId, qid='_legacy') 的一筆紀錄。

var LEGACY_QID = '_legacy';

function legacyCreate(data) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (e) { return { ok: false, error: 'busy' }; }
  try {
    var sSheet = sessionsSheet();
    var sid = data.sessionId;
    if (!sid) return { ok: false, error: 'sessionId required' };
    if (!findRow(sSheet, [{ col: 0, eq: sid }])) {
      sSheet.appendRow([sid, '', new Date().toISOString(), LEGACY_QID]);
    }
    var qSheet = questionsSheet();
    if (!findRow(qSheet, [{ col: 0, eq: sid }, { col: 1, eq: LEGACY_QID }])) {
      qSheet.appendRow([
        sid, LEGACY_QID,
        data.question || '',
        JSON.stringify(data.options || []),
        (data.answerId !== null && data.answerId !== undefined) ? String(data.answerId) : ''
      ]);
    }
    return { ok: true };
  } finally { try { lock.releaseLock(); } catch (e) {} }
}

function legacyGetQuestion(sid) {
  var q = findRow(questionsSheet(), [{ col: 0, eq: sid }, { col: 1, eq: LEGACY_QID }]);
  if (!q) return { ok: false };
  var opts;
  try { opts = JSON.parse(q.data[3]); } catch (e) { opts = []; }
  return { ok: true, question: q.data[2], options: opts, answerId: q.data[4] };
}
