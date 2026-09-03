# Checkpoint 04：儲存測試

本階段以測試先行加入 localStorage 邊界。新增、完成、取消完成與刪除會先計算並採用記憶體新狀態，嘗試保存，再重新渲染；保存失敗不會回滾。成功保存的清單與完成狀態會在重新整理後還原。篩選只改變畫面，不會寫入儲存空間。

所有資料只保存在目前瀏覽器。載入資料必須是陣列，且每筆待辦只能包含 `id`、`title`、`completed` 三個 own enumerable 欄位；UUID v4、標題正規化與長度、完成狀態型別及 exact ID 唯一性都必須有效。

## 執行環境

請使用 Node.js 20 或更新版本，以及最新版 Chrome、Edge 或 Safari。應用程式以 modern browser 與 localhost 安全環境為前提，直接使用 `crypto.randomUUID()`，不提供 fallback。

## 啟動開發伺服器

```bash
npm run dev
```

瀏覽器開啟 <http://127.0.0.1:4173>。

## 執行測試

```bash
npm test
```

測試使用 Node 內建的 `node:test` 與 `node:assert/strict`，不需要安裝第三方套件。storage 測試涵蓋 missing、roundtrip、不可用 storage、損壞資料、完整資料契約、大小寫 UUID、無效寫入，以及 `JSON.stringify` 序列化例外與 `setItem` 寫入例外；兩種失敗邊界均有直接測試，且都會回傳 `write-failed`。

從 repository root 執行真實瀏覽器整合測試：

```bash
node lectures/vibe-coding-workshop/assets/workshop/browser-smoke.mjs checkpoints/04-tests
```

此測試會驗證 DOM、警告訊息、XSS 防護、持久化與焦點行為。

## 儲存警告

- localStorage 無法取得或讀取時：`無法讀取本機儲存空間，已使用空白清單。`
- 已儲存 JSON 無法解析或不符合完整資料契約時：`本機儲存資料已損壞，已使用空白清單。`
- 新增、切換或刪除無法寫入時：`目前變更不會在重新整理後保留。`

寫入失敗不會回滾目前記憶體狀態；畫面仍會顯示這次操作，但重新整理後只還原最後一次成功保存的內容。下一次成功保存會清除 storage 警告。

## DevTools 驗證失敗情境

### 損壞 JSON

在 Console 執行：

```js
localStorage.setItem('vibe-coding.todos.v1', '{not-json');
location.reload();
```

頁面應顯示損壞資料警告與空清單，且仍可繼續新增待辦。

### 寫入失敗

先重新整理頁面，再在 Console 執行：

```js
window.originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function () {
  throw new DOMException('模擬寫入失敗', 'QuotaExceededError');
};
```

新增、切換或刪除後，畫面應保留新狀態並顯示不會保存的警告。重新整理後，該次變更不會出現。若不重新整理，可執行以下指令還原：

```js
Storage.prototype.setItem = window.originalSetItem;
delete window.originalSetItem;
```

## 驗證 120 code units 上限

HTML 輸入欄的 `maxlength="120"` 會先阻止第 121 個 UTF-16 code unit。若要驗證 domain 層防線，可在 DevTools 的 Elements 面板暫時移除 `maxlength`，再輸入 121 個 code units 並送出；畫面應顯示 `待辦事項不可超過 120 個字元。`。

## 文件

- [需求](requirements.md)
- [技術規格](spec.md)
- [實作任務清單](todolist.md)
- [不安全渲染對照](security-before.md)
