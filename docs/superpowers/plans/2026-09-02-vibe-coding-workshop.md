# Vibe Coding 六小時工作坊 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一門以 OpenCode 示範、由需求走到安全交付的六小時 Vibe Coding 工作坊，包含完整課程頁、純前端待辦清單、五個課堂 checkpoint、工作紙、原創圖解與建置產物。

**Architecture:** 沿用 `lectures/<course-dir>/` 的既有課程架構，讓 `config.yaml` 管理 metadata、`content.md` 管理講義，教材附件集中在課程自己的 `assets/`。工作坊範例以無框架 ES modules 分隔畫面、待辦邏輯與 localStorage 邊界，使用 Node.js 內建測試；課程頁由現有 build、OG 與索引腳本產生，不修改共用模板。

**Tech Stack:** OpenCode、HTML、CSS、JavaScript ES modules、Node.js `node:test`、自訂 Markdown/YAML、SVG、Puppeteer、GitHub Pages。

**Approved design:** `docs/superpowers/specs/2026-09-02-vibe-coding-workshop-design.md`

---

## File Structure

### 課程來源與建置產物

- Create: `lectures/vibe-coding-workshop/config.yaml` — 課程 metadata、分類、SEO 與引言
- Create: `lectures/vibe-coding-workshop/content.md` — 360 分鐘完整講義與 OpenCode 操作步驟
- Generate: `lectures/vibe-coding-workshop/index.html` — 課程頁建置產物
- Generate: `lectures/vibe-coding-workshop/assets/og-image.jpg` — 1200×630 OG 圖片
- Modify: `lectures/manifest.js` — 由 `build-index.mjs` 重建的課程索引

### 原創圖解

- Create: `lectures/vibe-coding-workshop/assets/images/vibe-coding-loop.svg` — 人與 Agent 的責任迴圈
- Create: `lectures/vibe-coding-workshop/assets/images/permission-boundary.svg` — plan/build 與權限邊界
- Create: `lectures/vibe-coding-workshop/assets/images/todo-data-flow.svg` — 輸入、邏輯、儲存與渲染資料流
- Create: `lectures/vibe-coding-workshop/assets/images/injection-before-after.svg` — 不安全與安全 DOM 輸出對照
- Create: `lectures/vibe-coding-workshop/assets/images/release-gate.svg` — 六項交付證據

### 工作紙

- Create: `lectures/vibe-coding-workshop/assets/worksheets/requirements-template.md`
- Create: `lectures/vibe-coding-workshop/assets/worksheets/spec-template.md`
- Create: `lectures/vibe-coding-workshop/assets/worksheets/todolist-template.md`
- Create: `lectures/vibe-coding-workshop/assets/worksheets/permission-checklist.md`
- Create: `lectures/vibe-coding-workshop/assets/worksheets/release-checklist.md`

### 工作坊範例共通檔案

以下檔案出現在 starter 或 checkpoint 快照中；每個 checkpoint 是可獨立複製的完整狀態：

- `README.md` — 當前 checkpoint、執行方式與預期結果
- `package.json` — 僅含 `type: module`、`dev` 與 `test` scripts，無 dependencies
- `server.mjs` — 使用 Node.js 內建 `http` 提供本機靜態頁面
- `server.test.js` — 200／403／404、MIME、編碼 traversal 與 symlink 邊界測試
- `index.html` — 待辦清單語意化頁面
- `styles.css` — 單一頁面樣式與可見 focus 狀態
- `app.js` — DOM 事件、畫面渲染與錯誤訊息
- `todo.js` — 純待辦資料邏輯
- `storage.js` — localStorage 讀寫與資料契約驗證
- `todo.test.js` — 標題、CRUD、篩選與不可突變測試
- `storage.test.js` — 缺 key、損壞資料、寫入失敗與合法往返測試
- `requirements.md` — 使用者故事、驗收標準、非目標與安全需求
- `spec.md` — 資料契約、模組介面與錯誤行為
- `todolist.md` — 可追蹤的小步任務

### 課堂快照

- Create: `lectures/vibe-coding-workshop/assets/workshop/reset-workspace.mjs` — 將唯讀 checkpoint 複製到全新工作目錄，拒絕覆寫既有資料
- Create tree: `lectures/vibe-coding-workshop/assets/workshop/starter/`
- Create tree: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/01-requirements/`
- Create tree: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/02-spec/`
- Create tree: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/`
- Create tree: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/`
- Create tree: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/`

`03-feature` 只在講義程式碼對照中展示 `innerHTML` 反例，實際快照仍使用安全文字渲染，避免部署可執行的 XSS 範例。`04-tests` 包含核心邏輯測試；`05-hardened` 再加入完整儲存驗證、安全測試與 Release Gate。

## Chunk 1: Course Shell, Worksheets, and Visuals

### Task 1: 建立課程目錄與設定

**Files:**
- Create: `lectures/vibe-coding-workshop/config.yaml`
- Create: `lectures/vibe-coding-workshop/content.md`
- Create directories under: `lectures/vibe-coding-workshop/assets/`
- Reference: `.agents/skills/course-page-generator/reference/config-example.yaml`
- Reference: `docs/superpowers/specs/2026-09-02-vibe-coding-workshop-design.md`

- [ ] **Step 1: 確認隔離工作區與現有變更**

Run:

```bash
git status --short
git remote get-url origin
```

Expected: 在專用 worktree 或獲使用者同意的工作目錄執行；remote 為 `https://github.com/mch000534/agent-skill-lecture-builder.git`；任何既有變更均先辨識，不覆寫使用者工作。

- [ ] **Step 2: 用既有腳本建立課程骨架**

Run:

```bash
node .agents/skills/course-page-generator/scripts/new-lecture.mjs lectures/vibe-coding-workshop
mkdir -p lectures/vibe-coding-workshop/assets/images
mkdir -p lectures/vibe-coding-workshop/assets/worksheets
mkdir -p lectures/vibe-coding-workshop/assets/workshop/checkpoints
```

Expected: 新課程目錄含 `config.yaml`、`content.md` 與三個附件目錄；不修改共用模板。

- [ ] **Step 3: 寫入完整 config.yaml**

Use exactly this course-level configuration:

```yaml
page:
  title: "Vibe Coding：從想法到安全交付"
  badge: "OpenCode · AI Agent · 安全開發"
  category: "AI & 程式設計"
  published: true
  hero_title: "Vibe Coding 工作坊<br>從需求到安全交付"
  subtitle: "六小時全班同步實作：用 OpenCode 把模糊想法轉成可驗收需求、可測試程式與可交付的安全待辦清單。"

seo:
  title: "Vibe Coding 工作坊｜OpenCode、安全開發與實作流程"
  description: "六小時 Vibe Coding 實作工作坊，使用 OpenCode 完成需求、規格、任務拆解、測試、安全加固與 Release Gate。"
  url: "https://mch000534.github.io/agent-skill-lecture-builder/lectures/vibe-coding-workshop/"
  image: "https://mch000534.github.io/agent-skill-lecture-builder/lectures/vibe-coding-workshop/assets/og-image.jpg"

quotes:
  opening:
    text: "Vibe Coding 不是把判斷交給 AI，<br>而是讓 AI 加速一套由人類控制與驗證的工程流程。"
  closing:
    text: >
      快速生成只是起點。<br>
      能說明需求、限制權限、驗證結果並安全交付，才是完整的 Vibe Coding。
```

- [ ] **Step 4: 保留最小合法 content.md 供後續逐章撰寫**

Replace scaffold content with:

```markdown
# 開場：從感覺寫程式到可驗證交付
> 六小時內，跟著同一個待辦清單專案走過需求、規格、實作、測試、安全與交付。

[flow]
1. 需求 — 說清楚問題與驗收方式
2. 規格 — 定義資料、介面與限制
3. 實作 — 讓 Agent 一次完成一個小步驟
4. 驗證 — 用測試與瀏覽器操作取得證據
5. 安全 — 收窄權限與不信任資料
6. 交付 — 通過 Release Gate 才宣告完成
[/flow]

[summary]
- 人類負責意圖、限制、核准與最終判斷。
- Agent 負責在明確邊界內規劃、修改與執行。
- 沒有驗證證據的完成聲明，不算完成。
[/summary]
```

- [ ] **Step 5: 驗證 config 與骨架內容**

Run:

```bash
node .agents/skills/course-page-generator/scripts/validate.mjs lectures/vibe-coding-workshop
node -e 'const fs=require("fs");const files=process.argv.slice(1);const re=/\p{Extended_Pictographic}|\p{Regional_Indicator}|\uFE0F|\u20E3/u;const bad=files.filter(f=>re.test(fs.readFileSync(f,"utf8")));if(bad.length){console.error("Emoji found:",bad.join(", "));process.exit(1)}' lectures/vibe-coding-workshop/config.yaml lectures/vibe-coding-workshop/content.md
```

Expected: validator exit code 0；無 Emoji；SEO URL 與 image 都包含 `lectures/vibe-coding-workshop/`。

### Task 2: 建立五份工作紙

**Files:**
- Create: `lectures/vibe-coding-workshop/assets/worksheets/requirements-template.md`
- Create: `lectures/vibe-coding-workshop/assets/worksheets/spec-template.md`
- Create: `lectures/vibe-coding-workshop/assets/worksheets/todolist-template.md`
- Create: `lectures/vibe-coding-workshop/assets/worksheets/permission-checklist.md`
- Create: `lectures/vibe-coding-workshop/assets/worksheets/release-checklist.md`

- [ ] **Step 1: 建立需求工作紙**

`requirements-template.md` must contain these sections and fill-in fields:

```markdown
# 待辦清單需求工作紙

## 問題與目標
- 使用者：
- 使用情境：
- 要解決的問題：
- 成功結果：

## 使用者故事
作為＿＿＿＿，我希望＿＿＿＿，以便＿＿＿＿。

## Given–When–Then 驗收標準
### 新增待辦
- Given：
- When：
- Then：

### 完成、篩選、刪除與重新載入
- Given：
- When：
- Then：

## 非功能與安全需求
- 輸入限制：
- 不信任資料：
- 儲存失敗：
- Agent 權限：

## 非目標
- 不包含：
```

- [ ] **Step 2: 建立規格與任務工作紙**

Write `spec-template.md` with this complete structure:

````markdown
# 待辦清單技術規格工作紙

## Todo 資料契約
```text
{ id: string, title: string, completed: boolean }
```
- id：`crypto.randomUUID()` 產生，須符合不分大小寫的 UUID v4 正則 `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`，同一陣列內唯一
- title：必須是字串，等於 `trim()` 結果，長度 1–120
- completed：必須是布林值，新增時為 false
- 只允許 id、title、completed 三個欄位

## 模組邊界
### todo.js
- `validateTitle(rawTitle)`：成功回傳 `{ ok: true, value }`；非字串回傳 `{ ok: false, error: "invalid-type" }`；trim 後空白回傳 `{ ok: false, error: "required" }`；超過 120 回傳 `{ ok: false, error: "too-long" }`
- `addTodo(todos, rawTitle, id)`：驗證 title、UUID 格式與唯一性；成功回傳 `{ ok: true, todos, todo }`；失敗回傳 `{ ok: false, todos, error }`，其中 error 為標題錯誤或 `"invalid-id" | "duplicate-id"`
- `toggleTodo(todos, id)`：以字串全等找 ID；找到則回傳 `{ todos, changed: true }`；非字串、空白、格式錯誤或不存在均不改資料並回傳 `{ todos, changed: false }`
- `deleteTodo(todos, id)`：使用與 toggle 相同 ID 規則，固定回傳 `{ todos, changed }`
- `filterTodos(todos, "all" | "active" | "completed")`：合法時回傳新陣列，其他值拋出 `TypeError`
- 所有函式不突變傳入陣列或物件

### storage.js
- key：`vibe-coding.todos.v1`
- `loadTodos(storage)`：固定回傳 `{ todos, warning }`；key 不存在為 `{ todos: [], warning: null }`；讀取失敗的 warning 為 `"storage-unavailable"`；任何資料契約錯誤的 warning 為 `"corrupt-data"`
- `saveTodos(storage, todos)`：先依完整 Todo 契約驗證；無效回傳 `{ ok: false, error: "invalid-data" }`；序列化或寫入拋錯回傳 `{ ok: false, error: "write-failed" }`；成功回傳 `{ ok: true }`

### app.js
- 監聽 UI 事件
- 呼叫 todo.js 與 storage.js
- 只用安全 DOM API 顯示 title
- 顯示輸入、讀取及寫入錯誤

## 錯誤行為
- key 不存在：空陣列，無 warning
- JSON 或資料契約錯誤：空陣列，corrupt-data
- storage 讀取拋錯：空陣列，storage-unavailable
- storage 寫入失敗：保留記憶體狀態，顯示不會持久保存
- 無效或不存在 ID：不改資料，changed 為 false
- 非法 filter：拋出 TypeError

## 驗證
- Node.js：純邏輯與 storage 邊界測試
- Browser：新增、完成、篩選、刪除、重新載入
- Security：120/121 邊界、HTML 只顯示文字、損壞資料、寫入失敗
````

Write `todolist-template.md` exactly as:

```markdown
# 小步任務清單

- [ ] 建立語意化頁面骨架
- [ ] 先寫標題驗證失敗測試
- [ ] 實作標題驗證
- [ ] 先寫新增、切換、刪除與篩選測試
- [ ] 實作純待辦邏輯
- [ ] 串接 DOM 與安全文字渲染
- [ ] 先寫儲存邊界失敗測試
- [ ] 實作 localStorage 讀寫
- [ ] 完成瀏覽器黃金路徑
- [ ] 完成安全與權限檢查
```

- [ ] **Step 3: 建立權限與發布工作紙**

Write `permission-checklist.md` with all checkpoints and full evidence commands:

```markdown
# OpenCode 權限檢查表

| Checkpoint | 模式 | 操作 | 決定 | Git 證據 | 結果 |
| --- | --- | --- | --- | --- | --- |
| plan probe | plan | 建立 permission-probe-plan.txt | 拒絕 | `git status --short --untracked-files=all`、`git diff`、`git diff --cached` | |
| build probe | build | 建立 permission-probe-build.txt | 拒絕 | `git status --short --untracked-files=all`、`git diff`、`git diff --cached` | |
| 01 requirements | plan | 分析與撰寫需求 | 單次核准 | `git status --short --untracked-files=all`、`git diff`、`git diff --cached` | |
| 02 spec | plan | 分析與撰寫規格 | 單次核准 | `git status --short --untracked-files=all`、`git diff`、`git diff --cached` | |
| 03 feature | build | 實作核准功能 | 逐項核准 | `git status --short --untracked-files=all`、`git diff`、`git diff --cached` | |
| 04 tests | build | 撰寫與執行測試 | 逐項核准 | `git status --short --untracked-files=all`、`git diff`、`git diff --cached` | |
| 05 hardened | build | 安全加固與驗證 | 逐項核准 | `git status --short --untracked-files=all`、`git diff`、`git diff --cached` | |

## 通過條件
- [ ] 兩個 probe 檔案均不存在
- [ ] 每列均記錄允許或拒絕結果
- [ ] 每個 checkpoint 均執行三個完整 Git 檢查
- [ ] 所有修改、暫存及未追蹤路徑都屬於核准任務
- [ ] 未核准專案外讀寫、套件安裝、刪除或發布
```

Write `release-checklist.md` exactly as:

```markdown
# Vibe Coding Release Gate

## 需求證據
- [ ] 使用者故事與成功結果明確
- [ ] Given–When–Then 涵蓋新增、完成、篩選、刪除與重新載入
- [ ] 非目標與安全需求已記錄

## 規格證據
- [ ] Todo 資料契約、UUID、標題長度及 storage key 已定義
- [ ] todo、storage、app 三個模組介面已定義
- [ ] 錯誤行為與驗證方法已定義

## 功能證據
- [ ] 可新增、完成、取消完成、篩選及刪除待辦
- [ ] 重新整理後合法資料仍存在
- [ ] 瀏覽器黃金路徑已實際操作

## 測試證據
- [ ] `node --test` 全部通過
- [ ] 純空白被拒絕，前後空白被移除
- [ ] 120 字元成功，121 字元失敗且資料不變
- [ ] 無效或不存在 ID 不修改資料

## 安全證據
- [ ] HTML 標籤與事件屬性只顯示為文字
- [ ] 無效 JSON、非陣列、額外欄位、錯誤 UUID、重複 ID 與未正規化 title 均安全失敗
- [ ] storage 讀寫失敗會顯示警告且不令頁面崩潰
- [ ] 無 CDN、第三方 dependencies、金鑰或 `.env` 內容

## 交付證據
- [ ] plan/build probe 均被拒絕且檔案不存在
- [ ] Git status、diff、diff --cached 只包含核准工作
- [ ] 課程 validator、build、OG 與 manifest 全部成功
```

- [ ] **Step 4: 驗證工作紙完整性**

Run:

```bash
node -e 'const fs=require("fs"),path=require("path");const dir="lectures/vibe-coding-workshop/assets/worksheets";const checks={"requirements-template.md":["Given–When–Then","非功能與安全需求","非目標"],"spec-template.md":["validateTitle(rawTitle)","vibe-coding.todos.v1","write-failed","不突變"],"todolist-template.md":["先寫標題驗證失敗測試","完成瀏覽器黃金路徑"],"permission-checklist.md":["permission-probe-plan.txt","git diff --cached","05 hardened"],"release-checklist.md":["120 字元成功","HTML 標籤與事件屬性","課程 validator"]};for(const [f,markers] of Object.entries(checks)){const p=path.join(dir,f),s=fs.readFileSync(p,"utf8");for(const m of markers)if(!s.includes(m))throw new Error(`${f} missing ${m}`)}console.log("5 worksheets complete")'
node -e 'const fs=require("fs");const files=process.argv.slice(1);const re=/\p{Extended_Pictographic}|\p{Regional_Indicator}|\uFE0F|\u20E3/u;const bad=files.filter(f=>re.test(fs.readFileSync(f,"utf8")));if(bad.length){console.error("Emoji found:",bad.join(", "));process.exit(1)}' lectures/vibe-coding-workshop/assets/worksheets/*.md
```

Expected: prints `5 worksheets complete`; Emoji check exits 0 with no output.

### Task 3: 建立五張原創 SVG 圖解

**Files:**
- Create: `lectures/vibe-coding-workshop/assets/images/vibe-coding-loop.svg`
- Create: `lectures/vibe-coding-workshop/assets/images/permission-boundary.svg`
- Create: `lectures/vibe-coding-workshop/assets/images/todo-data-flow.svg`
- Create: `lectures/vibe-coding-workshop/assets/images/injection-before-after.svg`
- Create: `lectures/vibe-coding-workshop/assets/images/release-gate.svg`

- [ ] **Step 1: 定義一致視覺規則**

All SVG files use `viewBox="0 0 1200 700"`, system fonts, no external image/font/script, and this palette: navy `#14213d`, blue `#2f6690`, teal `#2a9d8f`, amber `#e9a23b`, red `#c8553d`, violet `#6650a4`, paper `#f7f4ed`. Each graphic includes a visible title and concise Traditional Chinese labels. Do not use `<style>`, inline `style=`, gradients, named colors, `rgb()`／`rgba()` or `hsl()`／`hsla()`; every single- or double-quoted `fill` and `stroke` value must be an approved six-digit hex color or `none`.

- [ ] **Step 2: 建立流程與權限圖**

`vibe-coding-loop.svg` must show: human intent → Agent plan → human approval → Agent action → evidence → human decision, with a visible boundary separating judgment from execution.

`permission-boundary.svg` must show plan mode as read-only, build mode as controlled write, two rejected probe files, and three separately labelled evidence lines exactly as: `未追蹤：git status --short --untracked-files=all`, `未暫存：git diff`, `已暫存：git diff --cached`.

- [ ] **Step 3: 建立資料流與安全對照圖**

`todo-data-flow.svg` must show: user input → `validateTitle` → pure Todo logic → `saveTodos` → localStorage → safe DOM render, plus failure branches for invalid input, corrupt reads, and failed writes.

`injection-before-after.svg` must place an unsafe `innerHTML` pattern on the left and `textContent` on the right. The payload is displayed only as inert text; SVG must not contain `<script>`, event attributes, or `foreignObject`.

- [ ] **Step 4: 建立 Release Gate 圖**

`release-gate.svg` must show six gates in order: requirements, spec, implementation, tests, security, delivery. Each gate contains one concrete evidence example and leads to a final “可交付” state.

- [ ] **Step 5: 驗證 SVG 結構與安全性**

Run:

```bash
node -e 'const fs=require("fs"),path=require("path");const dir="lectures/vibe-coding-workshop/assets/images";const checks={"vibe-coding-loop.svg":["Vibe Coding","人類意圖","Agent 計畫","人工核准","Agent 執行","證據","人類判斷","責任邊界"],"permission-boundary.svg":["權限邊界","plan","唯讀","build","受控寫入","permission-probe-plan.txt","permission-probe-build.txt","未追蹤：git status --short --untracked-files=all","未暫存：git diff","已暫存：git diff --cached"],"todo-data-flow.svg":["資料流","validateTitle","Todo logic","saveTodos","localStorage","安全 DOM","無效輸入","損壞資料","寫入失敗"],"injection-before-after.svg":["DOM 輸出","innerHTML","textContent","不安全","安全"],"release-gate.svg":["Release Gate","需求","使用者故事","規格","資料契約","實作","Git diff","測試","node --test","安全","HTML 只顯示文字","交付","validator","可交付"]};const palette=new Set(["#14213d","#2f6690","#2a9d8f","#e9a23b","#c8553d","#6650a4","#f7f4ed","none"]);for(const [f,markers] of Object.entries(checks)){const p=path.join(dir,f),s=fs.readFileSync(p,"utf8");if(!s.includes("<svg")||!/\bviewBox=["\x27]0 0 1200 700["\x27]/.test(s))throw new Error(`Invalid SVG: ${p}`);if(/<script|<foreignObject|<style|\sstyle\s*=|<(?:linear|radial)Gradient|\son[a-z]+\s*=|https?:\/\/|rgba?\(|hsla?\(/i.test(s))throw new Error(`Unsafe or unsupported SVG content: ${p}`);for(const m of markers)if(!s.includes(m))throw new Error(`${f} missing ${m}`);const attrs=[...s.matchAll(/\b(?:fill|stroke)=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1].toLowerCase()),declared=(s.match(/\b(?:fill|stroke)=/g)||[]).length;if(!attrs.length||attrs.length!==declared)throw new Error(`${f} has unquoted or missing palette attributes`);for(const c of attrs)if(!palette.has(c))throw new Error(`${f} uses color ${c}`)}console.log("5 SVG files valid")'
```

Expected: prints `5 SVG files valid`; every file has the required title/labels, only approved palette colors, and no active or external content.

- [ ] **Step 6: Review checkpoint; commit only if explicitly requested**

Review:

```bash
git status --short
git diff -- lectures/vibe-coding-workshop/config.yaml lectures/vibe-coding-workshop/content.md lectures/vibe-coding-workshop/assets/worksheets lectures/vibe-coding-workshop/assets/images
```

Expected: only the new course shell, five worksheets, and five SVG files appear. If and only if the user explicitly requests commits, stage these paths and create a new commit such as `feat: add vibe coding workshop foundations`.

## Chunk 2: Workshop Project and Checkpoints

### Task 4: 建立 starter、需求與規格 checkpoint

**Files:**
- Create tree: `lectures/vibe-coding-workshop/assets/workshop/starter/`
- Create tree: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/01-requirements/`
- Create tree: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/02-spec/`
- Reference: `lectures/vibe-coding-workshop/assets/worksheets/`

- [ ] **Step 1: 建立跨平台 checkpoint 複製工具**

Create `lectures/vibe-coding-workshop/assets/workshop/reset-workspace.mjs`:

```js
import { cpSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const sources = new Map([
  ["starter", join(root, "starter")],
  ["01-requirements", join(root, "checkpoints", "01-requirements")],
  ["02-spec", join(root, "checkpoints", "02-spec")],
  ["03-feature", join(root, "checkpoints", "03-feature")],
  ["04-tests", join(root, "checkpoints", "04-tests")],
  ["05-hardened", join(root, "checkpoints", "05-hardened")]
]);

const [checkpoint, destinationArg] = process.argv.slice(2);
if (!sources.has(checkpoint) || !destinationArg) {
  console.error("Usage: node reset-workspace.mjs <checkpoint> <new-directory>");
  process.exit(1);
}

const source = sources.get(checkpoint);
const destination = resolve(destinationArg);
if (!existsSync(source)) {
  console.error(`Checkpoint not found: ${checkpoint}`);
  process.exit(1);
}
if (existsSync(destination)) {
  console.error(`Destination already exists: ${destination}`);
  process.exit(1);
}

cpSync(source, destination, { recursive: true, errorOnExist: true, force: false });
console.log(`Copied ${checkpoint} to ${destination}`);
```

Learner recovery example:

```bash
node lectures/vibe-coding-workshop/assets/workshop/reset-workspace.mjs 03-feature ../vibe-coding-recovery
```

Expected: creates a new directory and never overwrites the learner's original work.

- [ ] **Step 2: 建立可啟動的 starter**

Create `starter/package.json`:

```json
{
  "name": "vibe-coding-todo-workshop",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "node server.mjs",
    "test": "node --test"
  }
}
```

Create `starter/server.mjs` exactly as:

```js
import { createReadStream, existsSync, realpathSync, statSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_ROOT = realpathSync(dirname(fileURLToPath(import.meta.url)));
const TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function send(res, status, body) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

export function createWorkshopServer(root = DEFAULT_ROOT) {
  const realRoot = realpathSync(root);
  return createHttpServer((req, res) => {
    const rawPath = (req.url ?? "/").split("?", 1)[0];
    let pathname;
    try {
      pathname = decodeURIComponent(rawPath);
    } catch {
      send(res, 400, "Bad request");
      return;
    }

    const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const candidate = resolve(realRoot, relativePath);
    if (candidate !== realRoot && !candidate.startsWith(`${realRoot}${sep}`)) {
      send(res, 403, "Forbidden");
      return;
    }
    if (!existsSync(candidate)) {
      send(res, 404, "Not found");
      return;
    }

    let realCandidate = realpathSync(candidate);
    if (!realCandidate.startsWith(`${realRoot}${sep}`)) {
      send(res, 403, "Forbidden");
      return;
    }
    if (statSync(realCandidate).isDirectory()) {
      const indexPath = resolve(realCandidate, "index.html");
      if (!existsSync(indexPath)) {
        send(res, 404, "Not found");
        return;
      }
      realCandidate = realpathSync(indexPath);
    }
    if (!realCandidate.startsWith(`${realRoot}${sep}`) || !statSync(realCandidate).isFile()) {
      send(res, 403, "Forbidden");
      return;
    }

    res.writeHead(200, {
      "content-type": TYPES[extname(realCandidate)] ?? "application/octet-stream",
      "x-content-type-options": "nosniff"
    });
    createReadStream(realCandidate).pipe(res);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  createWorkshopServer().listen(4173, "127.0.0.1", () => {
    console.log("Todo workshop: http://127.0.0.1:4173");
  });
}
```

Create `starter/server.test.js` exactly as:

```js
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createWorkshopServer } from "./server.mjs";

function get(port, path) {
  return new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port, path }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on("error", reject);
    req.end();
  });
}

test("serves only files inside the workshop root", async (t) => {
  const base = mkdtempSync(join(tmpdir(), "vibe-server-"));
  const root = join(base, "root");
  mkdirSync(root);
  writeFileSync(join(root, "index.html"), "<h1>Todo</h1>");
  writeFileSync(join(root, "styles.css"), "body{}");
  writeFileSync(join(root, "diagram.svg"), "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>");
  mkdirSync(join(root, "nested"));
  writeFileSync(join(root, "nested", "index.html"), "<h1>Nested</h1>");
  writeFileSync(join(base, "outside.txt"), "secret");

  let symlinkAvailable = true;
  try {
    symlinkSync(join(base, "outside.txt"), join(root, "leak.txt"));
  } catch (error) {
    if (!["EPERM", "EACCES", "ENOTSUP"].includes(error.code)) throw error;
    symlinkAvailable = false;
  }

  const server = createWorkshopServer(root);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    rmSync(base, { recursive: true, force: true });
  });

  const home = await get(port, "/");
  assert.equal(home.status, 200);
  assert.equal(home.headers["content-type"], "text/html; charset=utf-8");
  assert.equal((await get(port, "/styles.css")).headers["content-type"], "text/css; charset=utf-8");
  assert.equal((await get(port, "/diagram.svg")).headers["content-type"], "image/svg+xml");
  assert.equal((await get(port, "/nested/")).status, 200);
  assert.equal((await get(port, "/missing.txt")).status, 404);
  assert.equal((await get(port, "/..%2foutside.txt")).status, 403);
  assert.equal((await get(port, "/%ZZ")).status, 400);
  if (symlinkAvailable) assert.equal((await get(port, "/leak.txt")).status, 403);
});
```

Create `starter/index.html` with this semantic structure:

```html
<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Vibe Coding 待辦清單</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="todo-app">
    <header>
      <p class="eyebrow">Vibe Coding Workshop</p>
      <h1>我的待辦清單</h1>
      <p>先定義需求，再讓 Agent 實作。</p>
    </header>
    <form id="todo-form" novalidate>
      <label for="todo-title">待辦內容</label>
      <div class="input-row">
        <input id="todo-title" name="title" maxlength="120" autocomplete="off">
        <button type="submit">新增</button>
      </div>
      <p id="form-error" class="message error" aria-live="polite"></p>
    </form>
    <nav class="filters" aria-label="篩選待辦">
      <button type="button" data-filter="all" aria-pressed="true">全部</button>
      <button type="button" data-filter="active" aria-pressed="false">未完成</button>
      <button type="button" data-filter="completed" aria-pressed="false">已完成</button>
    </nav>
    <p id="storage-warning" class="message warning" aria-live="polite"></p>
    <ul id="todo-list" aria-label="待辦項目"></ul>
    <p id="empty-state">目前沒有待辦事項。</p>
  </main>
  <script type="module" src="app.js"></script>
</body>
</html>
```

Create `starter/styles.css` with these concrete rules: centered `max-width: 720px` card, system font, navy/blue/teal/amber/red/paper palette from Chunk 1, responsive stacked input below 560px, visible `:focus-visible` outline of at least 3px, minimum 44px button height, completed title with line-through, `.message:empty { display:none; }`, and no external imports.

Create `starter/app.js` as a valid module that selects the form and prevents submission while showing `請先完成需求與規格。` in `#form-error`. This keeps the starter runnable without pretending the feature exists.

Create `starter/README.md` with exact commands:

````markdown
# Starter

```bash
npm run dev
npm test
```

Open `http://127.0.0.1:4173`. The starter only verifies the environment and page shell; feature work begins after requirements and spec are approved.
````

- [ ] **Step 3: 驗證 starter**

Run from `lectures/vibe-coding-workshop/assets/workshop/starter`:

```bash
node --version
npm test
npm run dev
```

Expected: Node.js is 20 or newer; server boundary tests pass; dev prints `Todo workshop: http://127.0.0.1:4173`; browser shows the page shell; submitting displays `請先完成需求與規格。`; keyboard focus is visible. Stop the local server after verification.

- [ ] **Step 4: 建立 01-requirements checkpoint**

Create the checkpoint without overwriting any existing directory:

```bash
node lectures/vibe-coding-workshop/assets/workshop/reset-workspace.mjs starter lectures/vibe-coding-workshop/assets/workshop/checkpoints/01-requirements
```

Add `requirements.md` containing:

- user: a person who wants a local personal task list;
- story: add, complete/uncomplete, filter, delete, reload;
- Given–When–Then for each behavior;
- title normalization and 1–120 limit;
- local-only persistence and safe text rendering;
- non-goals: backend, accounts, sync, framework, external API.

Update its README heading to `Checkpoint 01：需求完成` and link to `requirements.md`. Keep the starter UI unchanged.

- [ ] **Step 5: 建立 02-spec checkpoint**

Create the checkpoint without overwriting any existing directory:

```bash
node lectures/vibe-coding-workshop/assets/workshop/reset-workspace.mjs 01-requirements lectures/vibe-coding-workshop/assets/workshop/checkpoints/02-spec
```

Add `spec.md` by copying the complete content of `assets/worksheets/spec-template.md`; it already contains the approved design values. Add `todolist.md` using the exact ordered checklist from the worksheet. Update README heading to `Checkpoint 02：規格與任務完成` and add links to all three documents.

- [ ] **Step 6: 驗證前三個狀態可獨立使用**

Run:

```bash
node -e 'const fs=require("fs"),path=require("path");const root="lectures/vibe-coding-workshop/assets/workshop";const checks={starter:["README.md","package.json","server.mjs","server.test.js","index.html","styles.css","app.js"],"checkpoints/01-requirements":["README.md","requirements.md","package.json","server.mjs","server.test.js","index.html","styles.css","app.js"],"checkpoints/02-spec":["README.md","requirements.md","spec.md","todolist.md","package.json","server.mjs","server.test.js","index.html","styles.css","app.js"]};for(const [dir,files] of Object.entries(checks))for(const f of files){const p=path.join(root,dir,f);if(!fs.existsSync(p)||!fs.statSync(p).size)throw new Error(`Missing ${p}`)}console.log("starter, requirements, and spec checkpoints complete")'
```

Expected: prints `starter, requirements, and spec checkpoints complete`.

### Task 5: 以 TDD 建立 03-feature 的待辦邏輯與畫面

**Files:**
- Create: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/todo.test.js`
- Create: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/todo.js`
- Create: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/security-before.md`
- Modify: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/app.js`
- Modify: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/README.md`

- [ ] **Step 1: 複製 02-spec 為 03-feature**

Run:

```bash
node lectures/vibe-coding-workshop/assets/workshop/reset-workspace.mjs 02-spec lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature
```

Expected: `03-feature` starts from approved requirements/spec/task state.

- [ ] **Step 2: 先寫 todo.test.js**

Create this complete test file before `todo.js` exists:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { addTodo, deleteTodo, filterTodos, toggleTodo, validateTitle } from "./todo.js";

const ID_A = "11111111-1111-4111-8111-111111111111";
const ID_B = "22222222-2222-4222-8222-222222222222";

function sampleTodos() {
  return [
    { id: ID_A, title: "第一項", completed: false },
    { id: ID_B, title: "第二項", completed: true }
  ];
}

test("validateTitle validates type, whitespace, and length", () => {
  assert.deepEqual(validateTitle(null), { ok: false, error: "invalid-type" });
  assert.deepEqual(validateTitle("   "), { ok: false, error: "required" });
  assert.deepEqual(validateTitle("x".repeat(121)), { ok: false, error: "too-long" });
  assert.deepEqual(validateTitle(`  ${"x".repeat(120)}  `), { ok: true, value: "x".repeat(120) });
});

test("addTodo validates ID, uniqueness, and preserves input", () => {
  const original = sampleTodos();
  const snapshot = structuredClone(original);
  assert.deepEqual(addTodo(original, "  新項目  ", "bad"), { ok: false, todos: original, error: "invalid-id" });
  assert.deepEqual(addTodo(original, "新項目", ID_A), { ok: false, todos: original, error: "duplicate-id" });
  const result = addTodo(original, "  新項目  ", "33333333-3333-4333-8333-333333333333");
  assert.equal(result.ok, true);
  assert.deepEqual(result.todo, { id: "33333333-3333-4333-8333-333333333333", title: "新項目", completed: false });
  assert.deepEqual(original, snapshot);
  assert.notEqual(result.todos, original);
});

test("toggleTodo changes only an exact matching ID", () => {
  const original = sampleTodos();
  const result = toggleTodo(original, ID_A);
  assert.equal(result.changed, true);
  assert.equal(result.todos[0].completed, true);
  assert.equal(result.todos[1], original[1]);
  assert.deepEqual(toggleTodo(original, "bad"), { todos: original, changed: false });
  assert.deepEqual(toggleTodo(original, "44444444-4444-4444-8444-444444444444"), { todos: original, changed: false });
});

test("deleteTodo removes only an exact matching ID", () => {
  const original = sampleTodos();
  assert.deepEqual(deleteTodo(original, ID_A), { todos: [original[1]], changed: true });
  assert.deepEqual(deleteTodo(original, ""), { todos: original, changed: false });
});

test("filterTodos returns new arrays and rejects invalid filters", () => {
  const original = sampleTodos();
  assert.deepEqual(filterTodos(original, "all"), original);
  assert.notEqual(filterTodos(original, "all"), original);
  assert.deepEqual(filterTodos(original, "active"), [original[0]]);
  assert.deepEqual(filterTodos(original, "completed"), [original[1]]);
  assert.throws(() => filterTodos(original, "unknown"), TypeError);
});
```

- [ ] **Step 3: 執行測試並確認紅燈**

Run:

```bash
node --test lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/todo.test.js
```

Expected: FAIL because `todo.js` or its exports do not exist.

- [ ] **Step 4: 實作 todo.js 的最小完整契約**

Create `todo.js` exactly as:

```js
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FILTERS = new Set(["all", "active", "completed"]);

export function validateTitle(rawTitle) {
  if (typeof rawTitle !== "string") return { ok: false, error: "invalid-type" };
  const value = rawTitle.trim();
  if (!value) return { ok: false, error: "required" };
  if (value.length > 120) return { ok: false, error: "too-long" };
  return { ok: true, value };
}

export function addTodo(todos, rawTitle, id) {
  const titleResult = validateTitle(rawTitle);
  if (!titleResult.ok) return { ok: false, todos, error: titleResult.error };
  if (typeof id !== "string" || !UUID_V4.test(id)) return { ok: false, todos, error: "invalid-id" };
  if (todos.some((todo) => todo.id === id)) return { ok: false, todos, error: "duplicate-id" };
  const todo = { id, title: titleResult.value, completed: false };
  return { ok: true, todos: [...todos, todo], todo };
}

export function toggleTodo(todos, id) {
  if (typeof id !== "string" || !UUID_V4.test(id)) return { todos, changed: false };
  const index = todos.findIndex((todo) => todo.id === id);
  if (index < 0) return { todos, changed: false };
  return {
    todos: todos.map((todo, itemIndex) => itemIndex === index ? { ...todo, completed: !todo.completed } : todo),
    changed: true
  };
}

export function deleteTodo(todos, id) {
  if (typeof id !== "string" || !UUID_V4.test(id)) return { todos, changed: false };
  const index = todos.findIndex((todo) => todo.id === id);
  if (index < 0) return { todos, changed: false };
  return { todos: todos.filter((_, itemIndex) => itemIndex !== index), changed: true };
}

export function filterTodos(todos, filter) {
  if (!FILTERS.has(filter)) throw new TypeError(`Unknown filter: ${filter}`);
  if (filter === "active") return todos.filter((todo) => !todo.completed);
  if (filter === "completed") return todos.filter((todo) => todo.completed);
  return [...todos];
}
```

- [ ] **Step 5: 執行測試並確認綠燈**

Run:

```bash
node --test lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/todo.test.js
```

Expected: all Todo logic tests PASS with zero failures.

- [ ] **Step 6: 實作記憶體版 app.js**

Replace `app.js` with:

```js
import { addTodo, deleteTodo, filterTodos, toggleTodo } from "./todo.js";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-title");
const formError = document.querySelector("#form-error");
const list = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
let todos = [];
let currentFilter = "all";

function showTitleError(error) {
  formError.textContent = error === "too-long"
    ? "待辦內容不可超過 120 個字元。"
    : "請輸入待辦內容。";
}

function render() {
  list.replaceChildren();
  const visibleTodos = filterTodos(todos, currentFilter);
  for (const todo of visibleTodos) {
    const item = document.createElement("li");
    item.dataset.id = todo.id;
    if (todo.completed) item.classList.add("completed");

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `切換「${todo.title}」完成狀態`);
    checkbox.addEventListener("change", () => {
      const result = toggleTodo(todos, todo.id);
      if (result.changed) todos = result.todos;
      render();
    });
    const title = document.createElement("span");
    title.textContent = todo.title;
    label.append(checkbox, title);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "刪除";
    remove.setAttribute("aria-label", `刪除「${todo.title}」`);
    remove.addEventListener("click", () => {
      const result = deleteTodo(todos, todo.id);
      if (result.changed) todos = result.todos;
      render();
    });
    item.append(label, remove);
    list.append(item);
  }
  emptyState.hidden = visibleTodos.length > 0;
  for (const button of filterButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.filter === currentFilter));
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = addTodo(todos, input.value, crypto.randomUUID());
  if (!result.ok) {
    showTitleError(result.error);
    return;
  }
  todos = result.todos;
  formError.textContent = "";
  input.value = "";
  render();
  input.focus();
});

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
}

render();
```

Update README to state `Checkpoint 03：功能初版`, run commands, supported behaviors, and the fact that persistence arrives in the next checkpoint.

- [ ] **Step 7: 建立不會執行的安全反例**

Create `security-before.md`:

````markdown
# 不安全 DOM 輸出反例

此檔案只供閱讀與比較，不會由 `index.html` 載入。

```js
list.innerHTML = todos
  .map((todo) => `<li>${todo.title}</li>`)
  .join("");
```

若 title 是 `<img src=x onerror=alert(1)>`，瀏覽器會把字串解析成 HTML，而不是普通文字。正式範例必須以 `createElement` 和 `textContent` 建立內容。
````

Confirm `index.html` and `app.js` do not import or execute this file.

- [ ] **Step 8: 驗證 03-feature 的公開表面**

Run its server and manually verify in a browser:

1. add `準備 Vibe Coding 工作坊`;
2. mark it complete, switch all three filters, uncomplete it, and delete it;
3. submit spaces and confirm the required error;
4. in DevTools run `const input=document.querySelector("#todo-title");input.removeAttribute("maxlength");input.value="x".repeat(121);input.form.requestSubmit();`, then confirm the domain validation rejects it without adding a row;
5. enter `<img src=x onerror=alert(1)>` and confirm it appears as inert text with no alert.

Expected: all five checks pass; console has no uncaught errors; refreshing clears data because this checkpoint is intentionally memory-only.

### Task 6: 以 TDD 建立 04-tests 的儲存邊界

**Files:**
- Create: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/storage.test.js`
- Create: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/storage.js`
- Modify: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/app.js`
- Modify: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/README.md`

- [ ] **Step 1: 複製 03-feature 為 04-tests**

Run:

```bash
node lectures/vibe-coding-workshop/assets/workshop/reset-workspace.mjs 03-feature lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests
```

Expected: feature code and Todo tests are preserved.

- [ ] **Step 2: 先寫 storage.test.js**

Create `storage.test.js` before `storage.js` exists:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { loadTodos, saveTodos, STORAGE_KEY } from "./storage.js";

const ID_A = "11111111-1111-4111-8111-111111111111";
const ID_B = "22222222-2222-4222-8222-222222222222";
const VALID = { id: ID_A, title: "第一項", completed: false };

function createStorage(initial = {}, options = {}) {
  const values = new Map(Object.entries(initial));
  let setCalls = 0;
  return {
    get setCalls() { return setCalls; },
    getItem(key) {
      if (options.failRead) throw new Error("read failed");
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      setCalls += 1;
      if (options.failWrite) throw new Error("write failed");
      values.set(key, value);
    }
  };
}

test("loadTodos treats a missing key as an empty initial state", () => {
  assert.deepEqual(loadTodos(createStorage()), { todos: [], warning: null });
});

test("valid todos round-trip", () => {
  const storage = createStorage();
  assert.deepEqual(saveTodos(storage, [VALID]), { ok: true });
  assert.deepEqual(loadTodos(storage), { todos: [VALID], warning: null });
});

test("loadTodos reports unavailable storage", () => {
  assert.deepEqual(loadTodos(createStorage({}, { failRead: true })), { todos: [], warning: "storage-unavailable" });
});

test("loadTodos rejects malformed or invalid persisted data", () => {
  const invalidValues = [
    "{",
    JSON.stringify({}),
    JSON.stringify([{ ...VALID, extra: true }]),
    JSON.stringify([{ ...VALID, completed: "false" }]),
    JSON.stringify([{ ...VALID, id: "bad" }]),
    JSON.stringify([VALID, { ...VALID }]),
    JSON.stringify([{ ...VALID, title: " 第一項 " }]),
    JSON.stringify([{ ...VALID, title: "" }]),
    JSON.stringify([{ ...VALID, title: "x".repeat(121) }])
  ];
  for (const value of invalidValues) {
    const storage = createStorage({ [STORAGE_KEY]: value });
    assert.deepEqual(loadTodos(storage), { todos: [], warning: "corrupt-data" });
  }
});

test("saveTodos rejects invalid data before writing", () => {
  const storage = createStorage();
  assert.deepEqual(saveTodos(storage, [{ ...VALID, id: "bad" }]), { ok: false, error: "invalid-data" });
  assert.equal(storage.setCalls, 0);
});

test("saveTodos reports write failures", () => {
  const storage = createStorage({}, { failWrite: true });
  assert.deepEqual(saveTodos(storage, [VALID]), { ok: false, error: "write-failed" });
  assert.equal(storage.setCalls, 1);
});
```

- [ ] **Step 3: 執行儲存測試並確認紅燈**

Run:

```bash
node --test lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/storage.test.js
```

Expected: FAIL because `storage.js` or its exports do not exist.

- [ ] **Step 4: 實作 storage.js**

Create `storage.js` exactly as:

```js
export const STORAGE_KEY = "vibe-coding.todos.v1";
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TODO_KEYS = ["completed", "id", "title"];

function isValidTodoList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  for (const todo of value) {
    if (!todo || typeof todo !== "object" || Array.isArray(todo)) return false;
    if (Object.keys(todo).sort().join(",") !== TODO_KEYS.join(",")) return false;
    if (typeof todo.id !== "string" || !UUID_V4.test(todo.id) || ids.has(todo.id)) return false;
    if (typeof todo.title !== "string" || todo.title !== todo.title.trim() || !todo.title || todo.title.length > 120) return false;
    if (typeof todo.completed !== "boolean") return false;
    ids.add(todo.id);
  }
  return true;
}

export function loadTodos(storage) {
  let raw;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { todos: [], warning: "storage-unavailable" };
  }
  if (raw === null) return { todos: [], warning: null };
  try {
    const todos = JSON.parse(raw);
    return isValidTodoList(todos)
      ? { todos, warning: null }
      : { todos: [], warning: "corrupt-data" };
  } catch {
    return { todos: [], warning: "corrupt-data" };
  }
}

export function saveTodos(storage, todos) {
  if (!isValidTodoList(todos)) return { ok: false, error: "invalid-data" };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return { ok: true };
  } catch {
    return { ok: false, error: "write-failed" };
  }
}
```

- [ ] **Step 5: 執行所有測試並確認綠燈**

Run:

```bash
node --test lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/server.test.js lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/todo.test.js lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/storage.test.js
```

Expected: Todo and storage suites all PASS with zero failures.

- [ ] **Step 6: 串接持久化與警告**

Update `04-tests/app.js` to:

- initialize memory from `loadTodos(localStorage)`;
- display `儲存資料已損壞，已改用空清單。` for `corrupt-data`;
- display `瀏覽器儲存功能目前不可用。` for `storage-unavailable`;
- call `saveTodos` after every successful add/toggle/delete;
- keep the current in-memory state if saving fails;
- display `目前變更不會在重新整理後保留。` for `write-failed`;
- keep all rendering through `textContent` and DOM creation.

Update README to `Checkpoint 04：測試與持久化完成` and list `npm test` plus browser persistence checks.

- [ ] **Step 7: 驗證 04-tests**

Run tests, launch the server, then add two items, complete one, refresh, and verify both values and status persist. In DevTools, set `vibe-coding.todos.v1` to invalid JSON and refresh; verify the warning and empty list. Restore valid storage after the exercise.

Expected: tests pass; legal data persists; invalid storage does not crash the page.

### Task 7: 建立 05-hardened 與驗證全部 checkpoint

**Files:**
- Create tree: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/`
- Modify: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/index.html`
- Modify: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/app.js`
- Create: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/security-after.md`
- Modify: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/README.md`

- [ ] **Step 1: 複製 04-tests 為 05-hardened**

Run:

```bash
node lectures/vibe-coding-workshop/assets/workshop/reset-workspace.mjs 04-tests lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened
```

Expected: all tested behavior is preserved.

- [ ] **Step 2: 寫下最終安全驗收並確認目前結果**

Before changing code, record expected outcomes in README: CSP blocks unexpected external loads, no `innerHTML`, input has visible label and 120-character browser limit, dynamic buttons have accessible names, storage warnings use `aria-live`, and no runtime dependency exists.

Run:

```bash
node -e 'const fs=require("fs"),path="lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened",html=fs.readFileSync(`${path}/index.html`,"utf8"),readme=fs.readFileSync(`${path}/README.md`,"utf8");for(const marker of ["CSP","innerHTML","120","accessible names","aria-live","no runtime dependency"])if(!readme.includes(marker))throw new Error(`README missing ${marker}`);if(!html.includes("Content-Security-Policy"))throw new Error("Expected red test: CSP missing")'
```

Expected: FAIL only with `Expected red test: CSP missing`; all README evidence markers are already present.

- [ ] **Step 3: 完成最小安全加固**

Add this CSP to `05-hardened/index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'">
```

Keep all JavaScript external, remove any `innerHTML`, preserve visible labels, `aria-live`, `maxlength="120"`, focus styles and 44px targets.

Create `security-after.md`:

````markdown
# 安全 DOM 輸出

```js
const title = document.createElement("span");
title.textContent = todo.title;
item.append(title);
```

`textContent` 把待辦標題視為文字，不會解析其中的 HTML 標籤或事件屬性。請與 Checkpoint 03 的 `security-before.md` 對照。
````

Update README to `Checkpoint 05：安全加固與 Release Gate` and include every item from `release-checklist.md` as completed evidence instructions, not pre-checked claims.

- [ ] **Step 4: 執行自動檢查**

Run:

```bash
node --test lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/server.test.js lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/todo.test.js
node --test lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/server.test.js lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/todo.test.js lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/storage.test.js
node --test lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/server.test.js lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/todo.test.js lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/storage.test.js
node -e 'const fs=require("fs"),path=require("path");const root="lectures/vibe-coding-workshop/assets/workshop";const dirs=["starter","checkpoints/01-requirements","checkpoints/02-spec","checkpoints/03-feature","checkpoints/04-tests","checkpoints/05-hardened"];for(const d of dirs){const p=path.join(root,d),pkg=JSON.parse(fs.readFileSync(path.join(p,"package.json"),"utf8"));if(Object.keys(pkg.dependencies||{}).length||Object.keys(pkg.devDependencies||{}).length)throw new Error(`${d} has dependencies`)}const final=path.join(root,"checkpoints/05-hardened");const html=fs.readFileSync(path.join(final,"index.html"),"utf8"),app=fs.readFileSync(path.join(final,"app.js"),"utf8");if(!html.includes("Content-Security-Policy")||!html.includes("maxlength=\"120\"")||!html.includes("aria-live"))throw new Error("Final HTML missing hardening");if(/\.innerHTML\b/.test(app))throw new Error("Final app uses innerHTML");console.log("all workshop checkpoints verified")'
```

Expected: all test suites pass and the final command prints `all workshop checkpoints verified`.

- [ ] **Step 5: 手動驗證最終使用流程**

Start `05-hardened` with `npm run dev` and verify through the actual browser:

- add, complete/uncomplete, filter and delete;
- reload persistence;
- whitespace and 120/121 boundaries;
- HTML/event attributes remain inert text;
- corrupt localStorage warning;
- failed storage write warning: in DevTools run `Storage.prototype.setItem=()=>{throw new DOMException("Quota exceeded","QuotaExceededError")}`, add a new item, verify `目前變更不會在重新整理後保留。`, then reload the page to restore the prototype;
- keyboard-only operation and visible focus;
- no console errors and no external network requests.

Expected: every Release Gate behavior is directly observed. Revert any temporary DevTools changes before the final screenshot.

- [ ] **Step 6: Review checkpoint; commit only if explicitly requested**

Review:

```bash
git status --short
git diff -- lectures/vibe-coding-workshop/assets/workshop
```

Expected: only starter and five checkpoint trees appear. If and only if the user explicitly requests commits, create a new commit such as `feat: add vibe coding workshop project`.

## Chunk 3: Course Content, Build, and Browser Verification

### Task 8: 撰寫前半段教材內容

**Files:**
- Modify: `lectures/vibe-coding-workshop/content.md`
- Reference: `docs/superpowers/specs/2026-09-02-vibe-coding-workshop-design.md`
- Reference: `.agents/skills/course-page-generator/reference/components.md`
- Reference: `/Users/barry/vibe_coding_SOP`
- Reference: `/Users/barry/vibe_coding_Security`

- [ ] **Step 1: 以 @content-drafting 套用完整教學節奏**

Keep the approved audience, six-hour duration, OpenCode tool choice, synchronized teaching format, pure frontend Todo project, and development-security emphasis. Do not introduce another framework, backend, cloud service, account system or external API.

- [ ] **Step 2: 撰寫「開場」30 分鐘**

Create:

```markdown
# 開場：Vibe Coding 不只是把 Prompt 丟給 AI（30 分鐘）
> 先由人類定義意圖與風險，再讓 Agent 在有限權限內執行，最後用證據決定是否完成。
```

This chapter must contain:

- `![Vibe Coding 人機協作迴圈](assets/images/vibe-coding-loop.svg)` as chapter hero;
- `[compare]` contrasting “生成後直接相信” with “需求 → 計畫 → 核准 → 實作 → 驗證”;
- explanation of LLM + Harness + tools + memory + permission;
- `![OpenCode plan 與 build 權限邊界](assets/images/permission-boundary.svg)`;
- a `[vote id="vibe-coding-risk-first-action" title="Agent 要執行未解釋命令時，你會先做什麼？"]` activity with four concrete choices;
- a `[quiz]` asking who owns final judgment;
- an OpenCode preflight block with `opencode --version`, Node 20+, browser, dedicated workshop directory;
- model setup guidance using OpenCode's interactive connection flow, allowing any instructor-approved provider while never displaying, pasting into course files, or committing an API key;
- a `[callout]` stating that model choice does not replace least privilege, review or verification;
- the plan-mode and build-mode rejected probe exercise;
- explicit links to `assets/worksheets/permission-checklist.md` and `assets/workshop/reset-workspace.mjs`.

- [ ] **Step 3: 撰寫「需求」45 分鐘**

Create:

```markdown
# 需求：把「做一個 Todo App」變成可驗收問題（45 分鐘）
> Agent 可以補程式碼，不能替學員猜測成功標準。
```

Include:

- a weak one-line prompt and a scoped prompt in `[compare]`;
- problem, user, context, desired outcome and non-goal explanation;
- user stories for add, complete/uncomplete, filter, delete and reload;
- Given–When–Then examples for valid input, blank input, 120/121 limit and persistence;
- a `[quiz]` distinguishing implementation detail from acceptance criterion;
- a guided exercise that fills `requirements-template.md`;
- link `[Checkpoint 01：需求完成](assets/workshop/checkpoints/01-requirements/README.md)` plus `node assets/workshop/reset-workspace.mjs 01-requirements ../vibe-coding-01`;
- a checklist whose completion condition is an approved `requirements.md`.

- [ ] **Step 4: 撰寫「規格」45 分鐘與第一次休息**

Create:

```markdown
# 規格：把需求轉成 Agent 可安全執行的邊界（45 分鐘）
> 規格定義資料、介面、錯誤與驗證，不替 Agent 指定每一行程式碼。
```

Include:

- `![待辦清單資料流與錯誤邊界](assets/images/todo-data-flow.svg)`;
- `[tabs]` for requirements, spec and task-list viewpoints;
- the exact Todo data contract, UUID v4 rule, title normalization and storage key;
- all public function signatures and return unions from the approved design;
- `[flow]` from failing test to minimal implementation to green test to refactor;
- a guided exercise filling `spec-template.md` and `todolist-template.md`;
- link `[Checkpoint 02：規格完成](assets/workshop/checkpoints/02-spec/README.md)` plus `node assets/workshop/reset-workspace.mjs 02-spec ../vibe-coding-02`;
- `## 休息（10 分鐘）` after the chapter activity.

- [ ] **Step 5: 驗證前半段結構**

Run:

```bash
node -e 'const fs=require("fs"),p="lectures/vibe-coding-workshop/content.md",s=fs.readFileSync(p,"utf8");const markers=["# 開場：","# 需求：","# 規格：","## 休息（10 分鐘）","[compare","[vote","[quiz","[callout","[tabs]","assets/images/vibe-coding-loop.svg","assets/images/permission-boundary.svg","assets/images/todo-data-flow.svg","requirements-template.md","spec-template.md","todolist-template.md","01-requirements","02-spec"];for(const m of markers)if(!s.includes(m))throw new Error(`Missing ${m}`);console.log("front half structure complete")'
```

Expected: prints `front half structure complete`.

### Task 9: 撰寫實作、測試與安全教材

**Files:**
- Modify: `lectures/vibe-coding-workshop/content.md`
- Reference: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/03-feature/`
- Reference: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/04-tests/`
- Reference: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/`

- [ ] **Step 1: 撰寫「實作」65 分鐘**

Create:

```markdown
# 實作：讓 OpenCode 一次完成一個可驗證步驟（65 分鐘）
> 小步前進的目的不是減慢 Agent，而是縮小錯誤與權限的爆炸半徑。
```

Include:

- an initial `prompt` asking plan mode to analyze requirements/spec without writing;
- the rejected `permission-probe-plan.txt` and `permission-probe-build.txt` sequence;
- prompts for page shell, title validation, Todo logic and DOM wiring, one task at a time;
- `terminal` blocks for all three Git evidence commands after each step;
- `[steps-status]` matching the ten-item `todolist.md`;
- link `[Checkpoint 03：功能初版](assets/workshop/checkpoints/03-feature/README.md)` plus `node assets/workshop/reset-workspace.mjs 03-feature ../vibe-coding-03`;
- browser exercise for CRUD, all three filters, blank input, 121-character DevTools command and inert HTML payload;
- an insight explaining why the example app uses DOM creation and `textContent` even before the security chapter.

- [ ] **Step 2: 撰寫「測試」45 分鐘與第二次休息**

Create:

```markdown
# 測試：用失敗與通過證明程式行為（45 分鐘）
> 測試不是讓畫面顯示綠色，而是把需求轉成可以反覆執行的證據。
```

Include:

- Red → Green → Refactor `[flow]`;
- selected complete tests for `validateTitle`, immutable add/toggle and storage corruption;
- terminal blocks showing targeted red and green commands, then full `node --test`;
- distinction between unit evidence and browser behavior evidence;
- Git status/diff review and safe recovery explanation;
- link `[Checkpoint 04：測試完成](assets/workshop/checkpoints/04-tests/README.md)` plus `node assets/workshop/reset-workspace.mjs 04-tests ../vibe-coding-04`;
- a `[quiz]` about why unit tests do not prove browser behavior;
- `## 休息（10 分鐘）` after the testing exercise.

- [ ] **Step 3: 撰寫「安全」60 分鐘**

Create:

```markdown
# 安全：把 Agent、資料與瀏覽器都視為信任邊界（60 分鐘）
> 模型是否聰明不決定損害大小；它能使用哪些工具、讀取哪些資料與執行哪些操作才決定爆炸半徑。
```

Include:

- threat model covering Prompt Injection, malicious MCP/Skill, excessive permission, secret leakage, dependency risk and business-logic abuse;
- `[compare-table]` mapping threat → vulnerable behavior → control → verification evidence;
- `![不安全與安全 DOM 輸出對照](assets/images/injection-before-after.svg)`;
- inert excerpts from `security-before.md` and `security-after.md`;
- localStorage corruption and write-failure exercises;
- plan/build permission probes and human-approval rules;
- no-CDN/no-dependency/no-secret checks;
- a `[quiz]` choosing the best control for a malicious instruction embedded in project content;
- link `[Checkpoint 05：安全加固](assets/workshop/checkpoints/05-hardened/README.md)` plus `node assets/workshop/reset-workspace.mjs 05-hardened ../vibe-coding-05`;
- a final security checklist referencing `permission-checklist.md`.

- [ ] **Step 4: 驗證中段結構與安全內容**

Run:

```bash
node -e 'const fs=require("fs"),p="lectures/vibe-coding-workshop/content.md",s=fs.readFileSync(p,"utf8");const markers=["# 實作：","# 測試：","# 安全：","permission-probe-plan.txt","permission-probe-build.txt","git status --short --untracked-files=all","git diff --cached","node --test","03-feature","04-tests","05-hardened","innerHTML","textContent","Prompt Injection","MCP","localStorage","[compare-table","[steps-status]"];for(const m of markers)if(!s.includes(m))throw new Error(`Missing ${m}`);if((s.match(/## 休息（10 分鐘）/g)||[]).length!==2)throw new Error("Expected two breaks");console.log("implementation and security structure complete")'
```

Expected: prints `implementation and security structure complete`.

### Task 10: 完成交付、回顧與內容品質驗證

**Files:**
- Modify: `lectures/vibe-coding-workshop/content.md`
- Reference: `lectures/vibe-coding-workshop/assets/worksheets/release-checklist.md`

- [ ] **Step 1: 撰寫「交付」40 分鐘**

Create:

```markdown
# 交付：通過 Release Gate 才宣告完成（40 分鐘）
> 完成不是 Agent 的一句話，而是一組可重現的需求、測試、安全與瀏覽器證據。
```

Include:

- `![Vibe Coding 六項 Release Gate](assets/images/release-gate.svg)`;
- six gates: requirements, spec, implementation, tests, security, delivery;
- exact automated commands for Todo/storage/server tests;
- browser golden-path and failure-path checklist;
- OpenCode permission evidence and three Git commands;
- `[accordion]` troubleshooting for server port use, OpenCode output divergence, failed tests, corrupt storage and a learner falling behind;
- a link to `release-checklist.md` and non-destructive checkpoint recovery examples.

- [ ] **Step 2: 撰寫「回顧」10 分鐘**

Create:

```markdown
# 回顧：把工作坊方法帶回下一個專案（10 分鐘）
> 需求、規格、實作、測試、安全與交付，是一條可重複使用的證據鏈。
```

Include:

- `[summary]` with the six evidence groups;
- one final `[quiz]` choosing the correct next action when an Agent claims completion without evidence;
- a `[flow]` for applying the method to the learner's next project;
- exact worksheet links: `[需求工作紙](assets/worksheets/requirements-template.md)`, `[規格工作紙](assets/worksheets/spec-template.md)`, `[任務清單](assets/worksheets/todolist-template.md)`, `[權限檢查表](assets/worksheets/permission-checklist.md)`, `[Release Gate](assets/worksheets/release-checklist.md)`;
- exact checkpoint links: `[01](assets/workshop/checkpoints/01-requirements/README.md)`, `[02](assets/workshop/checkpoints/02-spec/README.md)`, `[03](assets/workshop/checkpoints/03-feature/README.md)`, `[04](assets/workshop/checkpoints/04-tests/README.md)`, `[05](assets/workshop/checkpoints/05-hardened/README.md)`;
- no unsupported statistics or unverified incident numbers.

- [ ] **Step 3: 驗證 360 分鐘、結構、連結與禁止內容**

Run:

```bash
node -e 'const fs=require("fs"),p="lectures/vibe-coding-workshop/content.md",s=fs.readFileSync(p,"utf8");const schedule=[["# 開場：Vibe Coding 不只是把 Prompt 丟給 AI（30 分鐘）",30],["# 需求：把「做一個 Todo App」變成可驗收問題（45 分鐘）",45],["# 規格：把需求轉成 Agent 可安全執行的邊界（45 分鐘）",45],["## 休息（10 分鐘）",10],["# 實作：讓 OpenCode 一次完成一個可驗證步驟（65 分鐘）",65],["# 測試：用失敗與通過證明程式行為（45 分鐘）",45],["## 休息（10 分鐘）",10],["# 安全：把 Agent、資料與瀏覽器都視為信任邊界（60 分鐘）",60],["# 交付：通過 Release Gate 才宣告完成（40 分鐘）",40],["# 回顧：把工作坊方法帶回下一個專案（10 分鐘）",10]];let cursor=-1,total=0;for(const [marker,minutes] of schedule){const next=s.indexOf(marker,cursor+1);if(next<0)throw new Error(`Missing or out of order: ${marker}`);cursor=next;total+=minutes}if(total!==360)throw new Error(`Duration ${total}`);console.log(`Duration ${total} minutes`)'
node -e 'const fs=require("fs"),path=require("path"),p="lectures/vibe-coding-workshop/content.md",s=fs.readFileSync(p,"utf8"),links=[...s.matchAll(/\]\((assets\/(?:images|worksheets|workshop)\/[^)]+)\)/g)].map(m=>m[1]),required=["assets/worksheets/requirements-template.md","assets/worksheets/spec-template.md","assets/worksheets/todolist-template.md","assets/worksheets/permission-checklist.md","assets/worksheets/release-checklist.md","assets/workshop/checkpoints/01-requirements/README.md","assets/workshop/checkpoints/02-spec/README.md","assets/workshop/checkpoints/03-feature/README.md","assets/workshop/checkpoints/04-tests/README.md","assets/workshop/checkpoints/05-hardened/README.md"];for(const link of required)if(!links.includes(link))throw new Error(`Required link missing: ${link}`);for(const link of links){const full=path.join(path.dirname(p),link);if(!fs.existsSync(full)||!fs.statSync(full).isFile())throw new Error(`Missing linked file: ${link}`)}console.log(`${links.length} local asset files resolve`)'
node -e 'const fs=require("fs"),p="lectures/vibe-coding-workshop/content.md",s=fs.readFileSync(p,"utf8"),re=/\p{Extended_Pictographic}|\p{Regional_Indicator}|\uFE0F|\u20E3/u;if(re.test(s))throw new Error("Emoji found");if(s.includes("[image-here]"))throw new Error("Image placeholder found");for(const tag of ["flow","summary","compare","vote","quiz","callout","tabs","steps-status","compare-table","accordion"]){const open=(s.match(new RegExp(`\\[${tag}(?:\\s[^\\]]*)?\\]`,"g"))||[]).length,close=(s.match(new RegExp(`\\[/${tag}\\]`,"g"))||[]).length;if(open!==close)throw new Error(`${tag}: ${open}/${close}`)}console.log("content structure valid")'
```

Expected: prints `Duration 360 minutes`, every local asset resolves, and content structure is valid.

- [ ] **Step 4: 執行課程語法與教學節奏審閱**

Run:

```bash
node .agents/skills/course-page-generator/scripts/validate.mjs lectures/vibe-coding-workshop
```

Expected: exit code 0 with no unclosed tags, SEO errors, empty/generic image alt, excess hero images or placeholders. Then invoke `@content-review`; every main chapter must contain explanation, example and learner action. Apply concrete review findings to `content.md`, rerun the validator, and do not create a review report unless requested.

- [ ] **Step 5: Review checkpoint; commit only if explicitly requested**

Review:

```bash
git status --short
git diff -- lectures/vibe-coding-workshop/content.md
```

Expected: complete course content with eight ordered main chapters and two breaks. If and only if the user explicitly requests commits, create a new commit such as `feat: add vibe coding workshop curriculum`.

### Task 11: 建置課程頁、OG 圖與索引

**Files:**
- Generate: `lectures/vibe-coding-workshop/index.html`
- Generate: `lectures/vibe-coding-workshop/assets/og-image.jpg`
- Modify: `lectures/manifest.js`

- [ ] **Step 1: 執行最終 validator**

Run:

```bash
node .agents/skills/course-page-generator/scripts/validate.mjs lectures/vibe-coding-workshop
```

Expected: exit code 0; warnings must be reviewed and fixed rather than ignored.

- [ ] **Step 2: 建置 HTML 並立即產生 OG**

Run:

```bash
node .agents/skills/course-page-generator/scripts/build.mjs lectures/vibe-coding-workshop
node .agents/skills/course-page-generator/scripts/generate-og.mjs lectures/vibe-coding-workshop
```

Expected: both commands exit 0; `index.html` exists; `assets/og-image.jpg` is regenerated after the final build.

- [ ] **Step 3: 重建課程索引**

Run:

```bash
node .agents/skills/course-page-generator/scripts/build-index.mjs
```

Expected: `lectures/manifest.js` contains one published entry whose href is `lectures/vibe-coding-workshop/` and category is `AI & 程式設計`.

- [ ] **Step 4: 驗證建置產物**

Run:

```bash
node -e 'const fs=require("fs"),html="lectures/vibe-coding-workshop/index.html",og="lectures/vibe-coding-workshop/assets/og-image.jpg",manifest="lectures/manifest.js";for(const p of [html,og,manifest])if(!fs.existsSync(p)||!fs.statSync(p).size)throw new Error(`Missing ${p}`);const h=fs.readFileSync(html,"utf8"),m=fs.readFileSync(manifest,"utf8");for(const marker of ["Vibe Coding","OpenCode","Release Gate","assets/workshop","assets/worksheets"])if(!h.includes(marker))throw new Error(`HTML missing ${marker}`);const href="\"href\": \"lectures/vibe-coding-workshop/\"";if(m.split(href).length-1!==1)throw new Error("Manifest must contain exactly one course entry");const entry=m.slice(m.lastIndexOf("{",m.indexOf(href)),m.indexOf("}",m.indexOf(href))+1);if(!entry.includes("\"category\": \"AI & 程式設計\""))throw new Error("Manifest category mismatch");console.log("build artifacts present")'
node -e 'const fs=require("fs"),b=fs.readFileSync("lectures/vibe-coding-workshop/assets/og-image.jpg");if(b[0]!==0xff||b[1]!==0xd8)throw new Error("Not JPEG");let i=2,w,h;while(i<b.length){if(b[i]!==0xff){i++;continue}const marker=b[i+1];if([0xc0,0xc1,0xc2].includes(marker)){h=b.readUInt16BE(i+5);w=b.readUInt16BE(i+7);break}const len=b.readUInt16BE(i+2);if(!len)break;i+=2+len}if(w!==1200||h!==630)throw new Error(`OG is ${w}x${h}`);console.log(`OG is ${w}x${h}`)'
```

Expected: prints `build artifacts present` and `OG is 1200x630`; manifest contains exactly one course entry in `AI & 程式設計`.

### Task 12: 在實際瀏覽器驗證課程頁

**Files:**
- Verify: `lectures/vibe-coding-workshop/index.html`
- Verify: `lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/`
- Verify: root `index.html` and `lectures/manifest.js`

- [ ] **Step 1: 從 repo root 啟動課程預覽**

Invoke `@run`. From the repository root, use the tested workshop server so the generated page can resolve shared `/assets/course.css` and `/assets/course.js`:

```bash
node -e 'import("./lectures/vibe-coding-workshop/assets/workshop/checkpoints/05-hardened/server.mjs").then(({createWorkshopServer})=>createWorkshopServer(process.cwd()).listen(3001,"127.0.0.1",()=>console.log("Preview: http://127.0.0.1:3001/lectures/vibe-coding-workshop/")))'
```

Expected: course page is available at `http://127.0.0.1:3001/lectures/vibe-coding-workshop/`; shared CSS/JS and course assets all return 200. Rebuild manually after edits, then refresh.

- [ ] **Step 2: 驗證課程頁主要流程**

In the browser verify:

- hero metadata, eight chapter nav items and two break sections render correctly;
- all five SVG images load with readable labels and no clipping;
- flow, compare, compare-table, tabs, steps-status, accordion, quiz and summary components render and operate;
- code copy buttons work;
- every worksheet and checkpoint link resolves;
- desktop and narrow viewport remain readable;
- keyboard navigation, focus and reduced-motion behavior remain usable;
- console has no errors and network has no unexpected external runtime dependency.

- [ ] **Step 3: 驗證最終 Todo checkpoint**

In a separate browser window run the `05-hardened` project and repeat its Release Gate: CRUD, filters, persistence, boundary inputs, inert HTML, corrupt storage, failed writes and keyboard use. Capture a screenshot only after all checks pass.

- [ ] **Step 4: 驗證根索引回歸**

Using the same repo-root server from Step 1, open `http://127.0.0.1:3001/`. Confirm the new course appears once under `AI & 程式設計`, its card opens `/lectures/vibe-coding-workshop/`, and existing course cards and filters still work. Stop the server after verification.

- [ ] **Step 5: Final review; commit only if explicitly requested**

Run:

```bash
git status --short
git diff --stat
git diff -- lectures/manifest.js
```

Expected: source files, workshop assets and required generated files are present; no unrelated file is modified. If and only if the user explicitly requests commits, stage exact course paths plus `lectures/manifest.js` and create a new commit such as `feat: publish vibe coding workshop`.
