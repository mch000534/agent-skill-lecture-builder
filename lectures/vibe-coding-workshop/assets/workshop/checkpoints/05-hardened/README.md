# Checkpoint 05：安全加固與 Release Gate

本階段在功能與儲存測試都完成後加入安全防線，並以 release checklist 作為交付閘門。以下均為預期驗收條件，不代表已經通過；學員必須親自執行檢查並保留證據後勾選。

## 預期驗收

- [ ] CSP：頁面包含指定的 `Content-Security-Policy`；預設只允許同源資源，腳本、樣式與圖片明確限制為同源，並禁止連線、物件與 base URI。
- [ ] 無 innerHTML：應用程式不使用 `innerHTML`、`outerHTML`、`insertAdjacentHTML`、`document.write`、`eval` 或字串事件處理器。
- [ ] visible label：待辦輸入欄有畫面可見且以 `for` 關聯的標籤。
- [ ] maxlength 120：輸入欄保留 `maxlength="120"`，domain 層也拒絕第 121 個 UTF-16 code unit。
- [ ] dynamic accessible names：動態建立的完成核取方塊與刪除按鈕都包含待辦標題的 accessible name。
- [ ] aria-live：表單錯誤與儲存警告皆可由輔助技術接收。
- [ ] no runtime dependency：所有 checkpoint 的 `package.json` 都沒有 `dependencies` 或 `devDependencies`，瀏覽器執行期不載入 CDN 或外部資源；repository QA 使用 repository 既有的 Puppeteer 啟動 Chromium，不屬於 checkpoint runtime 或 package dependency。

## Hardening RED check

先確認本 README 已列出全部驗收 marker，且 `security-after.md` 尚不存在；接著在尚未修改 `index.html` 前執行 CSP 檢查，預期只因缺少 CSP 而失敗並輸出 `Expected red test: CSP missing`。這是實作前 RED 狀態的一次性操作記錄；完成版已具備 CSP 與 `security-after.md`，不應把下列命令當成最終驗證重跑。

```bash
cd lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened
node -e "const fs=require('node:fs');const readme=fs.readFileSync('README.md','utf8');for(const marker of ['CSP','無 innerHTML','visible label','maxlength 120','dynamic accessible names','aria-live','no runtime dependency'])if(!readme.includes(marker))throw new Error('README marker missing: '+marker);if(fs.existsSync('security-after.md'))throw new Error('Expected red test: security-after already exists');const html=fs.readFileSync('index.html','utf8');if(!html.includes('Content-Security-Policy')){console.error('Expected red test: CSP missing');process.exit(1)}throw new Error('Expected red test: CSP already present')"
```

## 執行測試

在本目錄執行 server、todo 與 storage unit tests：

```bash
npm test
```

從 repository root 連續執行兩次真實瀏覽器 smoke test：

```bash
node lectures/vibe-coding-workshop/assets/workshop/browser-smoke.mjs checkpoints/05-hardened
node lectures/vibe-coding-workshop/assets/workshop/browser-smoke.mjs checkpoints/05-hardened
```

Smoke test 會從 DOM 精確比對完整 CSP 字串，並以 Chromium network lifecycle events 收集未遭 CSP 阻擋的 request；每筆 request 都必須通過 `new URL(url).origin === expectedOrigin`，其中 `expectedOrigin` 精確為本次測試 server 的 `http://127.0.0.1:<port>`，因此 `localhost` 或不同 port 均不接受。Hardened checkpoint 也必須實際請求 `index.html`、`app.js`、`styles.css` 與 `favicon.svg`。

Hardened smoke 會在頁面註冊一次 `securitypolicyviolation` listener，動態 append 一支來源為同主機不同 port 的外部 script：`http://127.0.0.1:${port+1}/csp-probe.js`，不接觸公共網路。測試必須收到一次 violation，`effectiveDirective` 只能是 `script-src` 或 `script-src-elem`，`blockedURI` origin 必須等於 probe origin；Chromium 必須回報 `blockedReason: csp`，且未遭 CSP 阻擋的 network request event 清單不得包含 probe URL。預期的 Chromium CSP console error 僅允許完整訊息精確匹配該次 probe URL，其他 console error 或任何 page error 都會使 smoke 失敗。輸出 metrics 應顯示 exact-origin requests 數量、probe network requests 為 0、violation 為 1，以及 unexpected console/page errors 均為 0。

互動尺寸檢查以實際 bounding box 為準：新增、篩選、刪除按鈕及包住 Todo checkbox 的 `<label>` 點擊 target 高度皆至少 44px；checkbox 視覺方塊維持 20–24px，並確認鍵盤焦點有至少 3px outline 或等效 box-shadow。

## Release checklist

以下六組項目引用自[發布前檢查工作紙](../../../worksheets/release-checklist.md)，只可在學員實際執行並保留可重現證據後勾選。這裡刻意全部保持未勾選，不以範例結果冒充驗收通過。

### 一、需求

- [ ] CRUD 全部可用：建立、讀取／顯示、更新完成狀態、刪除。
- [ ] `all`、`active`、`completed` filters 顯示正確，且不改寫原始資料。
- [ ] reload 後還原最後一次成功儲存的資料與完成狀態。
- [ ] 使用者故事與 Given–When–Then 驗收條件逐項通過。

### 二、規格

- [ ] 空白標題失敗；含頭尾空白的標題會 trim 後成功儲存。
- [ ] `trim()` 後的 1–120 長度以 JavaScript `string.length` 計算，即 UTF-16 code units。
- [ ] 依同一個 `string.length` 計算方式，長度 120 成功；長度 121 失敗且資料不變。
- [ ] 無效 ID 不會切換或刪除任何資料，`changed` 為 `false`。
- [ ] 待辦只含 `id`、`title`、`completed`，UUID v4 有效且唯一，`completed` 為 boolean。
- [ ] 純函式不突變輸入陣列或待辦物件。

### 三、功能

- [ ] 新增、完成、取消完成、刪除、三種篩選與重新載入的瀏覽器黃金路徑通過。
- [ ] HTML 與事件屬性輸入只顯示為純文字，不會建立可執行標記或處理器。
- [ ] 錯誤訊息會安全顯示，且可由輔助技術辨識。
- [ ] 新增、切換或刪除的儲存失敗時，當前記憶體操作與畫面變更仍有效、不回滾，並顯示 `目前變更不會在重新整理後保留。`。

### 四、測試

- [ ] Node 測試涵蓋 CRUD、filters、reload 所需的純函式與儲存邊界。
- [ ] 邊界測試涵蓋空白、trim，以及依同一個 JavaScript `string.length`（UTF-16 code units）計算方式判定的 120 成功、121 失敗且資料不變。
- [ ] 載入測試會拒絕無效 JSON、非陣列、額外欄位、錯誤 UUID、重複 ID、未正規化 title。
- [ ] 寫入測試涵蓋無效資料、序列化拋錯與 `setItem` 拋錯。
- [ ] 測試確認所有 pure functions 不突變輸入。

### 五、安全

- [ ] 使用者輸入、localStorage 與錯誤內容一律視為不可信資料。
- [ ] HTML／事件屬性 payload 以純文字顯示，未使用不安全 HTML 注入 API。
- [ ] 無效 JSON、非陣列、額外欄位、錯誤 UUID、重複 ID、未正規化 title 均被拒絕。
- [ ] 安全儲存失敗處理已驗證：讀取、序列化或寫入失敗不使應用程式崩潰，也不破壞既有狀態。
- [ ] 無 CDN、無新增 dependencies、無 secrets。
- [ ] 未發生未核准的專案外讀寫、套件安裝、刪除或發布。

### 六、交付

- [ ] `permission-probe-plan.txt` 與 `permission-probe-build.txt` 兩個 probe 均不存在。
- [ ] 已保存每階段的 Git 證據：`git status --short --untracked-files=all`、`git diff`、`git diff --cached`。
- [ ] validator 執行成功，無阻擋錯誤。
- [ ] build 執行成功，產物可載入。
- [ ] OG 圖已在 build 後重新產生並確認尺寸與路徑。
- [ ] manifest 已更新，課程路徑與發布狀態正確。
- [ ] 最終 Git 差異只包含核准交付檔案，未包含 probe、暫存資料或 secrets。

### 明確執行命令

從 repository root 執行：

```bash
node --test lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/*.test.js
node lectures/vibe-coding-workshop/assets/workshop/browser-smoke.mjs checkpoints/05-hardened
node lectures/vibe-coding-workshop/assets/workshop/browser-smoke.mjs checkpoints/05-hardened
node .agents/skills/course-page-generator/scripts/validate.mjs lectures/vibe-coding-workshop
node .agents/skills/course-page-generator/scripts/build.mjs lectures/vibe-coding-workshop
node .agents/skills/course-page-generator/scripts/generate-og.mjs lectures/vibe-coding-workshop
node .agents/skills/course-page-generator/scripts/build-index.mjs
git status --short --untracked-files=all
git diff
git diff --cached
```

`todolist.md` 最後一項「完成安全與權限檢查」仍維持未勾選，因為這是課堂中由學員親自執行、記錄證據並完成的 release gate，而不是 checkpoint 預先宣稱的成果。

## 文件

- [需求](requirements.md)
- [技術規格](spec.md)
- [實作任務清單](todolist.md)
- [不安全渲染對照（繼承自 Checkpoint 03）](security-before.md)
- [安全渲染完成版](security-after.md)
- [發布前檢查工作紙](../../../worksheets/release-checklist.md)
