# 為什麼是 Claude Code：心智模型
> Claude Code 不是另一個 Copilot，它是會「動手做事」的工程夥伴 — 先建立正確的心智模型，後面所有指令才會用得到位

## 從補完到代理：兩種 AI 寫程式的方式

### Copilot 與 Claude Code 的本質差異

[compare label-left="補完型 AI（Copilot 思維）" label-right="代理型 AI（Claude Code 思維）"]
- 在游標處猜下一行 | 接收一段需求，自行規劃多步驟
- 你開檔案、它寫片段 | 它讀檔、改檔、跑指令、看輸出
- 上下文限於目前檔案 | 自行檢索整個 repo、AGENT.md、commit 歷史
- 結果交給你貼上 | 結果是真實的檔案異動與測試紀錄
[/compare]

> **代理型工具改變的是分工，不是速度**
> 速度的提升只是表象。真正的改變是：你不再寫每一行程式碼，而是「描述目標、設定規範、審核產出」。
>
> 這意味著你的核心能力從打字速度，轉移到「設計規格」與「驗證結果」 — 而這兩項都需要遠比過去更清晰的工程思考。

### 它能做與不能做的事

[tags]
- [green] 擅長：跨檔案重構、依規格實作、寫測試、解釋既有程式碼
- [green] 擅長：閱讀 stack trace 並定位 root cause、依 lint 結果自動修
- [orange] 邊界：商業判斷、UX 取捨、跨系統的架構決策仍需要人主導
- [purple] 風險：它會自信地產生看似正確、實則錯誤的程式碼，務必要驗證
[/tags]

[dl]
- Copilot | 補完型 AI 工具，在游標處預測下一行程式碼，上下文限於目前檔案
- Agent AI（代理型 AI）| 能自主規劃多步驟、讀檔、改檔、跑指令的 AI 系統
- Claude Code | Anthropic 的代理型程式設計工具，透過終端機介面與 repo 互動
- Context Window | AI 模型的上下文視窗，決定它能「記住」多少資訊
[/dl]

[callout type="tip" title="建立正確心智模型的捷徑"]
- 每次對話都當成你正在跟一位新同事講解需求
- 不要說「請教我 X」，改說「請用 X 完成 Y，條件是 Z」
- 把 AI 的每個產出都當成 pull request 來審核，而不是 final answer
[/callout]

[reveal title="什麼樣的 prompt 最讓 Claude Code 發揮價值？"]
最優秀的 prompt 格式：「專案背景 + 明確目標 + 邊界條件 + 驗證方式」

例如：「這是一個 Next.js 14 的電商前台（背景），請把商品列表改為 SSR（目標），不要改 CSS 和路由（邊界），完成後跑 `npm run build` 確認無 error（驗證）。」
[/reveal]

## 課程地圖

### 你會學到什麼

[flow]
1. 第 2 章 — 安裝、首次對話、基本 CLI 指令
2. 第 3 章 — Plan / Edit / Verify 三段式工作流
3. 第 4 章 — 用 CLAUDE.md、Slash Commands、Permissions 形塑團隊規範
4. 第 5 章 — Skills 與 Subagents：把可重複的專業知識交給 AI
5. 第 6 章 — Hooks、MCP、Git Worktree 的自動化整合
6. 第 7 章 — 精通階段的迭代、Debug 與團隊協作心法
[/flow]

> **本章為背景鋪陳**
> 第 1 章只提供心智模型，沒有實作步驟。下一章開始我們會打開終端機，一行一行驗證每個概念。

[quiz type="single"]
Q: Claude Code 與 Copilot 最根本的差異是什麼？
- [ ] Claude Code 的模型參數更大
- [x] Claude Code 是代理型 AI，能自主讀檔、改檔、跑指令
- [ ] Claude Code 支援更多程式語言
Hint: 回想本章「補完型」與「代理型」的比較
[/quiz]

[quiz type="bool"]
Q: AI 產生的程式碼若沒有測試驗證，就可以先 commit？
- [ ] 是
- [x] 否
Hint: 代理型工具的產出是真實的檔案異動，必須驗證
[/quiz]

---

# 安裝啟程：第一次對話與基本指令
> 三步驟把 Claude Code 跑起來，並理解它在你機器上實際做了什麼

## 安裝與認證

### 安裝前置條件

- macOS / Linux / Windows（WSL）皆可
- Node.js 18 以上，建議 20 LTS
- 一個 Anthropic 帳號（或公司提供的 API Key）
- 一個你願意被它讀寫的 git repo（強烈建議乾淨的工作目錄）

### 安裝指令

```prompt [label="全域安裝"]
npm install -g @anthropic-ai/claude-code
claude --version
```

```prompt [label="首次啟動會引導登入"]
cd ~/projects/my-app
claude
```

- 第一次啟動會開瀏覽器完成 OAuth 授權，或要求貼上 API Key
- 設定會寫到 `~/.claude/`，包含 token、模型偏好、權限快取
- 退出對話：在 prompt 輸入 `/exit` 或按兩次 Ctrl+C

[callout type="warning" title="API Key 安全提醒"]
- 切勿將 API Key commit 進 Git repo 或貼到社群
- 建議使用 `~/.claude/` 下的設定檔管理，而非環境變數
- 公司提供的 API Key 請遵循內部資安規範
[/callout]

### 安裝驗證 checklist

- [x] `claude --version` 回傳版本號而非 command not found
- [x] 在 repo 目錄內執行 `claude`，能看到歡迎訊息
- [x] 輸入 `pwd` 並讓 Claude 執行，回應的路徑與你目前的目錄一致
- [x] 輸入 `/help` 能列出所有 slash commands

## 第一次有意義的對話

### 三句話讓它做點實事

[flow]
1. 提供脈絡 — 一句話說明你的專案是什麼
2. 給定目標 — 一句話說清楚這次要做什麼
3. 設定邊界 — 一句話講限制（不要動哪些檔案、要符合哪些規範）
[/flow]

```prompt [label="第一次對話的標準範本"]
這是一個 React + TypeScript 的後台管理專案，使用 Vite。
請幫我把 src/pages/UserList.tsx 改為使用 react-query 抓資料，
維持原本的 UI 不變，並加上 loading / error 狀態。
不要改動任何測試檔，完成後告訴我哪些檔案被修改。
```

> **不要把它當搜尋引擎用**
> 「請告訴我 react-query 怎麼用」會得到一篇文章，但不會改你的程式碼。
>
> Claude Code 的價值在於它能讀你的 repo、改你的檔案、跑你的測試。把它當成「願意幫你做事的工程同事」，每次對話都要包含明確的目標與邊界。

[reveal title="第一次對話最容易犯的錯誤"]
- 錯誤一：什麼都不說，直接丟一個需求 — AI 缺少專案背景，會憑空想像
- 錯誤二：一次給 10 個需求 — blast radius 太大，AI 很難同時做好每件事
- 錯誤三：沒有設定邊界 — AI 可能改到你不想動的測試檔或設定檔
- 正確做法：「背景 + 目標 + 邊界」三句話，讓 AI 像真正的同事一樣開工
[/reveal]

### 常用 Slash Commands

[tags]
- [blue] /help — 列出所有可用指令
- [blue] /clear — 清空當前對話的上下文
- [blue] /compact — 壓縮對話歷史以節省 context
- [blue] /model — 切換模型（Opus / Sonnet / Haiku）
- [blue] /cost — 查看本次對話累計 token 用量
[/tags]

[quiz type="single"]
Q: 安裝 Claude Code 後，第一次執行 `claude` 時會發生什麼事？
- [ ] 自動建立 CLAUDE.md 檔案
- [x] 引導完成 OAuth 授權或貼上 API Key
- [ ] 直接開始對話，不需要任何設定
Hint: 查看「安裝指令」段落的說明
[/quiz]

[quiz type="bool"]
Q: `/compact` 指令的用途是壓縮對話歷史以節省 context？
- [x] 是
- [ ] 否
Hint: 查看常用 Slash Commands 列表
[/quiz]

---

# 核心工作流：Plan、Edit、Verify
> 任何複雜任務都拆成三段：先規劃、再動手、最後驗證 — 這是把 Claude Code 從玩具變成生產力工具的關鍵

[steps-status]
- [todo] 初學者 | 只會下單一指令，沒有規劃與驗證
- [doing] 進階 | 會使用 Plan 模式，但 Edit 與 Verify 偶爾省略
- [done] 精通 | 每輪都嚴格遵循 Plan → Edit → Verify，自動驗證每步
[/steps-status]

## Plan 階段：先想清楚再動手

### 為什麼一定要 Plan？

- 大型重構若不規劃直接寫，AI 會在錯誤方向上跑得很遠
- Plan 階段讓你看到 AI 的「打算」，而不是看它的「結果」
- 走錯方向時，修正一份計畫遠比修正三十個檔案便宜

### 進入 Plan Mode

```prompt [label="顯式進入 Plan Mode"]
進入 plan mode：
我想把目前的 useState 表單改用 react-hook-form，
列出你計畫修改的檔案、變更摘要，以及測試該怎麼補。
不要動程式碼，先給我計畫。
```

[flow]
1. 描述目標 — 一段話說明要做什麼、為什麼要做
2. 要求列表 — 請 AI 列出計畫修改的檔案與順序
3. 標出風險 — 請它指出可能影響到的下游模組
4. 明確指示「先不要動程式碼」 — 避免它直接開幹
[/flow]

> **Plan 是給人看的，不是給 AI 看的**
> 計畫的真正價值在於「你能不能讀懂並挑出問題」。如果計畫看起來都對，但你看不懂某個步驟，那就是該追問的時候。
>
> 別假裝看懂後就 approve — 一旦 AI 開始動手，你損失的是後續每一步的審核機會。

[callout type="tip" title="Plan 模式的實用技巧"]
- 要求 AI 以條列式呈現，不要長篇大論
- 明確指出「不要動程式碼」，避免它直接開幹
- 如果計畫有風險，要求它標出「如果做錯，影響範圍多大」
- 對複雜任務，要求它先列出「需要讀哪些檔案才能開始規劃」
[/callout]

## Edit 階段：讓它一次只做一件事

### 控制 blast radius

[tags]
- [green] 一次一個 feature，不要同一輪改 5 個無關功能
- [green] 改完即驗證、即 commit；不要累積一大堆未驗證的變更
- [orange] 大型重構可分多輪：先改型別、再改實作、最後補測試
- [purple] 警訊：當 AI 說「順便也修了 X」，停下來檢查它做了什麼
[/tags]

```prompt [label="逐步推進的指令範例"]
按照剛才的計畫，先只改 src/forms/LoginForm.tsx，
改完先停，跑一次 npm run typecheck，
把錯誤訊息貼回來，我們再決定下一步。
```

## Verify 階段：證據比信任更重要

### 驗證的最小單位

[flow]
1. Type check — `tsc --noEmit` 或 `npm run typecheck`
2. Lint — `eslint .` 或 `npm run lint`
3. Test — `npm test` 或更窄的 `vitest run path/to/file`
4. 手動驗證 — 啟動 dev server，實際操作關鍵路徑
[/flow]

```prompt [label="把驗證寫進指令"]
完成後請執行：
1. npm run typecheck
2. npm test -- src/forms
3. 啟動 dev server（背景執行），告訴我 port 與要測試的路徑

每一步把輸出貼給我；任何一步失敗就停下來，不要自行修復。
```

> **永遠不要相信「應該可以了」**
> AI 很容易在沒跑測試的情況下宣稱完成。請把 verify 步驟明寫進每一輪指令，並要求看到輸出。
>
> 沒看到綠色的測試結果之前，沒有任何任務算完成。

[callout type="warning" title="常見錯誤：一次改太多"]
- 當 AI 在同一輪中改了 3 個以上的 feature，出錯機率會大幅增加
- 正確做法：每次只要求一個明確的變更，改完即 commit，再進行下一步
- 若發現 AI 開始「順便也修了 X」，立刻停下，逐一檢查每項變更
[/callout]

[quiz type="single"]
Q: 在 Plan 階段最重要的動作是什麼？
- [ ] 讓 AI 直接開始改程式碼以節省時間
- [ ] 提供盡可能長的背景說明，讓 AI 充分理解
- [x] 要求 AI 列出計畫、標出風險，並明確指示「先不要動程式碼」
- [ ] 讓 AI 自行決定最優的實作方式
Hint: Plan 的真正價值在於「你能不能讀懂並挑出問題」
[/quiz]

[quiz type="single"]
Q: Verify 階段應該驗證哪些項目？
- [x] Type check、Lint、Test、手動驗證關鍵路徑
- [ ] 只跑測試就足夠
- [ ] 只看 lint 結果即可
- [ ] 由 AI 自行決定驗證方式
Hint: 查看「驗證的最小單位」流程
[/quiz]

---

# 專案規範：CLAUDE.md、Permissions、Slash Commands
> AI 之所以失控，往往不是它不夠聰明，而是你沒告訴它規矩在哪裡

## CLAUDE.md：給 AI 看的專案說明書

### 它是什麼、放哪裡

- 放在 repo 根目錄，每次啟動 Claude Code 時自動載入
- 等同於「資深同事 onboarding 文件」，但讀者是 AI
- 也支援 `~/.claude/CLAUDE.md`（全域）與子目錄局部覆寫

### 一份合格的 CLAUDE.md 應該包含

[flow]
1. 專案概述 — 一段話講清楚這是什麼產品、技術棧
2. 建置指令 — install / dev / build / test 的標準命令
3. 程式碼規範 — 命名慣例、目錄結構、禁止 emoji 等專案紅線
4. 已知陷阱 — 常踩的坑、不要動的檔案、特殊 workaround
5. 提交規範 — commit message 格式、PR 模板、分支策略
[/flow]

```prompt [label="讓 AI 幫你寫第一版"]
請閱讀整個 repo，幫我草擬一份 CLAUDE.md，
內容包含：專案概述、建置指令、程式碼規範、已知陷阱、提交規範。
不確定的地方標 TODO 讓我補，不要瞎掰。
```

## Permissions：自動化與安全的平衡

### 三種權限模式

[compare-table headers="模式 | 說明 | 推薦場景"]
- **Ask** | 每個寫檔/執行都要確認 | 剛開始使用、高風險 repo
- Auto-allow | 對特定指令類別預先授權 | **日常開發（推薦）**
- Bypass | 完全不問，全自動執行 | 沙盒環境、CI/CD 流程
[/compare-table]

```prompt [label="在 .claude/settings.json 設定預授權"]
{
  "permissions": {
    "allow": [
      "Bash(npm test:*)",
      "Bash(npm run lint:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git push --force:*)"
    ]
  }
}
```

> **預授權只給「無副作用」的指令**
> 跑測試、看 git status、查 lint，這些再怎麼跑也不會壞東西。
>
> 但 `git push`、`rm`、`migrate down`、`prisma db push` 這類具破壞性或對外可見的指令，永遠保留人工確認 — 哪怕你今天信任它 100 次。

[reveal title="什麼樣的 auto-allow 規則最安全？"]
最安全的 auto-allow 規則遵循三個原則：
- **唯讀操作**：`git status`、`git diff`、`cat`、`ls` 永遠安全
- **可逆操作**：跑測試、lint、typecheck 即使跑壞了也可以重新執行
- **有明確 pattern**：用 `npm test:*` 比單純 `npm test:*` 更精確，避免意外匹配
[/reveal]

[accordion]
[item title="CLAUDE.md 應該放在哪裡？"]
推薦放在 repo 根目錄。也支援 `~/.claude/CLAUDE.md`（全域套用所有專案）與子目錄局部覆寫。
- 根目錄：團隊共用，commit 進 repo
- 全域：個人偏好，不 commit
- 子目錄：特定模組有特殊規範時
[/item]
[item title="Permissions 設定會影響團隊其他人嗎？"]
不會。`.claude/settings.json` 是個人本地設定，不會 commit 進 repo。但 CLAUDE.md、Slash Commands、Skills 可以 commit 共用。
[/item]
[item title="Slash Command 跟 Skill 應該同時存在嗎？"]
可以。Slash Command 適合「人類主動觸發的標準流程」，Skill 適合「AI 自行判斷該用哪套專業知識」。兩者互補而非互斥。
[/item]
[/accordion]

## Slash Commands：把重複指令變成快捷鍵

### 自訂專案 Slash Command

```prompt [label=".claude/commands/review.md"]
---
description: 對當前 branch 的變更做一次 code review
---

請依以下步驟對當前 branch 的變更進行 review：
1. 跑 git diff main...HEAD，列出所有變更檔案
2. 對每個檔案分析：可讀性、潛在 bug、測試覆蓋
3. 用 markdown 表格輸出建議（檔案 / 問題 / 嚴重性 / 建議修法）
4. 不要動任何程式碼
```

[flow]
1. 在 `.claude/commands/` 新增 `.md` 檔，檔名即指令名
2. 用 frontmatter 寫 `description`，會出現在 `/help`
3. 在對話輸入 `/review` 即觸發
4. 團隊共用 — 把 `.claude/commands/` commit 進 repo
[/flow]

[quiz type="single"]
Q: CLAUDE.md 的主要用途是什麼？
- [ ] 讓 Claude Code 的 UI 變得更漂亮
- [ ] 設定 API Key 和認證資訊
- [x] 提供專案規範給 AI 讀取，等同 onboarding 文件
- [ ] 作為 Git 的 .gitignore 替代品
Hint: 查看「它是什麼、放哪裡」段落
[/quiz]

[quiz type="bool"]
Q: `.claude/settings.json` 的 permissions 設定應該 commit 進 repo 讓團隊共用？
- [ ] 是
- [x] 否
Hint: permissions 是個人本地設定
[/quiz]

---

# Skills 與 Subagents：複用專業知識
> 當你發現自己一直貼同一段 prompt — 那就是該寫成 Skill 的時候

## Skills：可重複的專業知識

### Skill 與 Slash Command 的差別

[compare label-left="Slash Command（/foo）" label-right="Skill"]
- 由人主動觸發 | AI 自行判斷何時使用
- 一次性指令，執行完就結束 | 帶入長期領域知識，影響整段對話
- 適合「跑這套流程」 | 適合「在這類情境下要這樣思考」
- 寫法簡單，一份 markdown | 結構化：name / description / 工具白名單
[/compare]

### Skill 的最小結構

```prompt [label=".claude/skills/git-smart-commit/SKILL.md"]
---
name: git-smart-commit
description: 當使用者要建立 commit 時觸發，分析變更並拆成多個語意清晰的 commit
---

# Git Smart Commit

當使用者要 commit 時，依下列流程進行：

1. 跑 git status 與 git diff，列出所有變更
2. 依「邏輯關聯」分組：相同功能的改動放一起
3. 為每組產生 commit message：第一行 type(scope): subject，
   空行後 bullet 詳述 why
4. 依組逐一 git add 與 git commit，每次 commit 後 git status 確認
5. 所有變更處理完才回報結果
```

> **好 Skill 的判斷標準**
> 如果某個工作流你已經對 AI 解釋過 3 次以上，且每次解釋都長得很像 — 它就是 Skill。
>
> Skill 的價值不是「省字」，而是讓你的團隊每個人、每台機器、每次對話，都使用同一份標準作業流程。離職的人留下的不只是程式碼，更是制度化的工程習慣。

[callout type="tip" title="Skill 設計的黃金法則"]
- **一個 Skill 只做一件事**：不要把 git workflow、PR review、deploy 全塞進同一個 Skill
- **明確的觸發條件**：description 要寫清楚「什麼時候該用這個 Skill」
- **工具白名單**：在 SKILL.md 中列出允許使用的工具，避免 Skill 執行危險操作
- **版本控制**：把 `.agents/skills/` commit 進 repo，團隊共用同一份定義
[/callout]

[bonus title="延伸閱讀：如何測試你的 Skill？"]
Skill 寫好後，務必做以下測試：
- 在新專案中第一次觸發，觀察 AI 是否正確判斷
- 檢查 Skill 是否使用了未授權的工具
- 測試邊界情境：當條件不明確時，AI 是否仍然觸發
- 請團隊成員試用，收集反饋並調整 description
[/bonus]

## Subagents：把長任務丟給隔離脈絡

### 為什麼要用 Subagent？

[tags]
- [green] 隔離 context：探索任務不會污染主對話
- [green] 並行加速：多個獨立任務可同時跑
- [orange] 適用場景：codebase 探索、跨多檔案分析、長時間搜索
- [purple] 不適用：需要持續互動、依賴主線決策的任務
[/tags]

### 呼叫 Subagent 的時機

[flow]
1. 任務獨立 — 不需要主對話的中途介入
2. 內容龐雜 — 結果若全進主對話會撐爆 context
3. 可平行 — 同時派發 2 個以上探索任務
4. 結果可彙整 — 子代理回傳精煉摘要，主對話據此決策
[/flow]

```prompt [label="顯式委派給 Subagent"]
派出 explore subagent：
找出整個 repo 中所有使用 useEffect 處理 data fetching 的地方，
回報檔案、行號、用途分類，最多 30 筆。
你（主對話）不需要讀檔，等子代理結果就好。
```

[quiz type="single"]
Q: 什麼時候應該使用 Subagent？
- [ ] 需要跟使用者持續互動的對話任務
- [x] 獨立的探索任務，結果可平行執行
- [ ] 修改單一檔案的簡單任務
- [ ] 需要即時決策的任務
Hint: 查看「呼叫 Subagent 的時機」流程
[/quiz]

[quiz type="bool"]
Q: Subagent 的探索任務會污染主對話的 context？
- [ ] 是
- [x] 否
Hint: Subagent 的核心價值就是「隔離 context」
[/quiz]

---

# 自動化整合：Hooks、MCP、Git Worktree
> 真正的精通者，是讓工具自己呼叫工具

## Hooks：在事件發生時自動觸發

### Hook 的觸發點

[flow]
1. PreToolUse — 工具執行前，可阻擋或改寫
2. PostToolUse — 工具執行後，可做後處理（例如自動 lint）
3. UserPromptSubmit — 使用者送出指令時，可注入額外脈絡
4. SessionStart / SessionEnd — 啟動或結束時觸發
[/flow]

```prompt [label=".claude/settings.json — 自動 format"]
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "npm run format -- --write $FILE" }
        ]
      }
    ]
  }
}
```

> **Hook 的設計原則：能補做就不要補罵**
> 與其設一個 hook 在 AI 寫錯時噴錯誤訊息，不如直接讓 hook 幫它修好。
>
> 例如：每次 Write/Edit 後自動跑 prettier、自動補 license header、自動執行 typecheck。AI 能透過 hook 結果學習你的規範，下次產出就會更接近期望。

[callout type="warning" title="Hook 的潛在風險"]
- 無限循環：PostToolUse hook 觸發 Edit，Edit 又觸發 PostToolUse
- 效能影響：每個 hook 都會增加執行時間，避免設定過多 hook
- 除錯困難：hook 是隱式執行，新成員可能不知道某些行為是自動的
- 建議：每新增一個 hook，都要寫清楚「這個 hook 做了什麼」的註解
[/callout]

## MCP：把外部工具接進對話

### MCP（Model Context Protocol）是什麼

- 一個讓外部資源（資料庫、API、文件系統）成為 AI 工具的標準協議
- AI 可直接查 PostgreSQL、讀 Notion、操作 Linear，無需切換介面
- 設定在 `.claude/settings.json` 的 `mcpServers` 區塊

```prompt [label="加入 PostgreSQL MCP server"]
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres",
               "postgresql://localhost/mydb"]
    }
  }
}
```

### MCP 適合接什麼

[tags]
- [green] 唯讀查詢：DB schema、Sentry 錯誤、Linear ticket
- [green] 結構化操作：建立 PR、新增 issue、發布 release
- [orange] 需要嚴格權限：付款 API、deploy 流程
- [purple] 不建議：高頻寫入操作（成本與風險都高）
[/tags]

[timeline]
- 第一階段 | 手動操作 | 每次都要人輸入指令，最容易出錯
- 第二階段 | Slash Commands | 團隊共用標準流程，降低人為差異
- 第三階段 | Hooks 自動化 | 工具自己呼叫工具，減少重複確認
- 第四階段 | MCP 整合 | 連外部資源都成為 AI 可直接操作的工具
- 第五階段 | 完全自動化 | 從需求到部署，AI 全程自主執行，人只做審核
[/timeline]

## Git Worktree：多任務並行的關鍵

### 為什麼要用 Worktree？

- 一個 repo、多個分支同時 checkout 在不同目錄
- 每個 worktree 獨立的 node_modules、dev server、AI 對話
- 切換任務不需 stash，也不會弄髒當前進度

```prompt [label="建立 worktree"]
git worktree add ../myapp-feature-x feature/x
cd ../myapp-feature-x
npm install
claude
```

[flow]
1. 主分支保留在原目錄繼續 hotfix
2. 新功能在另一個 worktree 開發，跑獨立 dev server
3. 多個 Claude Code 視窗同時跑，互不干擾
4. 完成後合併回主分支，刪除 worktree
[/flow]

[quiz type="single"]
Q: MCP 最適合接入哪種外部資源？
- [ ] 高頻寫入操作的資料庫
- [x] 唯讀查詢（如 DB schema、錯誤日誌）
- [ ] 需要人類審核的 deploy 流程
- [ ] 即時通訊訊息傳送
Hint: 查看「MCP 適合接什麼」標籤
[/quiz]

[quiz type="bool"]
Q: Git Worktree 可以讓同一個 repo 的多個分支同時開發而不互相干擾？
- [x] 是
- [ ] 否
Hint: 每個 worktree 有獨立的 node_modules、dev server 和 AI 對話
[/quiz]

---

# 精通心法：迭代、Debug 與團隊協作
> 工具會更新，心法不會 — 把這些原則內化，未來換什麼 AI 都能上手

## 系統化 Debugging

### 不要讓 AI 亂猜，給它證據

[steps-status]
- [todo] 猜錯型 | 直接叫 AI 修 bug，不提供任何脈絡
- [doing] 證據型 | 提供 stack trace 和重現步驟，等 AI 分析後驗證
- [done] 系統型 | 先用 git bisect 定位 commit，再蒐集證據、提出假設、逐一驗證
[/steps-status]

[flow]
1. 重現 — 先有穩定的重現步驟，再開始修
2. 縮範圍 — 用 git bisect、二分法定位引入問題的 commit
3. 觀察 — 蒐集 log、stack trace、實際輸入輸出
4. 假設 — 提出至少 2 個可能原因
5. 驗證 — 用最小變更驗證假設，禁止「修了再說」
[/flow]

```prompt [label="正確的 debug 提問"]
這個錯誤的重現步驟：
1. npm run dev
2. 訪問 /users，點第一筆
3. console 出現：TypeError: Cannot read properties of undefined (reading 'name')
   stack 指向 src/pages/UserDetail.tsx:42

請列出至少 2 個可能原因，並各自設計一個最小驗證方法。
不要直接改程式碼。
```

> **bug 修不好的真正原因：上一個 bug 沒修對**
> 急著「讓它過」最後會堆出無法維護的補丁。每次修 bug 都要問：root cause 是什麼？這個修法會不會讓另一個地方壞掉？
>
> AI 很擅長丟出看似合理的修法，但它不會替你思考「這個修法的代價」。這正是工程師存在的價值。

## 團隊協作：把 AI 變成共同語言

### 規範化的工程資產

- [x] CLAUDE.md：每位團隊成員第一天就讀的規範
- [x] `.claude/commands/`：團隊共用的標準工作流
- [x] `.claude/skills/`：可重複的領域知識（commit、PR、review）
- [x] `.claude/settings.json`：權限、hooks、MCP 設定
- [x] PR 模板：要求 AI 產出符合團隊格式的描述
- [x] code review checklist：把人類審核重點明文化

### Onboarding 新人的新方式

[compare label-left="傳統 Onboarding" label-right="AI 時代 Onboarding"]
- 新人讀 README，常常過時 | CLAUDE.md 持續更新，AI 跟人共用
- 學長帶人，依賴口傳 | Skills 把工作流標準化、可複現
- 半年才上手核心模組 | 用 Claude Code 邊做邊問，第一週就能 PR
- 離職造成知識斷層 | 規範與 Skill 留在 repo，不依賴單一個人
[/compare]

[accordion]
[item title="團隊導入 Claude Code 的推薦起步方式？"]
建議從以下三步驟開始：
- 先寫好 CLAUDE.md，讓 AI 和新人有共同的 onboarding 文件
- 建立 1-2 個最常用的 Slash Command（如 `/review`），讓大家有統一體驗
- 設定合理的 auto-allow 規則，降低日常摩擦
[/item]
[item title="如何說服團隊成員使用 Claude Code？"]
最好的方式是讓它幫團隊「做一件真正痛的事情」：
- 找出大家每天都抱怨的重複工作（如 commit message、PR description）
- 寫成 Skill 或 Slash Command，讓大家第一次就感受到價值
- 讓價值自己說話，比任何 push 都有效
[/item]
[item title="Claude Code 會不會取代工程師？"]
不會。它取代的是「打字」這個動作，但取代不了「設計規格」、「驗證結果」、「做商業判斷」這些工程師的核心能力。
- 真正危險的是「只會打字、不會思考」的開發者
- 有價值的反而是「能用 AI 交付更多、更好產品」的人
[/item]
[/accordion]

> **真正的精通：讓你的工作可以被別人接手**
> 工具的終點不是個人英雄主義，而是團隊韌性。當你的工作流被寫進 CLAUDE.md、Skill、Hook、Slash Command — 任何一位同事（或未來的你）都能無痛接手。
>
> Claude Code 最終要解決的不是「我寫得多快」，而是「我們團隊能多有韌性地交付產品」。

[quiz type="single"]
Q: 系統化 Debug 的第一步應該是什麼？
- [x] 建立穩定的重現步驟
- [ ] 直接開始看程式碼找 bug
- [ ] 叫 AI 立刻修好
- [ ] 先用 git push 把變更推上遠端
Hint: 查看系統化 Debug 的流程，第一步是「重現」
[/quiz]

[quiz type="bool"]
Q: 當 AI 提出 bug 的可能原因時，應該要求它至少列出 2 個以上假設？
- [x] 是
- [ ] 否
Hint: 好的 debug 實踐是提出多個假設再逐一驗證
[/quiz]

---

---

# 總結

[summary]
- **心智模型 — 代理型工具** | Claude Code 不是補完，是會讀檔、寫檔、跑指令的工程同事；你的工作從打字轉為設計規格與審核
- **核心工作流 — Plan / Edit / Verify** | 任何複雜任務都先規劃、再動手、最後驗證；沒看到綠色測試前不算完成
- **規範化 — CLAUDE.md 與 Permissions** | 用 CLAUDE.md 對齊團隊認知，用 Permissions 控制風險，用 Slash Commands 沉澱重複工作
- **能力擴展 — Skills 與 Subagents** | 把講過 3 次的流程寫成 Skill，把獨立的長任務交給 Subagent，主對話只做決策
- **自動化整合 — Hooks / MCP / Worktree** | Hook 自動補做、MCP 接外部資源、Worktree 並行多任務，工具自己呼叫工具
- **精通心法 — 系統化 Debug 與團隊協作** | 不讓 AI 亂猜，永遠基於證據；把工作流變成團隊資產，工具更新心法不變
[/summary]
