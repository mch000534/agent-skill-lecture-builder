# 新專案：用 SDD 讓 AI 根據規格建立專案
> 規格驅動開發（Spec-Driven Development）— 讓 AI 不只寫程式，還幫你建立完善的規格文件

## OpenSpec 初始化

### 為什麼需要 OpenSpec？
- AI 寫程式越來越快，但專案越改越亂，甚至越改越壞
- 關鍵人物離職，沒有文件，系統知識直接斷層
- 解法：白話文對話 → AI 自動建立規格文件 → 根據規格驅動開發

### 安裝與初始化

```prompt [label="安裝指令"]
npm install -g @fission-ai/openspec@latest
openspec init
```

- 選擇使用的 AI 工具（Claude / Cursor）
- 產生 `.claude` / `.cursor` 下的 Agent Skills

### Skills 與 Commands
- **Skills** — AI 在對話過程中自動觸發的技能包，不需要背指令
- **Commands** — 用 `/opsx` 前綴強制驅動：apply / archive / explore / propose
- 可透過 `openspec config profile` 擴充更多 workflows

```prompt [label="查看 Skill"]
我想知道 openspec 目前安裝的 skill 用途
請使用表格呈現，用白話簡短描述
```

## 從零建立專案

### Prompt 設計三要素

[flow]
1. 專案目標 — 大方向描述需求，AI 會釐清細節
2. 使用技術 — 指定技術棧，便於團隊接手
3. 細節討論 — 提醒 AI 主動提問，釐清模糊需求
[/flow]

```prompt [label="建立 Dashboard（Plan Mode）"]
請設計一個公司內部 Dashboard 系統，包含以下功能：
- 登入頁面（帳號密碼驗證，區分管理者與一般使用者）
- 首頁儀表板（顯示關鍵數據卡片：營收、訂單數、活躍用戶數、轉換率）
- 資料圖表頁（折線圖、長條圖，支援日期篩選）
- 員工管理頁（管理者可檢視、新增、編輯、刪除員工資料）

前端使用 React + TypeScript，使用 Mock API 模擬後端回應
這是初步需求，我們可以透過討論釐清細節後，參考 openspec 的 skill 執行
以最小可行性方案來規劃
```

### OpenSpec 自動建立規格文件

[flow]
1. proposal.md — 確認目標與範圍
2. design.md — 技術選型與風險評估
3. specs/ — 按功能分類的詳細規格
4. task.md — 任務清單，完成自動打勾
[/flow]

![OpenSpec 四階段規格生成流程：從 proposal 到 task.md](images/openspec-flow.png)

```prompt [label="開始實作"]
開始實作
```

> **AI 正在改變企業決策**
> 過去 Dashboard 這類系統，企業通常找廠商購買、支付年費維護。但 Vibe Coding 的出現正讓企業做出不同的選擇。
>
> 有些企業導入 Vibe Coding 的目標不是取代工程師，而是讓熟悉業務的人有能力設計出符合使用需求的產品原型，再交給工程師做優化與維護。
>
> 用 OpenSpec 建立規格文件 — 就是讓這個交接過程有據可循，而不是一團無文件的程式碼丟過去。

```prompt [label="歸檔"]
功能符合預期，進行歸檔
```

## 建立專案規則

### 建立專案規則

```prompt [label="初始化規則"]
/init
```

```prompt [label="OpenSpec 設定"]
Please read openspec/config.yaml and help me fill it out
with details about my project, tech stack, and conventions
```

**CLAUDE.md** 是給「做事」用的，**config.yaml** 是給「規劃」用的

---

# 舊專案：根據情境設計 Skills，讓 AI 有執行依據
> 最難的不是 0 到 1，而是 1 到 100；透過 Skills 設計，讓 AI 在迭代功能、版本控制、Code Review 都有規範可循

## OpenSpec 迭代

### 版本控制的必要性
- 反面案例：一個 PR 塞了 18 個檔案、近千行變更、只有一個 commit
- 結果：無法追蹤設計邏輯、Code Review 形同虛設
- AI 加速開發後，這個問題被成倍放大

```prompt [label="新增功能"]
幫我設計 Dashboard 的深色/淺色主題切換功能
上方導覽列新增切換按鈕，使用者偏好存在 localStorage
使用 OpenSpec
```

```prompt [label="確認後實作"]
開始實作
```

> **為什麼 1 到 100 比 0 到 1 更難？**
> 如果沒有規格文件，下次改功能時 AI 不知道之前的設計邏輯，可能把同一個功能重複寫好幾次，或改 A 壞 B。
>
> 用 OpenSpec 每次迭代都會在 Source Control 留下規格變更，AI 跟人類都有文件可以參考。關鍵人物離職最痛的不是少了一個人，而是系統知識直接斷層。

```prompt [label="歸檔變更"]
幫我歸檔
```

⭐ 保持好習慣：每做完一件事就 commit，不要多功能混一起

## 設定 Commit Skill

### 為什麼需要 Commit Skill？

[tags]
- [orange] 人工手打：耗時且風格不一致
- [purple] AI 自動生成：長短隨機、中英混雜
- [green] 解法：git-smart-commit Skill
[/tags]

- 分析變更的檔案 → 判斷應拆成幾個 commit → 分段提交
- 不同功能的修改分開 commit，讓邏輯可被追蹤

```prompt [label="拆分 Commit"]
新增 commit
```

> **AI 產生的程式碼很多，但這不是你不看的原因**
> 導入 AI 後 Code Review 的負擔大幅增加，有些公司認為一天要完成 3 倍工作量才算達標。結果大家犧牲深度思考、懶得 Code Review。
>
> 讓 AI 根據 Skill 拆分 commit — 就是在降低認知負擔。每個 commit 只包含一件事，審核的人可以一步步理解設計邏輯。AI 產生的程式碼很多，但我們該想的是怎麼更有效率的去審核，而不是放棄審核。

## 設定 PR Skill

### git-pr-description Skill
- 比對當前分支與目標分支的差異
- 讀取 commit 訊息與變更檔案
- 參考 `pr-template` 生成 Title 與 Description

[image-text position="right" width="40"]
![PR 自動生成後的 GitHub 介面預覽](images/pr-preview.png)

AI 依據 commit 歷史與 spec 變更，自動填入 PR 標題與描述欄位，並依慣例附上影響範圍與測試建議。
[/image-text]

```prompt [label="生成 PR"]
撰寫 PR
```

## Git Worktree 並行開發

### 多 Agent 並行開發
- 不同功能使用不同 feature branch，搭配 Git Worktree 建立獨立工作區
- 每個 Worktree 可同時跑不同 dev server，讓多個 AI Agent 並行開發
- 設計 `git-worktree-design` Skill：一個指令拆分任務、建立 Worktree、安裝套件、新增 SPEC

> **圖片語法速記**
> - **獨立圖片**（置中 + caption）：段落間獨立一行 `![描述](images/xxx.png)`。若放在 `#` 標題與 `>` 引言之間，會成為 chapter hero。
> - **圖文並排**：`[image-text]...[/image-text]` 包裹圖片與文字。
> - **行內圖片**：在句子中直接寫 `![描述](images/xxx.png)`，例如「點一下 ![設定 icon](images/icon-settings.png) 即可開啟」。

```prompt [label="Worktree 並行開發"]
採用 Worktree，新增通知中心彈窗、資料匯出 CSV 功能、常見 QA 問答區
```

> **人，才是 AI 的瓶頸**
> Code Review 的速度已經跟不上 AI 寫程式的速度。當人成為 AI 的瓶頸時，要去想的是如何降低門檻，而不是放棄審核。
>
> 每個功能單獨驗證，Code Review 時只需專注一件事。雖然每一步都是 AI 在執行，但如果沒有業界經驗，其實不知道怎麼串起這些工具。**真正值錢的不是工具本身，而是知道什麼時候用、怎麼組合。**

### Worktree 注意事項
- 合併時可能有衝突：各分支獨立開發，不知彼此變更
- 建議共用功能優先開發、主分支變更時其他 Worktree 先同步
- 設計好流程才能提升效率

---

# 導入測試：讓維護與擴充更有底氣
> 市場不會為爛產品買單；加入自動化測試，是 Vibe Coding 從玩具走向產品的關鍵

### 為什麼 Vibe Coding 一定要測試？

[flow]
1. 穩定性 — 請 AI 修 bug，結果舊功能壞掉
2. 複雜度 — 功能越多，人工測試越不可能覆蓋全部
3. 擴充性 — 功能間有相依性，修改可能引發連鎖影響
[/flow]

不寫測試才浪費時間 — 測試讓你敢大膽修改，遇錯快速定位

## gen-test-cases

### 測試撰寫流程

[flow]
1. 建立資料夾 — 存放測試清單
2. AI 撰寫清單 — 類型、說明、輸入、期待輸出
3. 人類 Review — 確認情境有無遺漏
4. AI 撰寫測試 — 描述與文件一致
5. 自主驗證 — 最多嘗試 5 次
[/flow]

```prompt [label="生成測試案例"]
/gen-test-cases
（拖入 src/pages/LoginPage.tsx）
```

> **從玩具到產品，差的就是測試**
> 很多時候 AI 只是修好了眼前的錯誤，但過程中改壞了過去的邏輯。千萬不要嫌寫測試浪費時間 — 測試其實是在幫你加速開發。
>
> 現在有 AI 了，你不用自己寫測試程式，只要審核 AI 給的測試情境是否有遺漏就好。

### 登入頁測試情境範例

- [x] 電子郵件格式錯誤 → 前端擋住、不呼叫 API
- [x] 密碼不符規則 → 顯示對應錯誤訊息
- [x] 格式正確 → 呼叫 Mock API → 成功取得 Token
- [x] Mock API 回傳密碼錯誤 / 帳號不存在 → 顯示錯誤
- [x] 管理者登入 → 顯示員工管理頁入口；一般用戶 → 不顯示
- [x] 無 Token 時直接存取 Dashboard → 導向登入頁

### 實務建議
- 不要一口氣生成所有測試，先放一個檔案確認結果符合預期
- 每個頁面/模組有獨立的測試程式，方便定位問題
- 測試案例會隨規格變更而調整，不可能一次到位

## GitHub Action 自動化

```prompt [label="自動化測試"]
我希望在 GitHub Action 加入自動化測試的流程
每一個分支將更新推送到 GitHub 都會觸發一次自動化測試
測試完畢後，要生成覆蓋率報告讓我下載
```

> **企業內訓的真實回饋**
> 講師設計的教材是最佳體驗路徑，但換到自己的專案情境一定會遇到不一樣的問題。回去後不要只是複製指令，而是把流程搬到自己的專案試一遍。
>
> **學習 AI 不是搜集指令複製貼上，更重要的是了解應用情境後，透過實踐調整為適合自己的工作流。**

### 自動化測試流程
- 每次推送到 GitHub 都觸發測試
- 測試完畢生成覆蓋率報告
- 設定 Branch Protection Rule：測試通過才能合併到主分支

測試覆蓋率不需追求 100%，重要的邏輯都要測試到。有了測試，規格書上的功能才能被真正驗證。

---

# 總結

[summary]
- **新專案 — SDD** | OpenSpec + Spec-Driven Development，讓 AI 根據規格建立 Dashboard，同時產生完善文件
- **舊專案 — Skills** | 設計 Commit / PR / Worktree Skills，讓 AI 在大型專案中有規範可循
- **導入測試 — CI/CD** | 用 Workflow 驅動 AI 撰寫測試，搭配 GitHub Action 守住品質底線
[/summary]
