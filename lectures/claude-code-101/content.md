# 入門認識：Claude Code 與 AI Agent
> 在動手之前，先搞清楚「Claude Code 到底是什麼」，以及為什麼它和你以前用過的 AI 工具根本不一樣。

## 今天要學什麼

### 這堂課的四個主題

- 認識 AI Agent 的概念：它和你用過的 AI 有什麼根本差異
- 安裝並啟動 Claude Code：從零開始，動手第一次操作
- cc-switch 切換模型：根據任務選擇對的 AI 大腦
- Cowork 協作心法：讓 AI 真的幫上忙，而不是越用越亂

[vote id="v-aiuse" title="你目前最常用 AI 的方式是什麼？"]
- 用 ChatGPT 或 Claude 網頁版對話
- 還沒有固定在用任何 AI 工具
- 有時用 AI 幫忙寫信或改文章
- 其他
[/vote]

## Claude Code 是什麼

### 同樣叫「Claude」，但完全不同的東西

你可能已經用過 Claude.ai 網頁版，但 Claude Code 是完全不同的工具。

[compare label-left="Claude.ai 網頁版" label-right="Claude Code（本課主角）"]
- 你說，它回答 | 你說，它動手做
- 回覆是文字 | 回覆是行動（建立檔案、執行指令）
- 每次對話各自獨立 | 看得到你整個專案的脈絡
- 不知道你電腦裡有什麼 | 直接在你的終端機裡工作
[/compare]

> **Claude Code 是在你電腦裡工作的 AI 助理**
> 它不只是回答問題，而是真的幫你開檔案、寫程式、整理資料。
> 把 Claude.ai 想成「顧問」（你問，他答），Claude Code 則是「工讀生」（你指派任務，他去做）。

## 什麼是 AI Agent

### 「Agent」這個詞的真正意思

你可能常聽到「AI Agent」這個詞，但它到底是什麼？

- 一般 AI 聊天：你問 → 它答，一問一答，沒有後續動作
- AI Agent：你給任務 → 它規劃步驟 → 自己執行 → 回報結果

Agent 的核心特性是「採取行動」，不只是「生成文字」。

[flow]
1. 你下指令 — 用自然語言描述你想達到的目標
2. Agent 分析 — 理解任務，拆解需要做的步驟
3. Agent 執行 — 呼叫工具（讀取檔案、寫入檔案、執行指令）
4. Agent 回報 — 告知執行結果，等待你的下一個指令
[/flow]

> **Agent 不是魔法，是工具的組合**
> Claude Code 能做到的每一件事，都是透過「讀取檔案」「寫入檔案」「執行終端機指令」這幾個基本動作組合出來的。
> 搞清楚這件事，你就不會對它有不切實際的期待，也能更精準地下指令。

### Agent 能做什麼，不能做什麼

[tags]
- [green] 能：按照指令新增、修改、讀取多個檔案
- [green] 能：在終端機執行指令並回報結果
- [green] 能：搜尋程式碼、找出問題並提出修正方案
- [orange] 有限：需要你先登入的操作（它不會幫你輸入密碼）
- [orange] 有限：需要截圖或用眼睛判斷的視覺任務
- [purple] 不做：主動對外傳送資料（除非你明確要求）
- [purple] 不做：你沒有要求的任何事
[/tags]

[quiz type="single"]
Q: 以下哪個描述最準確說明了 AI Agent 和一般 AI 聊天的差異？
- [ ] Agent 比較聰明，能回答更難的問題
- [x] Agent 能自己採取行動，不只是生成文字回應
- [ ] Agent 每次對話都會記得你是誰
- [ ] Agent 不需要你下指令，自動知道該做什麼
Hint: Agent 的核心特性是「採取行動」——能夠讀寫檔案、執行指令，而不只是產生文字。
[/quiz]

---

# 安裝上手：第一次啟動 Claude Code
> 工具再好，不動手不會有感覺。這個章節帶你完成安裝，並下你人生中第一個 Claude Code 指令。

## 安裝與設定

### 開始之前，確認你有這些東西

- [x] 電腦（Mac 或 Windows，本課示範以 Mac 為主）
- [x] Node.js v18 以上（免費，去 nodejs.org 下載）
- [x] Claude Pro 帳號（需要訂閱才能使用 Claude Code CLI）
- [x] 終端機（Mac 內建 Terminal，Windows 用 PowerShell）

[callout type="info" title="什麼是終端機？"]
終端機是一個可以用文字輸入指令的視窗，看起來像黑底白字的畫面。Mac 搜尋 "Terminal" 就能找到。不用害怕它，這堂課會教你需要知道的所有指令。
[/callout]

### 安裝步驟

[flow]
1. 確認 Node.js 已安裝 — 終端機輸入 `node --version`，看到版本號即可（需 v18+）
2. 安裝 Claude Code — 執行安裝指令（見下方程式碼區塊）
3. 啟動並登入 — 執行 `claude`，第一次會開啟瀏覽器引導你登入 Claude 帳號
4. 確認安裝成功 — 看到提示符號 `>` 就代表準備好了
[/flow]

```terminal [label="安裝指令（逐步執行）"]
# 步驟一：確認 Node.js 版本（需要 v18 以上）
node --version

# 步驟二：安裝 Claude Code
npm install -g @anthropic-ai/claude-code

# 步驟三：啟動，第一次會引導登入
claude
```

> **安裝遇到問題，99% 是 Node.js 版本太舊**
> 執行 `node --version` 如果看到 v16 或更舊，請先去 nodejs.org 下載最新版。
> 更新後重新執行安裝指令即可。

## 第一個指令

### 動手：從「建立一個檔案」開始

不用急著做複雜的事。第一個指令只有一個目標：確認它在動，並感受「它真的去做了」的感覺。

在一個練習用的資料夾裡啟動 Claude Code 後，試試這個指令：

```prompt [label="你的第一個 Claude Code 指令"]
幫我在這個資料夾建立一個 hello.txt 檔案，
裡面寫「我學會使用 Claude Code 了」。
```

### 觀察它的工作方式

- 它會先「告訴你它打算做什麼」，然後等你確認
- 你按 Enter 或輸入 `y` 確認後，它才會真正執行
- 執行完會告訴你結果，然後等待你的下一個指令

[callout type="tip" title="不用怕下錯指令"]
Claude Code 在執行「可能有影響」的操作前都會先確認。你有機會說不。一開始大膽試，看到它做的事再決定要不要繼續。
[/callout]

### 練習：建立你的第一個練習資料夾

[flow]
1. 在桌面建立練習用資料夾 — 終端機執行 `mkdir ~/Desktop/cc-practice`
2. 切換到該資料夾 — 執行 `cd ~/Desktop/cc-practice`
3. 啟動 Claude Code — 執行 `claude`
4. 下第一個指令 — 「幫我建立一個 README.md，說明這是我的 Claude Code 練習資料夾」
5. 確認結果 — 執行 `ls` 或打開 Finder，看看檔案是否真的出現了
[/flow]

---

# cc-switch：管理你的 API 提供商
> Claude Code 需要透過「API 提供商」連接到 Claude 的 AI 能力。cc-switch 是一個桌面應用程式，讓你用視覺化介面輕鬆切換不同提供商，還能統一管理多個 AI 工具的設定。

## 什麼是 API 提供商

### 先搞懂這個概念

> **類比：API 提供商就像電信業者**
> Claude Code 要連接到 Claude 的 AI 大腦，就像你的手機要連上網路一樣，需要一個「服務提供商」。
> 預設是 Anthropic 官方直連（等於用官方門號）；有些人選用第三方 relay 服務，通常費用較低或在特定地區速度較快。

### 什麼情況會需要切換

[tags]
- [blue] 繼續用官方：剛入門、最簡單，Claude Pro 帳號直接登入就能用
- [green] 第三方 relay：想節省費用、或官方直連在你所在地區較慢
- [orange] 多帳號管理：工作帳號與個人帳號分開，cc-switch 統一切換
[/tags]

## cc-switch 是什麼

### 一個桌面 GUI 應用程式

cc-switch 是有視覺介面的桌面程式，**不是終端機指令**，也不透過 npm 安裝。

- 支援 7 種 AI 工具：Claude Code、Claude Desktop、Codex、Gemini CLI、OpenCode、OpenClaw、Hermes
- 內建 50+ 提供商預設，貼上 API Key 後一鍵切換，不用手動改設定檔
- 系統列圖示：不用開啟主視窗，直接從右上角選單切換
- 同時管理 MCP 伺服器、Skills、使用量追蹤、對話記錄

> **cc-switch 管的是「API 提供商」，不是 Claude 模型**
> 切換 Haiku / Sonnet / Opus 這些模型是 Claude Code 的內建功能，用 `/model` 指令操作（下方會說明）。
> cc-switch 管的是「誰來提供這個服務」，兩件事是分開的。

## 安裝與基本使用

### 下載安裝

[flow]
1. 前往官網 ccswitch.io 或 GitHub Releases 頁面下載
2. 安裝 — Mac 使用 `.dmg`，Windows 使用 `.msi`，macOS 已代碼簽名可直接安裝
3. 第一次啟動 — 自動匯入現有的 Claude Code 設定，不影響目前使用
4. 新增提供商 — 點「Add Provider」，從預設清單選擇，貼上 API Key 後儲存
5. 切換生效 — 點選提供商後按「Enable」，Claude Code 不需要重啟即可生效
[/flow]

### cc-switch 的主要功能一覽

[compare label-left="沒有 cc-switch" label-right="使用 cc-switch"]
- 切換提供商要手動編輯 JSON 設定檔 | GUI 介面點一下，自動寫入設定
- 每個 AI 工具設定分散在不同地方 | 7 種工具統一在一個 App 管理
- 不知道用了多少 token、花了多少錢 | 內建用量儀表板，費用一目了然
- Skills 和 MCP 要手動安裝設定 | 一鍵從 GitHub 安裝，自動同步到各工具
[/compare]

## 切換 Claude 模型（Claude Code 內建功能）

### /model 指令：選擇 Haiku / Sonnet / Opus

這個功能和 cc-switch 無關，是 Claude Code 自帶的，在對話中直接使用。

[compare-table headers="Haiku | **Sonnet** | Opus"]
- 速度 | 最快 | 快 | 較慢
- 能力 | 基礎任務 | 均衡，適合日常 | 最強推理
- 費用 | 最省 | 中等 | 最高
- 適合場景 | 簡單問答、大量重複任務 | 大多數工作（預設） | 複雜決策、深度分析
[/compare-table]

```terminal [label="在 Claude Code 中切換模型"]
# 方法一：在 Claude Code 對話中輸入
/model

# 方法二：啟動時直接指定模型
claude --model claude-haiku-4-5-20251001
```

[dl]
- claude-opus-4-8 | 旗艦模型，最強推理能力，適合複雜任務與重要決策
- claude-sonnet-4-6 | 預設模型，速度與能力均衡，適合日常使用的首選
- claude-haiku-4-5-20251001 | 最快最省，適合簡單重複任務與大量處理
[/dl]

### 動手練習：切換到 Haiku 感受速度差異

[flow]
1. 啟動 Claude Code — 在任意資料夾執行 `claude`
2. 切換到 Haiku — 在提示符輸入 `/model`，用方向鍵選擇 `claude-haiku-4-5-20251001`
3. 下一個簡單指令 — 「用一句話解釋 AI Agent 是什麼」
4. 感受速度差異後切回 Sonnet — 再次輸入 `/model`，選回 `claude-sonnet-4-6`
[/flow]

[callout type="tip" title="剛入門先用 Sonnet 就好"]
預設的 Sonnet 適合 80% 的使用場景。等熟悉了 Claude Code 之後，再根據任務類型考慮切換模型或提供商。
[/callout]

[quiz type="single"]
Q: 以下哪個描述正確說明了 cc-switch 的用途？
- [ ] 在 Claude Code 對話中切換 Haiku / Sonnet / Opus 模型
- [ ] 透過 npm 安裝的 CLI 工具，用指令切換模型
- [x] 桌面應用程式，用 GUI 管理 Claude Code 等工具的 API 提供商
- [ ] Anthropic 官方提供的帳號管理工具
Hint: cc-switch 是桌面 GUI 應用，管理的是「API 提供商」（誰來提供服務），不是 Haiku/Sonnet/Opus 這些模型。切換模型請用 Claude Code 的 /model 指令。
[/quiz]

---

# Claude Cowork：讓 AI 在你的電腦上自主工作
> Claude Cowork 是 Anthropic 推出的桌面 AI 產品，和 Claude Code 不同——它不需要你會寫程式，而是讓 AI 直接在你的電腦上操作本地檔案與應用程式，自主完成整個任務，交回成果給你。

## Cowork 是什麼

### 從「對話」到「委派任務」

你已經認識了 Claude Code，它讓工程師用 AI 寫程式。Cowork 解決的是另一個問題：**知識工作者的日常文件工作**。

[compare label-left="Claude.ai 網頁版" label-right="Claude Cowork"]
- 你說，它回答 | 你給目標，它自主完成整個任務
- 每次對話結束就消失 | 交回一個完成的成果給你
- 不能碰你的本地檔案 | 直接操作你電腦裡的檔案與應用程式
- 適合問問題、改文字 | 適合多步驟、需要整合多個來源的工作
[/compare]

> **Cowork 的核心概念：委派，而不是對話**
> 你不需要一步一步告訴它怎麼做，只需要說清楚「你要什麼結果」。
> 它會自己規劃步驟、操作你的電腦、整合需要的資料，最後交回成品。

### Cowork 設計給誰用

[tags]
- [blue] 研究人員：跨多份文件彙整資料、整理研究摘要
- [blue] 分析師：從非結構化報告中提取數據、整理成表格
- [blue] 法務財務：讀取合約與報告，輸出結構化的摘要
- [blue] 一般辦公室工作者：整理資料夾、準備簡報素材、組織文件
- [orange] 不需要：寫程式、處理程式碼相關任務（那是 Claude Code 的範疇）
[/tags]

## Cowork 能做什麼

### 四類典型工作流程

[flow]
1. 本地文件整理 — 重新命名、排序、去重、依條件篩選資料夾內容
2. 從來源文件準備草稿 — 整合多份源材料，生成結構化文件草稿
3. 跨來源研究綜合 — 從多個文件識別相關資訊並彙整摘要
4. 從非結構化文件提取數據 — 讀取合約、報告等，輸出結構化格式
[/flow]

```prompt [label="給 Cowork 的任務範例"]
幫我整理桌面上的「2024 財報」資料夾：
把所有 PDF 按季度重新命名（格式：2024Q1_報告名稱），
並建立一份 summary.txt，列出每份文件的主要數字。
```

> **給目標，不給步驟**
> Cowork 的指令設計和 Claude Code 不同——你不需要描述每個步驟，
> 只要說清楚「你想要的最終結果是什麼」，它會自行規劃和執行。

## 如何使用 Cowork

### 取得方式

[flow]
1. 確認你有 Claude 付費方案 — Cowork 適用於所有付費訂閱（Pro、Team、Enterprise）
2. 下載 Claude 桌面應用程式 — 從 claude.ai 下載 Mac 或 Windows 版本
3. 開啟 Cowork 模式 — 在 Claude Desktop 中選擇 Cowork
4. 給任務 — 描述你要達到的目標，Cowork 開始自主執行
5. 確認成果 — 它完成後交回結果，你審閱並決定是否接受
[/flow]

[callout type="info" title="人類始終保有最終決定權"]
Cowork 在執行重要操作前會確認，設計上確保你對關鍵決策保有控制權。
你可以隨時停止任務，也可以在它完成後選擇不接受結果。
[/callout]

### Claude Code vs Claude Cowork：選哪個

[compare label-left="Claude Code" label-right="Claude Cowork"]
- 在終端機操作，需要指令 | 桌面 App，視覺化操作
- 適合工程師、處理程式碼 | 適合知識工作者、處理文件資料
- 你主導每個步驟 | 你給目標，AI 自主規劃步驟
- 安裝在終端機，隨 claude 指令啟動 | 安裝在 Claude Desktop，選擇 Cowork 模式
[/compare]

### 今天可以馬上試的任務

- [x] 整理一個有很多散亂檔案的資料夾，讓它按規則重新命名
- [x] 給它三份不同的文件，請它整合出一份摘要報告
- [x] 請它從一份 PDF 合約中，提取所有涉及金額的條款

> **Cowork 最適合那些「你知道要什麼結果，但不想親自一步步做」的工作**
> 文件整理、資料彙整、跨來源研究——這些花時間但不需要創意的工作，正是 Cowork 的強項。

---

# 總結：你的 Claude Code 入門地圖

[summary]
- **AI Agent 是什麼** | 能自己採取行動的 AI，透過讀寫檔案與執行指令完成任務，不只是回答問題
- **安裝與啟動** | npm 安裝後執行 `claude` 啟動，第一次登入 Claude 帳號完成授權，看到提示符即完成
- **cc-switch 管理提供商** | 桌面 GUI App，管理 Claude Code 等 7 種工具的 API 提供商；切換 Haiku/Sonnet/Opus 模型則用 `/model` 指令
- **Claude Cowork** | Anthropic 桌面產品，給目標讓 AI 自主完成整個任務，適合知識工作者整理文件、彙整研究、提取數據
[/summary]
