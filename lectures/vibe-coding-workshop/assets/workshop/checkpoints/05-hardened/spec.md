# Vibe Coding 工作坊：待辦應用完整規格

姓名：____________________　日期：____________________　實作分支：____________________

本文件是實作與驗收的共同依據。未標示為選填的規則均為必要條件。

## 一、資料模型與不變條件

每筆待辦的型別為：

```js
{ id: string, title: string, completed: boolean }
```

待辦物件只允許 `id`、`title`、`completed` 三個自有可列舉欄位，不接受缺少欄位或額外欄位。

### `id`

- 必須是字串，並符合 UUID v4 正則：`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`。
- 正則比對不分大小寫。
- 通過驗證的 ID 必須保留 caller 傳入的原始字串，不改變大小寫。
- 同一份待辦清單中的 ID 必須唯一；唯一性使用字串全等比較，區分大小寫。

### `title`

- 非字串輸入回報 `invalid-type`。
- 字串先執行 `trim()`；結果為空字串時回報 `required`。
- `trim()` 後長度一律以 JavaScript `string.length` 計算，即 UTF-16 code units。
- `string.length` 大於 120 時回報 `too-long`；1 至 120 為有效值，儲存值必須等於 `trim()` 後的結果。
- 120 成功與 121 失敗的邊界案例必須使用同一個 `string.length` 計算方式。

### `completed`

- 必須是 boolean，只接受 `true` 或 `false`。

### 清單有效性

有效清單必須是陣列；每個元素皆符合上述精確欄位與型別規則，且所有 ID 以字串全等比較時皆唯一。任何一項不符，整份清單均視為無效，不部分載入或部分儲存。

## 二、錯誤格式

所有可預期的領域錯誤均使用字串代碼，不使用包含 `code` 與 `message` 的物件。允許的錯誤字串如下：

- 標題：`invalid-type`、`required`、`too-long`
- 新增 ID：`invalid-id`、`duplicate-id`
- 儲存：`invalid-data`、`write-failed`
- 載入警告：`storage-unavailable`、`corrupt-data`

介面如需顯示說明，必須由應用程式將固定字串代碼對應到安全的顯示文字，不改變函式契約。

## 三、純函式介面

所有 pure functions 不突變輸入。下列函式不得讀寫 DOM、localStorage、網路或全域可變狀態，也不得突變輸入陣列或其中物件；沒有變更時可回傳原輸入陣列，有變更時必須建立新陣列，且只複製實際改變的待辦物件。

### `validateTitle(input)`

成功回傳：

```js
{ ok: true, value: "trim 後的標題" }
```

失敗回傳：

```js
{ ok: false, error: "invalid-type" | "required" | "too-long" }
```

依「型別、trim 後必填、長度」順序驗證。

### `addTodo(todos, rawTitle, id)`

ID 由 caller 直接傳入；本函式不建立 ID，也不呼叫任何 ID 產生器。函式流程如下：

1. 以 `validateTitle(rawTitle)` 驗證並正規化標題。
2. 驗證 `id` 是符合 UUID v4 的字串；不符時回報 `invalid-id`。
3. 以字串全等比較檢查 `id`；與既有 ID 完全相同時回報 `duplicate-id`。
4. 成功時建立 `{ id, title: 正規化標題, completed: false }`，並保留 `id` 原始大小寫。

成功回傳：

```js
{ ok: true, todos: 新陣列, todo: 新增的待辦 }
```

失敗回傳：

```js
{ ok: false, todos: 原輸入陣列, error: "invalid-type" | "required" | "too-long" | "invalid-id" | "duplicate-id" }
```

標題失敗沿用 `validateTitle` 的錯誤字串；ID 失敗只使用 `invalid-id` 或 `duplicate-id`。任何失敗均不得改變輸入資料。

### `toggleTodo(todos, id)`

- `id` 必須是非空白且符合 UUID v4 的字串。
- 尋找項目時使用字串全等比較，區分大小寫。
- 非字串、空白字串、格式錯誤或找不到項目時，回傳 `{ todos: 原輸入陣列, changed: false }`。
- 找到項目時只反轉該筆 `completed`，回傳 `{ todos: 新陣列, changed: true }`。

### `deleteTodo(todos, id)`

- `id` 使用與 `toggleTodo` 相同的型別、格式與字串全等比較規則。
- 非字串、空白字串、格式錯誤或找不到項目時，回傳 `{ todos: 原輸入陣列, changed: false }`。
- 找到項目時移除該筆，回傳 `{ todos: 新陣列, changed: true }`。

### `filterTodos(todos, filter)`

- `all`：回傳包含全部項目的新陣列。
- `active`：回傳只含 `completed === false` 項目的新陣列。
- `completed`：回傳只含 `completed === true` 項目的新陣列。
- 其他值一律拋出 `TypeError`。
- 合法篩選一律建立新陣列，不得突變輸入陣列或待辦物件；篩選不改寫項目。

## 四、localStorage 邊界

固定 storage key：`vibe-coding.todos.v1`。

儲存層負責隔離瀏覽器例外，且必須先以「清單有效性」規則驗證資料。

### `loadTodos(storage)`

回傳物件固定只使用 `{ todos, warning }` 形狀：

- `storage.getItem(key)` 回傳 `null`，代表資料 missing，回傳 `{ todos: [], warning: null }`。
- 無法取得 storage、`getItem` 不存在或讀取時拋錯，回傳 `{ todos: [], warning: "storage-unavailable" }`。
- JSON 無法解析，或解析結果不是有效清單，回傳 `{ todos: [], warning: "corrupt-data" }`。
- 有效資料回傳 `{ todos, warning: null }`，不得直接信任或部分接受損壞資料。

### `saveTodos(storage, todos)`

- `todos` 不是有效清單時，不呼叫 `JSON.stringify` 或 `setItem`，回傳 `{ ok: false, error: "invalid-data" }`。
- 驗證通過後，以固定 key 和 `JSON.stringify(todos)` 寫入。
- `JSON.stringify` 拋錯、storage 不可用、`setItem` 不存在或寫入拋錯，均回傳 `{ ok: false, error: "write-failed" }`。
- 成功回傳 `{ ok: true }`。

## 五、應用程式整合

`app.js` 僅負責協調純函式、儲存層與畫面，且只使用安全 DOM API：

- 啟動時呼叫 `loadTodos`，以回傳的 `todos` 啟動；`warning` 非 `null` 時顯示對應警告。
- 新增時由應用程式建立 UUID v4，並以 `addTodo(todos, rawTitle, id)` 傳入。
- 新增、切換與刪除先計算並提交新的記憶體狀態，再以新狀態呼叫 `saveTodos` 並渲染。
- `saveTodos` 失敗時不得回滾；當前記憶體操作與畫面變更仍然有效，並顯示固定警告：`目前變更不會在重新整理後保留。`
- 篩選只影響顯示，不改寫或儲存清單。
- 使用 `document.createElement`、`textContent`、`setAttribute` 的固定安全值與 `addEventListener`。
- 不使用 `innerHTML`、`outerHTML`、`insertAdjacentHTML`、`document.write`、字串形式事件處理器或 `eval`。
- 標題、錯誤訊息與任何不可信資料都以純文字節點呈現；輸入中的 HTML 標籤與事件屬性不得執行。
- 錯誤區域具備可辨識文字，並使用適當的 `role="alert"` 或 `aria-live` 讓輔助技術得知更新。

## 六、Node 驗證

- [ ] 使用 Node 內建測試能力執行純函式與 storage 測試，不新增套件相依。
- [ ] 覆蓋 `validateTitle` 三種錯誤字串，以及依 JavaScript `string.length`（UTF-16 code units）計算的 120 成功／121 失敗邊界。
- [ ] 覆蓋 caller 傳入 ID 的新增成功、invalid-id、以字串全等比較的 duplicate-id、原始 ID 大小寫保留、切換、刪除、三種篩選的新陣列與非法篩選的 `TypeError`。
- [ ] 覆蓋切換與刪除收到非字串、空白字串、格式錯誤、大小寫不同或找不到 ID 時的 `changed: false`。
- [ ] 驗證每個純函式均不突變輸入陣列與物件。
- [ ] 覆蓋 missing、storage-unavailable、corrupt-data、invalid-data、序列化失敗與寫入失敗，並精確比對固定回傳形狀與字串。

Node 測試命令：______________________________________________________________
執行結果：____________________________________________________________________

## 七、瀏覽器驗證

- [ ] 完成新增、完成、取消完成、三種篩選、刪除與重新載入黃金路徑。
- [ ] 驗證空白輸入、頭尾空白，以及依同一個 JavaScript `string.length` 計算方式判定的 120 成功與 121 失敗。
- [ ] 驗證無效輸入會出現在介面，且不改變既有資料。
- [ ] 模擬新增、切換與刪除時寫入失敗，確認當前記憶體操作仍有效、畫面不回滾，並顯示 `目前變更不會在重新整理後保留。`。
- [ ] 驗證鍵盤操作、焦點順序與錯誤提示可辨識。

瀏覽器與版本：________________________________________________________________
驗證結果：____________________________________________________________________

## 八、安全驗證

- [ ] 輸入 `<img src=x onerror=alert(1)>` 與含事件屬性的字串，只會顯示純文字。
- [ ] 載入無效 JSON、非陣列、額外欄位、錯誤 UUID、以字串全等比較的重複 ID、未正規化 title 時皆拒絕資料並顯示警告。
- [ ] 模擬 storage 讀取、序列化與寫入失敗，確認應用程式不崩潰，且寫入失敗不回滾當前記憶體操作也不誤報已保存。
- [ ] 專案不使用 CDN、不新增 dependencies、不包含 secrets。
- [ ] Agent 操作未超出核准路徑與權限。

安全驗證證據：________________________________________________________________
