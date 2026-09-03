# 安全渲染完成版

Checkpoint 03 的 [security-before](security-before.md) 示範把不可信的待辦標題交給 HTML parser，可能把文字解讀成元素或事件處理器。本 checkpoint 改用 DOM 節點與 `textContent`：

```js
const title = document.createElement('span');
title.textContent = todo.title;
item.append(title);
```

`createElement` 只建立已知的 `span`；將 `todo.title` 指派給 `textContent` 時，瀏覽器會把 `<`、`>` 與事件屬性字串當成文字節點內容，不會解析成 HTML。最後 `append` 加入的是既有節點，因此像 `<img src=x onerror=alert(1)>` 的輸入只會顯示原字串，不會建立圖片或執行事件處理器。

這個範例刻意放在 Markdown code fence 中作為 inert 教材，不會由 `index.html` 或 `app.js` 載入或執行。實際應用程式同樣使用 `createElement`、`textContent` 與節點操作，未使用 HTML 注入 API。
