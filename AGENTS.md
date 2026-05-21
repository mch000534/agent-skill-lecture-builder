# AGENTS.md

This file provides guidance to the AI agent when working with code in this repository.

## 語言
- 大部分情況都使用**繁體中文**，除非是特別的專用名詞外，何使用英文。

## 建置指令

```bash
# 建置課程頁面（Markdown + YAML → index.html）
node .agents/skills/course-page-generator/scripts/build.mjs <course-dir>

# 產生 OG 縮圖（需要 Puppeteer；每次建置後必須執行）
node .agents/skills/course-page-generator/scripts/generate-og.mjs <course-dir>

# 開發伺服器，含即時重載，預設 port 3000
node .agents/skills/course-page-generator/scripts/dev.mjs <course-dir>

# 更新課程清單（新增/刪除課程後執行，產生 lectures/manifest.js）
node .agents/skills/course-page-generator/scripts/build-index.mjs
```

`npm install` 只需執行一次（唯一相依套件為 Puppeteer）。

## 課程頁面工作流程

1. 將講稿轉換為結構化 Markdown（語法規範見 `.agents/skills/course-page-generator/reference/components.md`）
2. 建立或更新 `<course-dir>/config.yaml`（覆寫 `config/global.yaml` 的欄位）
3. 執行 `build.mjs`，接著執行 `generate-og.mjs`（OG 圖片為必要步驟，不可省略）

## Config 系統

- 兩層合併：`config/global.yaml`（基底）+ `<course-dir>/config.yaml`（覆寫）
- 陣列欄位（`socials`、`nav`）為**整體取代**，不會合併——如需覆寫請在課程 config 中完整重新定義
- GitHub Pages URL 透過 `git remote get-url origin` 自動偵測；如需手動指定請設定 `page.url`

## Markdown 語法注意事項

- 章節標題格式為 `# LABEL：TITLE`（全形冒號 `：`，非 ASCII 冒號 `:`）
- 自訂區塊標籤如 `[flow]`、`[tags]`、`[summary]`、`[bonus]`、`[image-text]`、`[youtube]` **不是**標準 Markdown——定義見 `reference/components.md`
- `# 章節` 標題正下方的 `> 文字` 會渲染為章節引言段落，而非一般 blockquote

## 無外部執行期相依

HTML 輸出為完全自包含（CSS/JS 已嵌入）。`.agents/skills/course-page-generator/reference/` 中的 `base.html` 為唯一模板——禁止加入 CDN 連結。

## 專案慣例

- **禁止 Emoji**：所有課程內容、卡片標題、設定檔一律不得使用 emoji，改用 SVG 或純文字
- 每門課程獨立存放於 `lectures/` 目錄下（例如 `lectures/gen-ai-security/`）
- 建置產物 `index.html` 與 `assets/og-image.jpg` 需與原始檔一同提交
- `.agents/skills/course-page-generator/reference/` 中的參考檔案為規範來源——修改前須同步更新 `SKILL.md`
- **HTML 屬性中的引號**：在 HTML double-quoted 屬性（如 `onerror`）中嵌入 SVG 或 HTML 片段時，所有 `"` 必須改為 `&quot;`
- **`seo.image` / `seo.url` 須為絕對 URL**，路徑必須含 `lectures/`（格式：`https://<user>.github.io/<repo>/lectures/<course-dir>/`）
