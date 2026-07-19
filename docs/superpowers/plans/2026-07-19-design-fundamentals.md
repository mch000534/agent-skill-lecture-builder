# Design Fundamentals Course Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一門可部署的 6 小時「設計入門：從視覺基礎到 UX/UI」課程，包含完整講義、五張 SVG 教學圖、HTML 課程頁、OG 縮圖與課程索引資料。

**Architecture:** 沿用既有 `lectures/<course-dir>/` 結構，以 `config.yaml` 管理課程 metadata、`content.md` 管理三節課的結構化教材，並把原創 SVG 放在課程自己的 `assets/images/`。現有建置腳本負責驗證、將 Markdown/YAML 轉為 HTML、擷取 OG 圖與重新產生 `manifest.js`，不修改共用模板或執行期程式碼。

**Tech Stack:** Node.js ESM 建置腳本、自訂 Markdown/YAML 語法、SVG、HTML、Puppeteer、GitHub Pages。

**Approved design:** `docs/superpowers/specs/2026-07-19-design-fundamentals-design.md`

---

## File Structure

- Create: `lectures/design-fundamentals/config.yaml` — 課程標題、分類、SEO、開場與結尾引言
- Create: `lectures/design-fundamentals/content.md` — 三節各 120 分鐘的完整教材、四個獨立練習與整合練習
- Create: `lectures/design-fundamentals/assets/images/poster-before-after.svg` — 海報資訊層級前後對照
- Create: `lectures/design-fundamentals/assets/images/ppt-hierarchy.svg` — PPT 密集資訊改版示意
- Create: `lectures/design-fundamentals/assets/images/web-reading-flow.svg` — Web 首頁內容結構與閱讀動線
- Create: `lectures/design-fundamentals/assets/images/app-booking-flow.svg` — App 報名流程與狀態回饋
- Create: `lectures/design-fundamentals/assets/images/design-system.svg` — 色彩、字級、間距與元件規則
- Generate: `lectures/design-fundamentals/index.html` — 課程頁建置產物
- Generate: `lectures/design-fundamentals/assets/og-image.jpg` — 1200×630 OG 縮圖
- Modify: `lectures/manifest.js` — 新增「設計印刷」分類下的課程索引資料

## Chunk 1: Course Sources

### Task 1: 建立課程設定與目錄

**Files:**
- Create: `lectures/design-fundamentals/config.yaml`
- Create directory: `lectures/design-fundamentals/assets/images/`

- [ ] **Step 1: 確認 GitHub Pages 基礎網址與工作樹狀態**

Run:

```bash
git remote get-url origin
git status --short
```

Expected: remote 為 `https://github.com/mch000534/agent-skill-lecture-builder.git`；實作開始前只包含已知的計畫文件變更。

- [ ] **Step 2: 建立課程圖片目錄**

Run:

```bash
mkdir -p lectures/design-fundamentals/assets/images
```

Expected: 目錄存在，且不影響其他課程。

- [ ] **Step 3: 以 apply_patch 建立課程 config**

`lectures/design-fundamentals/config.yaml` 必須包含：

```yaml
page:
  title: "設計入門：從視覺基礎到 UX/UI"
  badge: "設計基礎 · 視覺設計 · UX/UI"
  category: "設計印刷"
  published: true
  hero_title: "看得懂、用得順<br>從設計原則到跨媒介實作"
  subtitle: "為零基礎學員與職場人士設計的 6 小時完整課程，從使用者與目標出發，練習海報、PPT、Web、App 與設計系統。"

seo:
  title: "設計入門：從視覺基礎到 UX/UI｜6 小時完整課程"
  description: "零基礎設計入門課程，涵蓋設計思維、色彩、字體、版面、UX、UI、設計系統，以及海報、PPT、Web、App 實作。"
  image: "https://mch000534.github.io/agent-skill-lecture-builder/lectures/design-fundamentals/assets/og-image.jpg"
  url: "https://mch000534.github.io/agent-skill-lecture-builder/lectures/design-fundamentals/"

quotes:
  opening:
    text: "設計不是把東西變漂亮，<br>而是讓正確的人更容易理解、選擇與行動。"
  closing:
    text: >
      好設計不是一次完成的答案，<br>
      而是理解問題、提出方案、接受回饋並持續修正的過程。
```

- [ ] **Step 4: 驗證設定欄位沒有 Emoji 或錯誤 URL**

Run:

```bash
rg -n "category|published|seo:|image:|url:" lectures/design-fundamentals/config.yaml
node -e 'const fs=require("fs");const files=process.argv.slice(1);const re=/\p{Extended_Pictographic}|\p{Regional_Indicator}|\uFE0F|\u20E3/u;const bad=files.filter(f=>re.test(fs.readFileSync(f,"utf8")));if(bad.length){console.error("Emoji found:",bad.join(", "));process.exit(1)}' lectures/design-fundamentals/config.yaml
```

Expected: 第一個命令顯示必要欄位；第二個命令以 exit code 0 結束且無輸出。

### Task 2: 建立五張原創 SVG 教學圖

**Files:**
- Create: `lectures/design-fundamentals/assets/images/poster-before-after.svg`
- Create: `lectures/design-fundamentals/assets/images/ppt-hierarchy.svg`
- Create: `lectures/design-fundamentals/assets/images/web-reading-flow.svg`
- Create: `lectures/design-fundamentals/assets/images/app-booking-flow.svg`
- Create: `lectures/design-fundamentals/assets/images/design-system.svg`

- [ ] **Step 1: 建立共用視覺規則**

所有 SVG 使用 `viewBox="0 0 1200 700"`、純向量圖形、系統字體、足夠的文字對比，以及一致的色盤：深藍 `#18243d`、藍 `#356df3`、珊瑚橙 `#ff7657`、米白 `#f7f4ee`、綠 `#29a36a`。不得引用外部字型、影像或 script。

- [ ] **Step 2: 以 apply_patch 建立海報與 PPT 對照圖**

`poster-before-after.svg` 左側呈現資訊等大、擁擠、缺乏對齊的版本；右側呈現主標、日期、地點、CTA 的清楚層級。`ppt-hierarchy.svg` 左側呈現滿版段落與多個同等數據；右側只保留一個結論、關鍵數字與三個佐證。

- [ ] **Step 3: 以 apply_patch 建立 Web、App 與設計系統圖**

`web-reading-flow.svg` 顯示 Hero、價值、流程、FAQ、CTA 的垂直閱讀動線。`app-booking-flow.svg` 顯示選日期、選時段、填資料、確認四步與成功／錯誤狀態。`design-system.svg` 顯示顏色 token、字級階梯、8pt 間距與按鈕／輸入框／卡片元件。

- [ ] **Step 4: 驗證 SVG 結構與禁止的外部內容**

Run:

```bash
test -s lectures/design-fundamentals/assets/images/poster-before-after.svg
test -s lectures/design-fundamentals/assets/images/ppt-hierarchy.svg
test -s lectures/design-fundamentals/assets/images/web-reading-flow.svg
test -s lectures/design-fundamentals/assets/images/app-booking-flow.svg
test -s lectures/design-fundamentals/assets/images/design-system.svg
rg -q '<svg' lectures/design-fundamentals/assets/images/poster-before-after.svg
rg -q '<svg' lectures/design-fundamentals/assets/images/ppt-hierarchy.svg
rg -q '<svg' lectures/design-fundamentals/assets/images/web-reading-flow.svg
rg -q '<svg' lectures/design-fundamentals/assets/images/app-booking-flow.svg
rg -q '<svg' lectures/design-fundamentals/assets/images/design-system.svg
if rg -n 'https?://|<script|<foreignObject' lectures/design-fundamentals/assets/images/*.svg; then exit 1; fi
```

Expected: 五個檔案均非空且包含 `<svg`；禁止內容搜尋無輸出，整個區塊以 exit code 0 結束。

- [ ] **Step 5: 提交設定與 SVG 教材**

Run:

```bash
git add lectures/design-fundamentals/config.yaml lectures/design-fundamentals/assets/images
git commit -m "feat: add design fundamentals course visuals"
```

Expected: commit 成功，僅包含 config 與五個 SVG。

### Task 3: 撰寫完整 6 小時 content.md

**Files:**
- Create: `lectures/design-fundamentals/content.md`
- Reference: `.agents/skills/course-page-generator/reference/components.md`
- Reference: `docs/superpowers/specs/2026-07-19-design-fundamentals-design.md`

- [ ] **Step 1: 撰寫第一節「從問題到視覺」**

必須包含：

- `# 第一節：從問題到視覺` 與 120 分鐘標示
- `## 設計思維（30 分鐘）`：使用者、情境、問題、目標、限制
- `[flow]`：理解使用者 → 定義問題 → 設定目標 → 提出方案 → 驗證
- `## 視覺基礎（50 分鐘）`：色彩、字體、留白、對比、對齊、層級
- `[compare]`：裝飾導向與目標導向
- `![海報資訊層級改版前後對照](assets/images/poster-before-after.svg)`
- `## 海報實作（40 分鐘）`：校園公開講座的素材、步驟、限制與檢查清單
- 至少一題 `[quiz]`

- [ ] **Step 2: 撰寫第二節「從內容到體驗」**

必須包含：

- `# 第二節：從內容到體驗` 與 120 分鐘標示
- `## 構圖與版面（25 分鐘）`：網格、親密性、對齊、重複、對比、閱讀動線
- `![PPT 資訊層級改版示意](assets/images/ppt-hierarchy.svg)`
- `## PPT 實作（35 分鐘）`：專案成果報告、一頁一重點、訊息標題
- `## UX 與資訊架構（30 分鐘）`：目標路徑、內容分組、導航、可尋性
- `![Web 首頁內容結構與閱讀動線](assets/images/web-reading-flow.svg)`
- `## Web 實作（30 分鐘）`：社區工作坊首頁、Hero 到 CTA 的線框
- 至少一題 `[quiz]`

- [ ] **Step 3: 撰寫第三節「從元件到系統」**

必須包含：

- `# 第三節：從元件到系統` 與 120 分鐘標示
- `## UI 基礎（20 分鐘）`：按鈕、表單、卡片、導航、預設／載入／成功／錯誤狀態
- `![迷你設計系統的組成](assets/images/design-system.svg)`
- `## 設計系統（15 分鐘）`：色彩、字級、8pt 間距、元件與一致性
- `![App 報名流程與畫面狀態](assets/images/app-booking-flow.svg)`
- `## App 實作（25 分鐘）`：場地預約四步流程與狀態回饋
- `## 回饋與迭代（15 分鐘）`：目標、證據、優先級、再測試
- `## 跨媒介整合實作（45 分鐘）`：城市創意節整合練習與五項評分標準
- 至少一題 `[quiz]` 與最終 `[summary]`

- [ ] **Step 4: 檢查內容品質與時數**

Run:

```bash
rg -n '^# |^## |^### |\[quiz|\[summary' lectures/design-fundamentals/content.md
node -e 'const fs=require("fs");const s=fs.readFileSync(process.argv[1],"utf8");const spec={"第一節":[["設計思維",30],["視覺基礎",50],["海報實作",40]],"第二節":[["構圖與版面",25],["PPT 實作",35],["UX 與資訊架構",30],["Web 實作",30]],"第三節":[["UI 基礎",20],["設計系統",15],["App 實作",25],["回饋與迭代",15],["跨媒介整合實作",45]]};let lastSession=-1;for(const [session,items] of Object.entries(spec)){const sessionPos=s.indexOf(`# ${session}：`);if(sessionPos<0)throw new Error(`缺少：${session}`);if(sessionPos<=lastSession)throw new Error(`節次順序錯誤：${session}`);lastSession=sessionPos;let pos=sessionPos;const total=items.reduce((n,[label,m])=>{const heading=`## ${label}（${m} 分鐘）`;const next=s.indexOf(heading);if(next<0)throw new Error(`缺少：${heading}`);if(next<=pos)throw new Error(`單元順序錯誤：${heading}`);pos=next;return n+m},0);if(total!==120)throw new Error(`${session} 時數為 ${total}`);console.log(`${session}: ${total} 分鐘，順序正確`)}' lectures/design-fundamentals/content.md
node -e 'const fs=require("fs");const files=process.argv.slice(1);const re=/\p{Extended_Pictographic}|\p{Regional_Indicator}|\uFE0F|\u20E3/u;const bad=files.filter(f=>re.test(fs.readFileSync(f,"utf8")));if(bad.length){console.error("Emoji found:",bad.join(", "));process.exit(1)}' lectures/design-fundamentals/content.md
```

Expected: 三個主章節、四個獨立練習、整合練習、每節 Quiz 與 Summary 均可找到；Node 時數檢查分別輸出三節均為 120 分鐘；Emoji 檢查以 exit code 0 結束且無輸出。

- [ ] **Step 5: 執行語法驗證**

Run:

```bash
node .agents/skills/course-page-generator/scripts/validate.mjs lectures/design-fundamentals
```

Expected: exit code 0，無未閉合區塊、SEO URL 或圖片 alt 錯誤；如有 warning，先修正後再進入建置。

- [ ] **Step 6: 提交課程講義**

Run:

```bash
git add lectures/design-fundamentals/content.md
git commit -m "feat: add design fundamentals course content"
```

Expected: commit 成功，內容檔可獨立通過 validator。

## Chunk 2: Build, Index, and Verification

### Task 4: 建置 HTML 與 OG 縮圖

**Files:**
- Generate: `lectures/design-fundamentals/index.html`
- Generate: `lectures/design-fundamentals/assets/og-image.jpg`

- [ ] **Step 1: 建置課程頁**

Run:

```bash
node .agents/skills/course-page-generator/scripts/build.mjs lectures/design-fundamentals
```

Expected: exit code 0，輸出 `lectures/design-fundamentals/index.html`。

- [ ] **Step 2: 立即產生 OG 縮圖**

Run:

```bash
node .agents/skills/course-page-generator/scripts/generate-og.mjs lectures/design-fundamentals
```

Expected: exit code 0，輸出 1200×630 的 `lectures/design-fundamentals/assets/og-image.jpg`。

- [ ] **Step 3: 驗證建置產物與圖片引用**

Run:

```bash
test -s lectures/design-fundamentals/index.html
test -s lectures/design-fundamentals/assets/og-image.jpg
rg -q 'src="assets/images/poster-before-after.svg"' lectures/design-fundamentals/index.html
rg -q 'src="assets/images/ppt-hierarchy.svg"' lectures/design-fundamentals/index.html
rg -q 'src="assets/images/web-reading-flow.svg"' lectures/design-fundamentals/index.html
rg -q 'src="assets/images/app-booking-flow.svg"' lectures/design-fundamentals/index.html
rg -q 'src="assets/images/design-system.svg"' lectures/design-fundamentals/index.html
file lectures/design-fundamentals/assets/og-image.jpg
```

Expected: 兩個產物非空；HTML 逐一包含五個正確的 `assets/images/` SVG 相對路徑；`file` 回報 JPEG image data、1200×630。

### Task 5: 更新課程索引

**Files:**
- Modify: `lectures/manifest.js`

- [ ] **Step 1: 重新產生 manifest**

Run:

```bash
node .agents/skills/course-page-generator/scripts/build-index.mjs
```

Expected: exit code 0，`lectures/manifest.js` 新增設計入門課程。

- [ ] **Step 2: 驗證索引欄位**

Run:

```bash
node -e 'const fs=require("fs"),vm=require("vm");const box={window:{}};vm.runInNewContext(fs.readFileSync(process.argv[1],"utf8"),box);const c=box.window.__courses__.find(x=>x.href==="lectures/design-fundamentals/");if(!c)throw new Error("找不到 design-fundamentals");const expected={title:"設計入門：從視覺基礎到 UX/UI",ogImage:"lectures/design-fundamentals/assets/og-image.jpg",href:"lectures/design-fundamentals/",category:"設計印刷"};for(const [key,value] of Object.entries(expected)){if(c[key]!==value)throw new Error(`${key}: expected ${value}, got ${c[key]}`)}console.log(c)' lectures/manifest.js
```

Expected: 同一筆新課程資料的 title、href、ogImage 與 category 全部相符，命令以 exit code 0 結束。

- [ ] **Step 3: 提交建置產物與索引**

Run:

```bash
git add lectures/design-fundamentals/index.html lectures/design-fundamentals/assets/og-image.jpg lectures/manifest.js
git commit -m "build: publish design fundamentals course"
```

Expected: commit 成功，包含 GitHub Pages 所需三個建置產物。

### Task 6: 最終驗收

**Files:**
- Verify: `lectures/design-fundamentals/config.yaml`
- Verify: `lectures/design-fundamentals/content.md`
- Verify: `lectures/design-fundamentals/index.html`
- Verify: `lectures/design-fundamentals/assets/images/*.svg`
- Verify: `lectures/design-fundamentals/assets/og-image.jpg`
- Verify: `lectures/manifest.js`

- [ ] **Step 1: 重跑 validator 與 build，確認可重現**

Run:

```bash
node .agents/skills/course-page-generator/scripts/validate.mjs lectures/design-fundamentals
node .agents/skills/course-page-generator/scripts/build.mjs lectures/design-fundamentals
node .agents/skills/course-page-generator/scripts/generate-og.mjs lectures/design-fundamentals
node .agents/skills/course-page-generator/scripts/build-index.mjs
```

Expected: 四個命令均以 exit code 0 完成。

- [ ] **Step 2: 檢查禁止項目、課程時數與工作樹**

Run:

```bash
node -e 'const fs=require("fs");const files=process.argv.slice(1);const emoji=/\p{Extended_Pictographic}|\p{Regional_Indicator}|\uFE0F|\u20E3/u;const external=/https:\/\/.*cdn|<script[^>]+src=/i;for(const f of files){const s=fs.readFileSync(f,"utf8");if(emoji.test(s)||external.test(s)){console.error(`禁止內容：${f}`);process.exit(1)}}' lectures/design-fundamentals/config.yaml lectures/design-fundamentals/content.md lectures/design-fundamentals/assets/images/*.svg
node -e 'const fs=require("fs");const s=fs.readFileSync(process.argv[1],"utf8");const spec={"第一節":[["設計思維",30],["視覺基礎",50],["海報實作",40]],"第二節":[["構圖與版面",25],["PPT 實作",35],["UX 與資訊架構",30],["Web 實作",30]],"第三節":[["UI 基礎",20],["設計系統",15],["App 實作",25],["回饋與迭代",15],["跨媒介整合實作",45]]};let lastSession=-1;for(const [session,items] of Object.entries(spec)){const sessionPos=s.indexOf(`# ${session}：`);if(sessionPos<0||sessionPos<=lastSession)throw new Error(`節次缺少或順序錯誤：${session}`);lastSession=sessionPos;let pos=sessionPos;const total=items.reduce((n,[label,m])=>{const heading=`## ${label}（${m} 分鐘）`;const next=s.indexOf(heading);if(next<0||next<=pos)throw new Error(`單元缺少或順序錯誤：${session}／${label}`);pos=next;return n+m},0);if(total!==120)throw new Error(`${session} 時數為 ${total}`)}if(!s.includes("城市創意節"))throw new Error("缺少城市創意節整合主題");console.log("三節各 120 分鐘、順序正確，整合主題存在")' lectures/design-fundamentals/content.md
git status --short
```

Expected: 禁止內容檢查以 exit code 0 結束；時數檢查輸出三節各 120 分鐘且整合主題存在；只出現重建後確實變動且尚未提交的預期產物。

- [ ] **Step 3: 如重建造成產物差異，提交可重現產物**

Run:

```bash
git add lectures/design-fundamentals/index.html lectures/design-fundamentals/assets/og-image.jpg lectures/manifest.js
git commit -m "build: refresh design course artifacts"
```

Expected: 僅在重建有實際差異時建立 commit；若無差異，跳過此步。

- [ ] **Step 4: 最終確認**

Run:

```bash
git status --short
git log -5 --oneline
```

Expected: 工作樹乾淨，近期 commit 清楚分隔設計文件、來源教材與建置產物。
