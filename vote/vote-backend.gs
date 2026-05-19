// 課堂投票後端 — Google Apps Script
// 部署方式：
//   1. 在 Google 試算表建立新試算表，命名「課堂投票」
//   2. 點「擴充功能 > Apps Script」，貼上此程式碼，儲存
//   3. 點「部署 > 新增部署作業」，選「網路應用程式」
//      執行身分：我自己 / 存取對象：所有人（包含匿名）
//   4. 複製 Web App URL，貼入課程頁的投票 Widget 設定欄

var SHEET_SESSIONS = 'sessions';
var SHEET_VOTES = 'votes';

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === SHEET_SESSIONS) {
      sheet.appendRow(['sessionId', 'question', 'options', 'answerId', 'createdAt']);
    } else {
      sheet.appendRow(['sessionId', 'choice', 'timestamp', 'hash']);
    }
  }
  return sheet;
}

function doGet(e) {
  var params = e ? (e.parameter || {}) : {};
  var action = params.action || 'question';
  var sid = params.s || '';
  var result = action === 'results' ? getResults(sid) : getQuestion(sid);
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data;
  try { data = JSON.parse(e.postData.contents); } catch (ex) {
    return ContentService.createTextOutput('{"error":"invalid"}').setMimeType(ContentService.MimeType.JSON);
  }
  var result = data.action === 'create' ? createSession(data) : submitVote(data);
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function createSession(data) {
  var sheet = getSheet(SHEET_SESSIONS);
  var sid = data.sessionId;
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === sid) return { ok: true };
  }
  sheet.appendRow([
    sid,
    data.question || '',
    JSON.stringify(data.options || []),
    data.answerId !== null && data.answerId !== undefined ? String(data.answerId) : '',
    new Date().toISOString()
  ]);
  return { ok: true };
}

function getQuestion(sid) {
  var rows = getSheet(SHEET_SESSIONS).getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === sid) {
      var opts;
      try { opts = JSON.parse(rows[i][2]); } catch (e) { opts = []; }
      return { ok: true, question: rows[i][1], options: opts, answerId: rows[i][3] };
    }
  }
  return { ok: false };
}

function getResults(sid) {
  var qData = getQuestion(sid);
  if (!qData.ok) return { ok: false, counts: [] };
  var numOpts = (qData.options || []).length;
  var counts = new Array(numOpts).fill(0);
  var voteRows = getSheet(SHEET_VOTES).getDataRange().getValues();
  for (var j = 1; j < voteRows.length; j++) {
    if (voteRows[j][0] === sid) {
      var c = parseInt(voteRows[j][1]);
      if (c >= 0 && c < numOpts) counts[c]++;
    }
  }
  return { ok: true, counts: counts, answerId: qData.answerId };
}

function submitVote(data) {
  var sid = data.sessionId;
  var choice = data.choice;
  var hash = data.hash || '';
  var sheet = getSheet(SHEET_VOTES);
  if (hash) {
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === sid && rows[i][3] === hash) {
        return { ok: false, duplicate: true };
      }
    }
  }
  sheet.appendRow([sid, choice, new Date().toISOString(), hash]);
  return { ok: true };
}
