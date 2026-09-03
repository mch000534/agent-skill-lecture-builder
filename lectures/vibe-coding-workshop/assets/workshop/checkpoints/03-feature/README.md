# Checkpoint 03：功能初版

本階段以測試先行完成待辦事項的純函式與安全的記憶體介面。可新增、完成、取消完成、刪除待辦，並以「全部」、「未完成」、「已完成」篩選畫面；空白標題會顯示中文錯誤，domain 層也會拒絕超過 120 個 UTF-16 code units 的標題。

資料仍只存在記憶體中，重新整理頁面後會清空；localStorage 將在後續 checkpoint 實作。

## 執行環境

請使用最新版 Chrome、Edge 或 Safari，並透過本機開發伺服器的 localhost 網址開啟。此課程以 modern browser 與 localhost 安全環境為前提，因此直接使用 `crypto.randomUUID()`，不提供 fallback。

## 啟動開發伺服器

```bash
npm run dev
```

瀏覽器開啟 <http://127.0.0.1:4173>。

## 驗證 120 code units 上限

HTML 輸入欄的 `maxlength="120"` 會在一般鍵盤輸入或貼上時先限制內容，阻止第 121 個 UTF-16 code unit 進入欄位。因此，一般 UI 操作不會直接觸發 domain 層的 `too-long` 錯誤。

若要驗證 defense-in-depth，請在 DevTools 的 Elements 面板暫時移除待辦輸入欄的 `maxlength` 屬性，再輸入 121 個 UTF-16 code units 並送出；畫面應顯示「待辦事項不可超過 120 個字元。」重新整理頁面後，`maxlength` 會恢復。

## 執行測試

```bash
npm test
```

不需要安裝第三方套件；請使用 Node.js 20 或更新版本。

## 文件

- [需求](requirements.md)
- [技術規格](spec.md)
- [實作任務清單](todolist.md)
- [不安全渲染對照](security-before.md)
