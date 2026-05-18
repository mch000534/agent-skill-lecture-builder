# Course Page Generator

> [!NOTE]
> 📺 **搭配影片觀看效果更佳** — [YouTube 完整教學](https://youtu.be/0pZri5f_tfk)

❝Vibe Coding 速度很快，但用完就丟的東西，永遠不會變成你的！❞

這句話，是我用 Vibe Coding 做了幾十個網頁後的感悟。

- 👉 AI 生成的網頁很漂亮，但細節與架構很難調整
- 👉 每次生成結果都很隨機，風格、排版無法完全掌控
- 👉 做完的東西無法重複使用，下次又要從零開始

這支影片將透過實戰，帶你用「模板思維 + Agent Skills」解決以上痛點：

1. 登入 ChatGPT 免費體驗 Codex
2. 終端機 vs 編輯器，自由選擇操作模式
3. 把 AI 隨機的輸出，變成可用 Markdown 維護的模板
4. 將模板封裝成 Agent Skill，建立完整工作流
5. 一鍵部署到 GitHub Pages，讓講義網頁上線

> AI 時代下，Vibe Coding 的價值不在於生成速度 ──
> 而在於你能不能把成果從「免洗餐具」變成「長期工具」

---

提供主題 or Markdown 講稿，透過 Agent Skills 產生單一 HTML 課程頁面。

## 目錄

- [Quick Start](#quick-start)
- [專案結構](#專案結構)
- [新增一門課程](#新增一門課程)
- [課程目錄索引頁](#課程目錄索引頁)
- [開發伺服器](#開發伺服器)
- [Config 機制](#config-機制)
- [Markdown 語法](#markdown-語法)

## Quick Start

```bash
# 安裝依賴（OG 縮圖產生需要 puppeteer）
npm install
```

在 AI 對話窗輸入「幫我生成課程頁面」這類指令，AI 會自動觸發 `course-page-generator` Skill 完成所有步驟。

### 情境一：給主題，從零生成

只提供主題，AI 自動生成完整課程內容：

```
扮演一位擅長用實際案例解說的資安專家，設計"生成式 AI 資訊安全"的講義並生成網頁，完成後直接啟動
```

AI 會依序：生成 `content.md` + `config.yaml` → build `index.html` → 產生 OG 縮圖 → 啟動本地預覽

### 情境二：給講稿，輔助轉換

提供現有的講稿、筆記或大綱，AI 將其轉換為結構化課程頁面：

```
幫我把這份講稿轉成課程頁面（貼上講稿內容，或指定檔案路徑）
```

AI 會依序：萃取重點轉為結構化 `content.md` → 建立 `config.yaml` → build `index.html` → 產生 OG 縮圖

## 專案結構

```
agent-skill-lecture-builder/
├── .agents/
│   └── skills/
│       └── course-page-generator/
│           ├── scripts/
│           │   ├── build.mjs        # 建置課程頁
│           │   ├── dev.mjs          # 本機預覽
│           │   └── generate-og.mjs  # 產出 1200x630 OG 圖
│           └── reference/
│               ├── base.html
│               ├── components.md
│               └── config-example.yaml
├── config/
│   ├── global.yaml          # 全域設定（講者、社群、頁尾）
│   └── assets/              # 共用圖片（avatar 等）
├── lectures/                # 所有課程放在此目錄下
│   ├── gen-ai-security/     # 範例課程
│   │   ├── config.yaml
│   │   ├── content.md
│   │   ├── index.html       # build 產出
│   │   └── assets/
│   │       └── og-image.jpg # generate-og.mjs 產出
│   └── example/             # 課程範本（含說明）
├── build-index.mjs          # 產生根目錄課程目錄索引頁
├── index.html               # 課程目錄索引頁（build-index.mjs 產出）
├── package.json
└── README.md
```

## 新增一門課程

```bash
mkdir -p lectures/my-course/assets
```

1. **建立 `lectures/my-course/content.md`** — 用約定的 Markdown 語法撰寫講稿（或丟原始筆記給 AI，觸發 Skill 自動轉換）
2. **建立 `lectures/my-course/config.yaml`** — 只需寫要覆蓋全域設定的欄位
3. **Build**

```bash
node .agents/skills/course-page-generator/scripts/build.mjs lectures/my-course
```

產出 `lectures/my-course/index.html`。

4. **產生 OG 縮圖**

```bash
node .agents/skills/course-page-generator/scripts/generate-og.mjs lectures/my-course
```

5. **更新根目錄索引頁**

```bash
node build-index.mjs
```

## 課程目錄索引頁

根目錄的 `index.html` 是所有課程的入口頁面，列出 `lectures/` 下每門課程的標題、Badge、描述及 OG 縮圖。

每次新增或修改課程後，執行一次即可更新：

```bash
node build-index.mjs
```

`build-index.mjs` 會自動掃描 `lectures/` 下所有含 `config.yaml` 的子目錄，不需要手動維護課程清單。

## 開發伺服器

啟動含即時重載的本機預覽伺服器：

```bash
node .agents/skills/course-page-generator/scripts/dev.mjs lectures/my-course
```

也可以指定 port：

```bash
node .agents/skills/course-page-generator/scripts/dev.mjs lectures/my-course --port 8080
```

`dev.mjs` 會：

- 啟動本機伺服器（預設 port 3000，衝突時自動遞增）
- 先自動執行一次 build
- 監看 `content.md`、`config.yaml`、`config/global.yaml`、`reference/base.html`
- 存檔後自動重建並重新整理瀏覽器

## Config 機制

兩層設定，deep merge：

| 層級 | 檔案 | 內容 |
|------|------|------|
| 全域 | `config/global.yaml` | 講者資訊、社群連結、頁尾 |
| 課程 | `<dir>/config.yaml` | 頁面標題、badge、hero、引言、導覽按鈕 |

課程 config 只需寫要覆蓋的欄位，其餘繼承全域。陣列欄位（如 `socials`）會整個取代。

`nav`（Hero 導覽按鈕）預設從 `content.md` 的 `#` 章節自動產生，不需在 config 維護。

`config/global.yaml` 不必放在固定位置。Build 會從課程目錄往上搜尋最多 4 層父目錄，找到第一個 `config/global.yaml` 就使用。

### Global config 範例

```yaml
page:
  lang: zh-TW

instructor:
  name: "講者名稱"
  tagline: "一句話介紹"
  bio: >
    這裡可放講者簡介。<br>
    支援 HTML `<br>` 換行。
  avatar: "config/assets/author"  # 可省略副檔名
  stats:
    - text: "📚 代表作品或經歷 **X** 項"
      url: "https://example.com/books"
  socials:
    - platform: "YouTube"
      url: "https://youtube.com/@your-channel"

quotes:
  opening:
    text: "課程開場金句"
  closing:
    text: >
      課程結尾金句

footer:
  cta: "頁尾行動呼籲"
  copyright: "© 你的名字"
  show_socials: true

seo:
  title: "預設 SEO 標題"
  description: "預設 SEO 描述"
  image: "https://your-domain.example/lectures/example/assets/og-image.jpg"
  url: "https://your-domain.example/lectures/example/"
```

### 課程 config 範例

```yaml
page:
  title: "課程標題"
  badge: "BADGE 文字"
  hero_title: "Hero 大標題<br>支援換行"
  subtitle: "副標題"

quotes:
  opening:
    text: "開場引言"
  closing:
    text: >
      結尾引言

# nav 自動從 content.md 的 # 章節產生
# 需要自訂時才寫：
# nav:
#   - text: "自訂文字"
#     href: "#section-id"
```

如果你需要完整欄位，請直接參考 [`config-example.yaml`](./.agents/skills/course-page-generator/reference/config-example.yaml)。

## Markdown 語法

| 語法 | 用途 |
|------|------|
| `# LABEL：TITLE` | 主章節 |
| `> lead text`（緊接 `#`） | 章節引言 |
| `## Title` | 子章節 |
| `### 🔧 Title` | 卡片 |
| `` ```prompt [label="..."] `` | 終端機 / Prompt 區塊 |
| `> **Bold Title**` | 洞察框 |
| `[flow]...[/flow]` | 流程步驟 |
| `[tags]...[/tags]` | 標籤（`green / orange / purple / blue`，必須用此區塊包裹） |
| `[summary]...[/summary]` | 總結卡片 |
| `[bonus title="..."]...[/bonus]` | Bonus 按鈕 + 彈窗 |
| `- [x] item` | 勾選清單（僅用於已驗證/已完成的事項，不適合一般觀點條列） |
| `![alt](src)` | 獨立圖片（置中、含說明文字） |
| `[image-text]...[/image-text]` | 圖文並排（圖片＋文字左右排列，預設圖片佔 40%） |
| `[youtube id="..." title="..."]` | YouTube 影片嵌入（16:9 響應式） |
| `---` | 章節分隔線 |

詳細語法與 HTML 對照見 [`components.md`](./.agents/skills/course-page-generator/reference/components.md)。

### 圖片

**獨立圖片（置中顯示）：**
```markdown
![架構示意圖](images/architecture.png)
```
- `alt` 文字自動成為圖片說明（figcaption）
- 行內使用時（段落或列表中）會以 inline 方式渲染

**圖文並排：**
```markdown
[image-text position="left" width="50"]
![產品截圖](images/screenshot.png)
這是產品的主要介面，提供了 **直覺式操作** 體驗。
- 支援拖放操作
- 即時預覽結果
[/image-text]
```
- `position="left"`（預設）：圖片在左、文字在右
- `position="right"`：圖片在右、文字在左
- `width="N"` 設定圖片佔比百分比（預設 40），例如 `width="30"` 或 `width="60"`
- 文字區域支援段落、粗體、程式碼、連結、列表
- 平板（≤ 900px）及手機自動改為上下排列

### YouTube 影片嵌入

**單行（帶標題）：**
```markdown
[youtube id="dQw4w9WgXcQ" title="Demo 影片"]
```

**區塊（帶說明文字）：**
```markdown
[youtube id="dQw4w9WgXcQ"]
這是一段示範影片的說明
[/youtube]
```

- `id` 為 YouTube 影片 ID（網址中 `v=` 後面的值）
- `title` 為選填的標題/說明，顯示在影片下方
- 影片以 16:9 比例響應式嵌入
- 列印模式下顯示 YouTube 連結取代 iframe

### Bonus 彈窗

在任何章節（通常放在總結最下方）加入 `[bonus]` 區塊，build 後會產出一個按鈕，點擊開啟 Modal 彈窗，彈窗內容支援 Markdown。

```markdown
[bonus title="🎁 幕後製作心得"]
這裡是**彈窗內容**，支援基本 Markdown：

- 段落間用空行分隔
- 清單用 `- item`
- 粗體用 `**文字**`
- 行內程式碼用 `` `code` ``

連續非空行會自動以 `<br>` 合併成同一段落。
[/bonus]
```

彈窗互動：
- 點擊遮罩或右上角 ✕ 可關閉
- 按 `Esc` 亦可關閉
