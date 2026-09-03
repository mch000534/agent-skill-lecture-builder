# 不安全渲染對照

本文件只供閱讀，`index.html` 與 `app.js` 不會載入或執行其中內容。

以下是不安全的示範程式碼。程式若以 `innerHTML` 組合待辦標題，瀏覽器會把不可信輸入解析為 HTML：

```js
list.innerHTML = todos
  .map((todo) => `<li>${todo.title}</li>`)
  .join('');
```

例如輸入 `<img src=x onerror=alert(1)>`，若透過上述方式渲染，圖片載入失敗時可能執行事件屬性中的程式碼。

正式版不解析標題字串，而是以 `document.createElement` 建立固定結構，再用 `textContent` 放入標題，因此標籤與事件屬性只會顯示為文字。
