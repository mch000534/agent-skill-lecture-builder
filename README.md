# Course Page Generator

> [!IMPORTANT]
> 此為 Fork 自原始專案的修改版本。
>
> - **我的 Repo**：[mch000534/agent-skill-lecture-builder](https://github.com/mch000534/agent-skill-lecture-builder)
> - **示範主頁**：[class.barrymok.cc](https://class.barrymok.cc/)
> - **示範案例**：[Agent Skill Lecture Builder 課程頁](https://class.barrymok.cc/lectures/agent-skill-lecture-builder/)

> [!NOTE]
> 搭配影片觀看效果更佳 — [YouTube 完整教學](https://youtu.be/0pZri5f_tfk)

❝Vibe Coding 速度很快，但用完就丟的東西，永遠不會變成你的！❞

這句話，是我用 Vibe Coding 做了幾十個網頁後的感悟。

- AI 生成的網頁很漂亮，但細節與架構很難調整
- 每次生成結果都很隨機，風格、排版無法完全掌控
- 做完的東西無法重複使用，下次又要從零開始

這支影片將透過實戰，帶你用「模板思維 + Agent Skills」解決以上痛點：

1. 登入 ChatGPT 免費體驗 Codex（本 Fork 改用 Claude Code，任何 AI 編程工具皆可）
2. 終端機 vs 編輯器，自由選擇操作模式
3. 把 AI 隨機的輸出，變成可用 Markdown 維護的模板
4. 將模板封裝成 Agent Skill，建立完整工作流
5. 一鍵部署到 GitHub Pages，讓講義網頁上線

> AI 時代下，Vibe Coding 的價值不在於生成速度 ──
> 而在於你能不能把成果從「免洗餐具」變成「長期工具」

---

提供主題 or Markdown 講稿，透過 Agent Skills 產生單一 HTML 課程頁面。

## 目錄

- [與原版的差異](#與原版的差異)
- [Quick Start](#quick-start)
- [Agent Skills](#agent-skills)
- [專案結構](#專案結構)
- [新增一門課程](#新增一門課程)
- [課程目錄索引頁](#課程目錄索引頁)
- [開發伺服器](#開發伺服器)
- [npm scripts](#npm-scripts)
- [Config 機制](#config-機制)
- [Markdown 語法](#markdown-語法)
- [課堂互動工具](#課堂互動工具)
- [未來開發方向](#未來開發方向)

## 與原版的差異

本 Fork 在原版基礎上新增了以下功能，並調整了專案結構：

### 結構調整

| 項目 | 原版 | 本 Fork |
|------|------|---------|
| AI 工具 | ChatGPT Codex | Claude Code（任何工具皆可） |
| 課程目錄 | 根目錄下（`my-course/`） | 統一放在 `lectures/`（`lectures/my-course/`） |
| 多課程管理 | 無索引頁 | 自動掃描產生課程目錄首頁 |

### 新增功能一覽

本 Fork 在原版基礎上擴充五大面向，詳細語法與用法請見各對應段落：

| 類別 | 重點 | 詳見 |
|------|------|------|
| AI 工作流 | 六個 Agent Skills（生成 / 起草 / 審閱 / 全流程 / 配圖 / widget 規範） | [Agent Skills](#agent-skills) |
| 多課程管理 | `lectures/` 統一擺放，`build-index.mjs` 自動掃描產生目錄首頁 | [課程目錄索引頁](#課程目錄索引頁) |
| 教學元件 | 30+ 種 Markdown 自訂語法（對比、分頁、callout、quiz、timeline 等） | [Markdown 語法](#markdown-語法) |
| 課堂互動 | 計時器、抽籤、投票、測驗、塗鴉筆、聚光燈 / 放大鏡 | [課堂互動工具](#課堂互動工具) |
| AI 配圖 | 透過 DMXAPI GPT Image 2 批次生成課程配圖，支援模型與風格選擇 | [image-generator-dmxapi-gptimage2](#image-generator-dmxapi-gptimage2) |
| 開發工具 | `new-lecture.mjs` / `validate.mjs` / `dev.mjs` / `build-vote.mjs` | [新增一門課程](#新增一門課程)、[npm scripts](#npm-scripts) |

---

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

AI 會依序：生成 `content.md` + `config.yaml` → 批次生成課程配圖（可選）→ build `index.html` → 產生 OG 縮圖 → 啟動本地預覽

### 情境二：給講稿，輔助轉換

提供現有的講稿、筆記或大綱，AI 將其轉換為結構化課程頁面：

```
幫我把這份講稿轉成課程頁面（貼上講稿內容，或指定檔案路徑）
```

AI 會依序：萃取重點轉為結構化 `content.md` → 建立 `config.yaml` → 批次生成課程配圖（可選）→ build `index.html` → 產生 OG 縮圖

## Agent Skills

六個 AI 工作流，全部定義在 `.agents/skills/` 目錄下，在 Claude Code 對話中用自然語言觸發：

### course-page-generator

**觸發詞**：「幫我生成課程頁面」、「把講稿轉成課程頁面」

給定主題或講稿，AI 自動完成：生成 `content.md` + `config.yaml` → build `index.html` → 產生 OG 縮圖。詳見 [SKILL.md](.agents/skills/course-page-generator/SKILL.md)。

### content-drafting

**觸發詞**：「幫我起草課程內容」、「生成 content.md」

輸入三個參數（缺少時 AI 主動詢問）：

| 參數 | 說明 | 範例 |
|------|------|------|
| `topic` | 課程主題 | "Claude Code 進階工作流程" |
| `audience` | 目標受眾與前置知識 | "有 1 年以上使用經驗的工程師" |
| `duration` | 課程時長（分鐘） | "90 分鐘" |

AI 依時長推算章節數（90 分鐘 → 4–5 個主章節），依受眾調整深度，強制套用「說明→範例→實作」三層節奏，產出有實質內容的草稿（而非佔位骨架）。詳見 [SKILL.md](.agents/skills/content-drafting/SKILL.md)。

### content-review

**觸發詞**：「審閱課程內容」、「分析教學節奏」、「幫我看 content.md」

分析現有 `content.md`，對每個主章節輸出節奏診斷表（說明/範例/實作各欄 ✅ / ⚠️ / ❌），並附具體改善建議與時間估算。詳見 [SKILL.md](.agents/skills/content-review/SKILL.md)。

### topic-to-page

**觸發詞**：「從主題到頁面」、「完整流程」、「一鍵生成課程」、「幫我完整做一個課程」

把上述三個 Skill 串成一條完整工作流：Phase 1 用 `content-drafting` 起草 → Phase 2 用 `content-review` 診斷 → Phase 3 用 `course-page-generator` build 成頁面。每個 Phase 結束會暫停詢問，使用者可手動修改 `content.md` 後說「繼續 Phase N」恢復。詳見 [SKILL.md](.agents/skills/topic-to-page/SKILL.md)。

### image-generator-dmxapi-gptimage2

**觸發詞**：「生成教材圖片」「幫課程加圖」「跑 image generator」

透過 DMXAPI GPT Image 2 為教材自動生成配圖。四個 Phase：

| Phase | 說明 |
|-------|------|
| Phase 1 | 掃描 content.md，找出 `[image-here]` 佔位符與 AI 判斷的加圖位置 |
| Phase 2 | 互動確認：選模型（gpt-image-2-03 / gpt-image-2 / gpt-image-2-ssvip）、選全域風格、確認圖片計畫表 |
| Phase 3 | 批次呼叫 API 生成圖片，存入 `assets/images/` |
| Phase 4 | 回寫 content.md，使用 `[image-text]` 或獨立圖片語法嵌入 |

API Key 存放在 `.env` 檔案（已 gitignore，不上 GitHub）。首次使用時複製 `.env.example` 為 `.env` 並填入 Key。模型可選清單參考：https://www.dmxapi.cn/rmb 。詳見 [SKILL.md](.agents/skills/image-generator-dmxapi-gptimage2/SKILL.md)。

### widget-builder

**觸發詞**：「新增 widget」「建立浮動面板」「加一個 widget」

浮動 widget 的完整建置規範，涵蓋 HTML 結構（拖曳把手、關閉按鈕）、CSS 樣式（半透明毛玻璃背景、`.open` 切換）、JS IIFE 模式（z-index 管理、拖曳邏輯、鍵盤快捷鍵）、settings panel 整合。新增 widget 時 AI 依此文件產生符合規範的程式碼。詳見 [SKILL.md](.agents/skills/widget-builder/SKILL.md)。

---

前四個工序 Skill 可獨立使用，也可改用 `topic-to-page` 一次串完整流程：`content-drafting` 生成草稿 → `content-review` 診斷節奏 → `course-page-generator` build 成頁面。`image-generator-dmxapi-gptimage2` 可在工作流任意階段插入，為課程批次生成配圖。`widget-builder` 為純參考規範，供新增 widget 時查閱。

## 專案結構

```
agent-skill-lecture-builder/
├── .agents/
│   └── skills/
│       ├── course-page-generator/   # 講稿/主題 → HTML 課程頁
│       │   ├── scripts/
│       │   │   ├── build.mjs        # 建置課程頁
│       │   │   ├── build-index.mjs  # 掃描 lectures/ 產生 manifest.js
│       │   │   ├── build-vote.mjs   # 將 GAS URL 注入 vote/index.html
│       │   │   ├── dev.mjs          # 本機預覽
│       │   │   └── generate-og.mjs  # 產出 1200x630 OG 圖
│       │   └── reference/
│       │       ├── base.html        # 唯一 HTML 模板
│       │       ├── components.md    # 所有元件語法對照
│       │       └── config-example.yaml
│       ├── content-drafting/        # 主題+受眾+時長 → content.md 草稿
│       │   └── SKILL.md
│       ├── content-review/          # 分析教學節奏，輸出改善建議
│       │   └── SKILL.md
│       ├── topic-to-page/           # 串接三階段的完整工作流
│       │   └── SKILL.md
│       ├── image-generator-dmxapi-gptimage2/  # AI 配圖生成（DMXAPI）
│       │   ├── SKILL.md
│       │   ├── .env                # API Key（gitignore）
│       │   └── scripts/generate.mjs
│       └── widget-builder/          # 浮動 widget 建置規範（HTML/CSS/JS/z-index）
│           └── SKILL.md
├── assets/
│   ├── course.css           # 所有課程共用 CSS（外部引用，改動免 rebuild）
│   └── course.js            # 所有課程共用 JS（計時器、簡報、抽籤器、投票等）
├── config/
│   ├── global.yaml          # 全域設定（講者、社群、頁尾、投票後端）
│   └── assets/              # 共用圖片（avatar 等）
├── lectures/                # 所有課程放在此目錄下（新增）
│   ├── gen-ai-security/     # 範例課程
│   │   ├── config.yaml
│   │   ├── content.md
│   │   ├── index.html       # build 產出（需 commit）
│   │   └── assets/
│   │       └── og-image.jpg # generate-og.mjs 產出（需 commit）
│   └── manifest.js          # build-index.mjs 產出的課程清單（需 commit）
├── vote/                    # 課堂投票學生端（新增）
│   ├── index.html           # 學生掃 QR Code 後的投票頁面
│   └── vote-backend.gs      # Google Apps Script 後端腳本（部署參考）
├── index.html               # 課程目錄索引頁（靜態殼層，動態讀取 manifest.js）（新增）
├── package.json
└── README.md
```

## 新增一門課程

### 快速方式（推薦）

一行指令建立目錄與模板檔案：

```bash
node .agents/skills/course-page-generator/scripts/new-lecture.mjs lectures/my-course
```

會自動建立：

- `lectures/my-course/config.yaml`（含偵測到的 GitHub Pages SEO URL）
- `lectures/my-course/content.md`（兩個章節範例）
- `lectures/my-course/assets/`（空資料夾）

### 手動方式

```bash
mkdir -p lectures/my-course/assets
```

1. **建立 `lectures/my-course/content.md`** — 用約定的 Markdown 語法撰寫講稿（或丟原始筆記給 AI，觸發 Skill 自動轉換）
2. **建立 `lectures/my-course/config.yaml`** — 只需寫要覆蓋全域設定的欄位

### Build 流程

1. **（建議）驗證 content.md 語法**

```bash
node .agents/skills/course-page-generator/scripts/validate.mjs lectures/my-course
```

   檢查未閉合標籤、半形冒號、`seo.url` 格式等常見錯誤。退出碼為 0 即可繼續。

2. **Build 課程頁**

```bash
node .agents/skills/course-page-generator/scripts/build.mjs lectures/my-course
```

   產出 `lectures/my-course/index.html`。

3. **產生 OG 縮圖**

```bash
node .agents/skills/course-page-generator/scripts/generate-og.mjs lectures/my-course
```

4. **更新根目錄索引頁**

```bash
node .agents/skills/course-page-generator/scripts/build-index.mjs
```

## 課程目錄索引頁

根目錄的 `index.html` 是所有課程的入口頁面，列出 `lectures/` 下每門課程的標題、Badge、描述及 OG 縮圖。

每次新增或修改課程後，執行一次即可更新：

```bash
node .agents/skills/course-page-generator/scripts/build-index.mjs
```

`build-index.mjs` 會自動掃描 `lectures/` 下所有含 `config.yaml` 的子目錄，不需要手動維護課程清單。

### 課程分類與顯示控制

在課程 `config.yaml` 的 `page` 區塊加入兩個選填欄位：

```yaml
page:
  title: "課程標題"
  badge: "BADGE 文字"
  category: "AI & 程式設計"   # 分類名稱，用於索引頁篩選
  published: true             # 設為 false 時不會出現在索引頁
```

索引頁會自動依 `category` 產生分類篩選按鈕，點擊即可過濾該類別課程。未設定 `category` 的課程歸入「未分類」；`published` 預設為 `true`，只有明確設為 `false` 的課程才會被隱藏。

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

## npm scripts

`package.json` 提供 6 個快捷指令，省去輸入冗長路徑：

| 指令 | 用途 | 範例 |
|------|------|------|
| `npm run build -- <course-dir>` | Build 任意課程 | `npm run build -- lectures/my-course` |
| `npm run dev -- <course-dir> [--port N]` | 啟動本機預覽含 live reload | `npm run dev -- lectures/my-course --port 8080` |
| `npm run og -- <course-dir>` | 產生 OG 縮圖 | `npm run og -- lectures/my-course` |
| `npm run build:example` | Build `example/` 範例課程 | `npm run build:example` |
| `npm run dev:example` | 預覽 `example/` 範例課程 | `npm run dev:example` |
| `npm run og:example` | 產生 `example/` 的 OG 縮圖 | `npm run og:example` |

> **注意**：使用通用指令（`build` / `dev` / `og`）時，必須用 `--` 分隔 npm 與後續參數，否則課程路徑無法傳入 script。`:example` 變體已綁定路徑，不需要 `--`。

其他腳本（`new-lecture.mjs` / `validate.mjs` / `build-index.mjs` / `build-vote.mjs`）因使用頻率低或無需參數，未包裝為 npm script，請直接用 `node` 執行。

## Config 機制

兩層設定，deep merge：

| 層級 | 檔案 | 內容 |
|------|------|------|
| 全域 | `config/global.yaml` | 講者資訊、社群連結、頁尾、投票後端 URL |
| 課程 | `<dir>/config.yaml` | 頁面標題、badge、hero、引言、導覽按鈕 |

課程 config 只需寫要覆蓋的欄位，其餘繼承全域。陣列欄位（如 `socials`）會整個取代。

`nav`（Hero 導覽按鈕）預設從 `content.md` 的 `#` 章節自動產生，不需在 config 維護。

`config/global.yaml` 不必放在固定位置。Build 會從課程目錄往上搜尋最多 4 層父目錄，找到第一個 `config/global.yaml` 就使用。

### Global config 範例

```yaml
page:
  lang: zh-TW
  favicon: "config/assets/favicon.ico"   # 選填，網站 icon

instructor:
  name: "講者名稱"
  tagline: "一句話介紹"
  bio: >
    這裡可放講者簡介。<br>
    支援 HTML `<br>` 換行。
  avatar: "config/assets/author"  # 可省略副檔名
  stats:
    - text: "代表作品或經歷 X 項"
      url: "https://example.com/books"
  socials:                         # 支援平台：Medium / Facebook / Threads / YouTube / GitHub / LinkedIn / Email
    - platform: "YouTube"
      url: "https://youtube.com/@your-channel"
    - platform: "Email"
      url: "mailto:you@example.com"

quotes:
  opening:
    text: "課程開場金句"
    author: "作者名稱"            # 選填，不填則不顯示
  closing:
    text: >
      課程結尾金句
    author: "作者名稱"            # 選填

footer:
  cta: "頁尾行動呼籲"
  copyright: "© 你的名字"
  show_socials: true

seo:
  site_name: "網站名稱"           # 選填，OG site_name
  type: "article"                 # 選填，預設 article
  title: "預設 SEO 標題"
  description: "預設 SEO 描述"
  image: "https://<user>.github.io/<repo>/lectures/<course>/assets/og-image.jpg"
  url: "https://<user>.github.io/<repo>/lectures/<course>/"

vote:
  # 填入 Google Apps Script Web App URL（課堂投票功能必填，見「課堂投票 Widget」段落）
  gas_url: ""
```

### 課程 config 範例

```yaml
page:
  title: "課程標題"
  badge: "BADGE 文字"
  category: "AI & 程式設計"   # 分類名稱（用於索引頁篩選）
  published: true             # false 則隱藏，預設顯示
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
| `### Title` | 卡片 |
| `#### Title` | 小標題（minor title） |
| `` ```prompt [label="..."] `` | Prompt 區塊（無高亮，header 顯示 label 或 "Prompt"） |
| `` ```terminal [label="..."] `` | Terminal 區塊（bash 高亮，header 顯示 "Terminal"） |
| `> **Bold Title**` | 洞察框（Insight Box） |
| `[flow]...[/flow]` | 流程步驟（捲動進入視窗時步驟逐一滑入） |
| `[compare label-left="..." label-right="..."]...[/compare]` | 左右對比卡（舊做法 vs 新做法） |
| `[vote id="..." title="..."]...[/vote]` | 投票卡片嵌入（需設定 `vote.gas_url`） |
| `[quiz type="single"]...[/quiz]` | 即時測驗（選擇題 / 是非題，localStorage 保存狀態） |
| `[tags]...[/tags]` | 標籤（`green / orange / purple / blue`，必須用此區塊包裹） |
| `[summary]...[/summary]` | 總結卡片 |
| `[bonus title="..."]...[/bonus]` | Bonus 按鈕 + 彈窗 |
| `- [x] item` | 勾選清單（僅用於已驗證/已完成的事項，不適合一般觀點條列） |
| `![alt](src)` | 獨立圖片（置中、含說明文字） |
| `[image-text]...[/image-text]` | 圖文並排（圖片＋文字左右排列，預設圖片佔 40%） |
| `[youtube id="..." title="..."]` | YouTube 影片嵌入（16:9 響應式，可單行或區塊形式） |
| `[tabs][tab label="..."]...[/tab][/tabs]` | 分頁切換卡（多語言／多方案範例對照） |
| `[callout type="info\|warning\|tip" title="..."]...[/callout]` | 標注框（藍／橙／綠三色，可選 title） |
| `[accordion][item title="..." open]...[/item][/accordion]` | FAQ 摺疊區塊（純 `<details>`，零 JS） |
| `[reveal title="..."]...[/reveal]` | 點擊揭曉答案 / Spoiler |
| `[timeline]` + `- 時間 \| 標題 \| 描述` + `[/timeline]` | 時間軸（技術演進、學習路徑） |
| `[steps-status]` + `- [done\|doing\|todo] 標題 \| 描述` + `[/steps-status]` | 帶 done / doing / todo 狀態的步驟列表 |
| `` ```js [label="..."] `` | 程式碼區塊（自動高亮，支援 js / jsx / ts / tsx / py / bash / sh / shell / zsh / json / yaml / yml / html / xml / css / scss / go / rust / java / kotlin / swift / ruby / php / sql / c / cpp 等） |
| `` ```diff [label="..."] `` | Diff 對比區塊（`+` 綠 / `-` 紅） |
| `[compare-table headers="A \| **B** \| C"]` + `- 列 \| 1 \| 2 \| 3` | 多欄比較表（`**` 包住的欄位高亮為推薦） |
| `[stats]` + `- 數字 \| 標題 \| 描述` + `[/stats]` | 大字數據卡片格網 |
| `[?term\|定義]` | 行內術語 tooltip（hover 顯示定義） |
| `[dl]` + `- 詞 \| 解釋` + `[/dl]` | 名詞解釋對照（`<dl>`） |
| `\| 欄1 \| 欄2 \| 欄3 \|` | 標準 Markdown 表格 |
| `---` | 章節分隔線 |

詳細語法與 HTML 對照見 [`components.md`](./.agents/skills/course-page-generator/reference/components.md)。

### 圖片

**獨立圖片（置中顯示）：**
```markdown
![架構示意圖](images/architecture.png)
```
- `alt` 文字自動成為圖片說明（figcaption）
- 行內使用時（段落或列表中）會以 inline 方式渲染
- 配圖使用相對路徑引用，build 時不轉 base64，保持 HTML 輕量並支援瀏覽器 lazy loading

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

### Compare 對比卡

左右並排呈現「舊做法 vs 新做法」，左欄紅色調、右欄綠色調：

```markdown
[compare label-left="以前的做法" label-right="現在的做法"]
- 手動複製貼上 commit message | 使用 git-smart-commit Skill 自動生成
- 風格不一致，長短隨機 | 統一格式，一行摘要 + bullet 詳情
- 想修改時得回去改 HTML | 只要更新 content.md 重新 build
[/compare]
```

- `label-left` / `label-right`：欄標題（省略時預設「舊做法」/「新做法」）
- 每行 `- 左側內容 | 右側內容`（`|` 為分隔符）
- 支援行內 Markdown（`**粗體**`、`` `code` ``、連結）

### Vote 投票嵌入

將課堂投票直接嵌入 content 中，學員無需跳頁即可投票，投票後立即顯示即時橫條圖。需先設定 `vote.gas_url`（見[課堂投票 Widget](#課堂投票-widget)）。

```markdown
[vote id="tool-pref" title="你最常用的 AI 工具？"]
- Claude
- ChatGPT
- Gemini
- 其他
[/vote]
```

- `id`：投票場次唯一識別碼，對應 Google Sheets 的 sessionId
- `title`：顯示給學員的問題文字
- 選項以 `- ` 開頭（最多 26 個）
- 頁面載入自動向 GAS 建立場次（幂等）；未設定 `gas_url` 時按鈕停用並顯示提示

### Quiz 即時測驗

純前端測驗，無需後端。點選即時回饋，結果存 localStorage，重新整理後保留狀態。

```markdown
[quiz type="single"]
Q: Claude 預設使用哪個模型？
- [ ] GPT-4
- [x] claude-sonnet-4-6
- [ ] Gemini Pro
Hint: 查看 CLAUDE.md 的 Environment 段落
[/quiz]
```

是非題範例：

```markdown
[quiz type="bool"]
Q: build.mjs 會自動讀取 global.yaml？
- [x] 是
- [ ] 否
[/quiz]
```

- `Q:` 定義問題文字
- `- [x]` 為正確選項（只能有一個），`- [ ]` 為錯誤選項
- `Hint:` 選填，答錯後顯示提示文字
- 省略 `[x]` 則任何選項點選後僅記錄，不顯示對錯

### Bonus 彈窗

在任何章節（通常放在總結最下方）加入 `[bonus]` 區塊，build 後會產出一個按鈕，點擊開啟 Modal 彈窗，彈窗內容支援 Markdown。

```markdown
[bonus title="幕後製作心得"]
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

### Tabs 分頁切換卡

適合多語言、多方案的範例對照，第一個分頁預設顯示，點擊標籤帶淡入動畫切換。

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

- `[tab label="..."]` 定義每個分頁的標籤名稱
- 內容支援 `- 項目`（轉為 `<ul><li>`）與一般段落
- 可放置多個分頁，無數量上限

### Callout 標注框

左邊框三色提示框，純 CSS 無需 JS：

```markdown
[callout type="info"]
這是一個提示訊息,說明某個重要概念。
[/callout]

[callout type="warning" title="注意"]
此操作無法還原,請謹慎執行。
[/callout]

[callout type="tip" title="實用技巧"]
- 技巧一:簡短有力
- 技巧二:配合實例
[/callout]
```

- `type` 三種值：`info`(藍)、`warning`(橙)、`tip`(綠),預設 `info`
- `title` 選填,省略則無標題列
- 內容支援 `- 項目` 與一般段落

## 課堂互動工具

本 Fork 新增一套完整的課堂互動工具，全部整合於課程頁面中，無需額外安裝。

### 設定面板

點擊左下角齒輪圖示開啟。面板分為三個區塊：

**第一列（固定按鈕，寫在 `base.html` 模板）：**

| 圖示 | 功能 |
|------|------|
| A2 | 循環切換字體大小（A1 → A5 共 5 段） |
| 月亮 / 太陽 | 切換深色 / 淺色主題 |
| QR | 顯示課程分享 QR Code（同 `Q` 鍵） |
| 時鐘 | 開啟浮動計時器（同 `T` 鍵） |

**第二列（由各 widget 的 JS 動態注入）：**

| 圖示 | 功能 |
|------|------|
| 螢幕 | 進入簡報模式（同 `P` 鍵） |
| 印表機 | 匯出投影片版 PDF |
| 骰子 | 開啟抽籤器（同 `R` 鍵） |
| 勾選框 | 開啟投票 Widget（同 `V` 鍵） |
| 同心圓 | 切換聚光燈 / 放大鏡（同 `S` 鍵） |
| 鉛筆 | 開啟塗鴉筆（同 `B` 鍵） |

**色票區**：八種色彩主題（正紅 / 暖陽珊瑚 / 深海藍 / 翡翠森林 / 星河紫 / 花見櫻 / ...），點擊即時切換，按 `c` 可循環。

**快捷鍵說明**：面板底部「?」按鈕可開啟快捷鍵 Modal，速查所有按鍵。

### 浮動計時器

- 可自由拖曳移動位置
- 點擊時間數字直接輸入（MMSS 格式，如輸入 `0530` = 05:30）
- 兩側 `−` / `+` 每次調整 1 分鐘
- 計時中隱藏視窗時，畫面頂端顯示細長進度條
- 計時結束自動彈出視窗

### 抽籤器

- 學號模式：設定起始 / 結束學號範圍隨機抽取
- 人名模式：貼上名單（每行一人），支援不重複抽籤
- 分組功能：將名單隨機分成 2-10 組，結果以卡片呈現
- 計分板：對應分組或自訂隊伍名稱，支援 +/− 加減分
- 可拖曳移動位置

### 課堂投票 Widget

學生掃一次 QR Code，整堂課不用重掃。教師切換題目時，學生手機自動跟隨顯示新題目。教師頁面每 5 秒自動更新長條圖。

#### 一次性設定（需 Google 帳號）

1. 前往 [Google 試算表](https://sheets.google.com) 建立新試算表
2. 點「擴充功能 > Apps Script」，將 `vote/vote-backend.gs` 的內容貼入並儲存
3. 點「部署 > 新增部署作業」→ 類型選「網路應用程式」→ 執行身分「我自己」→ 存取對象「所有人（包含匿名）」→ 複製 Web App URL
4. 將 URL 填入 `config/global.yaml` 的 `vote.gas_url` 欄位：

```yaml
vote:
  # 填入 Google Apps Script Web App URL
  gas_url: "https://script.google.com/macros/s/YOUR_ID/exec"
```

5. 重新 build 課程頁，並執行一次 `build-vote.mjs`：

```bash
node .agents/skills/course-page-generator/scripts/build.mjs lectures/my-course
node .agents/skills/course-page-generator/scripts/build-vote.mjs
```

#### 課堂使用流程

1. 開啟課程頁，點設定齒輪 → 投票圖示（或按 `V`）
2. Widget 自動產生本堂課的固定 Session ID，投影 QR Code 讓學生掃描一次
3. 在 Picker 中選擇題目（或手動輸入新題目），點「啟動投票」
4. 學生手機自動顯示目前題目 → 選擇選項 → 看到投票結果
5. 教師頁面長條圖每 5 秒自動更新，顯示各選項票數與百分比
6. 點「切換題目」回 Picker 選下一題，學生手機自動跟隨換題（已投過的題顯示「你已投票」）
7. 點「暫停投票」停用目前題目，點「重置投票」清空本堂課所有投票紀錄

#### 課程頁嵌入投票

除了 Widget 浮動面板，也可將投票直接嵌入 content.md 中（見 [Vote 投票嵌入](#vote-投票嵌入)）。嵌入的 `[vote]` 區塊獨立於課堂 Session 之外，適合課後自學使用。

#### 安全說明

GAS URL 屬公開端點（學生瀏覽器需直接呼叫），放在 `config/global.yaml` 並 commit 至 GitHub 是正常做法。攻擊者最多只能送假投票，無法存取你的 Google 帳號或試算表內容。若遇到濫用，重新部署 GAS 即可取得新 URL。

### 即時測驗（Quiz）

在 content.md 中使用 `[quiz]` 語法加入測驗題，無需後端或外部服務。詳細語法見 [Quiz 即時測驗](#quiz-即時測驗)。

### 聚光燈與放大鏡

按 `S`（或點齒輪面板中的同心圓圖示）啟動聚光燈模式：以滑鼠為中心挖出一個透明圓，其餘區域以半透明黑色遮罩淡化，協助學生鎖定講解位置。

- `[` / `]` 即時調整圓形半徑（60–600px）
- `{` / `}` 改變放大倍率（1× ~ 5×，1× 等於純聚光燈，2× 以上圓內以放大鏡呈現，並用平滑過渡動畫）
- 放大鏡採 DOM 快照 + `clip-path: circle()`，整頁無外部相依
- 按 `X` 或 `Esc` 一鍵關閉

### 塗鴉筆

按 `B`（或點齒輪面板中的鉛筆圖示）開啟塗鴉筆：全螢幕透明畫布覆蓋在課程頁面上方，可直接用滑鼠畫線、圈重點。工具列為可拖曳的浮動 widget，具半透明毛玻璃效果。

- `Shift+B` 切換橡皮擦模式
- `c` 循環切換筆刷顏色（8 色）
- `C`（Shift+c）清空畫布
- `[` / `]` 調整筆刷粗細（2–20px，塗鴉筆啟用時優先於聚光燈半徑調整）
- `Ctrl+Z` / `Cmd+Z` 復原上一筆
- 游標以圓形顯示，反映目前筆刷大小與顏色
- 按 `B` 再次關閉，或按 `X` 關閉所有工具

### 章節進度追蹤

TOC（左側邊欄）每個章節標題旁顯示小圓點，捲動過該章節後自動標為已讀（綠色）。狀態以 `localStorage` 持久化，重新整理頁面後保留。

學員完全讀完一個章節（其標題從頂端離開畫面）即視為已讀，不需任何設定或 Markdown 語法。

### 鍵盤快捷鍵

課程頁面支援以下快捷鍵（輸入框中不觸發）：

| 按鍵 | 功能 |
|------|------|
| `P` | 切換簡報模式（全頁投影片輪播） |
| `F` | 切換全螢幕模式（簡報模式下不可用） |
| `A` | 桌面端：收合/展開側邊欄；行動端：開啟/關閉導航選單 |
| `Q` | 切換 QR code 分享視窗（開啟/關閉，簡報模式亦可用） |
| `T` | 切換計時器顯示/隱藏（不影響計時狀態，簡報模式亦可用） |
| `R` | 切換抽籤器顯示/隱藏 |
| `V` | 切換投票 Widget 顯示/隱藏 |
| `S` | 切換聚光燈模式（滑鼠追蹤圓形透明區域，簡報模式亦可用） |
| `B` | 切換塗鴉筆開啟/關閉 |
| `Shift+B` | 切換橡皮擦模式（塗鴉筆啟用時） |
| `Ctrl+Z` / `Cmd+Z` | 復原上一筆（塗鴉筆啟用時） |
| `[` / `]` | 塗鴉筆啟用時：筆刷粗細縮小 / 放大（2–20px）；聚光燈開啟時：圓形縮小 / 放大 |
| `{` / `}` | 放大鏡倍率縮小 / 放大（僅在聚光燈開啟時生效，範圍 1×–5×） |
| `C`（Shift+c） | 塗鴉筆啟用時：清空畫布；否則：切換暗色 / 亮色主題 |
| `c` | 塗鴉筆啟用時：循環筆刷顏色（8 色）；否則：循環切換色彩主題（8 種） |
| `=` / `+` | 增大文字 |
| `-` / `_` | 縮小文字 |
| `X` | 關閉所有已顯示的小工具（計時器、抽籤器、投票、分享 QR、塗鴉筆、聚光燈 / 放大鏡） |
| `Esc` | 關閉目前開啟的彈窗（分享、Bonus、設定等） |

## 未來開發方向

歡迎透過 Issue 提出建議或 PR 貢獻新工具。當前已實作的開發流程工具（`new-lecture.mjs`、`validate.mjs`）見上方「新增一門課程」段。
