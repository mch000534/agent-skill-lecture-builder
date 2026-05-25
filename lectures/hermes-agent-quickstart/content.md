# 認識 Hermes Agent：開源 AI Agent 框架
> Hermes Agent 不只是另一個聊天機器人 — 它是一個具備持久記憶、自主學習、跨平台運作的 AI Agent 框架，讓 AI 真正成為你的長期協作夥伴

## 為什麼需要 AI Agent？

### 從聊天到行動的跨越

[compare label-left="聊天型 AI（ChatGPT 思維）" label-right="代理型 AI（Hermes 思維）"]
- 只能回答問題 | 能讀檔、寫檔、執行指令、管理流程
- 每次對話從零開始 | 跨對話記憶你的偏好與環境
- 限於單一介面 | 同一個 Agent 跑在終端機、Telegram、Discord 等十多個平台
- 你需要複製貼上結果 | Agent 直接操作你的系統完成任務
- 所有能力固定 | 透過 Skills 持續累積領域知識，越用越強
[/compare]

[callout type="tip" title="核心觀點"]
Agent 的核心差異：從「問答」到「行動」
- 聊天型 AI 只能告訴你怎麼做
- Agent 型 AI 會直接幫你做
- Hermes 會記住你上次做了什麼、你偏好什麼工具、你的專案結構長怎樣 — 這讓它不是一次性的助手，而是持續進化的協作者
[/callout]

[quiz type="single"]
Q: Hermes Agent 與一般聊天型 AI 最大的差異是什麼？
- [ ] 支援更多種語言
- [x] 具備持久記憶、能自主執行工具、跨平台運作
- [ ] 回答速度更快
- [ ] 完全免費開源
Hint: 從「被動回答」vs「主動行動」的角度思考
[/quiz]

### Hermes Agent 的核心特色

[tags]
- [green] 自我學習 — 透過 Skills 系統，把解決問題的經驗保存為可重複使用的技能
- [green] 持久記憶 — 跨對話記住你是誰、你的偏好、環境細節與經驗教訓
- [green] 多平台 Gateway — 同一個 Agent 同時跑在 Telegram、Discord、Slack、WhatsApp 等 15+ 平台
- [blue] 模型無關 — 支援 20+ LLM Provider，隨時切換模型不影響工作流
- [blue] Profile 隔離 — 多個獨立 Hermes 實例，各自擁有獨立的設定、記憶與技能
- [purple] 完全開源 — 由 Nous Research 開發，社群驅動
[/tags]

## 課程地圖

### 快速入門路徑

[steps-status]
- [done] 第 2 章 — 安裝、設定與第一次對話
- [doing] 第 3 章 — CLI 核心操作與 Slash Commands
- [todo] 第 4 章 — Skills 技能系統與 Memory 記憶
- [todo] 第 5 章 — Gateway 多平台連接
- [todo] 第 6 章 — 進階能力：Subagent、Cron、Profile
[/steps-status]

### 你會學到什麼

[flow]
1. 安裝與設定 — 完成環境建置，與 Agent 進行第一次對話
2. CLI 核心操作 — 掌握日常操作中最常用的指令與 Slash Commands
3. Skills 與 Memory — 讓 Agent 透過技能與記憶的累積越用越強
4. Gateway 多平台 — 把 Agent 接到 Telegram、Discord 等日常通訊工具
5. 進階能力 — Subagent 平行委派、Cron 排程、Profile 隔離、MCP 工具擴充
[/flow]

> **本章為背景鋪陳**
> 接下來的章節會一步步帶你從安裝到實戰，每個概念都搭配實際指令操作。

---

# 安裝與設定：讓 Hermes 跑起來
> 三步驟完成安裝，理解設定系統的兩層架構，開始你的第一次 Agent 對話

## 安裝

### 系統需求與安裝指令

[callout type="warning" title="系統需求"]
- 支援 macOS / Linux / Windows（WSL）
- 需要 Python 3.10 以上版本
- 建議預留至少 500MB 磁碟空間（虛擬環境 + 依賴套件）
[/callout]

```prompt [label="一鍵安裝"]
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

```prompt [label="驗證安裝"]
hermes --version
```

- 安裝腳本會自動建立虛擬環境、安裝依賴、設定 shell completions
- 如需手動安裝，可 clone repo 後執行 `pip install -e .`

### 互動式設定精靈

```prompt [label="啟動設定精靈"]
hermes setup
```

[flow]
1. 選擇模型 — 從 20+ Provider 中挑選（推薦 OpenRouter 作為起點）
2. 輸入 API Key — 設定會寫入 ~/.hermes/.env，不會進入版控
3. 啟用工具 — 選擇你需要的 Toolset（web、terminal、file 等）
4. 完成設定 — 自動產生 ~/.hermes/config.yaml

[reveal title="第一次設定推薦的 Provider 是什麼？"]
推薦使用 **OpenRouter** 作為起點：
- 一個 API Key 即可存取數百種模型，不需分別註冊
- 提供免費額度，適合初次探索
- 後續想切換到特定 Provider（如 Anthropic、Google）時隨時可改
[/reveal]
[/flow]

> **設定精靈不是唯一方式**
> 你也可以直接編輯 `~/.hermes/config.yaml` 和 `~/.hermes/.env`。但第一次建議用 `hermes setup`，它會確保所有必要欄位都填好。

## 設定系統

### 兩層式架構

[compare label-left="~/.hermes/config.yaml" label-right="~/.hermes/.env"]
- 主要設定檔，YAML 格式 | 存放 API Key 與密碼
- 包含模型、工具、顯示等偏好 | 不會被版控追蹤
- 可用 hermes config edit 編輯 | 用 hermes config env-path 查看路徑
- 支援 hermes config set KEY VAL 快速修改 | Provider 的 API Key 都放這裡
[/compare]

[callout type="info" title="為什麼分開存放？"]
將 API Key 獨立到 `.env` 檔案是安全最佳實踐：
- `config.yaml` 可以安全地備份或分享（不含敏感資訊）
- `.env` 應加入 `.gitignore`，避免意外洩露金鑰
- Hermes 在讀取設定時會自動合併兩層
[/callout]

[quiz type="bool"]
Q: `~/.hermes/config.yaml` 可以安全地放入 Git 版本控制嗎？
- [ ] 是
- [x] 否
Hint: 想一下哪些資訊應該避免進入版控
[/quiz]

### 常用設定指令

```prompt [label="設定相關 CLI"]
# 查看目前設定
hermes config

# 編輯設定檔
hermes config edit

# 快速修改單一值
hermes config set model.default anthropic/claude-sonnet-4

# 檢查設定是否完整
hermes doctor

# 查看設定檔路徑
hermes config path
```

### 支援的 Provider

[tags]
- [green] OpenRouter — 一個 Key 存取數百種模型，推薦入門使用
- [green] Anthropic — Claude 系列，高品質推理
- [green] Google Gemini — 免費額度大，適合探索
- [blue] OpenAI — GPT 系列
- [blue] DeepSeek — 高性價比
- [blue] xAI / Grok — 另一個推理選項
- [purple] 本地模型 — 透過 llama.cpp 等工具，完全離線運行
[/tags]

```prompt [label="切換模型"]
hermes model
```

- 互動式選單，列出所有可用的 Provider 與模型
- 切換後立即生效，不需要重啟

## 第一次對話

### 啟動互動式聊天

```prompt [label="開始對話"]
hermes
```

```prompt [label="單次查詢模式"]
hermes chat -q "解釋什麼是 AI Agent"
```

- 預設進入互動式聊天，輸入文字後按 Enter 送出
- 單次查詢模式適合快速提問或腳本整合
- 退出：輸入 `/exit` 或按兩次 Ctrl+C

### 安裝驗證 Checklist

- [x] `hermes --version` 回傳版本號
- [x] `hermes doctor` 無錯誤訊息
- [x] `hermes` 能進入互動式聊天
- [x] 輸入 `/help` 列出所有 Slash Commands
- [x] 嘗試讓它執行一個簡單指令（如 `pwd`）確認工具正常

[reveal title="如果 hermes doctor 報錯怎麼辦？"]
常見問題與解法：
- **Python 版本過低**：升級至 Python 3.10+，可使用 pyenv 管理多版本
- **API Key 無效**：檢查 `~/.hermes/.env` 中的 Key 是否正確，確認 Provider 帳戶有可用額度
- **網路連線問題**：確認終端機可以存取外部 API，企業環境可能需要設定 proxy
- **權限不足**：安裝腳本需要寫入權限，可使用 `sudo` 或檢查目錄權限
[/reveal]

---

# CLI 操作：核心指令與 Slash Commands
> 掌握日常操作中最常用的指令，讓你有效率地與 Hermes 互動

## 全域 Flag 與啟動選項

### 常用啟動參數

```prompt [label="常用啟動方式"]
# 預設互動式聊天
hermes

# 指定模型
hermes chat -m anthropic/claude-sonnet-4

# 載入特定技能
hermes -s git-workflow,code-review

# 使用特定 Profile
hermes -p work

# 繼續上次對話
hermes --continue

# 恢復特定 Session
hermes --resume SESSION_ID
```

[tags]
- [blue] --continue, -c — 恢復最近的對話
- [blue] --resume, -r — 依 ID 或標題恢復指定對話
- [blue] --skills, -s — 啟動時預載技能
- [blue] --profile, -p — 使用命名 Profile
- [orange] --yolo — 跳過危險指令確認（不建議日常使用）
- [purple] --worktree, -w — 隔離 Git Worktree 模式
[/tags]

[callout type="warning" title="注意 --yolo 模式"]
`--yolo` 會讓 Hermes 自動執行所有指令，包含 `rm -rf` 等危險操作。僅在受控環境（如測試用 VM、隔離的 container）中使用，日常操作請勿啟用。
[/callout]

## Slash Commands

### 對話控制

```prompt [label="對話內指令"]
/new              # 開新對話
/clear            # 清空畫面 + 新對話
/retry            # 重新送出上一則訊息
/undo             # 移除上一輪對話
/title 名稱       # 命名當前對話
/compress         # 手動壓縮上下文
/stop             # 停止背景任務
```

> **Slash Commands 在啟動時載入**
> 變更工具或設定後，需要 `/reset` 開新 Session 才會生效。這是為了保護 prompt caching 的穩定性。

### 模型與設定調整

```prompt [label="即時調整"]
/model                    # 查看或切換模型
/personality friendly     # 切換人格
/reasoning high           # 調整推理深度
/verbose                  # 循環切換：關閉 → 新增 → 全部 → 詳細
/voice on                 # 開啟語音模式
/yolo                     # 切換指令確認模式
```

### 工具與技能管理

```prompt [label="工具管理"]
/tools               # 管理工具（互動式）
/toolsets            # 列出工具集
/skills              # 搜尋與安裝技能
/skill name          # 載入指定技能到當前對話
/reload-skills       # 重新掃描技能目錄
```

## Session 管理

### 查看與管理歷史對話

```prompt [label="Session 指令"]
hermes sessions list        # 列出近期對話
hermes sessions browse      # 互動式選擇器
hermes sessions rename ID T # 重新命名
hermes sessions delete ID   # 刪除對話
hermes sessions prune       # 清理舊對話（--older-than N 天）
```

- Session 資料存放在 `~/.hermes/state.db`（SQLite + FTS5 全文搜尋）
- 可用 `hermes sessions stats` 查看儲存統計

[reveal title="Session 會佔用很多空間嗎？"]
一般情況下不會：
- 每筆 Session 只儲存對話文字，大小通常在幾 KB 到幾百 KB
- 使用 `hermes sessions prune --older-than 30` 可定期清理 30 天前的舊對話
- SQLite 資料庫支援 FTS5 全文搜尋，即使大量 Session 也不影響查詢效能
[/reveal]

---

# Skills 與 Memory：讓 Agent 越用越強
> Hermes 最獨特的能力 — 透過技能與記憶的累積，每次對話都比上次更懂你

## Skills 技能系統

### Skill 是什麼

- 一份結構化的 Markdown 文件（SKILL.md），記錄某個領域的知識與操作流程
- AI 自行判斷何時使用，不需要你手動觸發
- 隨時間累積，讓 Agent 在你的特定工作環境中越來越熟練

[compare label-left="Slash Command（/foo）" label-right="Skill（技能）"]
- 由人主動觸發 | AI 自行判斷何時使用
- 一次性指令，執行完結束 | 帶入長期領域知識，影響整段對話
- 適合「跑這套流程」 | 適合「在這類情境下要這樣思考」
- 寫法簡單，一份 markdown | 結構化：name / description / 標籤
[/compare]

### 技能的瀏覽與安裝

```prompt [label="技能管理 CLI"]
hermes skills list          # 列出已安裝技能
hermes skills browse        # 瀏覽技能目錄
hermes skills search QUERY  # 搜尋技能
hermes skills install ID    # 安裝技能
hermes skills inspect ID    # 預覽但不安裝
hermes skills update        # 更新過期技能
hermes skills uninstall N   # 移除技能
```

```prompt [label="直接從 URL 安裝"]
hermes skills install https://example.com/skills/my-skill/SKILL.md
```

[callout type="tip" title="好技能的判斷標準"]
如果你發現自己對 AI 解釋同一件事超過 3 次，每次內容都很像 — 它就應該被寫成 Skill。

Skill 的價值不是「省打字」，而是讓每次對話、每台機器、每個團隊成員，都遵循同一套標準作業流程。
[/callout]

[quiz type="single"]
Q: 什麼情況下最適合建立一個新的 Skill？
- [ ] 只需要執行一次的操作
- [ ] 簡單到一句話就能說清楚的指令
- [x] 需要反覆解釋、有固定流程的領域知識
- [ ] 只有你自己會用到的個人偏好
Hint: 回想前面提到的「解釋超過 3 次」原則
[/quiz]

### Skill 的基本結構

```prompt [label="SKILL.md 最小範例"]
---
name: git-smart-commit
description: 當使用者要 commit 時，分析變更並拆成多個語意清晰的 commit
---

# Git Smart Commit

當使用者要 commit 時，依下列流程進行：

1. 跑 git status 與 git diff，列出所有變更
2. 依「邏輯關聯」分組：相同功能的改動放一起
3. 為每組產生 commit message
4. 依組逐一 git add 與 git commit
5. 所有變更處理完才回報結果
```

### Curator：技能的自動維護

- 背景 curator 會追蹤技能使用頻率，標記閒置技能為 stale
- 被歸檔的技能不會被刪除，只是不再自動載入
- 可用 `/curator status` 查看狀態，`/curator run` 手動觸發維護

## Memory 記憶系統

### 兩種記憶：User Profile 與 Agent Memory

[compare label-left="User Profile（使用者畫像）" label-right="Agent Memory（代理記憶）"]
- 記錄你是誰 | 記錄 Agent 學到的事實
- 名字、角色、偏好、溝通風格 | 環境事實、專案慣例、工具特性
- 減少你重複自我介紹 | 減少 Agent 重複犯錯
- 每次對話都會載入 | 每次對話都會載入
[/compare]

### 記憶的運作方式

[flow]
1. 對話中，Agent 自動判斷哪些資訊值得記住
2. 將事實寫入持久化儲存（宣告式描述，不是指令）
3. 下次對話時，記憶被注入系統提示，影響 Agent 行為
4. 你也可以主動要求 Agent 記住某件事
[/flow]

[callout type="tip" title="記憶應該記什麼？"]
優先順序：使用者偏好和修正 > 環境事實 > 程序性知識。

不要記錄任務進度、Session 結果、Commit SHA 等會過時的資訊 — 那些屬於 Session 搜尋，不是記憶。好的記憶是那種「7 天後仍然重要」的事實。
[/callout]

### 記憶管理

```prompt [label="記憶設定"]
hermes memory status    # 查看記憶狀態
hermes memory setup     # 設定記憶 Provider
hermes memory off       # 關閉記憶
```

- 內建 Provider 為 SQLite 本地儲存
- 也支援 Honcho、Mem0 等外部記憶後端
- 記憶寫入為宣告式陳述，不是指令 — 避免 Agent 把記憶當作強制規則重複執行

---

# Gateway：讓 Agent 走進你的通訊平台
> 同一個 Agent、同一套技能與記憶，出現在你日常使用的每一個聊天室裡

## Gateway 概念

### 為什麼需要 Gateway

- 終端機不是唯一的使用場景 — 很多日常溝通在即時通訊軟體裡發生
- Gateway 讓 Hermes 同時連接多個平台，共享同一個 Agent 核心
- 在 Telegram 問的問題，Agent 的記憶在 Discord 上也記得

### 支援的平台

[tags]
- [green] Telegram — 最穩定的平台支援
- [green] Discord — 支援 Bot 與 Slash Commands
- [green] Slack — 企業環境首選
- [blue] WhatsApp — 透過 WhatsApp Web API
- [blue] Signal — 注重隱私的選擇
- [blue] Email — IMAP/SMTP 整合
- [blue] Matrix — 開源通訊協議
- [purple] SMS — 透過 Twilio 等服務
- [purple] WeChat / DingTalk / Feishu — 亞洲市場支援
[/tags]

## Gateway 設定

### 安裝與啟動

```prompt [label="Gateway 設定"]
# 互動式設定各平台
hermes gateway setup

# 前景執行（適合測試）
hermes gateway run

# 安裝為背景服務
hermes gateway install
hermes gateway start

# 查看狀態
hermes gateway status
```

[flow]
1. 執行 hermes gateway setup — 選擇要連接的平台
2. 輸入各平台的 Bot Token 或 API 憑證
3. 啟動 Gateway — 開始接收與回覆訊息
4. 在任何已連接平台直接 @Agent 或私訊即可互動
[/flow]

### Gateway 內的 Slash Commands

```prompt [label="Gateway 專用指令"]
/approve          # 核准待確認的危險指令
/deny             # 拒絕待確認的指令
/restart          # 重啟 Gateway
/sethome          # 設定當前聊天室為主頻道
/platforms        # 查看平台連接狀態
```

[callout type="warning" title="Gateway 的安全設計"]
危險指令（如 `rm`、`git push --force`）不會自動執行，而是暫停等待你在聊天室中輸入 `/approve` 或 `/deny`。這讓你在手機上也能安全地使用 Agent。
[/callout]

## 語音能力

### STT（語音轉文字）

- 語音訊息自動轉錄，支援多種 Provider
- 優先順序：本地 faster-whisper（免費） > Groq Whisper（免費額度） > OpenAI Whisper（付費）

```prompt [label="STT 設定"]
hermes config set stt.enabled true
hermes config set stt.provider local
```

### TTS（文字轉語音）

```prompt [label="TTS 設定"]
# 在對話中切換語音模式
/voice on         # 語音對話模式
/voice tts        # 所有回覆都轉語音
/voice off        # 關閉語音
```

- 預設使用 Edge TTS（免費），也支援 ElevenLabs、OpenAI、MiniMax 等

---

# 進階能力：Subagent、Cron 與 Profile
> 當基礎操作熟練後，這些進階能力讓你把 Hermes 從個人助手升級為自動化工作引擎

## Subagent：任務委派

### 什麼時候需要 Subagent

[tags]
- [green] 獨立研究任務 — 搜尋論文、分析程式碼、收集資料
- [green] 並行處理 — 多個不相關的子任務同時跑
- [green] 隔離 Context — 探索性任務不會撐爆主對話的上下文
- [orange] 需要持續互動的任務 — 不適合，Subagent 無法與你對話
- [purple] 必須超越對話生命週期的工作 — 改用 Cron Job
[/tags]

### 兩種 Subagent 模式

[compare label-left="delegate_task（同步委派）" label-right="Spawn Process（獨立進程）"]
- 共享同一個進程，隔離對話 | 完全獨立的 Hermes 進程
- 幾分鐘內完成的子任務 | 可跑數小時甚至數天
- 繼承父 Agent 的部分工具 | 擁有完整工具存取
- 不支援互動 | 支援 PTY 互動模式
- 適合：快速平行分析 | 適合：長時間自主任務
[/compare]

### delegate_task 操作範例

```prompt [label="單一任務委派"]
# 在對話中要求 Agent 委派子任務
請派一個 subagent 去分析 src/ 目錄下的所有 Python 檔案，
回報每個檔案的行數、函式數量、以及是否有型別標註。
```

```prompt [label="批次平行委派"]
# 同時派發多個獨立任務
請同時執行以下三個分析：
1. 分析 backend/ 的 API 端點數量與認證方式
2. 分析 frontend/ 的元件數量與狀態管理策略
3. 分析 tests/ 的測試覆蓋率
完成後把三份報告合併成一份總結。
```

## Cron：排程自動化

### Cron 的用途

- 定期執行的監控任務（如：每天檢查服務健康狀態）
- 定時資料收集與彙整（如：每週摘要 GitHub 活動）
- 條件觸發的通知（如：磁碟空間低於閾值時警告）
- 排程內容生成（如：每日簡報、每週回顧）

### 建立與管理 Cron Job

```prompt [label="Cron 管理 CLI"]
hermes cron list               # 列出排程
hermes cron create "0 9 * * *" # 每天 9 點
hermes cron create "30m"       # 每 30 分鐘
hermes cron edit ID            # 編輯排程
hermes cron pause ID           # 暫停
hermes cron resume ID          # 恢復
hermes cron run ID             # 手動觸發
hermes cron remove ID          # 刪除
```

[callout type="warning" title="Cron Job 的安全設計"]
Cron 運行在獨立的 Session 中，無法與使用者互動或要求澄清。因此 prompt 必須是自包含的 — 包含所有必要的上下文與指令。

每次運行有 3 分鐘的硬性中斷限制，防止無窮迴圈。執行結果會自動送到指定的聊天頻道。
[/callout]

## Profile：多實例隔離

### 為什麼需要 Profile

- 工作與個人使用不同的模型、工具、記憶
- 多個專案各自擁有獨立的 Agent 環境
- 不同團隊成員共享同一台機器但各自隔離

```prompt [label="Profile 管理"]
hermes profile list              # 列出所有 Profile
hermes profile create work       # 建立名為 work 的 Profile
hermes profile use work          # 設為預設
hermes profile show work         # 查看詳情
hermes -p work                   # 臨時使用特定 Profile
```

- 每個 Profile 擁有獨立的 `config.yaml`、`.env`、`skills/`、`sessions/`
- 可用 `--clone` 從現有 Profile 複製設定
- Profile 之間完全隔離，記憶與技能不會互相干擾

## MCP：擴充工具生態

### MCP（Model Context Protocol）是什麼

- 一個讓外部資源成為 AI 工具的標準協議
- 可直接查詢資料庫、操作 Notion、呼叫 Linear API
- 不需要自己寫工具，生態系有大量現成的 MCP Server

```prompt [label="MCP 管理"]
hermes mcp list              # 列出已設定的 Server
hermes mcp add NAME          # 新增 Server（--url 或 --command）
hermes mcp remove NAME       # 移除 Server
hermes mcp test NAME         # 測試連線
hermes mcp configure NAME    # 選擇啟用的工具
```

[callout type="tip" title="MCP 是擴充 Hermes 能力的最快捷徑"]
不需要寫 Python 工具，只需要設定一個 MCP Server 的連線資訊，Hermes 就能自動發現並使用該 Server 提供的所有工具。從資料庫查詢到 API 操作，生態系中已有數百個現成 Server 可用。
[/callout]

## 常見問題 FAQ

[accordion]
[item title="Hermes Agent 是免費的嗎？" open]
Hermes Agent 本身是完全開源免費的（由 Nous Research 開發）。

但使用 AI 模型需要 API Key，部分 Provider 提供免費額度：
- Google Gemini：免費額度較大，適合探索
- OpenRouter：新帳號有試用額度
- 本地模型：完全免費，但需要硬體資源
[/item]
[item title="Hermes 會把我的資料傳到哪裡？"]
Hermes 只在你的本機執行，所有對話、記憶、技能都儲存在本地（`~/.hermes/`）。

模型推理需要呼叫外部 API（如 Anthropic、OpenAI），這與使用任何 AI 服務相同。你可以選擇本地模型來完全離線運行。
[/item]
[item title="我可以同時在多個平台使用同一个 Agent 嗎？"]
可以。Gateway 允許同一個 Agent 同時連接多個平台（Telegram、Discord、Slack 等），共享同一套技能與記憶。

在任何一个平台與 Agent 互動的經驗，都會反映在其他平台上。
[/item]
[item title="Skill 和 Memory 的差別是什麼？"]
- **Skill**：結構化的操作流程與領域知識，類似 SOP。例如「如何產生好的 commit message」
- **Memory**：關於你與環境的事實。例如「我偏好使用 conventional commits」、「這個專案用 pytest」

Skill 是「怎麼做」，Memory 是「什麼是」。兩者互補，讓 Agent 更懂你。
[/item]
[item title="如何備份我的 Hermes 設定？"]
備份 `~/.hermes/` 目錄即可包含所有設定：
- `config.yaml` — 主要設定（可安全備份）
- `state.db` — Session 與對話紀錄
- `skills/` — 已安裝的技能
- `.env` — API Key（請妥善保管，建議加密備份）
[/item]
[/accordion]

---

# 總結

[summary]
- **Hermes Agent 是什麼** | 開源 AI Agent 框架，具備持久記憶、自我學習、多平台連接，與模型無關的設計
- **安裝與設定** | 一鍵安裝 + 互動設定精靈，兩層設定架構（config.yaml + .env），20+ Provider 可選
- **CLI 核心操作** | 互動式聊天、Slash Commands、Session 管理、即時調整模型與設定
- **Skills 與 Memory** | Skills 讓 Agent 累積可重複的領域知識，Memory 讓它跨對話記住你的偏好與環境
- **Gateway 多平台** | 同一個 Agent 跑在 15+ 通訊平台，支援語音輸入輸出，危險指令需人工確認
- **進階能力** | Subagent 平行委派、Cron 排程自動化、Profile 多實例隔離、MCP 工具擴充
[/summary]
