# Vibe Coding 工作坊：Release Gate 工作紙

姓名：____________________　日期：____________________　版本：____________________

本工作紙分兩部分：「學員現場 Release Gate」供學員在課堂審核 Todo 專案本身的證據；「教材發布者附錄」由講師或教材維護者在課後或正式發布時執行，不影響學員 Todo 是否交付。

---

# 學員現場 Release Gate

本節只審核學員 Todo 專案本身的證據，不執行本工作紙末尾的「教材發布者附錄」。預設審核並引用安全章已保存的命令、時間、退出碼、輸出摘要、人工結果與工作紙；只有證據缺失、候選版本已變更或結果過期時，才依各節「查表」命令補跑。所有項目均須勾選並附上可重現證據；任一失敗都不進入交付。沒有證據的欄位保持未勾選，不用推測補滿。完成訊息、畫面看起來正常或單一綠燈都不是整體交付證據。

## 一、需求（Requirements）

- [ ] CRUD 全部可用：建立、讀取／顯示、更新完成狀態、刪除。
- [ ] `all`、`active`、`completed` filters 顯示正確，且不改寫原始資料。
- [ ] reload 後還原最後一次成功儲存的資料與完成狀態。
- [ ] 使用者故事與 Given–When–Then 驗收條件逐項通過。

需求證據（來源章節、命令、時間、退出碼、輸出摘要或人工結果）：________________________________________________________________

## 二、規格（Spec）

- [ ] `spec.md` 明定 trim、UTF-16 `string.length` 120／121、UUID、immutable update、storage validation 與 write failure 不回滾，測試名稱可追溯到契約。
- [ ] 空白標題失敗；含頭尾空白的標題會 trim 後成功儲存。
- [ ] `trim()` 後的 1–120 長度以 JavaScript `string.length` 計算，即 UTF-16 code units。
- [ ] 依同一個 `string.length` 計算方式，長度 120 成功；長度 121 失敗且資料不變。
- [ ] 無效 ID 不會切換或刪除任何資料，`changed` 為 `false`。
- [ ] 待辦只含 `id`、`title`、`completed`，UUID v4 有效且唯一，`completed` 為 boolean。
- [ ] 純函式不突變輸入陣列或待辦物件。

規格證據：____________________________________________________________________

## 三、功能（Implementation）

- [ ] Git 輸出與檔案閱讀顯示只修改核准路徑；安全 DOM API、事件 wiring、三種 filter、reload 與警告訊息均存在，沒有未核准套件或整檔替換。
- [ ] 新增、完成、取消完成、刪除、三種篩選與重新載入的瀏覽器黃金路徑通過。
- [ ] HTML 與事件屬性輸入只顯示為純文字，不會建立可執行標記或處理器。
- [ ] 錯誤訊息會安全顯示，且可由輔助技術辨識。
- [ ] 新增、切換或刪除的儲存失敗時，當前記憶體操作與畫面變更仍有效、不回滾，並顯示「目前變更不會在重新整理後保留。」

最終黃金路徑每組只走一次；XSS 與兩種 storage failure 等失敗路徑不在本章重演，改為審核安全章保存的 unit tests、browser smoke 與人工結果。

功能證據：____________________________________________________________________

## 四、測試（Tests：unit + browser）

- [ ] Checkpoint 05 的 server、todo、storage unit tests 全部通過，涵蓋 CRUD、filters、reload 所需的純函式與儲存邊界；命令、輸出與退出碼已保存。
- [ ] 同一個 browser smoke 精確命令連續執行兩次且兩次皆通過；第二次證明前一次已正確清理 server、port 與瀏覽器狀態，結果可重現。只通過一次不足以跨過 Release Gate。
- [ ] browser smoke 涵蓋 CRUD、兩種 storage failure、XSS、鍵盤焦點、44px targets、CSP 精確字串、同源 request 與本機 CSP probe 被阻擋。
- [ ] 邊界測試涵蓋空白、trim，以及依同一個 JavaScript `string.length`（UTF-16 code units）計算方式判定的 120 成功、121 失敗且資料不變。
- [ ] 載入測試會拒絕無效 JSON、非陣列、額外欄位、錯誤 UUID、重複 ID、未正規化 title。
- [ ] 寫入測試涵蓋無效資料、序列化拋錯與 `setItem` 拋錯。
- [ ] 測試確認所有 pure functions 不突變輸入。

測試證據：____________________________________________________________________

查表：僅在證據缺失、候選版本已變更或結果過期時補跑 Todo 自動證據；預設引用安全章輸出，不重跑：

```bash
node --test lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/server.test.js lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/todo.test.js lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/storage.test.js
node lectures/vibe-coding-workshop/assets/workshop/browser-smoke.mjs checkpoints/05-hardened
node lectures/vibe-coding-workshop/assets/workshop/browser-smoke.mjs checkpoints/05-hardened
```

若必須補跑，兩次 browser smoke 都要通過；任一次失敗都保留輸出並停止 Gate。

## 五、安全（Security）

- [ ] 使用者輸入、localStorage 與錯誤內容一律視為不可信資料。
- [ ] HTML／事件屬性 payload 以純文字顯示，未使用不安全 HTML 注入 API。
- [ ] 無效 JSON、非陣列、額外欄位、錯誤 UUID、重複 ID、未正規化 title 均被拒絕。
- [ ] 安全儲存失敗處理已驗證：讀取、序列化或寫入失敗不使應用程式崩潰，也不破壞既有狀態。
- [ ] 精確 CSP 存在且作用可說明；沒有外部 runtime request、CSP 放寬或本機 probe 未被阻擋的情形。
- [ ] 無 CDN、無新增 dependencies、無 secrets。

安全證據：____________________________________________________________________

## 六、權限與 Git 證據（Delivery）

- [ ] `permission-probe-plan.txt` 與 `permission-probe-build.txt` 兩個 probe 均不存在；建立請求皆在任何寫入前由權限提示拒絕，未先提示即寫入則判定驗證失敗並停止。
- [ ] 三個 Git 證據命令的輸出已保存並逐項閱讀，所有新增、修改與 staged 路徑都有明確核准。
- [ ] 最終 Git 差異只包含核准交付檔案，未包含 probe、暫存資料、`.env`、token、私鑰或 secrets。
- [ ] 未發生未核准的專案外讀寫、套件安裝、刪除或發布。
- [ ] 空白 Git 輸出只代表該命令觀察的範圍沒有差異，不代表其他 Gate 自動通過。

權限與 Git 證據：______________________________________________________________

查表：僅在證據缺失或安全章完成後又有檔案／staging 變更時補跑 Git 證據；預設引用安全章保存的三份輸出，不重跑：

```bash
git status --short --untracked-files=all
git diff
git diff --cached
```

六道 Gate 全部通過後，才由人類把目前版本視為可發布候選。

---

# 教材發布者附錄（講師／維護者）

本附錄由講師或教材維護者在課後或正式發布時執行，不屬於學員現場 Release Gate，也不影響學員 Todo 是否交付；學員在課堂不執行本附錄。下列四道命令只發布與產生本教材（課程頁面、OG 縮圖與課程清單），不能取代安全章已取得的 Todo 產品證據；附錄結果不列入學員現場必須完成項目，成功建置也不會替學員的 Todo 功能與安全 Gate 背書。

- [ ] validator 執行成功（退出碼 0），`content.md` 語法與 `seo.url`／`seo.image` 格式無 error；退出碼 1 時先修正 error 再繼續。
- [ ] build 執行成功，`lectures/vibe-coding-workshop/index.html` 產出且可載入。
- [ ] 每次 build 後重新執行 generate-og，`lectures/vibe-coding-workshop/assets/og-image.jpg` 已產生並確認尺寸（1200×630）與路徑。
- [ ] build-index 執行成功，`lectures/manifest.js` 的課程路徑與發布狀態正確。
- [ ] 依序保存 validator、build、build 後重新產生的 OG，以及更新 manifest 的輸出，供正式發布追蹤。

從 repository 根目錄依序執行：

```bash
node .agents/skills/course-page-generator/scripts/validate.mjs lectures/vibe-coding-workshop
node .agents/skills/course-page-generator/scripts/build.mjs lectures/vibe-coding-workshop
node .agents/skills/course-page-generator/scripts/generate-og.mjs lectures/vibe-coding-workshop
node .agents/skills/course-page-generator/scripts/build-index.mjs
```

validator 結果：________________________________________________________________
build 結果：____________________________________________________________________
OG 結果：_______________________________________________________________________
manifest 結果：_________________________________________________________________
執行者與執行時間：______________________________________________________________
