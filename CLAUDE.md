# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 語言

所有溝通與內容一律使用**繁體中文**，專用技術名詞除外。

## 建置指令

```bash
# 建立新課程目錄（含 config.yaml、content.md 模板）
node .agents/skills/course-page-generator/scripts/new-lecture.mjs lectures/<course-dir>

# 建置前驗證語法（建議但非必須；檢查未閉合標籤、全形冒號、seo.url 格式）
node .agents/skills/course-page-generator/scripts/validate.mjs lectures/<course-dir>

# 建置單一課程頁（從 repo 根目錄執行）
node .agents/skills/course-page-generator/scripts/build.mjs lectures/<course-dir>

# 產生 OG 縮圖（每次 build 後必須執行，不可省略）
node .agents/skills/course-page-generator/scripts/generate-og.mjs lectures/<course-dir>

# 本機預覽含即時重載（預設 port 3000）
node .agents/skills/course-page-generator/scripts/dev.mjs lectures/<course-dir>

# 更新課程清單（新增/刪除課程後執行，產生 lectures/manifest.js）
node .agents/skills/course-page-generator/scripts/build-index.mjs

# 將 GAS URL 注入 vote/index.html（更新 vote.gas_url 後執行一次）
node .agents/skills/course-page-generator/scripts/build-vote.mjs
```

`npm install` 只需執行一次（唯一相依：Puppeteer，用於 OG 縮圖）。

## 架構概覽

```text
agent-skill-lecture-builder/
├── .agents/skills/
│   ├── course-page-generator/
│   │   ├── scripts/
│   │   │   ├── build.mjs           # Markdown + YAML → HTML（主 build）
│   │   │   ├── validate.mjs        # build 前語法驗證
│   │   │   ├── new-lecture.mjs     # 快速建立新課程目錄
│   │   │   ├── dev.mjs             # 本機預覽，監看變更自動重建
│   │   │   ├── generate-og.mjs     # Puppeteer 截圖產出 1200×630 OG 圖
│   │   │   ├── build-index.mjs     # 掃描 lectures/ 產生 manifest.js
│   │   │   └── build-vote.mjs      # 將 GAS URL 注入 vote/index.html
│   │   └── reference/
│   │       ├── base.html           # 唯一 HTML 模板（CSS/JS 全嵌入）
│   │       ├── components.md       # Markdown → HTML 元件對照（規範來源）
│   │       └── config-example.yaml
│   ├── content-drafting/SKILL.md   # 主題+受眾+時長 → content.md 草稿
│   ├── content-review/SKILL.md     # 分析教學節奏，輸出改善建議
│   ├── topic-to-page/SKILL.md      # 完整工作流（drafting → review → build）
│   ├── image-generator-dmxapi-gptimage2/  # AI 配圖生成（DMXAPI GPT Image 2）
│   │   ├── SKILL.md                # 工作流定義（模型選擇、風格、批次生成）
│   │   ├── .env                    # API Key（gitignore）
│   │   └── scripts/generate.mjs    # API 呼叫與存檔
│   └── widget-builder/SKILL.md     # 浮動 widget 建置規範（HTML/CSS/JS/z-index）
├── assets/
│   ├── course.css                  # 所有課程共用 CSS（外部引用，改動免 rebuild）
│   └── course.js                   # 計時器、抽籤、投票等互動功能
├── config/
│   ├── global.yaml                 # 全域設定（講者、社群、頁尾）
│   └── assets/                     # 共用圖片（author 頭像）
├── lectures/
│   ├── manifest.js                 # build-index.mjs 產出（需 commit）
│   └── <course-dir>/
│       ├── config.yaml             # 課程設定（覆寫 global）
│       ├── content.md              # 結構化 Markdown 講稿
│       ├── index.html              # build 產出（需 commit）
│       └── assets/
│           └── og-image.jpg        # OG 縮圖（需 commit）
├── vote/
│   ├── index.html                  # 學生投票頁（build-vote.mjs 注入 GAS URL）
│   └── vote-backend.gs             # Google Apps Script 後端參考腳本
└── index.html                      # 根目錄課程索引頁（動態讀取 manifest.js）
```

### Build 流程

`build.mjs` 單次執行：

1. 讀 `config/global.yaml`（從課程目錄往上最多 4 層搜尋）
2. 讀 `<course-dir>/config.yaml` deep merge 覆寫（陣列欄位整體取代）
3. 解析 `<course-dir>/content.md`（自訂 Markdown 語法，見下方）
4. 套用 `reference/base.html` 模板，填入 TOC、Scroll Spy
5. 輸出 `<course-dir>/index.html`（完全自包含，無外部 CDN）

`nav`（Hero 導覽按鈕）從 `content.md` 的 `#` 主章節自動產生，不需手動維護。

### Build 行為細節

- **自寫 YAML 解析器**：`build.mjs` 不用外部 YAML lib，已知限制：
  - **不支援行內 `#` 註解**：`key: value # comment` 的 `# comment` 會被當成值的一部分。註解必須獨立成行。
  - 複雜巢狀陣列（多層縮排）可能解析錯誤，請保持結構扁平。
- **`validate.mjs` 退出碼**：`0` = 可繼續 build（含 warnings）；`1` = 有 errors，應先修正。**只檢查 `content.md` 與 `seo.url` / `seo.image` 格式**，不檢查 `config.yaml` 語法。
- **本地圖片使用相對路徑**：`content.md` 中引用的本機圖片保持相對路徑引用，build 後由瀏覽器按需載入，不嵌入 base64，保持 HTML 輕量。
- **GitHub Pages URL 自動偵測**：從 `git remote get-url origin` 取得，失敗時 `seo.url` / `seo.image` 留空（不阻擋 build）。

### Config 合併規則

| 層級 | 檔案 | 說明 |
| --- | --- | --- |
| 全域 | `config/global.yaml` | 講者資訊、社群連結、頁尾預設值 |
| 課程 | `<course-dir>/config.yaml` | 僅寫需覆寫的欄位 |

陣列欄位（`socials`、`nav`）在課程 config 中定義時**整體取代**，不做合併。

`page.category`（字串）控制索引頁的分類篩選；`page.published: false` 可將課程從索引頁隱藏。

## Markdown 語法（`content.md`）

| 語法 | 用途 |
| --- | --- |
| `# LABEL：TITLE`（全形冒號） | 主章節（`#` 章節前加 `<hr class="divider">`） |
| `> text`（緊接 `#`） | 章節引言（`.lead`），非一般 blockquote |
| `## Title` | 子章節 |
| `### Title` | 卡片 |
| `` ```prompt [label="..."] `` | 程式碼區塊（無高亮，text） |
| `` ```terminal [label="..."] `` | 程式碼區塊（bash 高亮） |
| `> **Bold Title**` | Insight Box |
| `[flow]...[/flow]` | 流程步驟 |
| `[tags]...[/tags]` | 標籤（`green/orange/purple/blue`） |
| `[compare label-left="..." label-right="..."]` + `- 左 \| 右` | 左右對比卡 |
| `[vote id="..." title="..."]` + `- 選項` + `[/vote]` | 課堂投票（需設定 `vote.gas_url`） |
| `[quiz type="single"]` + `Q:` + `- [x] 正確` + `- [ ] 錯誤` + `Hint:` + `[/quiz]` | 即時測驗（純前端） |
| `- [x] 項目` | Checklist（帶勾選樣式） |
| `[summary]...[/summary]` | 總結卡片 |
| `[bonus title="..."]...[/bonus]` | 按鈕 + Modal 彈窗（延伸補充） |
| `[image-text position="left\|right" width="N"]...[/image-text]` | 圖文並排 |
| `[youtube id="..." title="..."]` | YouTube 嵌入（16:9 響應式） |
| `[tabs][tab label="..."]...[/tab][/tabs]` | 分頁切換卡（多語言範例對照） |
| `[callout type="info\|warning\|tip" title="..."]...[/callout]` | 標注框（藍/橙/綠三色） |
| `[accordion][item title="..." open]...[/item][/accordion]` | FAQ 摺疊區塊（純 `<details>`） |
| `[reveal title="..."]...[/reveal]` | 點擊揭曉答案 / Spoiler |
| `[timeline]` + `- 時間 \| 標題 \| 描述` + `[/timeline]` | 時間軸（技術演進、學習路徑） |
| `[steps-status]` + `- [done\|doing\|todo] 標題 \| 描述` + `[/steps-status]` | 帶狀態的步驟列表 |
| `` ```js [label="..."] `` | 程式碼區塊（自動語法高亮，支援 js/ts/py/bash/json/yaml/html/css/go/rust 等） |
| `` ```diff [label="..."] `` | Diff 對比區塊（`+` 綠 / `-` 紅） |
| `[compare-table headers="A \| **B** \| C"]` + `- 列 \| 1 \| 2 \| 3` | 多欄比較表（`**` 包住的欄位高亮為推薦） |
| `[stats]` + `- 數字 \| 標題 \| 描述` + `[/stats]` | 大字數據卡片格網 |
| `[?term\|定義]` | 行內術語 tooltip（hover 顯示定義） |
| `[dl]` + `- 詞 \| 解釋` + `[/dl]` | 名詞解釋對照（`<dl>`） |
| `---` | 章節分隔線 |

詳細語法與 HTML 對照見 `.agents/skills/course-page-generator/reference/components.md`。

## Agent Skills

### course-page-generator

課程頁面生成的完整工作流程定義在 `.agents/skills/course-page-generator/SKILL.md`。

當使用者說「幫我生成課程頁面」、「把講稿轉成課程頁面」或類似指令時，請讀取該檔案並依照其中的 Step 0–4 完整執行，包含：

- Step 0：偵測輸入類型（純主題 vs 有講稿 vs 現有目錄）
- Step 1：將講稿轉為結構化 `content.md`
- Step 2：確認或建立 `config.yaml`（含偵測 GitHub Pages 前綴）
- Step 3：執行 build
- Step 4：產生 OG 縮圖（與 Step 3 綁定，不可省略）

### content-drafting

根據主題、目標受眾、時長三個參數，AI 生成符合 `components.md` 語法的完整 `content.md` 草稿（有實質內容，非佔位骨架）。工作流程定義在 `.agents/skills/content-drafting/SKILL.md`。

當使用者說「幫我起草課程內容」、「生成 content.md」、「根據主題寫講義」或類似指令時，請讀取該檔案並執行，若未提供受眾或時長則主動詢問。

### content-review

分析現有 `content.md` 是否符合「說明→範例→實作」教學節奏，輸出章節節奏診斷表與改善建議清單。工作流程定義在 `.agents/skills/content-review/SKILL.md`。

當使用者說「審閱課程內容」「分析教學節奏」「幫我看 content.md」或類似指令時，請讀取該檔案並執行。說「審閱並存檔」「存成報告」時直接將報告寫入 `<course_dir>/review-report.md`，否則詢問使用者是否存檔。

### topic-to-page

從主題到課程頁面的完整工作流，依序串聯 content-drafting → content-review → course-page-generator 三個階段。每個 Phase 結束後暫停確認，使用者可插入修改後說「繼續 Phase N」恢復。工作流程定義在 `.agents/skills/topic-to-page/SKILL.md`。

當使用者說「從主題到頁面」「完整流程」「一鍵生成課程」「幫我完整做一個課程」時，請讀取該檔案並執行。

### image-generator-dmxapi-gptimage2

透過 DMXAPI GPT Image 2 為教材自動生成配圖。工作流程定義在 `.agents/skills/image-generator-dmxapi-gptimage2/SKILL.md`。

當使用者說「生成教材圖片」「幫課程加圖」「跑 image generator」或類似指令時，請讀取該檔案並執行 Phase 1-4：

- Phase 1：掃描 content.md，找出 `[image-here]` 佔位符與 AI 判斷的加圖位置，跳過已有圖片的段落
- Phase 2：互動確認 — 選模型（gpt-image-2-03 / gpt-image-2 / gpt-image-2-ssvip）、選全域風格、確認圖片計畫表
- Phase 3：批次呼叫 `scripts/generate.mjs` 生成圖片，存入 `assets/images/`
- Phase 4：回寫 content.md，使用 `[image-text]` 或獨立圖片語法嵌入

API Key 存放在 `.agents/skills/image-generator-dmxapi-gptimage2/.env`（已 gitignore）。首次使用時複製 `.env.example` 為 `.env` 並填入 Key。

### widget-builder

浮動 widget 的完整建置規範，涵蓋 HTML 結構（拖曳把手、關閉按鈕）、CSS 樣式（半透明毛玻璃背景、`.open` 切換）、JS IIFE 模式（z-index 管理、拖曳邏輯、鍵盤快捷鍵）、settings panel 整合。工作流程定義在 `.agents/skills/widget-builder/SKILL.md`。

當使用者說「新增 widget」「建立浮動面板」「加一個 widget」時，請讀取該檔案並依循規範產生程式碼。

**Widget z-index 規則**（容易踩雷）：
- 所有 widget 的 CSS 初始 `z-index: 10500`，由 `window.__bringToTop(widget)` 動態遞增覆寫。**直接改 CSS z-index 不會生效**，必須透過 `__bringToTop`。
- 拖曳開始時必須將 `right: auto; bottom: auto; transform: none` 清掉，否則位置會跳動。
- Settings 面板按鈕用 `document.createElement` 動態建立，注入 `window.__settingsRow2`（第二列），不要寫在 `base.html`。
- 新增 widget 後，必須把 widget ID 加入 `course.js` 的 `X` 鍵關閉列表，否則按 `X` 無法關閉。

## 關鍵慣例

- **禁止 Emoji**：所有課程內容、卡片標題、設定檔等一律不得使用 emoji，改用 SVG 或純文字。
- **無外部執行期相依**：`index.html` 為完全自包含（CSS/JS 全嵌入）。`base.html` 是唯一模板，禁止加入任何 CDN 連結。
- **`reference/` 為規範來源**：修改 `build.mjs` 或 `base.html` 前，需同步更新 `SKILL.md`。
- **`seo.image` / `seo.url` 須為絕對 URL**，且路徑必須含 `lectures/`：

  ```text
  seo.url:   https://<user>.github.io/<repo>/lectures/<course-dir>/
  seo.image: https://<user>.github.io/<repo>/lectures/<course-dir>/assets/og-image.jpg
  ```

  GitHub Pages base URL 可由 `git remote get-url origin` 自動偵測。
- **HTML 編碼**：在 HTML double-quoted 屬性（如 `onerror`）中嵌入 SVG 或 HTML 片段時，所有 `"` 必須改為 `&quot;`，否則 HTML 解析器會提前結束屬性，導致剩餘字串以可見文字輸出。
- **建置產物需 commit**：以下三個檔案是 GitHub Pages 部署的必要對象，build 後必須 commit：
  - `lectures/<course-dir>/index.html`
  - `lectures/<course-dir>/assets/og-image.jpg`
  - `lectures/manifest.js`（`build-index.mjs` 產出）
