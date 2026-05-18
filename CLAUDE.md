# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 語言

所有溝通與內容一律使用**繁體中文**，專用技術名詞除外。

## 建置指令

```bash
# 建置單一課程頁（從 repo 根目錄執行）
node .agents/skills/course-page-generator/scripts/build.mjs lectures/<course-dir>

# 產生 OG 縮圖（每次 build 後必須執行，不可省略）
node .agents/skills/course-page-generator/scripts/generate-og.mjs lectures/<course-dir>

# 本機預覽含即時重載（預設 port 3000）
node .agents/skills/course-page-generator/scripts/dev.mjs lectures/<course-dir>

# 更新根目錄課程索引頁
node build-index.mjs
```

`npm install` 只需執行一次（唯一相依：Puppeteer，用於 OG 縮圖）。

## 架構概覽

```
agent-skill-lecture-builder/
├── .agents/skills/course-page-generator/
│   ├── scripts/
│   │   ├── build.mjs          # 主 build script（Markdown + YAML → HTML）
│   │   ├── dev.mjs            # 開發伺服器，監看變更自動重建
│   │   └── generate-og.mjs    # Puppeteer 截圖產出 1200×630 OG 圖
│   └── reference/
│       ├── base.html          # 唯一 HTML 模板（CSS/JS 全嵌入）
│       ├── components.md      # Markdown → HTML 元件對照（規範來源）
│       ├── config-example.yaml
│       └── content-example.md
├── config/
│   ├── global.yaml            # 全域設定（講者、社群、頁尾）
│   └── assets/                # 共用圖片（author 頭像）
├── lectures/
│   └── <course-dir>/
│       ├── config.yaml        # 課程設定（覆寫 global）
│       ├── content.md         # 結構化 Markdown 講稿
│       ├── index.html         # build 產出（需 commit）
│       └── assets/
│           └── og-image.jpg   # OG 縮圖（需 commit）
├── build-index.mjs            # 掃描 lectures/ 產生根目錄 index.html
└── index.html                 # 根目錄課程索引頁（build-index.mjs 產出）
```

### Build 流程

`build.mjs` 單次執行：
1. 讀 `config/global.yaml`（build 從課程目錄往上最多 4 層搜尋）
2. 讀 `<course-dir>/config.yaml` deep merge 覆寫（陣列欄位整體取代）
3. 解析 `<course-dir>/content.md`（自訂 Markdown 語法，見下方）
4. 套用 `reference/base.html` 模板，填入 TOC、Scroll Spy
5. 輸出 `<course-dir>/index.html`（完全自包含，無外部 CDN）

`nav`（Hero 導覽按鈕）從 `content.md` 的 `#` 主章節自動產生，不需手動維護。

### Config 合併規則

| 層級 | 檔案 | 說明 |
|------|------|------|
| 全域 | `config/global.yaml` | 講者資訊、社群連結、頁尾預設值 |
| 課程 | `<course-dir>/config.yaml` | 僅寫需覆寫的欄位 |

陣列欄位（`socials`、`nav`）在課程 config 中定義時**整體取代**，不做合併。

## Markdown 語法（`content.md`）

| 語法 | 用途 |
|------|------|
| `# LABEL：TITLE`（全形冒號） | 主章節（`#` 章節前加 `<hr class="divider">`） |
| `> text`（緊接 `#`） | 章節引言（`.lead`），非一般 blockquote |
| `## Title` | 子章節 |
| `### Title` | 卡片 |
| `` ```prompt [label="..."] `` | 終端機/Prompt 區塊 |
| `> **Bold Title**` | Insight Box |
| `[flow]...[/flow]` | 流程步驟 |
| `[tags]...[/tags]` | 標籤（`green/orange/purple/blue`） |
| `[summary]...[/summary]` | 總結卡片 |
| `[bonus title="..."]...[/bonus]` | 按鈕 + Modal 彈窗 |
| `[image-text position="left" width="N"]...[/image-text]` | 圖文並排 |
| `[youtube id="..." title="..."]` | YouTube 嵌入（16:9 響應式） |
| `---` | 章節分隔線 |

詳細語法與 HTML 對照見 `.agents/skills/course-page-generator/reference/components.md`。

## 關鍵慣例

- **禁止 Emoji**：所有課程內容、卡片標題、設定檔等一律不得使用 emoji，改用 SVG 或純文字。
- **無外部執行期相依**：`index.html` 為完全自包含（CSS/JS 全嵌入）。`base.html` 是唯一模板，禁止加入任何 CDN 連結。
- **`reference/` 為規範來源**：修改 `build.mjs` 或 `base.html` 前，需同步更新 `SKILL.md`。
- **`seo.image` / `seo.url` 須為絕對 URL**，且路徑必須含 `lectures/`：
  ```
  seo.url:   https://<user>.github.io/<repo>/lectures/<course-dir>/
  seo.image: https://<user>.github.io/<repo>/lectures/<course-dir>/assets/og-image.jpg
  ```
  GitHub Pages base URL 可由 `git remote get-url origin` 自動偵測。
- **HTML 編碼**：在 HTML double-quoted 屬性（如 `onerror`）中嵌入 SVG 或 HTML 片段時，所有 `"` 必須改為 `&quot;`，否則 HTML 解析器會提前結束屬性，導致剩餘字串以可見文字輸出。
- **建置產物需 commit**：`lectures/<course-dir>/index.html` 與 `assets/og-image.jpg` 都是必要的 commit 對象。
