# Vibe Coding 六小時工作坊設計

## 目標

建立一份以 OpenCode 示範的六小時 Vibe Coding 工作坊教材，帶領混合背景學員以純 HTML、CSS、JavaScript 完成可執行的待辦清單。課程須把需求、規格、任務拆解、小步實作、驗證與安全整合為同一條專案旅程。

內容以以下資料為主要參考：

- `/Users/barry/vibe_coding_SOP`
- `/Users/barry/vibe_coding_Security`

## 受眾與形式

- 受眾：AI 編程初學者、工程師、產品經理及其他跨職能成員。
- 時長：六小時，包含兩次各十分鐘休息。
- 協作方式：講師操作，全班同步完成相同步驟。
- 示範工具：OpenCode。
- 技術：純 HTML、CSS、JavaScript，不使用 CDN 或第三方執行期依賴。
- 實作成果：可在瀏覽器執行並保存資料的待辦清單。
- 安全重點：開發實務，包括權限、秘密、依賴、Prompt Injection、輸入處理與安全驗證。

## 學習目標

完成工作坊後，學員能夠：

1. 說明人類與 AI Agent 在開發流程中的責任邊界。
2. 將模糊構想轉為使用者故事與 Given–When–Then 驗收標準。
3. 建立足以指導 Agent 的技術規格與小型任務清單。
4. 使用 OpenCode 逐步實作、檢視 diff、測試並驗證結果。
5. 辨識 Prompt Injection、過度授權、不安全輸出、秘密外洩及供應鏈風險。
6. 以測試結果、瀏覽器操作及安全檢查表作為交付證據。

## 教學策略

採用「專案旅程式」編排。所有單元持續推進同一個待辦清單專案，安全要求不獨立留到最後，而是插入需求、規格、實作及交付階段。集中安全單元則用來整合並演練先前的檢查點。

每個實作單元遵循相同節奏：

1. 講解概念與判斷原則。
2. 示範 OpenCode 操作方式。
3. 全班同步完成一個小步驟。
4. 執行測試或瀏覽器操作驗證。
5. 檢視變更與安全影響。

### 課堂環境與復原流程

- 課前確認每台電腦可執行 `opencode --version` 與 `node --test`，OpenCode 已完成模型設定，並備有近期版本的 Chrome、Edge 或 Safari。
- 教材命令只使用 OpenCode、Node.js 與 Git 的跨平台形式，不依賴特定作業系統的 shell 語法。
- 講師提供起始專案，以及需求完成、規格完成、功能初版、測試完成、安全加固五個唯讀 checkpoint。
- 學員落後或 Agent 輸出偏離時，不覆寫原工作目錄；改從新的 checkpoint 副本繼續，保留原版本供課後比較。
- 每個 checkpoint 開始前由講師完成一次共同驗證，確認全班畫面與測試結果一致後再前進。

## 六小時大綱

| 時間 | 單元 | 內容 | 產出 |
| --- | --- | --- | --- |
| 00:00–00:30 | Vibe Coding 與 OpenCode | Vibe Coding 的常見誤解；LLM、Harness、工具、記憶與權限；人類與 Agent 的責任邊界 | 角色與責任清單 |
| 00:30–01:15 | 從想法到可驗收需求 | 比較模糊與明確 Prompt；使用者故事；Given–When–Then；非功能與安全需求 | 待辦清單 requirements |
| 01:15–02:00 | 規格與任務拆解 | 資料模型、介面行為、儲存方式、輸入限制、模組邊界；將工作拆成可驗證的小任務 | spec 與 task list |
| 02:00–02:10 | 休息 |  |  |
| 02:10–03:15 | OpenCode 小步實作 | 建立頁面；待辦新增、完成、篩選、刪除；逐項檢視 diff；避免一次生成全部功能 | 可運作初版 |
| 03:15–04:00 | 測試、Git 與驗證 | 抽離可測試資料邏輯；Node.js 內建測試；瀏覽器黃金路徑；提交、復原與證據留存 | 測試結果與提交紀錄 |
| 04:00–04:10 | 休息 |  |  |
| 04:10–05:10 | AI 開發安全實務 | Prompt Injection、Agent 權限、不安全 DOM 輸出、localStorage 異常、秘密與依賴；以故障情境進行修正 | 威脅與防護清單、加固版本 |
| 05:10–05:50 | 安全加固與 Release Gate | 完整功能與安全檢查；失敗情境；瀏覽器實測；核對 diff 與測試證據 | 可交付待辦清單 |
| 05:50–06:00 | 回顧與延伸 | 串連需求、規格、實作、測試、安全與交付；提供後續專案檢查表 | 個人實作檢查表 |

## 專案範圍

### 必要功能

- 新增待辦事項。
- 標記待辦為完成或未完成。
- 顯示全部、未完成及已完成項目。
- 刪除待辦事項。
- 將資料保存至 `localStorage`。
- 重新整理頁面後還原資料。

### 資料流

```text
使用者輸入
  → 邊界驗證與正規化
  → 待辦資料模型
  → localStorage 持久化
  → 安全 DOM 渲染
```

### 資料契約與單元邊界

每筆待辦資料固定為：

```text
{
  id: string,
  title: string,
  completed: boolean
}
```

- `id` 由 `crypto.randomUUID()` 產生，在待辦生命週期內保持不變，且須符合 UUID v4 格式 `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`（不分大小寫）。同一陣列內不得重複。
- `title` 必須是字串，且須等於自身 `trim()` 結果，長度為 1–120 個 JavaScript 字元。
- `completed` 必須是布林值，新增時固定為 `false`。
- Todo 物件只能包含 `id`、`title`、`completed` 三個欄位。
- localStorage key 固定為 `vibe-coding.todos.v1`，值為待辦陣列的 JSON；key 不存在代表尚無資料，不是錯誤。

單元邊界與公開介面：

- 畫面層：處理事件與安全更新 DOM，不直接操作儲存格式。
- `validateTitle(rawTitle)`：非字串回傳 `{ ok: false, error: "invalid-type" }`；否則先 `trim()`，再回傳 `{ ok: true, value }`，或 `{ ok: false, error: "required" | "too-long" }`。
- `addTodo(todos, rawTitle, id)`：驗證標題、UUID 格式與 ID 唯一性；成功回傳 `{ ok: true, todos, todo }`，失敗回傳 `{ ok: false, todos, error }`，其中 `error` 為標題錯誤或 `"invalid-id" | "duplicate-id"`。
- `toggleTodo(todos, id)`：使用字串全等比較 ID；找到時回傳 `{ todos, changed: true }`，任何非字串、空白、格式錯誤或不存在 ID 均回傳 `{ todos, changed: false }`。
- `deleteTodo(todos, id)`：使用與 `toggleTodo` 相同的 ID 規則，回傳 `{ todos, changed }`。
- `filterTodos(todos, filter)`：`filter` 只接受 `"all" | "active" | "completed"`；合法時回傳新陣列，其他值拋出 `TypeError`。
- `loadTodos(storage)`：固定回傳 `{ todos, warning }`，`warning` 為 `null | "corrupt-data" | "storage-unavailable"`。key 不存在回傳空陣列與 `null`；讀取拋錯回傳空陣列與 `"storage-unavailable"`；JSON、根節點、額外欄位、欄位型別、UUID、ID 唯一性或已正規化 title 任一不符，整份資料視為損壞並回傳 `"corrupt-data"`。
- `saveTodos(storage, todos)`：寫入前以相同 Todo 契約驗證完整陣列；無效時回傳 `{ ok: false, error: "invalid-data" }`，寫入拋錯時回傳 `{ ok: false, error: "write-failed" }`，成功回傳 `{ ok: true }`。

上述介面只交換普通 JavaScript 資料，不依賴框架或建置工具。所有待辦邏輯函式均不突變傳入陣列或其中物件；成功修改時建立新陣列與受影響物件，失敗時資料值保持不變。除 `loadTodos` 與 `saveTodos` 外，所有函式均為無瀏覽器副作用的純函式，可由 Node.js 獨立測試。

## 教材元件

| 用途 | 元件 |
| --- | --- |
| 說明完整開發流程 | `[flow]` |
| 比較模糊與清晰 Prompt | `[compare]` |
| 比較不安全與安全實作 | `[compare-table]` |
| 收集風險判斷 | `[vote]` |
| 檢查理解與辨識風險 | `[quiz]` |
| 切換需求、規格與程式視角 | `[tabs]` |
| 強調權限與安全限制 | `[callout]` |
| 顯示逐步完成狀態 | `[steps-status]` |
| 呈現 OpenCode 操作 | `terminal` 與 `prompt` 程式碼區塊 |
| 彙整交付證據 | checklist 與 `[summary]` |

## 失敗情境與處理

### 模糊需求

Agent 自行補完未定義規則，產生與預期不同的功能。教材先展示失敗輸出，再要求學員補充使用者故事、驗收標準及非目標。

### 不安全 DOM 輸出

初版刻意展示直接使用 `innerHTML` 顯示待辦內容的風險。修正後使用 `textContent` 或等效安全 DOM API，確保輸入的 HTML 與事件屬性不會執行。

### 無效輸入

系統對原始文字執行 `trim()`，拒絕結果為空或 `length` 超過 120 的內容。驗證失敗時不修改資料，並在輸入欄旁顯示具體原因。相同規則必須同時寫入需求、程式與測試，避免只存在於 Prompt。

### localStorage 失敗

儲存層把 JSON 解析失敗、根節點不是陣列，或任一項目不符合 Todo 資料契約視為損壞資料；系統改用空清單並顯示警告。若瀏覽器停用儲存或寫入因容量限制失敗，當前記憶體資料仍可操作，但畫面須提示重新整理後不會保留。錯誤處理集中在儲存邊界，不在其他內部函式加入無法發生的防禦分支。

### 過度授權

OpenCode 一律從專用工作坊目錄啟動，並記錄 `opencode --version`。學員先切換至 `plan` 唯讀模式，要求 Agent 解釋變更，再用建立 `permission-probe-plan.txt` 的無害請求確認寫入會被拒絕或要求核准；學員拒絕該操作。`git status --short --untracked-files=all`、`git diff` 與 `git diff --cached` 必須全部為空。

計畫核准後才切換至 `build`。正式實作前先要求建立 `permission-probe-build.txt`，在權限提示出現時拒絕，再以三個 Git 檢查確認檔案不存在且工作樹未變。若目前 OpenCode 版本未出現權限提示或仍建立檔案，視為權限驗證失敗，停止實作並由講師檢查模式與權限設定，不以手動刪除探針檔案冒充通過。

正式實作期間，每次建立檔案、修改檔案或執行命令均只核准當前任務所需操作；拒絕未解釋的命令、專案外讀寫、套件安裝、刪除及外部發布。每個 checkpoint 同時檢查 `git status --short --untracked-files=all`、`git diff` 與 `git diff --cached`。通過準則是兩個探針檔案均不存在，所有已修改、已暫存與未追蹤路徑均屬於當前核准任務，而且權限檢查表逐筆記錄 OpenCode 模式、操作內容、允許或拒絕結果及對應 Git 證據。教材不假定特定版本的設定檔格式，以實際拒絕測試與完整工作樹證據作為權限行為驗收。

### 供應鏈與秘密

專案不使用 CDN 或第三方執行期依賴，避免把供應鏈問題轉化為安裝教學。教材仍說明依賴審查與秘密管理原則，並要求確認專案不包含金鑰或 `.env` 內容。

## 驗證與 Release Gate

### 功能驗證

- 可新增合法待辦事項。
- 可切換完成狀態。
- 三種篩選結果正確。
- 可刪除待辦事項。
- 重新整理後資料仍存在。

### 邊界與安全驗證

- 純空白內容不會建立項目，前後空白會被移除。
- 120 個字元可建立，121 個字元會被拒絕且原資料不變。
- HTML 標籤與事件屬性只會作為文字顯示。
- 無效 JSON、非陣列根節點及欄位格式錯誤不會令頁面崩潰。
- localStorage 寫入失敗時，當前操作仍有效並顯示資料不會持久保存的提示。
- 專案不包含外部 CDN、未核准依賴或秘密。
- OpenCode 的 `plan` 階段不產生 Git diff，`build` 階段只包含已核准任務的變更。

### 證據要求

- 核心資料邏輯通過 Node.js 內建測試。
- 講師在瀏覽器實際完成黃金路徑及失敗情境。
- 學員檢視最終 Git diff。
- 功能、安全及權限檢查表全部完成。

## 非目標

- 不加入後端、資料庫、帳號、登入或多人同步。
- 不教授特定前端框架。
- 不使用外部 API 或雲端部署作為必要練習。
- 不追求完整產品視覺設計。
- 不比較多種 AI 編程工具。

## 教材完成標準

- `content.md` 採用「說明 → 範例 → 實作 → 驗證」節奏。
- 所有 OpenCode 指令與 Prompt 都能對應一個明確學習目標。
- 待辦清單範例可以直接在瀏覽器運行。
- 教材提供安全前後對照，而非只列出原則。
- 工作坊活動與休息時間總計 360 分鐘。
- 課程頁面通過專案驗證、建置並生成 OG 圖片。
