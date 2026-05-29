---
name: widget-builder
description: 建立新浮動 widget 的完整規範。涵蓋 HTML 結構、CSS 樣式、JS IIFE 模式、z-index 管理、拖曳邏輯、鍵盤快捷鍵、settings panel 整合。新增 widget 時依此文件產生符合規範的程式碼。
---

# Widget Builder Skill

> **禁止使用 Emoji**：所有 widget 的標題、按鈕文字、標籤一律不得使用 emoji。

## 觸發條件

當使用者說：

- 「新增 widget」「建立浮動面板」「加一個 widget」
- 「做一個 XXX 工具」（且該工具需要以浮動視窗形式存在）

---

## 概述

本專案的浮動 widget 是一種固定在視窗上的互動面板，具備以下共通特性：

- 可拖曳（透過 header 把手）
- 可調整大小（CSS `resize: both`）
- 半透明毛玻璃背景
- 動態 z-index 管理（點擊或開啟時自動置顶）
- 單字母鍵盤快捷鍵切換
- X 鍵關閉所有 widget
- Settings panel 中的開啟按鈕

現有 widget 清單：

| Widget | ID | 快捷鍵 | 全域函式 |
|--------|----|--------|----------|
| 計時器 | `timer-widget` | T | `__toggleTimerWidget` |
| 抽籤器 | `lottery-widget` | R | `__toggleLotteryWidget` |
| 投票 | `vote-widget` | V | `__toggleVoteWidget` |
| 分享 | `share-widget` | Q | `__toggleShareWidget` |

---

## Step 1：HTML 結構（`reference/base.html`）

在 `base.html` 的 `</body>` 之前加入 widget 容器。以下以 `xxx` 作為 widget 名稱佔位符。

### 命名規則

| 元素 | ID | Class |
|------|----|-------|
| 容器 | `xxx-widget` | `xxx-widget` |
| Header（拖曳把手） | `xxx-drag-handle` | `xxx-header` |
| 標題 | -- | `xxx-title` |
| 關閉按鈕 | `xxx-widget-close` | `xxx-close` |
| 主體 | -- | `xxx-body` |

### 模板

```html
<!-- XXX Widget (floating, draggable) -->
<div class="xxx-widget" id="xxx-widget">
  <div class="xxx-header" id="xxx-drag-handle">
    <span class="xxx-title"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><!-- icon path --></svg>Widget 標題</span>
    <button class="xxx-close" id="xxx-widget-close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
  </div>
  <div class="xxx-body">
    <!-- widget 內容 -->
  </div>
</div>
```

### 要點

- SVG icon 使用 `stroke="currentColor"` + `stroke-width="2"` + `stroke-linecap="round"` + `stroke-linejoin="round"`，不填色（`fill="none"`），以繼承 CSS 的 `color` 值。
- 關閉按鈕的 X icon 為所有 widget 共用的標準 SVG。
- Header 同時是拖曳把手，必須帶 `id="xxx-drag-handle"`。
- 若 widget 有多個面板（如 vote widget 的 picker/setup/active/results），在 `.xxx-body` 內用 `.xxx-panel` 切換。

---

## Step 2：CSS 樣式（`assets/course.css`）

在 `course.css` 的 `/* ===== SHARE WIDGET =====` 區段之前（或適當位置）加入新 widget 的樣式。

### 容器基底

```css
/* ===== XXX WIDGET ===== */
.xxx-widget {
  position: fixed;
  width: 280px;          /* 依內容調整 */
  min-width: 240px;
  min-height: 200px;
  background: var(--bg-widget);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,.4);
  z-index: 10500;
  display: none;
  flex-direction: column;
  user-select: none;
  overflow: hidden;
  resize: both;
  right: 9rem;           /* 初始位置，避免與其他 widget 重疊 */
  bottom: 5rem;
}

.xxx-widget.open { display: flex; }
```

### `--bg-widget` 變數

定義在 `:root`（已在 `course.css` 頂部定義），不需重複宣告：

```css
:root             { --bg-widget: rgba(24, 27, 37, 0.82); }
[data-theme="light"] { --bg-widget: rgba(255, 255, 255, 0.7); }
```

### Header

```css
.xxx-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .55rem .9rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card-alt);
  border-radius: 14px 14px 0 0;
  cursor: grab;
  flex-shrink: 0;
}
```

### Title

```css
.xxx-title {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .78rem;
  font-weight: 700;
  color: var(--text-dim);
}
```

### Close Button

```css
.xxx-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-dim);
  padding: 2px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: color .2s;
}

.xxx-close:hover { color: var(--text); }
```

### Body

```css
.xxx-body {
  padding: .85rem .9rem;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
```

### Light Theme（選擇性）

若 widget 的 `box-shadow` 在淺色背景下太深，加覆寫：

```css
[data-theme="light"] .xxx-widget {
  box-shadow: 0 10px 30px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
  border-color: #c8c8cf;
}
```

---

## Step 3：JS IIFE（`assets/course.js`）

在 `course.js` 的適當位置（通常在最後一個 widget IIFE 之後）加入新 widget 的 IIFE。

### 完整模板

```javascript
// ===== XXX WIDGET =====
(function () {
  var widget = document.getElementById('xxx-widget');
  var dragHandle = document.getElementById('xxx-drag-handle');
  if (widget) {
    new MutationObserver(function () {
      if (widget.classList.contains('open')) __bringToTop(widget);
    }).observe(widget, { attributes: true, attributeFilter: ['class'] });
    widget.addEventListener('mousedown', function () { __bringToTop(widget); });
  }
  var closeBtn = document.getElementById('xxx-widget-close');
  if (!widget) return;

  // ── Show / hide ──
  function hideWidget() { widget.classList.remove('open'); }
  function toggleWidget() { widget.classList.toggle('open'); }
  window.__toggleXxxWidget = toggleWidget;

  if (closeBtn) closeBtn.addEventListener('click', hideWidget);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && widget.classList.contains('open')) hideWidget();
  });

  // ── Drag ──
  var dragging = false, dragOffX = 0, dragOffY = 0;
  if (dragHandle) {
    dragHandle.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      var rect = widget.getBoundingClientRect();
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
      widget.style.transform = 'none';
      widget.style.left = rect.left + 'px';
      widget.style.top = rect.top + 'px';
      dragging = true;
      dragOffX = e.clientX - rect.left;
      dragOffY = e.clientY - rect.top;
      e.preventDefault();
    });
  }
  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    var x = Math.max(0, Math.min(e.clientX - dragOffX, window.innerWidth - widget.offsetWidth));
    var y = Math.max(0, Math.min(e.clientY - dragOffY, window.innerHeight - widget.offsetHeight));
    widget.style.left = x + 'px';
    widget.style.top = y + 'px';
  });
  document.addEventListener('mouseup', function () { dragging = false; });

  // ── Widget-specific logic ──
  // ...
})();
```

### 關鍵模式說明

| 模式 | 說明 |
|------|------|
| `MutationObserver` | 監聽 `class` 屬性變化，當 `.open` 被加上時自動呼叫 `__bringToTop` |
| `mousedown` on widget | 點擊 widget 任意位置時置顶 |
| `hideWidget()` | 移除 `.open` class |
| `toggleWidget()` | 切換 `.open` class |
| `window.__toggleXxxWidget` | 全域函式，供鍵盤快捷鍵和 settings panel 呼叫 |
| Drag `right: auto; bottom: auto` | 將 CSS 的 right/bottom 定位轉為 left/top，以便拖曳 |
| Drag `transform: none` | 移除 CSS 置中 transform，避免拖曳時位置跳動 |
| Drag viewport clamp | `Math.max(0, Math.min(...))` 確保 widget 不被拖出視窗 |

---

## Step 4：鍵盤快捷鍵

在 `course.js` 的 `keydown` event listener 中加入快捷鍵（通常在既有的快捷鍵區塊）。

### 新增切換鍵

```javascript
if ((e.key === 'KEY' || e.key === 'KEY_UPPER') && !e.ctrlKey && !e.metaKey && !e.altKey) {
  if (window.__toggleXxxWidget) window.__toggleXxxWidget();
}
```

- 使用單一字母鍵，大小寫都要判斷。
- 排除 Ctrl/Meta/Alt 組合鍵，避免與瀏覽器快捷鍵衝突。
- 若 widget 開啟時需要防止文字輸入框觸發，加上 `if (['INPUT','TEXTAREA','SELECT'].indexOf(document.activeElement.tagName) >= 0) return;` 守衛。

### 更新 X 鍵（關閉全部）

在 X 鍵的 handler 中加入新 widget：

```javascript
if ((e.key === 'x' || e.key === 'X') && !e.ctrlKey && !e.metaKey && !e.altKey) {
  ['timer-widget', 'lottery-widget', 'vote-widget', 'xxx-widget'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('open');
  });
  // ... spotlight, magnifier 等其他元素 ...
}
```

---

## Step 5：Settings Panel 按鈕

在 widget 的 IIFE 中，動態建立 settings panel 的開啟按鈕。

### 模板

```javascript
// ── Settings panel button ──
var xxxBtn = document.createElement('button');
xxxBtn.className = 'xxx-settings-btn';
xxxBtn.setAttribute('aria-label', 'Widget 標題');
xxxBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><!-- icon --></svg>';
xxxBtn.addEventListener('click', function () {
  var sp = document.getElementById('settings-panel');
  sp.classList.remove('open');
  document.getElementById('settings-toggle').classList.remove('active');
  widget.classList.add('open');
});

var targetRow = window.__settingsRow2 || document.querySelectorAll('.settings-controls-row')[1];
if (targetRow) targetRow.appendChild(xxxBtn);
```

### 要點

- 按鈕使用 `createElement` 動態建立，不寫在 `base.html` 中。
- 點擊時先關閉 settings panel，再開啟 widget。
- 注入到 `window.__settingsRow2`（由 lottery widget IIFE 建立的第二行按鈕列）。若尚未建立，取 `.settings-controls-row` 的第二個元素。
- 按鈕樣式（`.xxx-settings-btn`）需在 `course.css` 中加入，參考既有的 `.lottery-settings-btn` 或 `.vote-settings-btn`。

### Settings Button CSS

```css
.xxx-settings-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-card-alt);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .18s;
  flex-shrink: 0;
  padding: 0;
  color: var(--text-dim);
}

.xxx-settings-btn:hover {
  background: rgba(var(--accent-rgb), .12);
  border-color: var(--accent);
  color: var(--accent);
}

.xxx-settings-btn.active {
  background: rgba(var(--accent-rgb), .18);
  border-color: var(--accent);
  color: var(--accent);
}
```

**圖示規範**：
- SVG 尺寸：`width="15" height="15"`，`viewBox="0 0 24 24"`
- 樣式：`fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
- 按鈕外觀：`32px` 圓形（`border-radius: 50%`），背景色 `var(--bg-card-alt)`，與所有 settings panel 按鈕一致
- `.active` 狀態：當 widget 開啟時，按鈕顯示 accent 高亮（選配，由 JS 切換 `.active` class）

---

## z-index 管理機制

### 全域計數器

定義在 `course.js` 頂部：

```javascript
var __widgetZ = 10500;
function __bringToTop(el) { el.style.zIndex = ++__widgetZ; }
```

### 運作方式

1. 所有 widget 的 CSS 基底 `z-index` 都是 `10500`。
2. 當 widget 開啟（`.open` 加上）時，MutationObserver 偵測到 class 變化，呼叫 `__bringToTop`。
3. 當使用者點擊任意 widget，mousedown listener 呼叫 `__bringToTop`。
4. `__bringToTop` 遞增 `__widgetZ` 並寫入 inline `style.zIndex`，覆蓋 CSS 基底值。
5. 最後操作（開啟或點擊）的 widget 永遠在最上層。

### z-index 層級對照

| 層級 | z-index 範圍 | 元素 |
|------|-------------|------|
| UI Chrome | 90 - 200 | Overlay, sidebar, hamburger |
| Settings | 500 | Settings panel |
| Presentation | 10000 | 簡報模式 deck |
| Spotlight | 10050 | 聚光燈 |
| Magnifier | 10060 | 放大鏡 |
| **Widgets** | **10500+** | Timer, Lottery, Vote, Share |
| Top layer | 11000 | Keyboard shortcuts modal, bonus overlay (pres) |

---

## Checklist：新增 Widget 完整檢查清單

完成以下所有項目後，新 widget 即可正常運作：

### HTML（`reference/base.html`）

- [ ] 容器 `<div class="xxx-widget" id="xxx-widget">`
- [ ] Header `<div class="xxx-header" id="xxx-drag-handle">`
- [ ] 標題 `<span class="xxx-title">` + 內聯 SVG icon + 文字
- [ ] 關閉按鈕 `<button class="xxx-close" id="xxx-widget-close">` + X SVG
- [ ] 主體 `<div class="xxx-body">`
- [ ] 放在 `</body>` 之前，其他 widget 附近

### CSS（`assets/course.css`）

- [ ] `.xxx-widget`：`position: fixed; background: var(--bg-widget); backdrop-filter: blur(12px); z-index: 10500; display: none; resize: both; user-select: none;`
- [ ] `.xxx-widget.open { display: flex; }`
- [ ] `.xxx-header`：`padding: .55rem .9rem; cursor: grab; background: var(--bg-card-alt); border-radius: 14px 14px 0 0;`
- [ ] `.xxx-title`：`font-size: .78rem; font-weight: 700; color: var(--text-dim);`
- [ ] `.xxx-close`：`background: none; border: none; cursor: pointer; color: var(--text-dim);`
- [ ] `.xxx-body`：`flex: 1; min-height: 0; padding: .85rem .9rem;`
- [ ] Settings button 樣式 `.xxx-settings-btn`：`32px` 圓形、`var(--bg-card-alt)` 背景
- [ ] Settings button SVG icon：`15x15`、`fill="none" stroke="currentColor"`
- [ ] Light theme 覆寫（選擇性）

### JS（`assets/course.js`）

- [ ] IIFE 結構 `(function () { ... })();`
- [ ] `var widget = document.getElementById('xxx-widget');`
- [ ] `var dragHandle = document.getElementById('xxx-drag-handle');`
- [ ] MutationObserver 呼叫 `__bringToTop(widget)`
- [ ] `widget.addEventListener('mousedown', ...)` 呼叫 `__bringToTop(widget)`
- [ ] `hideWidget()` 移除 `.open`
- [ ] `toggleWidget()` 切換 `.open`
- [ ] `window.__toggleXxxWidget = toggleWidget;`
- [ ] `closeBtn` 點擊事件呼叫 `hideWidget()`
- [ ] Escape 鍵關閉
- [ ] Drag 邏輯（`right: auto; bottom: auto; transform: none;` + viewport clamp）
- [ ] Settings panel 按鈕動態注入
- [ ] 鍵盤快捷鍵加入 keydown listener（單字母鍵 + 大小寫）
- [ ] X 鍵 handler 的 widget ID 陣列中加入 `'xxx-widget'`

### 測試

- [ ] 開啟 widget，確認顯示在螢幕上
- [ ] 拖曳 header，確認可移動且不超出視窗
- [ ] 拖曳 widget 邊角（`resize: both`），確認可調整大小
- [ ] 點擊 widget，確認 z-index 置顶（覆蓋其他 widget）
- [ ] 開啟另一個 widget，確認新的在最上層
- [ ] 按 X 鍵，確認所有 widget 關閉
- [ ] 按快捷鍵，確認切換開啟/關閉
- [ ] 按 Escape，確認關閉
- [ ] Settings panel 按鈕可開啟 widget
- [ ] Dark / Light 主題下外觀正確

---

## 參考資源

- HTML 模板來源：`.agents/skills/course-page-generator/reference/base.html`
- CSS 共用樣式：`assets/course.css`
- JS 共用邏輯：`assets/course.js`
- 全域 z-index 管理：`course.js` 頂部的 `__widgetZ` + `__bringToTop`
- Settings panel 結構：`base.html` 中的 `#settings-panel`
