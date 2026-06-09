---
name: course-page-generator
description: 將講稿或非結構化筆記轉換為約定的 Markdown 格式，再透過 build script 產生單一 HTML 課程頁面與 OG 縮圖。Skill 的主要任務是 Markdown 格式轉換，build 與 OG 圖片生成是最後的必要步驟。
---

# Course Page Generator

> **禁止使用 Emoji**：所有生成的課程內容（卡片標題、總結項目、群組標頭、設定檔等）一律不得使用 emoji 字符。

原始講稿 → 結構化 Markdown → `validate.mjs`（建議） → `build.mjs` → `index.html` → `generate-og.mjs` → `assets/og-*.jpg`

## 專案結構

```
.agents/skills/course-page-generator/
├── scripts/
│   ├── build.mjs          # 課程頁 build script
│   └── generate-og.mjs    # 針對課程頁產出 1200x630 OG 縮圖（依賴 Puppeteer）
└── reference/             # 格式範例與 HTML 模板（含支援 ?og=1 的 base.html）

<root>/                      # 任意根目錄（例如 course/、lectures/、docs/）
├── config/
│   ├── global.yaml          # 全域設定（講者、社群、頁尾）
│   └── assets/              # 共用圖片（avatar 等）
├── <course-dir>/
│   ├── config.yaml          # 課程專屬設定（覆蓋 global）
│   ├── content.md           # 結構化 Markdown 講稿
│   ├── index.html           # 課程頁（build 生成）
│   └── assets/
│       └── og-*.jpg         # OG 縮圖（generate-og.mjs 產出）
```

## Workflow

### Step 0：偵測輸入類型

在進入轉換流程之前，先判斷使用者提供的是哪種輸入：

| 情境 | 判斷依據 | 行動 |
|------|----------|------|
| **只有主題** | 只給了一句話主題／標題，無對應資料夾或 Markdown | → 執行「主題生成流程」（見下方） |
| **有講稿內容** | 提供了講稿文字、大綱、或已有 content.md | → 直接進入 Step 1 |
| **有現有目錄** | 指定了已存在的課程資料夾 | → 讀取後進入 Step 1 |

#### 主題生成流程

當使用者只提供主題（例如「Python 非同步程式設計」）：

1. **決定課程資料夾位置**：將主題轉為 kebab-case 英文（例如 `python-async`）作為資料夾名稱。
   - 若使用者有指定路徑（例如 `lectures/python-async`），直接使用。
   - 否則，**用 Glob 工具掃描 repo 根目錄**，觀察現有的課程資料夾放在哪一層（例如是否有 `course/`、`lectures/` 等慣例目錄），沿用同層。
   - 若無任何慣例可循，直接建在 **repo 根目錄**下（`<course-dir>/`），不假設子目錄。

2. **建立資料夾結構**：
   ```
   <root>/<course-dir>/
   ├── config.yaml      # 從主題推導課程設定
   ├── content.md       # 根據主題生成骨架
   └── assets/          # 空資料夾（保留圖片用）
   ```

3. **生成 `config.yaml`**：根據主題填入基本欄位（`page.title`、`page.hero_title`、`seo.title`、`seo.description`、`quotes.opening`、`quotes.closing`）；`seo.image` 與 `seo.url` 依照 Step 2-0 偵測到的 GitHub Pages 前綴填入；若偵測失敗則留空。

4. **生成 `content.md` 骨架**：
   - 推導 3–5 個主要章節（`#`），每章節下 1–2 個子章節（`##`）與 2–3 張卡片（`### Title`）
   - 每張卡片留 2–4 個條列式占位點（重點提示，非最終內容）
   - 在最後加入 `[summary]` 區塊，列出各章節預期的學習成果
   - 所有占位內容用 `<!-- TODO: ... -->` 或簡短提示標記，讓使用者知道哪裡需要補充
   - 骨架本身應具備足夠結構讓 build 可以成功執行

5. **確認 global config**：檢查是否已有 `config/global.yaml`，若無，在回覆中提示使用者參考 Step 2 建立。

6. **告知使用者**：列出已建立的檔案清單，並說明下一步（補充內容或直接 build）。

7. **完成後繼續 Step 2 以下流程**（確認 config → build → **OG 縮圖**）。Build 成功後**必須**立即執行 `generate-og.mjs`。

---

### Step 1：將講稿轉為結構化 Markdown

這是 Skill 的核心任務。使用者提供的可能是：
- 非結構化的演講筆記或大綱
- 已部分格式化的 Markdown
- 課程投影片的文字內容

AI 需要根據以下語法規則，將內容轉換為 `content.md`。

#### Markdown 語法約定

| 語法 | 用途 | 範例 |
|------|------|------|
| `# LABEL：TITLE` | 主章節 | `# 新專案：用 SDD 讓 AI 根據規格建立專案` |
| `> lead text` | 章節引言（緊接 `#` 後） | `> 規格驅動開發（Spec-Driven Development）` |
| `## Title` | 子章節 | `## OpenSpec 初始化` |
| `### Title` | 卡片標題 | `### 為什麼需要 OpenSpec？` |
| `` ```prompt [label="..."] `` | 終端機/Prompt 區塊 | 見下方 |
| `> **Bold Title**` | 洞察框（Insight） | `> **AI 正在改變企業決策**` |
| `[flow]...[/flow]` | 流程步驟 | 見下方 |
| `[tags]...[/tags]` | 標籤（必須用此區塊包裹） | `- [green] 正面` |
| `[compare label-left="..." label-right="..."]...[/compare]` | 左右對比卡（舊做法 vs 新做法） | `- 舊 \| 新` |
| `[summary]...[/summary]` | 總結卡片 | `- **標題** \| 描述` |
| `- [x] item` | 勾選清單（僅用於已驗證/已完成的事項） | `- [x] 已完成項目` |
| `![alt](src)` | 獨立圖片 | `![架構圖](images/arch.png)` |
| `[image-text]...[/image-text]` | 圖文並排 | 見下方 |
| `[youtube id="..." title="..."]` | YouTube 影片嵌入 | 見下方 |
| `---` | 章節分隔線 | 放在 `#` 章節之間 |

#### 詳細語法

**Prompt Block：**
~~~markdown
```prompt [label="安裝指令"]
npm install -g @fission-ai/openspec@latest
```
~~~

- Shell 指令開頭（`npm`, `git`, `docker` 等）→ header 顯示 "Terminal"
- 其他內容 → header 顯示 "Prompt"

**Flow Steps：**
```markdown
[flow]
1. proposal.md — 確認目標與範圍
2. design.md — 技術選型與風險評估
[/flow]
```

**Tags：**
```markdown
[tags]
- [green] 正面標籤
- [orange] 警告標籤
- [purple] 中性標籤
- [blue] 資訊標籤
[/tags]
```
⚠️ `- [color] text` 必須放在 `[tags]...[/tags]` 內，獨立使用不會套用顏色。

**Summary Grid：**
```markdown
[summary]
- **標題** | 描述文字
- **標題** | 描述文字
[/summary]
```

**Insight Box：**
```markdown
> **洞察標題**
> 第一段落內容。
>
> 第二段落內容（空行分隔）。
```

**獨立圖片：**
```markdown
![架構示意圖](images/architecture.png)
```
- 獨立一行 → 置中顯示，alt 文字自動成為 `<figcaption>` 圖說
- 在段落或列表中使用 → 行內圖片（`<img class="inline-image">`）
- **章節英雄（chapter hero）**：若 `![alt](path)` 緊接在 `#` 主章節標題與 `>` 引言之間，會被 build 渲染成全寬 chapter hero，作為該章節的視覺封面。建議每門課程 2–4 張 hero，不宜每章都有。
- **內文獨立圖片**：放在 `##` / `###` 段落間，前後各空一行，自動以 `<figure class="content-image">` 置中呈現。路徑建議使用相對路徑 `images/xxx.png`，build 會自動解析為課程的 `assets/images/xxx.png`。

**圖文並排（Image-Text）：**
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
- 響應式：平板（≤ 900px）及手機自動改為上下排列

**YouTube 影片嵌入：**

單行：
```markdown
[youtube id="dQw4w9WgXcQ" title="Demo 影片"]
```

區塊（含說明文字）：
```markdown
[youtube id="dQw4w9WgXcQ"]
這是一段示範影片的說明
[/youtube]
```
- `id` 為 YouTube 影片 ID（網址中 `v=` 後面的值）
- `title` 為選填標題，顯示在影片下方
- 影片以 16:9 比例響應式嵌入
- 列印模式下顯示 YouTube 連結取代 iframe

完整元件對照請參考：[components.md](reference/components.md)
Markdown 範例請參考：[content-example.md](reference/content-example.md)

### Step 2：確認或建立課程 Config

#### 2-0：偵測 GitHub Pages 前綴（必須先執行）

在撰寫任何 config 之前，先執行以下指令取得 GitHub Pages base URL：

```bash
git remote get-url origin
```

解析規則：
- SSH 格式 `git@github.com:user/repo.git` → `https://user.github.io/repo`
- HTTPS 格式 `https://github.com/user/repo.git` → `https://user.github.io/repo`

取得 `GH_BASE` 後，`seo.image` 和 `seo.url` 的值即為：
- `seo.url`：`{GH_BASE}/{course-dir}/`
- `seo.image`：`{GH_BASE}/{course-dir}/assets/og-image.jpg`（固定檔名，由 generate-og.mjs 輸出）

若指令失敗（非 git repo、無 remote、非 GitHub），直接在 config 中留空這兩個欄位，並告知使用者需手動填入。

Config 分為兩層：

| 檔案 | 用途 | 必要性 |
|------|------|--------|
| `config/global.yaml` | 全域設定（講者資訊、社群連結、頁尾） | 首次使用時建立一次 |
| `<course-dir>/config.yaml` | 課程專屬設定（覆蓋 global） | 每個課程各一份 |

> `config/global.yaml` 不需要放在固定位置，build 會從課程目錄往上搜尋最多 4 層父目錄。只需確保它存在於課程目錄的某個祖層即可。

#### 首次設定：建立 Global Config

如果還沒有 `config/global.yaml`，需要先建立全域設定。可參考 [config-example.yaml](reference/config-example.yaml) 作為模板：

1. 在課程目錄的任意祖層建立 `config/global.yaml`，填入講者資訊、社群連結、頁尾預設值
2. 在同層建立 `config/assets/` 資料夾，放入講師頭像（檔名為 `author`，副檔名可省略，build 會自動偵測 jpg/jpeg/png/webp/gif/svg）

全域設定的關鍵欄位：

```yaml
instructor:
  name: "講者姓名"
  tagline: "一句話簡介"
  bio: "講者介紹（支援 <br> 換行）"
  avatar: "config/assets/author"    # 可省略副檔名
  stats:                             # text 支援 **粗體** 等 inline markdown
    - text: "📚 出版 **7** 本專業書籍"
      url: "https://..."
  socials:                           # 支援 Medium/Facebook/Threads/YouTube/GitHub/LinkedIn/Email
    - platform: "YouTube"
      url: "https://..."

footer:
  cta: "行動呼籲文字"
  copyright: "© 你的名字"
  show_socials: true

seo:
  site_name: "網站名稱"
```

#### 課程 Config

每個課程目錄的 `config.yaml` 只需寫要覆蓋全域設定的欄位：

```yaml
page:
  title: "課程標題"
  badge: "BADGE 文字"
  hero_title: "Hero 大標題<br>支援換行"
  subtitle: "副標題"

seo:
  title: "SEO 標題"
  description: "頁面描述"
  image: "https://username.github.io/repo/<course-dir>/assets/og-image.jpg"  # 由 Step 2-0 偵測填入
  url: "https://username.github.io/repo/<course-dir>/"                        # 由 Step 2-0 偵測填入

quotes:
  opening:
    text: "開場引言"
  closing:
    text: >
      結尾引言
```

⚠️ **`seo.image` 必須使用絕對 URL**（`https://...`），社群平台無法解析相對路徑，會導致 OG 預覽圖片無法顯示。這兩個欄位的值應在 Step 2-0 執行 `git remote get-url origin` 後填入。

`nav`（Hero 導覽按鈕）預設從 `content.md` 的 `#` 章節自動產生，不需手動維護。
若需自訂按鈕文字，可在 config.yaml 中覆蓋：

```yaml
nav:
  - text: "自訂文字"
    href: "#section-id"
```

YAML 完整範例：[config-example.yaml](reference/config-example.yaml)

### Step 2.5：驗證語法（建議）

在執行 build 前可選用 `validate.mjs` 檢查 content.md 是否有未閉合標籤、半形冒號等常見錯誤：

```bash
node .agents/skills/course-page-generator/scripts/validate.mjs <course-dir>
```

退出碼為 0 即可繼續 build；若回報錯誤則先修正 content.md。警告（如半形冒號）可忽略。

**完整檢查清單：**

| Check | 項目 | 嚴重度 | 說明 |
| ----- | ---- | ------ | ---- |
| 1 | 未閉合區塊標籤 | error | `[flow]`、`[tags]`、`[summary]`、`[bonus]`、`[compare]`、`[compare-table]`、`[vote]`、`[quiz]`、`[image-text]`、`[tabs]`、`[callout]`、`[accordion]`、`[reveal]`、`[timeline]`、`[steps-status]`、`[stats]`、`[dl]` |
| 2 | `[youtube]` 多行形式未閉合 | error | 單行 `[youtube id=... title=...]` 不需關閉；多行 `[youtube]...[/youtube]` 必須成對 |
| 3 | 未閉合 ` ```prompt ` / ` ```terminal ` 區塊 | error | 結尾的 ` ``` ` 漏寫 |
| 4 | `seo.url` / `seo.image` 非絕對 URL 或缺 `lectures/` | error/warning | config.yaml 層級 |
| 5 | 殘留 `[image-here]` 佔位符 | warning | 執行 image-generator Skill 或替換為 `![alt](path)` |
| 6 | `![](...)` 空 alt 或泛用 alt（image / img / picture / 圖片 / 照片 / 截圖） | warning | 會產生空白或無意義的 figcaption；自動跳過 fenced code block（含巢狀 ` ```` ` / ` ``` `） |
| 7 | Chapter hero 超過 4 張 | warning | 依 `build.mjs` 邏輯：`#` 標題後跳過空行與 `>` lead，下一個非空行若是獨立圖片即視為 hero。建議挑選 2–4 個最具視覺錨點的章節保留 |

**圖片警告的處理建議：**

- **Check 5（`[image-here]` 殘留）**：通常是舊版草稿留下的佔位符。若課程尚未配圖，可改為 `<!-- TODO: 建議加圖 — {用途} -->`，再執行 image-generator Skill 批次生成。
- **Check 6（空 / 泛用 alt）**：補上描述性文字，因為 alt 會自動成為 `<figcaption>` 顯示在圖片下方。避免使用 `image`、`img`、`圖片` 等無意義文字。
- **Check 7（hero 過多）**：每門課程建議 2–4 張 hero。超出時挑選最具視覺錨點的章節保留，其他改為 standalone 內文圖片（段落間獨立一行 `![alt](path)`）。

何時建議執行：

- 使用者提供的舊講稿、外部來源 Markdown，或轉換結果不確定時
- 使用者在生成後手動編輯過 content.md
- 連續多次 build 失敗，懷疑 content.md 語法問題
- 執行 image-generator 回寫 content.md 後，驗證圖片語法是否正確

AI 自己剛生成的 content.md 通常可跳過此步驟。

### Step 3 + 4：執行 Build 並產生 OG 縮圖（必須連續執行）

> ⚠️ **Step 3 與 Step 4 是綁定的：只要執行了 build，就必須接著產生 OG 縮圖。不可只做 build 而跳過 OG。**

所有指令都從 **repo 根目錄** 執行：

```bash
# Step 3: Build 課程頁
node .agents/skills/course-page-generator/scripts/build.mjs <course-dir>

# Step 4: 產生 OG 縮圖（build 成功後立即執行）
node .agents/skills/course-page-generator/scripts/generate-og.mjs <course-dir>
```

範例：

```bash
node .agents/skills/course-page-generator/scripts/build.mjs course/cake
node .agents/skills/course-page-generator/scripts/generate-og.mjs course/cake
```

**Step 3 — Build 自動流程：**
1. 讀取 `config/global.yaml`（base config）
2. 讀取 `<course-dir>/config.yaml`（deep merge 覆蓋）
3. 解析 `<course-dir>/content.md`
4. 套用 HTML 模板 → 填入 TOC / Scroll Spy
5. 輸出 `<course-dir>/index.html`

**Step 4 — OG 縮圖（build 完成後自動接續）：**

> ⚠️ 此步驟為**必要步驟**，每次 build 完成後都**必須**執行，不可省略。需要 Puppeteer（`npm install --save-dev puppeteer`）。

`generate-og.mjs` 的行為概要：

1. 使用 Puppeteer 開啟 `file://<course-dir>/index.html?og=1`
   - `?og=1` 會觸發 `base.html` 中的 `og-mode`：
     - 隱藏 sidebar / footer / 一般內容 section
     - 只保留 hero 區塊，適合作為社群縮圖
2. 將 viewport 設為接近手機寬度、較高 `deviceScaleFactor`，輸出 1200×630 截圖
3. 將結果存到 `<course-dir>/assets/og-*.jpg`，課程 config 的 `seo.image` 應指向該檔案

## Config 合併規則

- **Deep merge**：課程 config 只需寫要覆蓋的欄位
- **Arrays 整個取代**：例如 `nav` 或 `socials` 在課程 config 有定義時，完整取代全域的
- **沒有課程 config**：直接使用全域 config

## 轉換指引

**⚠️ 核心原則：講義是傳遞資訊的載體，請「萃取重點」而非「逐字轉錄」。**
請忽略口語化的過場詞（如：大家好、接下來我們看、老實說）、贅字與講者自我呢喃，直接將講稿「提煉」成結構化的條列重點、圖表或卡片。

當使用者提供原始講稿時，AI 應該：

1. **萃取章節結構** — 移除口語過場，找出核心主題的轉換點，對應到 `#` 主章節與 `##` 子章節。
2. **資訊卡片化（極其重要）** — 將長篇大論的解說，提煉成精簡的 `### Title` 卡片與條列式列表，不要把講稿的段落直接複製貼上。**不要在標題或任何內容中使用 emoji。**
   - **原則：所有內容都應該落在結構化元件內**（卡片、Insight、Flow、Tags 等），避免出現裸段落（`loose-text`）。
   - ❌ 錯誤示範：直接把講稿貼成段落
     ```markdown
     一開始我把課程大綱交給 AI，第一版完成度很高。
     但 AI 會自己增減文字，想修改時得回去改 HTML。
     ```
   - ✅ 正確做法：提煉成卡片 + Insight
     ```markdown
     ### 第一版很快，但改不動
     - 把課程大綱直接交給 AI，第一版完成度很高
     - 但 AI 會自行增減文字、改變強調方式
     - 想修改時，得回去改 HTML 原始碼

     > **不能只停留在 AI 幫我生成第一版**
     > 講義要維護的是內容，不是 HTML。
     ```
3. **標記指令與操作** — 程式碼、CLI 指令、Prompt 範例，用 `` ```prompt `` 包裹。
4. **整理流程步驟** — 講述到操作或邏輯步驟時，將其整理成清晰的 `[flow]...[/flow]`。
5. **提煉深度觀點** — 將講稿中的核心洞察、反思或重要結論，轉為 `> **Title**` Insight Box 點出。
6. **產生總結** — 最後一個段落請直接用 `[summary]...[/summary]` 歸納本次課程精華。
7. **確認開場與結尾引言** — 檢查課程 `config.yaml`（或 `global.yaml`）是否已設定 `quotes.opening` 和 `quotes.closing`。若尚未設定，根據講稿的核心精神各撰寫一段引言，寫入 `config.yaml`。開場引言出現在講師介紹之後、第一個章節之前；結尾引言出現在所有章節之後、頁尾之前，用於收束整場課程的訊息。
9. **搜尋並插入圖片** — 當內容適合搭配圖片時（架構圖、截圖、流程圖、概念主角圖等），主動用 Glob 工具搜尋 `<course-dir>/assets/` 資料夾中的圖片檔（`*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.svg`, `*.webp`），並依圖片用途選擇嵌入方式：

   | 用途 | 語法 | 頻率 |
   |------|------|------|
   | **章節英雄**（`#` 主章節開頭，與引言共同構成封面） | 在 `# LABEL：TITLE` 與 `>` 引言之間獨立一行 `![alt](assets/images/xxx.png)` | 每門課 2–4 張，不宜每章都有 |
   | **內文獨立圖片**（段落間的架構圖、截圖、示意圖） | 在 `##` / `###` 段落間獨立一行，前後各空一行 `![alt](assets/images/xxx.png)` | 每個主章節平均 1–3 張 |
   | **圖文並排**（UI 截圖 + 欄位說明等） | `[image-text position="left\|right" width="N"]` + 圖片 + 文字 + `[/image-text]` | 視內容需要 |
   | **行內圖片**（icon、小型示意） | 句子中直接 `![alt](path)` | 少用 |

   - **找到匹配圖片**：根據檔名判斷最適合的圖片，選擇上述類型之一嵌入。
   - **找不到圖片**：在該處插入 HTML 註解標記，格式為 `<!-- TODO: 建議加圖 — {圖片用途描述} -->`，同時在回覆中彙整所有缺圖位置，提醒使用者補充或改用 `image-generator` Skill 批次生成。
   - **assets 資料夾不存在**：提醒使用者建立 `<course-dir>/assets/images/` 並放入相關圖片。
10. **驗證格式** — 對照 [components.md](reference/components.md) 確認語法正確。

## Reference Files

- 元件對照：[components.md](reference/components.md)
- YAML 範例：[config-example.yaml](reference/config-example.yaml)
- Markdown 範例：[content-example.md](reference/content-example.md)
- HTML 模板：[base.html](reference/base.html)
