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

### 常用 Slash Commands

[tags]
- [blue] /help — 列出所有可用指令
- [blue] /clear — 清空當前對話的上下文
- [blue] /compact — 壓縮對話歷史以節省 context
- [blue] /model — 切換模型（Opus / Sonnet / Haiku）
- [blue] /cost — 查看本次對話累計 token 用量
[/tags]

---

# 核心工作流：Plan、Edit、Verify
> 任何複雜任務都拆成三段：先規劃、再動手、最後驗證 — 這是把 Claude Code 從玩具變成生產力工具的關鍵

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

[tags]
- [green] Ask — 每個寫檔/執行指令都要你按 yes（最安全，最慢）
- [orange] Auto-allow rules — 對特定指令類別預先授權（推薦）
- [purple] Bypass — 完全不問，全自動（只在沙盒環境使用）
[/tags]

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

---

# 精通心法：迭代、Debug 與團隊協作
> 工具會更新，心法不會 — 把這些原則內化，未來換什麼 AI 都能上手

## 系統化 Debugging

### 不要讓 AI 亂猜，給它證據

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

> **真正的精通：讓你的工作可以被別人接手**
> 工具的終點不是個人英雄主義，而是團隊韌性。當你的工作流被寫進 CLAUDE.md、Skill、Hook、Slash Command — 任何一位同事（或未來的你）都能無痛接手。
>
> Claude Code 最終要解決的不是「我寫得多快」，而是「我們團隊能多有韌性地交付產品」。

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
