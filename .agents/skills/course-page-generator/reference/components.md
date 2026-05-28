# Component Mapping Reference

Markdown 語法 → HTML 元件的完整對照。產生 HTML 時依此規則轉換。

## 1. Section（主章節）

**Markdown：**
```markdown
# 新專案：用 SDD 讓 AI 根據規格建立專案
> 規格驅動開發（Spec-Driven Development）— 讓 AI 不只寫程式，還幫你建立完善的規格文件
```

**HTML：**
```html
<hr class="divider">
<section class="section" id="new-project">
  <div class="reveal">
    <span class="section-label"><span class="num">1</span> 新專案</span>
    <h2>用 SDD 讓 AI 根據規格建立專案</h2>
    <p class="lead">
      規格驅動開發（Spec-Driven Development）— 讓 AI 不只寫程式，還幫你建立完善的規格文件
    </p>
  </div>
```

規則：
- `#` 標題以冒號分為 label 和 title（`# LABEL：TITLE`），冒號前為 section-label，冒號後為 h2
- 若無冒號，整個作為 h2，section-label 使用簡短版
- 緊接著的 `>` blockquote 作為 `.lead` 段落
- 自動遞增編號（第一個主章節 = 1）
- `id` 由標題轉為 kebab-case 英文（需要你根據語意判斷）
- 第一個 section 前加 `<hr class="divider">`

## 2. Sub-section（子章節）

**Markdown：**
```markdown
## OpenSpec 初始化
```

**HTML：**
```html
<div class="reveal" id="sub-openspec-init">
  <div class="sub-title"><span class="bar"></span>OpenSpec 初始化</div>
```

規則：
- `##` 標題轉為 `.sub-title`
- 自動產生 `id`（加 `sub-` 前綴）
- 出現在 TOC 的子項目中

## 3. Card（卡片）

**Markdown：**
```markdown
### 為什麼需要 OpenSpec？
- AI 寫程式越來越快，但專案越改越亂
- 關鍵人物離職，沒有文件，系統知識直接斷層
- 解法：白話文對話 → AI 自動建立規格文件
```

**HTML：**
```html
<div class="card">
  <h3>為什麼需要 OpenSpec？</h3>
  <ul>
    <li>AI 寫程式越來越快，但專案越改越亂</li>
    <li>關鍵人物離職，沒有文件，系統知識直接斷層</li>
    <li>解法：白話文對話 → AI 自動建立規格文件</li>
  </ul>
</div>
```

規則：
- `###` 標題 → card 的 `h3`（不使用 emoji）
- 底下的 bullet list → card 內的 `<ul>`
- 底下的段落 → card 內的 `<p>`
- 整個 card 包在 `<div class="reveal">` 中

## 4. Prompt / Terminal Block（提示區塊）

**Markdown：**
~~~markdown
```prompt [label="Claude Code"]
扮演一位擅長用實際案例解說的資安專家，
設計「生成式 AI 資訊安全」的講義並生成網頁
```

```terminal [label="Terminal"]
mkdir -p lectures/my-course/assets
```
~~~

**HTML（兩者皆渲染為一般 .code-block）：**
```html
<div class="code-block">
  <div class="code-header">
    <span class="code-lang">text</span>
    <span class="code-label">Claude Code</span>
    <button class="copy-btn" ...>...</button>
  </div>
  <pre class="code-body"><code class="lang-text">扮演一位擅長用實際案例解說的資安專家，
設計「生成式 AI 資訊安全」的講義並生成網頁</code></pre>
</div>
```

規則：
- ````prompt` 渲染為 `.code-block`，語言標示為 `text`（無語法高亮）
- ````terminal` 渲染為 `.code-block`，語言標示為 `bash`（bash 語法高亮）
- `[label="..."]` 可選，顯示在 header 右側
- 與 `js`、`yaml` 等程式碼區塊共用 `.code-block` 樣式

## 5. Insight Box（洞察框）

**Markdown：**
```markdown
> **AI 正在改變企業決策**
> 過去 Dashboard 這類系統，企業通常找廠商購買、支付年費維護。
> 但 Vibe Coding 的出現正讓企業做出不同的選擇。
```

**HTML：**
```html
<div class="insight">
  <div class="insight-title">AI 正在改變企業決策</div>
  <p>過去 Dashboard 這類系統，企業通常找廠商購買、支付年費維護。</p>
  <p style="margin-top:.5rem">但 Vibe Coding 的出現正讓企業做出不同的選擇。</p>
</div>
```

規則：
- blockquote 第一行以 `**粗體**` 開頭 → insight box
- 粗體文字成為 `.insight-title`
- 後續段落（以空行分隔）分別成為 `<p>` 元素
- 若 blockquote 不以粗體開頭，則判斷為普通引言或 lead 文字

## 6. Flow Steps（流程步驟）

**Markdown：**
```markdown
[flow]
1. proposal.md — 確認目標與範圍
2. design.md — 技術選型與風險評估
3. specs/ — 按功能分類的詳細規格
4. task.md — 任務清單，完成自動打勾
[/flow]
```

**HTML：**
```html
<div class="flow">
  <div class="flow-step">
    <div class="step-num">1</div>
    <div class="step-title">proposal.md</div>
    <div class="step-desc">確認目標與範圍</div>
  </div>
  <div class="flow-step">
    <div class="step-num">2</div>
    <div class="step-title">design.md</div>
    <div class="step-desc">技術選型與風險評估</div>
  </div>
  <!-- ... -->
</div>
```

規則：
- 使用 `[flow]...[/flow]` 包裹 ordered list
- 每個項目以 `—` 或 ` - ` 分隔標題和描述
- 若無分隔符，整行作為 step-title，step-desc 留空
- 也可以不用 `[flow]` 標記，在 `###` 卡片標題包含「流程」「步驟」等關鍵字時自動轉換

## 7. Compare（左右對比卡）

**Markdown：**
```markdown
[compare label-left="以前的做法" label-right="現在的做法"]
- 手動複製貼上 commit message | 使用 git-smart-commit Skill 自動生成
- 風格不一致，長短隨機 | 統一格式，一行摘要 + bullet 詳情
- 想修改時得回去改 HTML | 只要更新 content.md 重新 build
[/compare]
```

**HTML：**
```html
<div class="compare">
  <div class="compare-header">
    <div class="compare-label compare-label--old">以前的做法</div>
    <div class="compare-label compare-label--new">現在的做法</div>
  </div>
  <div class="compare-body">
    <div class="compare-row">
      <div class="compare-cell compare-cell--old">手動複製貼上 commit message</div>
      <div class="compare-cell compare-cell--new">使用 git-smart-commit Skill 自動生成</div>
    </div>
    <!-- ... -->
  </div>
</div>
```

規則：
- `label-left` / `label-right`：左右欄標題（省略時預設「舊做法」/「新做法」）
- 每行格式：`- 左側內容 | 右側內容`（`|` 為分隔符）
- 左欄：紅色調（代表舊/問題），右欄：綠色調（代表新/解法）
- 支援行內 Markdown（`**粗體**`、`` `code` ``、連結）

## 8. Vote（課堂投票嵌入）

**前置條件：** `config.yaml` 需設定 `vote.gas_url`，指向 Google Apps Script Web App URL。

**Markdown：**
```markdown
[vote id="tool-pref" title="你最常用的 AI 工具？"]
- Claude
- ChatGPT
- Gemini
- 其他
[/vote]
```

**規則：**
- `id`：投票場次唯一識別碼（需與 Google Sheets sessions 表的 sessionId 一致）
- `title`：顯示給學員的問題文字
- 選項以 `- ` 開頭，最多支援 26 個選項（A–Z）
- 頁面載入時自動向 GAS 建立場次（idempotent）
- 已投票者（localStorage 記錄）自動顯示結果橫條圖
- 未設定 `vote.gas_url` 時按鈕停用並顯示提示

**config.yaml 設定：**
```yaml
vote:
  gas_url: "https://script.google.com/macros/s/<deployment-id>/exec"
```

---

## 9. Quiz（即時測驗）

**Markdown：**
```markdown
[quiz type="single"]
Q: Claude 預設使用哪個模型？
- [ ] GPT-4
- [x] claude-sonnet-4-6
- [ ] Gemini Pro
Hint: 查看 CLAUDE.md 的 Environment 段落
[/quiz]
```

**是非題：**
```markdown
[quiz type="bool"]
Q: build.mjs 會自動讀取 global.yaml？
- [x] 是
- [ ] 否
[/quiz]
```

**規則：**
- `type`：`single`（單選）或 `bool`（是非），目前 HTML 輸出相同，僅作語意標記
- `Q:` 行定義問題文字
- `- [x]` 為正確選項，`- [ ]` 為錯誤選項；正確選項只能有一個
- `Hint:` 為選填，答錯後顯示提示文字
- 答題結果存入 `localStorage`，重新整理後保留狀態
- 若 `data-quiz-answer="-1"`（無正確答案），點選任何選項僅記錄，不顯示對錯

---

## 10. Tags（標籤）

**Markdown：**
```markdown
[tags]
- [orange] 人工手打：耗時且風格不一致
- [purple] AI 自動生成：長短隨機、中英混雜
- [green] 解法：git-smart-commit Skill
[/tags]
```

**HTML：**
```html
<div class="tags">
  <span class="tag orange">人工手打：耗時且風格不一致</span>
  <span class="tag purple">AI 自動生成：長短隨機、中英混雜</span>
  <span class="tag green">解法：git-smart-commit Skill</span>
</div>
```

可用顏色：`green`, `orange`, `purple`, `blue`

⚠️ 帶顏色的 `- [color] text` 項目**必須**放在 `[tags]...[/tags]` 區塊內才會生效。獨立使用時會被當成普通文字，不會套用顏色樣式。

## 11. Checklist（勾選清單）

**Markdown：**
```markdown
- [x] 電子郵件格式錯誤 → 前端擋住、不呼叫 API
- [x] 密碼不符規則 → 顯示對應錯誤訊息
- [x] 格式正確 → 呼叫 Mock API → 成功取得 Token
```

**HTML：**
```html
<ul class="checklist">
  <li>電子郵件格式錯誤 → 前端擋住、不呼叫 API</li>
  <li>密碼不符規則 → 顯示對應錯誤訊息</li>
  <li>格式正確 → 呼叫 Mock API → 成功取得 Token</li>
</ul>
```

規則：
- `- [x]` 項目 → checklist（CSS 自帶 ✓ 圖示）

適用場景：表達「已驗證」「已完成」「已踩過的坑」等**帶有完成語意**的事項清單。
- ✅ 適合：測試情境清單、踩坑紀錄、已確認的檢查項目
- ❌ 不適合：核心觀點、重點摘要、一般條列（這些應使用卡片 `###` + 普通 list `- item`）

## 12. Bonus（延伸補充彈窗）

**Markdown：**
```markdown
[bonus title="延伸閱讀：Prompt Caching 最佳實踐"]
- 在對話開頭放置最穩定的內容（system prompt、文件）
- 動態內容放最後，避免破壞快取前綴
- 搭配 `cache_control: ephemeral` 標記快取斷點
[/bonus]
```

**HTML：**
```html
<button class="bonus-btn"
  data-bonus-title="延伸閱讀：Prompt Caching 最佳實踐"
  data-bonus-content="- 在對話開頭放置最穩定的內容（system prompt、文件）&#10;- 動態內容放最後，避免破壞快取前綴&#10;- 搭配 `cache_control: ephemeral` 標記快取斷點">
  延伸閱讀：Prompt Caching 最佳實踐
</button>
```

規則：
- `[bonus title="..."]...[/bonus]` 包裹任意 Markdown 內容
- `title` 為按鈕顯示文字（必填）
- 區塊內容在點擊按鈕後以 Modal 彈窗顯示
- 內容支援一般 Markdown（段落、列表、`code`、**粗體**）
- 適用場景：補充知識、進階延伸、不影響主線閱讀的參考資料

## 13. Summary Grid（總結卡片）

**Markdown：**
```markdown
# 總結
[summary]
- **新專案 — SDD** | OpenSpec + Spec-Driven Development，讓 AI 根據規格建立 Dashboard
- **舊專案 — Skills** | 設計 Commit / PR / Worktree Skills，讓 AI 有規範可循
- **導入測試 — CI/CD** | 用 Workflow 驅動 AI 撰寫測試，搭配 GitHub Action 守住品質
[/summary]
```

**HTML：**
```html
<div class="summary-grid">
  <div class="summary-card">
    <h4>新專案 — SDD</h4>
    <p>OpenSpec + Spec-Driven Development，讓 AI 根據規格建立 Dashboard</p>
  </div>
  <!-- ... -->
</div>
```

規則：
- `[summary]...[/summary]` 包裹的 list
- 每項格式：`**標題** | 描述`（不使用 emoji）
- 粗體 → `<h4>`，`|` 後面 → `<p>`

## 14. Image（獨立圖片）

**Markdown：**
```markdown
![架構示意圖](images/architecture.png)
```

**HTML：**
```html
<figure class="content-image">
  <img src="images/architecture.png" alt="架構示意圖" loading="lazy">
  <figcaption>架構示意圖</figcaption>
</figure>
```

規則：
- 獨立一行的 `![alt](src)` → 圖片區塊，置中顯示
- `alt` 文字自動成為 `<figcaption>` 圖片說明
- 若 `alt` 為空則不產生 figcaption
- 圖片包在 `<div class="reveal">` 中
- 行內圖片（在文字段落或列表中）則以 `<img class="inline-image">` 渲染

## 15. Image-Text（圖文並排）

**Markdown：**
```markdown
[image-text position="left" width="50"]
![產品截圖](images/screenshot.png)
這是產品的主要介面，提供了 **直覺式操作** 體驗。
- 支援拖放操作
- 即時預覽結果
[/image-text]
```

**HTML：**
```html
<div class="image-text" style="--img-width:50%">
  <div class="image-text__img">
    <img src="images/screenshot.png" alt="產品截圖" loading="lazy">
  </div>
  <div class="image-text__body">
    <p>這是產品的主要介面，提供了 <strong>直覺式操作</strong> 體驗。</p>
    <ul>
      <li>支援拖放操作</li>
      <li>即時預覽結果</li>
    </ul>
  </div>
</div>
```

規則：
- `[image-text]...[/image-text]` 包裹圖片與文字
- `position="left"`（預設）：圖片在左、文字在右
- `position="right"`：圖片在右、文字在左
- `width="N"` 設定圖片佔比百分比（預設 40），例如 `width="30"` 或 `width="60"`
- 文字區域支援段落、**粗體**、`程式碼`、連結、列表等行內格式
- 響應式：平板（≤ 900px）及手機自動改為上下排列（圖片在上）
- 整個區塊包在 `<div class="reveal">` 中

## 16. YouTube Embed（YouTube 影片嵌入）

**Markdown（單行）：**
```markdown
[youtube id="dQw4w9WgXcQ" title="Demo 影片"]
```

**Markdown（區塊，含說明文字）：**
```markdown
[youtube id="dQw4w9WgXcQ"]
這是一段示範影片的說明
[/youtube]
```

**HTML：**
```html
<div class="youtube-embed">
  <div class="youtube-wrapper" data-id="dQw4w9WgXcQ">
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Demo 影片" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
  </div>
  <p class="youtube-caption">Demo 影片</p>
</div>
```

規則：
- `id` 為 YouTube 影片 ID（網址中 `v=` 後面的值）
- `title` 為選填的影片標題/說明，會顯示在影片下方
- 區塊形式 `[youtube]...[/youtube]` 中間的文字作為 caption
- 影片以 16:9 比例響應式嵌入
- 列印模式下 iframe 隱藏，改為顯示 YouTube 連結
- 整個區塊包在 `<div class="reveal">` 中

## 17. Tabs 切換卡

**Markdown：**
```markdown
[tabs]
[tab label="Python"]
- 第一種寫法
- 適合初學者
[/tab]
[tab label="JavaScript"]
- 另一種寫法
- 適合前端開發者
[/tab]
[/tabs]
```

**HTML：**
```html
<div class="tabs-block">
  <div class="tabs-nav">
    <button class="tab-btn active" data-tab="0">Python</button>
    <button class="tab-btn" data-tab="1">JavaScript</button>
  </div>
  <div class="tab-panel active" data-panel="0">
    <ul><li>第一種寫法</li><li>適合初學者</li></ul>
  </div>
  <div class="tab-panel" data-panel="1">
    <ul><li>另一種寫法</li><li>適合前端開發者</li></ul>
  </div>
</div>
```

規則：
- `[tab label="..."]` 定義每個分頁的標籤名稱
- 內容支援 `- 項目`（轉為 `<ul><li>`）與一般段落（轉為 `<p>`）
- 第一個分頁預設顯示，其餘隱藏
- 點擊標籤切換，帶淡入動畫

---

## 18. Callout 標注框

**Markdown：**
```markdown
[callout type="info"]
這是一個提示訊息，說明某個重要概念。
[/callout]

[callout type="warning" title="注意"]
此操作無法還原，請謹慎執行。
[/callout]

[callout type="tip" title="實用技巧"]
- 技巧一：簡短有力
- 技巧二：配合實例
[/callout]
```

**HTML：**
```html
<div class="callout callout--info">
  <div class="callout-icon"><!-- info SVG --></div>
  <div class="callout-body">
    <p>這是一個提示訊息，說明某個重要概念。</p>
  </div>
</div>

<div class="callout callout--warning">
  <div class="callout-icon"><!-- warning SVG --></div>
  <div class="callout-body">
    <div class="callout-title">注意</div>
    <p>此操作無法還原，請謹慎執行。</p>
  </div>
</div>
```

規則：
- `type` 三種值：`info`（藍）、`warning`（橙）、`tip`（綠），預設 `info`
- `title` 選用，省略則無標題列
- 內容支援 `- 項目`（轉為 `<ul><li>`）與一般段落（轉為 `<p>`）
- 左側 3px 彩色邊框 + 對應圖示，純 CSS 無需 JS

---

## 19. Accordion / FAQ 摺疊區塊

**Markdown：**
```markdown
[accordion]
[item title="什麼是 Agent Skill？" open]
Agent Skill 是讓 Claude Code 學會新能力的設定包。
- 包含一份 SKILL.md
- 可選 scripts/ 與 reference/
[/item]
[item title="如何啟用 Skill？"]
把 skill 放到 `.agents/skills/` 或 `~/.claude/skills/` 即可被偵測。
[/item]
[/accordion]
```

**HTML：**
```html
<div class="accordion">
  <details class="acc-item" open>
    <summary>什麼是 Agent Skill？</summary>
    <div class="acc-body">
      <p>Agent Skill 是讓 Claude Code 學會新能力的設定包。</p>
      <ul><li>包含一份 SKILL.md</li><li>可選 scripts/ 與 reference/</li></ul>
    </div>
  </details>
  <details class="acc-item">
    <summary>如何啟用 Skill？</summary>
    <div class="acc-body"><p>把 skill 放到 <code>.agents/skills/</code> 或 <code>~/.claude/skills/</code> 即可被偵測。</p></div>
  </details>
</div>
```

規則：
- `[accordion]...[/accordion]` 包多個 `[item]`
- `[item title="..."]`：必填 title
- `[item title="..." open]`：加 `open` 則預設展開
- 內容支援 `- 項目`（轉為 `<ul><li>`）與一般段落
- 純 `<details>/<summary>`，零 JS

適用場景：FAQ、進階補充、延伸閱讀、分類收合的長條列。

---

## 20. Reveal / Spoiler 點擊揭曉

**Markdown：**
```markdown
[reveal title="點擊查看解答"]
答案：useEffect 配合 cleanup function 即可避免 memory leak。
- 在 effect 內回傳一個函式
- 函式內取消訂閱 / 清除 timer
[/reveal]
```

**HTML：**
```html
<details class="spoiler">
  <summary>點擊查看解答</summary>
  <div class="spoiler-body">
    <p>答案：useEffect 配合 cleanup function 即可避免 memory leak。</p>
    <ul><li>在 effect 內回傳一個函式</li><li>函式內取消訂閱 / 清除 timer</li></ul>
  </div>
</details>
```

規則：
- `title` 選填，省略則預設「點擊查看解答」
- 內容支援列表與段落（與 accordion 同）
- 樣式為虛線框 + 居中文字，展開後變實線框

適用場景：開放式問題答案、需要學員先思考再揭曉的內容、隱藏 spoiler。

---

## 21. Timeline 時間軸

**Markdown：**
```markdown
[timeline]
- 2020 | GPT-3 發布 | OpenAI 正式公開 API，AI 寫程式雛形
- 2022/11 | ChatGPT 問世 | 全民 AI 元年，產業認知大幅轉變
- 2024 | Claude 3 系列 | Anthropic 進入第一梯隊
- 2026 | Agent Skills | AI 開始具備可組合的能力
[/timeline]
```

**HTML：**
```html
<ol class="timeline">
  <li>
    <div class="tl-dot"></div>
    <div class="tl-time">2020</div>
    <div class="tl-title">GPT-3 發布</div>
    <div class="tl-desc">OpenAI 正式公開 API，AI 寫程式雛形</div>
  </li>
  <!-- ... -->
</ol>
```

規則：
- 每項格式：`- 時間 | 標題 | 描述`
- 描述（第三欄）可省略：`- 2020 | GPT-3 發布`
- 純 CSS 直線軸 + 圓點，無 JS

適用場景：技術演進、版本變遷、學習路徑、專案里程碑。

---

## 22. Steps with Status 帶狀態步驟

**Markdown：**
```markdown
[steps-status]
- [done] 環境設定 | 安裝 Node.js 與 Claude Code
- [done] 建立第一個 Skill | 用 skill-creator 生成模板
- [doing] 撰寫 CI workflow | 接 GitHub Action 自動跑測試
- [todo] 部署到 production | 觀察一週後決定是否擴大導入
[/steps-status]
```

**HTML：**
```html
<ol class="steps-status">
  <li class="is-done">
    <div class="ss-icon"><!-- check SVG --></div>
    <div>
      <div class="ss-title">環境設定</div>
      <div class="ss-desc">安裝 Node.js 與 Claude Code</div>
    </div>
  </li>
  <li class="is-doing">
    <div class="ss-icon"><!-- pulsing dot --></div>
    <div>
      <div class="ss-title">撰寫 CI workflow</div>
      <div class="ss-desc">接 GitHub Action 自動跑測試</div>
    </div>
  </li>
  <!-- ... -->
</ol>
```

規則：
- 每項格式：`- [status] 標題 | 描述`
- `status` 三種值：
  - `done` — 綠勾、綠左邊框
  - `doing` — 藍色脈動圓、藍左邊框
  - `todo` — 灰空圓、灰左邊框（透明度降低）
- 描述可省略：`- [done] 環境設定`

適用場景：進度追蹤、學習路徑（已學完/正在學/還沒學）、專案狀態看板、Sprint 任務清單。

差別於 `[flow]`：`[flow]` 是線性流程的「步驟說明」，`[steps-status]` 額外帶執行狀態。

---

## 23. Code Block 與語法高亮

**Markdown：**
~~~markdown
```js [label="範例：階乘函式"]
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
```
~~~

支援語言：`js / javascript / ts / typescript / jsx / tsx / py / python / bash / sh / shell / zsh / json / yaml / yml / html / xml / css / scss / go / rust / rs / java / kotlin / swift / rb / ruby / php / sql`。其他語言會以 plain code-block 呈現（無上色）。

**HTML：**
```html
<div class="code-block">
  <div class="code-header">
    <span class="code-lang">js</span>
    <span class="code-label">範例：階乘函式</span>
    <button class="copy-btn" ...>...</button>
  </div>
  <pre class="code-body"><code class="lang-js"><span class="tok-kw">function</span> <span class="tok-fn">factorial</span>(n) {
  <span class="tok-kw">if</span> (n &lt;= <span class="tok-num">1</span>) <span class="tok-kw">return</span> <span class="tok-num">1</span>;
  <span class="tok-kw">return</span> n * <span class="tok-fn">factorial</span>(n - <span class="tok-num">1</span>);
}</code></pre>
</div>
```

規則：
- 建置時 tokenize（無 runtime JS）；token 類別：`tok-kw / tok-str / tok-num / tok-com / tok-fn`
- 自動深淺色切換（沿用 `data-theme="light"`）
- `[prompt]` / `[terminal]` 區塊也使用 `.code-block`（見 Section 4）

---

## 24. Code Diff

**Markdown：**
~~~markdown
```diff [label="重構 useState callback"]
- const inc = () => setCount(count + 1);
+ const inc = () => setCount(c => c + 1);
  return <button onClick={inc}>{count}</button>;
```
~~~

**HTML：**
```html
<div class="code-block code-block--diff">
  <div class="code-header">
    <span class="code-lang">diff</span>
    ...
  </div>
  <pre class="code-body"><code>
<span class="diff-del">- const inc = () =&gt; setCount(count + 1);</span>
<span class="diff-add">+ const inc = () =&gt; setCount(c =&gt; c + 1);</span>
<span class="diff-eq">  return &lt;button onClick={inc}&gt;{count}&lt;/button&gt;;</span>
  </code></pre>
</div>
```

規則：
- 每行第一個字元決定樣式：`+` 綠（新增）、`-` 紅（刪除）、其他（含空白）為不變
- 不做語法高亮，整行染色避免視覺混亂

---

## 25. Comparison Table 多欄比較

**Markdown：**
```markdown
[compare-table headers="免費版 | **Pro 版** | 企業版"]
- 月費 | $0 | $10 | 客制
- 用戶數 | 1 | 10 | 無限
- 技術支援 | 社群 | Email | 24/7
[/compare-table]
```

**HTML：**
```html
<div class="compare-table-wrap">
  <table class="compare-table">
    <thead>
      <tr>
        <th></th>
        <th>免費版</th>
        <th class="is-highlight">Pro 版</th>
        <th>企業版</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th class="row-label">月費</th>
        <td>$0</td>
        <td class="is-highlight">$10</td>
        <td>客制</td>
      </tr>
      <!-- ... -->
    </tbody>
  </table>
</div>
```

規則：
- `headers="A | B | C"` 定義欄位名
- 用 `**...**` 包住的 header 會加上「推薦」徽章與背景色，整欄資料也跟著上色
- 每列：`- 列標題 | 欄1 | 欄2 | 欄3`
- 比 `[compare]`（僅 2 欄）更適合多方案 / 多版本對照

---

## 26. Stats / Metric 數據卡

**Markdown：**
```markdown
[stats]
- 80% | 節省時間 | 從 5 小時降至 1 小時
- 3x | 開發速度 | 平均 PR 完成時間
- 99.9% | 服務可用性 | 過去 12 個月統計
[/stats]
```

**HTML：**
```html
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value">80%</div>
    <div class="stat-title">節省時間</div>
    <div class="stat-desc">從 5 小時降至 1 小時</div>
  </div>
  <!-- ... -->
</div>
```

規則：
- 每項格式：`- 數字 | 標題 | 描述`，標題與描述皆選用
- 自動 grid 排列，最小 180px 寬，自動換行
- 數字以 accent 色大字呈現，搭配 hover 上浮動畫

適用：成效呈現、效能指標、覆蓋率、用量統計。

---

## 27. Glossary Tooltip 行內術語

**Markdown：**
```markdown
這個專案使用 [?RAG|Retrieval-Augmented Generation，透過向量檢索增強模型生成] 概念。
```

**HTML：**
```html
這個專案使用 <span class="gloss" tabindex="0" data-tip="Retrieval-Augmented Generation，透過向量檢索增強模型生成">RAG</span> 概念。
```

規則：
- 行內語法 `[?術語|定義]`，加在任何段落、列表項、卡片內皆可
- hover 或 focus（鍵盤 Tab）即顯示定義
- 純 CSS tooltip（`::after` + `data-tip`），無 JS
- 術語下方虛線提示可互動

適用場景：行內首次出現的縮寫、專有名詞、需要簡短解釋的概念。

---

## 28. Definition List 名詞解釋對照

**Markdown：**
```markdown
[dl]
- RAG | Retrieval-Augmented Generation，透過向量檢索增強模型生成
- LLM | Large Language Model，大型語言模型
- MCP | Model Context Protocol，Anthropic 的工具協定
[/dl]
```

**HTML：**
```html
<dl class="definition-list">
  <dt>RAG</dt>
  <dd>Retrieval-Augmented Generation，透過向量檢索增強模型生成</dd>
  <dt>LLM</dt>
  <dd>Large Language Model，大型語言模型</dd>
  <!-- ... -->
</dl>
```

規則：
- 每項格式：`- 術語 | 定義`
- 兩欄 CSS Grid 對齊；術語以 accent 色 chip 樣式呈現
- 適用於一次列出多項術語（章末名詞表、附錄）；行內單一術語請用 §27 Glossary Tooltip

---

## 29. Inline Elements

| Markdown | HTML | 說明 |
|---|---|---|
| `**bold**` | `<strong>` | 粗體 |
| `` `code` `` | `<code>` | 行內程式碼 |
| `[text](url)` | `<a href="url">text</a>` | 連結 |
| `[?term\|定義]` | `<span class="gloss" data-tip="...">term</span>` | 行內術語 tooltip |
| 一般段落 | `<p>` | card 或 section 內的段落 |

## 30. Wrapping Rules

- 每個獨立元件都包在 `<div class="reveal">` 中以啟動滾動動畫
- 連續的 card + code-block 可以在同一個 reveal wrapper 中
- insight box 通常獨立一個 reveal wrapper

## Social Link SVG Icons

用於 instructor section 和 footer 的社群連結 icon：

| Platform | SVG |
|---|---|
| Medium | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42S14.2 15.54 14.2 12s1.51-6.42 3.38-6.42 3.38 2.88 3.38 6.42zm2.94 0c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75c.66 0 1.19 2.58 1.19 5.75z"/></svg>` |
| Facebook | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` |
| Threads | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.287 3.263-.809.993-1.927 1.587-3.324 1.768-1.138.147-2.258-.058-3.15-.579-1.005-.586-1.65-1.524-1.818-2.638-.322-2.15.946-3.71 2.476-4.407.967-.44 2.164-.685 3.553-.731-.21-1.118-.658-1.905-1.348-2.365-.823-.548-1.943-.685-3.125-.61l-.145-2.118c1.508-.098 2.995.097 4.165.86 1.024.668 1.73 1.69 2.102 3.058.8-.065 1.559-.033 2.24.128 2.346.555 3.844 2.086 4.33 4.13.612 2.573-.134 5.46-2.392 7.35-1.895 1.588-4.258 2.392-7.028 2.392z"/></svg>` |
| YouTube | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` |
| GitHub | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>` |
| LinkedIn | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` |
| Email | `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>` |
