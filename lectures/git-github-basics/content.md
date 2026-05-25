# 概念入門：Git 是什麼？為什麼需要版本控制
> 沒有版本控制，你只是在賭——賭自己永遠不會犯錯、永遠不需要回頭

## 集中式 vs 分散式版本控制

在了解 Git 之前，先知道版本控制系統的兩種主要架構：

[compare label-left="集中式（SVN / CVS）" label-right="分散式（Git / Mercurial）"]
- 只有一台中央伺服器存有完整歷史 | 每個人的電腦都有完整歷史備份
- 斷網就無法提交、無法查看歷史 | 斷網也能正常 commit，有網路再同步
- 伺服器掛掉，所有歷史消失 | 任一台電腦都能還原整個專案
- 操作速度慢，需要網路 | 操作速度快，本機執行
- 適合：集中管控的大型企業 | 適合：開源專案、敏捷開發團隊
[/compare]

> **Git 是分散式的**
> 這代表你每次 clone 專案，都是一次完整的備份。即使中央伺服器消失，任何一台電腦都能還原全部歷史。這就是 Git 強大的核心設計。

## 版本控制的演進歷程

Git 並非憑空出現，它是數十年版本控制經驗的結晶：

[timeline]
- 1990 | CVS | 第一代分散式版本控制，支援並行開發
- 2000 | SVN（Subversion） | 集中式版本控制的巔峰，成為業界標準
- 2002 | BitKeeper | Linux 核心採用，首次大規模分散式 VCS
- 2005 | Git 誕生 | Linus Torvalds 為 Linux 核心開發，因 BitKeeper 授權終止而自行打造
- 2008 | GitHub 上線 | 讓 Git 和開源協作變得觸手可及
- 2026 | 至今 | Git 已是全球開發者的標準工具，GitHub 超過 1 億用戶
[/timeline]

> **為什麼 Git 會成功？**
> 速度、簡單、分散式、分支與合併強大——這些都是 Linus 從 Linux 核心開發經驗中總結的需求。Git 不是為了「好用」而設計，是為了「必要」而設計。

## 從生活出發：你一定有過這種經驗

### 沒有版本控制的世界
- 修改報告到一半，發現改壞了，但找不到原版
- 和同學合作，互相覆蓋對方的修改
- 「昨天那個版本比較好」——但已經回不去了
- 資料夾裡出現 `final.docx`、`final2.docx`、`final_真的最終版.docx`

> **這就是沒有版本控制的痛**
> 手動備份費時費力，卻還是會出錯。你需要的不是「更勤快地備份」，而是一套自動幫你記錄每次改動的系統。

## Git 的核心比喻：存檔點系統

### 把 Git 想像成電動遊戲的存檔功能
- 你在玩 RPG 遊戲，每過一個關卡都會存檔
- 如果後面走錯路，可以讀取之前的存檔重來
- Git 就是你程式碼的「存檔點系統」
- 每次 `git commit` 就是建立一個可以隨時回去的存檔點

### Git 讓你做到什麼？
- 記錄每一次修改：誰改了什麼、什麼時間改的
- 隨時回到任何一個存檔點
- 多人同時開發，不互相干擾
- 安全地嘗試新功能，失敗了也不影響主線

[flow]
1. 修改檔案 — 在本地編輯你的程式碼
2. git add — 標記哪些改動要記錄
3. git commit — 建立存檔點，附上說明
4. git push — 把存檔點上傳到雲端（GitHub）
[/flow]

## Git 完整工作流一覽

以下是在真實團隊開發中，你會走過的完整循環：

[flow]
1. git pull origin main — 從遠端取得最新程式碼
2. git checkout -b feature/new-login — 建立功能分支
3. 編輯程式碼 — 撰寫新功能或修正
4. git add . — 加入所有改動到暫存區
5. git commit -m "feat: 新增登入功能" — 建立存檔點
6. git push origin feature/new-login — 推送分支到遠端
7. 在 GitHub 建立 Pull Request — 請求合併
8. Code Review — 隊友審查你的程式碼
9. git merge feature/new-login — 合併到 main 分支
10. git branch -d feature/new-login — 刪除已合併的分支
[/flow]

> **不需要一次記起來**
> 前四步（pull → branch → edit → add → commit）是每天的重複操作。後面幾步（push → PR → merge）是在功能完成時才需要。先掌握基礎的 add/commit/push，再慢慢學習分支和 PR 流程。

## 版本控制的核心價值

### 獨自開發時
- 每次重大修改前先 commit，之後改壞可以回復
- 完整保留所有嘗試的紀錄，不怕實驗失敗
- 出問題時可以用 `git log` 找到「昨天還正常的那個版本」

### 團隊協作時
- 每個人在自己的分支上開發，完成後再合併
- 清楚看到誰改了哪一行，有問題可以追溯
- Pull Request 機制讓每次合併都有人審查

[tags]
- [green] 安全：改壞了隨時可以回復
- [blue] 協作：多人同時開發不互相覆蓋
- [orange] 追溯：每次改動都有紀錄可查
- [purple] 備份：程式碼同步在雲端，不怕電腦掛掉
[/tags]

## 本課程學習路徑

[steps-status]
- [done] 版本控制概念 | 理解什麼是版本控制、為什麼需要 Git
- [doing] 環境安裝與設定 | 安裝 Git、設定身份，準備好開發環境
- [todo] 核心操作 | init、add、commit、status 建立本地存檔點
- [todo] 歷史與還原 | 用 log 查看、diff 比較、checkout 回到過去
- [todo] 遠端協作 | 連接 GitHub、push 推送、pull 同步
- [todo] 分支策略 | branch、checkout -b、merge 安全開發新功能
- [todo] 開源流程 | Fork → Clone → PR → Code Review → Merge
[/steps-status]

> **本節學會了什麼**
> Git 是一套版本控制系統，讓你能夠記錄每次程式碼的修改、隨時回到過去的版本，並支援多人協作不互相干擾。它解決的核心問題是：「改壞了怎麼辦」和「多人協作怎麼不亂」。

---

# 環境準備：安裝 Git 與初始設定
> 工欲善其事，必先利其器——花十分鐘把環境設好，之後每次用都省心

## 安裝 Git

### 確認你的系統

[flow]
1. macOS — 開啟 Terminal，輸入 git --version
2. Windows — 前往 git-scm.com 下載安裝程式
3. Linux（Ubuntu/Debian） — 執行 sudo apt install git
[/flow]

### macOS 安裝方式

macOS 通常已內建 Git。打開 Terminal（按 Command+空白鍵，輸入「terminal」），輸入以下指令確認：

```prompt [label="確認 Git 版本"]
git --version
```

若看到類似 `git version 2.39.3` 的輸出，代表已安裝完成。

若尚未安裝，系統會提示你安裝 Xcode Command Line Tools，按照指示操作即可。或使用 Homebrew：

```prompt [label="macOS 透過 Homebrew 安裝"]
brew install git
```

### Windows 安裝方式

前往 [git-scm.com](https://git-scm.com) 下載 Git for Windows。安裝過程中的選項建議：
- Editor：選擇你熟悉的編輯器（初學者選 Notepad++）
- 其他選項保留預設即可

安裝後，使用「Git Bash」作為你的命令列工具。

```prompt [label="Windows 確認安裝"]
git --version
```

### 常見錯誤：command not found

- macOS：重新開啟 Terminal 再試，或執行 `xcode-select --install`
- Windows：確認是在 Git Bash 中執行，不是在 cmd 或 PowerShell

[callout type="tip" title="實用技巧"]
- 安裝完成後，關閉所有已開啟的 Terminal 視窗，重新開啟一個新的，確保環境變數生效
- Windows 用戶建議使用 Git Bash 而非 PowerShell，指令行為與教學內容一致
[/callout]

## git config：告訴 Git 你是誰

### 為什麼要設定身份？

每次 commit 都會記錄「是誰做的這個改動」。如果沒有設定，Git 不知道要填什麼名字。這個設定只需要做一次。

```prompt [label="設定使用者名稱與 Email"]
git config --global user.name "你的名字"
git config --global user.email "your@email.com"
```

將 `"你的名字"` 換成你的真實姓名（或暱稱），`"your@email.com"` 換成你的 Email。

```prompt [label="確認設定是否正確"]
git config --global --list
```

預期輸出：
```prompt [label="預期輸出"]
user.name=你的名字
user.email=your@email.com
```

[callout type="warning" title="注意"]
這裡設定的 Email 會公開顯示在你的 commit 歷史中。如果你使用 GitHub，建議設定成與 GitHub 帳號相同的 Email，這樣你的 commit 才會正確關聯到你的 GitHub 帳號。使用 `--global` 參數代表這個設定對這台電腦的所有 Git 專案都有效。
[/callout]

### 設定預設分支名稱（建議執行）

GitHub 預設使用 `main` 作為主分支名稱，建議讓本地 Git 也統一：

```prompt [label="設定預設分支為 main"]
git config --global init.defaultBranch main
```

### 設定換行符號（Windows 用戶必做）

```prompt [label="Windows 使用者執行"]
git config --global core.autocrlf true
```

macOS / Linux 用戶執行：

```prompt [label="macOS / Linux 使用者執行"]
git config --global core.autocrlf input
```

> **為什麼要設定換行符號？**
> Windows 和 Mac/Linux 的換行字元格式不同。如果不統一，多人協作時每次打開對方的檔案，Git 都會顯示「整個檔案都被修改了」，其實只是換行符號不同而已。

> **本節學會了什麼**
> 完成了 Git 安裝與基本身份設定（`user.name`、`user.email`）。`--global` 參數代表這個設定對這台電腦的所有 Git 專案都有效，只需設定一次。

---

# 第一個 Repository：從 init 到第一次 commit
> 每個偉大的專案，都從一個空資料夾和 git init 開始

## 建立你的第一個 Git 專案

### 建立專案資料夾

打開 Terminal，依序輸入：

```prompt [label="建立並進入專案目錄"]
mkdir my-first-repo
cd my-first-repo
```

`mkdir` 是建立資料夾，`cd` 是進入資料夾。現在你在一個全新的空資料夾裡。

### git init：把資料夾變成 Git 倉庫

```prompt [label="初始化 Git 倉庫"]
git init
```

預期輸出：
```prompt [label="預期輸出"]
Initialized empty Git repository in /Users/你的名字/my-first-repo/.git/
```

這個指令在你的資料夾裡建立了一個隱藏的 `.git` 目錄，Git 所有的歷史紀錄都存在裡面。

### 建立你的第一個檔案

```prompt [label="建立 README 檔案"]
echo "# 我的第一個 Git 專案" > README.md
```

## git status：隨時查看目前狀態

```prompt [label="查看目前狀態"]
git status
```

預期輸出：
```prompt [label="預期輸出"]
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md

nothing added to commit but untracked files present (use "git add" to track)
```

### 讀懂 git status 輸出

[flow]
1. Untracked files — Git 看到這個檔案，但還沒開始追蹤它
2. Changes not staged — 已追蹤的檔案有修改，但還沒標記要 commit
3. Changes to be committed — 已用 git add 標記，等待 commit
[/flow]

## git add：標記要放入存檔點的內容

### 比喻：打包行李

把 `git add` 想像成「把要帶走的東西放進行李箱」。你可以選擇放哪些東西（不是全部都要帶），等確認好了再 `git commit`（拉上拉鍊，確認打包完成）。

```prompt [label="加入單一檔案"]
git add README.md
```

或者加入所有有改動的檔案：

```prompt [label="加入所有變更"]
git add .
```

加入後再次執行 `git status` 確認：

```prompt [label="確認 add 結果"]
git status
```

預期輸出：
```prompt [label="預期輸出"]
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   README.md
```

## git commit：建立存檔點

```prompt [label="建立第一個 commit"]
git commit -m "feat: 新增 README 初始說明"
```

`-m` 後面的字串是這次 commit 的說明訊息，描述「你做了什麼」。

預期輸出：
```prompt [label="預期輸出"]
[main (root-commit) a1b2c3d] feat: 新增 README 初始說明
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
```

### 寫好 commit 訊息的原則

[tags]
- [green] 好的訊息：feat: 新增使用者登入功能
- [green] 好的訊息：fix: 修正密碼驗證邏輯錯誤
- [orange] 普通的訊息：update code
- [orange] 普通的訊息：修改了一些東西
[/tags]

### 常見錯誤與排除

> **錯誤：請先設定 user.name 和 user.email**
> 出現 `Please tell me who you are` 訊息，代表沒有完成第二節的身份設定。回去執行 `git config --global user.name "你的名字"` 即可。

> **錯誤：nothing to commit**
> 出現 `nothing to commit, working tree clean`，代表沒有任何修改，或是忘記執行 `git add`。

> **本節學會了什麼**
> 掌握了建立 Git 倉庫的完整流程：`git init`（初始化）→ `git add`（標記要記錄的檔案）→ `git commit -m`（建立存檔點並附上說明）。這三個指令是 Git 最核心的操作，每天都會用到。

---

# 時光機：查看歷史與還原操作
> 知道怎麼「回去」，才能放心大膽地「往前走」

## git log：翻閱修改歷史

先多新增幾個 commit 來練習查看歷史。建立一個新檔案並 commit：

```prompt [label="新增第二個 commit"]
echo "print('Hello, Git!')" > hello.py
git add hello.py
git commit -m "feat: 新增 hello.py 程式"
```

現在查看歷史：

```prompt [label="查看完整歷史"]
git log
```

預期輸出：
```prompt [label="預期輸出"]
commit b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3 (HEAD -> main)
Author: 你的名字 <your@email.com>
Date:   Mon May 18 10:30:00 2026 +0800

    feat: 新增 hello.py 程式

commit a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
Author: 你的名字 <your@email.com>
Date:   Mon May 18 10:00:00 2026 +0800

    feat: 新增 README 初始說明
```

### 更簡潔的歷史檢視

```prompt [label="精簡的單行格式"]
git log --oneline
```

預期輸出：
```prompt [label="預期輸出"]
b4c5d6e (HEAD -> main) feat: 新增 hello.py 程式
a1b2c3d feat: 新增 README 初始說明
```

每行開頭的短代碼（如 `b4c5d6e`）是 commit ID，之後還原操作會用到。

## git diff：查看具體改了什麼

先修改 `hello.py`：

```prompt [label="修改 hello.py"]
echo "print('Hello, GitHub!')" > hello.py
```

然後查看改動：

```prompt [label="查看未 commit 的改動"]
git diff
```

預期輸出：
```prompt [label="預期輸出"]
diff --git a/hello.py b/hello.py
index ...
--- a/hello.py
+++ b/hello.py
@@ -1 +1 @@
-print('Hello, Git!')
+print('Hello, GitHub!')
```

`-` 開頭是被刪除的內容（舊版），`+` 開頭是新增的內容（新版）。

## git checkout：切換到過去的版本

### 查看某個 commit 的檔案狀態

用 `git log --oneline` 找到要回去的 commit ID，然後：

```prompt [label="切換到指定 commit"]
git checkout a1b2c3d
```

這時候你進入了「分離頭部」（detached HEAD）狀態——你可以看到過去的檔案，但不要在這裡做修改。

要回到最新版本：

```prompt [label="回到最新版本"]
git checkout main
```

### 還原單一檔案

如果只想把某個檔案還原到最後一次 commit 的狀態（放棄目前的修改）：

```prompt [label="還原單一檔案"]
git checkout -- hello.py
```

或使用更現代的語法：

```prompt [label="還原單一檔案（推薦語法）"]
git restore hello.py
```

> **注意：這個操作無法復原**
> `git restore` 或 `git checkout --` 會直接丟棄你在工作目錄的改動，無法用 Ctrl+Z 恢復。執行前請確認你真的要放棄這些修改。

### 還原到某個 commit（危險操作，先了解即可）

如果想把整個分支退回到某個舊版本：

```prompt [label="退回到指定 commit（危險）"]
git reset --hard a1b2c3d
```

這個指令會丟棄該 commit 之後的所有改動，謹慎使用。

[callout type="warning" title="危險操作警告"]
`git reset --hard` 會**永久丟棄**所有未 commit 的改動，且無法用 Ctrl+Z 恢復。執行前建議先用 `git diff` 確認要丟棄的內容，或使用 `git stash` 暫時備份改動。只有在你確定「這些改動完全不要了」的情況下才使用。
[/callout]

> **本節學會了什麼**
> `git log` 查看完整修改歷史，`git log --oneline` 看精簡版；`git diff` 查看目前未 commit 的具體改動；`git checkout` 可以切換到過去某個存檔點，或配合 `--` 還原單一檔案。掌握這些工具，你就有了完整的「後悔藥」。

---

# 連上世界：GitHub 遠端倉庫操作
> 本地的存檔只保護你不怕改壞，雲端的備份才讓你不怕電腦壞掉

## 建立 GitHub 帳號與遠端 Repository

### 建立 GitHub 帳號

前往 [github.com](https://github.com) 註冊帳號（若已有帳號可跳過）。

### 在 GitHub 上建立新的 Repository

[flow]
1. 登入 GitHub，點擊右上角「+」→「New repository」
2. 填入 Repository name，例如 my-first-repo
3. 選擇 Public（公開）或 Private（私有）
4. 不要勾選「Add a README file」（因為我們本地已有）
5. 點擊「Create repository」
[/flow]

GitHub 建立後，你會看到一個頁面，上面有遠端倉庫的網址。

## git remote：連接本地與遠端

複製 GitHub 頁面上的倉庫 URL（格式類似 `https://github.com/你的帳號/my-first-repo.git`），然後在本地執行：

```prompt [label="連接遠端倉庫"]
git remote add origin https://github.com/你的帳號/my-first-repo.git
```

`origin` 是遠端倉庫的「暱稱」，這是業界慣例，不需要改它。

確認連接成功：

```prompt [label="查看遠端設定"]
git remote -v
```

預期輸出：
```prompt [label="預期輸出"]
origin  https://github.com/你的帳號/my-first-repo.git (fetch)
origin  https://github.com/你的帳號/my-first-repo.git (push)
```

## git push：上傳本地 commit 到 GitHub

```prompt [label="第一次推送"]
git push -u origin main
```

`-u` 是設定「預設追蹤」，設定一次後，之後只需要輸入 `git push` 即可。

推送後可能需要輸入 GitHub 帳號和密碼（或設定 SSH Key）。

> **注意：GitHub 已停止支援密碼登入**
> 如果要求輸入密碼，你需要建立 Personal Access Token（PAT）來替代密碼，或設定 SSH Key。建議在 GitHub 的 Settings → Developer settings → Personal access tokens 建立 Token。

```prompt [label="之後每次推送只需要"]
git push
```

## git pull：從 GitHub 下載最新改動

當你在其他電腦工作，或有隊友推送了新的 commit，你需要把最新版本拉下來：

```prompt [label="拉取最新改動"]
git pull
```

`git pull` 的完整意思是：從遠端下載最新的 commit，並自動合併到你目前的分支。

### 完整的日常工作流程

[flow]
1. git pull — 開始工作前，先拉取最新版本
2. 編輯程式碼 — 做你的修改
3. git add . — 標記要記錄的改動
4. git commit -m "說明" — 建立存檔點
5. git push — 推送到 GitHub
[/flow]

[callout type="tip" title="每日工作好習慣"]
每次開始工作前先 `git pull`，是避免衝突的最佳實踐。即使目前只有你一個人在開發，養成這個習慣也能避免未來「推送被拒絕」的問題。
[/callout]

### 常見錯誤：推送被拒絕

```prompt [label="推送被拒絕的錯誤訊息"]
! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'origin'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally.
```

這代表遠端有別人新增的 commit 你還沒拉取。解法：先執行 `git pull`，再執行 `git push`。

[callout type="warning" title="不要使用 git push --force"]
初學者推送被拒絕時，可能會查到 `git push --force` 這個指令。**絕對不要**在共用分支（如 main）上使用它，因為會**覆蓋並丟失別人的 commit**。只有在你完全確定「遠端版本可以整個丟棄」（例如個人分支且只有自己使用）的情況下，才能使用 `--force`。
[/callout]

> **本節學會了什麼**
> `git remote add origin <url>` 連接本地與遠端倉庫；`git push` 上傳本地的 commit；`git pull` 下載遠端的最新改動。這三個指令讓你的程式碼同時存在本地和雲端，也讓多人協作成為可能。

---

# 平行宇宙：分支操作入門
> 分支讓你在不影響主線的情況下，安全地嘗試任何新功能

## 分支的核心概念

### 比喻：電影裡的平行宇宙

- `main` 分支是你的「正式版本」，是穩定、可以給人看的版本
- 每個新功能都在自己的分支上開發，就像在平行宇宙裡做實驗
- 功能完成、測試沒問題，才把它「合併」回主線
- 如果功能失敗，直接刪掉那個分支，主線完全不受影響

> **為什麼不直接在 main 上開發？**
> 想像你正在修改一個已在運行的網站，但還沒寫完、程式會出錯。如果直接在 main 上開發，整個網站就壞掉了。分支讓你可以在「另一個空間」慢慢做，完成了再切換回來。

## git branch：管理分支

### 查看所有分支

```prompt [label="查看分支清單"]
git branch
```

預期輸出（星號代表目前所在分支）：
```prompt [label="預期輸出"]
* main
```

### 建立新分支

```prompt [label="建立 feature 分支"]
git branch feature/add-greeting
```

命名慣例：`feature/功能名稱`、`fix/修正內容`、`docs/文件說明`

### 切換到新分支

```prompt [label="切換到新分支"]
git checkout feature/add-greeting
```

或用更現代的語法（建立並切換，一步完成）：

```prompt [label="建立並立即切換（推薦）"]
git checkout -b feature/add-greeting
```

確認目前在哪個分支：

```prompt [label="確認目前分支"]
git branch
```

預期輸出：
```prompt [label="預期輸出"]
* feature/add-greeting
  main
```

## 在分支上開發

現在你在 `feature/add-greeting` 分支，對 `hello.py` 做修改：

```prompt [label="修改 hello.py"]
echo "print('Hello, World! Welcome to Git!')" > hello.py
git add hello.py
git commit -m "feat: 更新歡迎訊息"
```

這個 commit 只存在於 `feature/add-greeting` 分支，`main` 分支完全不受影響。

切回 `main` 分支驗證：

```prompt [label="切回 main 並查看檔案"]
git checkout main
cat hello.py
```

預期輸出（還是舊版）：
```prompt [label="預期輸出"]
print('Hello, GitHub!')
```

## git merge：合併分支

功能開發完成，把分支合併回 `main`：

```prompt [label="合併 feature 分支到 main"]
git checkout main
git merge feature/add-greeting
```

預期輸出：
```prompt [label="預期輸出"]
Updating b4c5d6e..f0a1b2c
Fast-forward
 hello.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

合併完成後，`main` 分支就有了新功能，同時保留了完整的開發歷史。

## 合併衝突（Merge Conflict）

### 什麼情況下會發生？

當兩個分支都修改了同一個檔案的同一行，Git 不知道要保留誰的版本，就會發生衝突：

```prompt [label="衝突標記的樣子"]
<<<<<<< HEAD
print('Hello, GitHub!')
=======
print('Hello, World!')
>>>>>>> feature/add-greeting
```

### 如何解決

[flow]
1. 打開有衝突的檔案，找到 <<<<<<< 標記
2. 決定要保留哪個版本（或兩個都要），手動編輯
3. 刪除所有 <<<<<<<、=======、>>>>>>> 標記
4. git add 標記衝突已解決
5. git commit 完成合併
[/flow]

[callout type="tip" title="避免衝突的最佳實踐"]
- 經常執行 `git pull`，不要累積太多改動才合併
- 開分支時取名要明確，如 `feature/login` 而非 `new-branch`，減少同名衝突
- 修改前先用 `git diff` 看清楚改了什麼
- 如果真的遇到衝突，不要慌張，按照上面的五個步驟一步步解決即可
[/callout]

[reveal title="查看：衝突解決完整範例"]
假設你的 main 和 feature 分支都修改了 `hello.py` 的第一行：

**衝突時的檔案內容：**
```
<<<<<<< HEAD
print('Hello, GitHub!')
=======
print('Hello, World! Welcome to Git!')
>>>>>>> feature/add-greeting
```

**解決後的結果**（假設你決定兩個都要）：
```
print('Hello, GitHub!')
print('Hello, World! Welcome to Git!')
```

**解決步驟：**
1. 手動編輯檔案，保留想要的內容
2. 刪除所有 `<<<<<<<`、`=======`、`>>>>>>>` 標記
3. 執行 `git add hello.py` 標記已解決
4. 執行 `git commit` 完成合併

> 你也可以只保留其中一個版本，完全取決於你的需求。重點是：Git 不知道哪個是「正確」的版本，需要**你**來做決定。
[/reveal]

### 完成後刪除已合併的分支

```prompt [label="刪除已合併的分支"]
git branch -d feature/add-greeting
```

> **本節學會了什麼**
> `git branch` 查看分支、`git checkout -b` 建立並切換到新分支、`git merge` 把分支合併回主線。分支讓你可以安全地在「平行宇宙」開發功能，完成後再合入主線，是團隊協作的核心基礎。

---

# 開源協作：Pull Request 完整流程
> PR 不只是合併程式碼，它是程式碼品質的把關機制

## Fork：複製別人的專案到自己帳號

### 什麼是 Fork？

- Fork 是在 GitHub 上「複製」別人的倉庫到你的帳號下
- 你對 Fork 出來的版本有完整權限，可以任意修改
- 修改完成後，透過 Pull Request 向原作者提交你的貢獻
- 這是全球開源協作的標準流程

### 實際操作 Fork

[flow]
1. 找到你想貢獻的 GitHub 專案頁面
2. 點擊右上角的「Fork」按鈕
3. 選擇要 Fork 到哪個帳號（通常是你自己）
4. GitHub 會幫你複製一份到你的帳號下
[/flow]

Fork 完成後，你的帳號底下會有一個一模一樣的倉庫，URL 是 `github.com/你的帳號/原專案名稱`。

### Clone 你 Fork 的版本到本地

```prompt [label="Clone Fork 到本地"]
git clone https://github.com/你的帳號/原專案名稱.git
cd 原專案名稱
```

Clone 會把整個倉庫（包含所有歷史）下載到本地。

## 建立分支並做修改

在開始改動前，先建立一個新分支（好習慣）：

```prompt [label="建立並切換到新分支"]
git checkout -b fix/typo-in-readme
```

做你的修改，然後 commit：

```prompt [label="commit 你的修改"]
git add README.md
git commit -m "fix: 修正 README 中的錯字"
```

## 推送到你的 Fork 並提交 Pull Request

### 推送分支到你的 Fork

```prompt [label="推送到你的 GitHub Fork"]
git push origin fix/typo-in-readme
```

### 在 GitHub 上建立 Pull Request

[flow]
1. 推送後，前往你的 Fork 頁面，GitHub 會自動提示你「Compare & pull request」
2. 點擊這個按鈕，進入 PR 建立頁面
3. 填寫 PR 標題（清楚說明你做了什麼）
4. 填寫描述（說明為什麼要這樣改、影響範圍）
5. 確認左邊是「原始專案的 main」，右邊是「你的分支」
6. 點擊「Create pull request」
[/flow]

## Code Review 基礎

### 作為 PR 提交者

[tags]
- [green] 標題清楚：一眼能看出這個 PR 做了什麼
- [green] 說明充分：為什麼要改、改了哪些地方
- [green] 範圍集中：一個 PR 只解決一個問題
- [orange] 避免：一個 PR 塞入十幾個不相關的修改
[/tags]

### 作為 Code Reviewer

- 針對程式碼留評論，而不是針對人
- 提問而不是命令：「這裡這樣寫是有特別考量嗎？」
- 區分「必須改」和「建議改」
- 不要只挑錯，好的寫法也值得稱讚

### PR 的生命週期

[flow]
1. 提交 PR — 等待 Reviewer 審查
2. 收到回饋 — 根據建議修改，再 push 到同一分支
3. Reviewer 核准（Approve）— PR 通過審查
4. 合併（Merge）— 由原作者或有權限者合併進主線
5. 刪除分支 — 合併後刪除 feature 分支保持整潔
[/flow]

> **本節學會了什麼**
> Fork 是複製別人的專案到自己帳號；Clone 是把倉庫下載到本地；Pull Request 是告訴原作者「我有改動，請幫我 review 並合併」。這套流程是全球開源協作的基礎，也是公司內部團隊協作的標準方式。

---

# 綜合實戰：模擬完整的團隊協作流程
> 把前面學到的全部串起來，走一遍真實的協作場景

## 情境設定

你和同學 A 共同維護一個靜態網站專案（只有 HTML 和文字檔）。你們兩人要同時開發不同功能，最終合併到主線。

我們用「一個人扮演兩個角色」的方式來模擬這個場景。

## 階段一：專案初始化（隊長操作）

```prompt [label="建立團隊專案"]
mkdir team-website
cd team-website
git init
echo "<html><body><h1>我們的團隊網站</h1></body></html>" > index.html
git add index.html
git commit -m "feat: 初始化專案，建立首頁框架"
```

在 GitHub 上建立新的 Repository（不要加 README），然後連接：

```prompt [label="連接遠端並推送"]
git remote add origin https://github.com/你的帳號/team-website.git
git push -u origin main
```

## 階段二：成員加入（成員操作）

成員從 GitHub Clone 專案到本地：

```prompt [label="成員 Clone 專案"]
git clone https://github.com/你的帳號/team-website.git
cd team-website
```

## 階段三：各自在分支上開發

### 你負責「新增關於我們」頁面

```prompt [label="你建立自己的分支"]
git checkout -b feature/about-page
echo "<html><body><h1>關於我們</h1><p>這是一個學習 Git 的團隊</p></body></html>" > about.html
git add about.html
git commit -m "feat: 新增關於我們頁面"
git push origin feature/about-page
```

### 同學 A 負責「新增聯絡方式」

```prompt [label="同學 A 建立自己的分支"]
git checkout -b feature/contact-page
echo "<html><body><h1>聯絡我們</h1><p>Email: team@example.com</p></body></html>" > contact.html
git add contact.html
git commit -m "feat: 新增聯絡方式頁面"
git push origin feature/contact-page
```

## 階段四：提交 Pull Request 並進行 Code Review

[flow]
1. 你到 GitHub，針對 feature/about-page 建立 PR
2. 同學 A 幫你做 Code Review，留下一則評論
3. 你根據建議修改，再 push 更新
4. 同學 A 核准 PR
5. 合併到 main
6. 同學 A 也建立 PR，你幫他 review，重複流程
[/flow]

## 階段五：同步最新主線

合併後，每個人都要把最新的 `main` 拉下來：

```prompt [label="同步最新的 main"]
git checkout main
git pull
```

查看完整歷史，確認所有人的 commit 都在：

```prompt [label="查看完整歷史"]
git log --oneline
```

預期輸出：
```prompt [label="預期輸出"]
g5h6i7j (HEAD -> main, origin/main) feat: 新增聯絡方式頁面
f3d4e5f feat: 新增關於我們頁面
a1b2c3d feat: 初始化專案，建立首頁框架
```

## 完整流程回顧

[summary]
- **版本控制基礎** | git init、add、commit 建立本地存檔點，用 log 和 diff 查看歷史
- **遠端協作** | git remote 連接 GitHub，push 上傳、pull 同步，讓程式碼存在雲端
- **分支策略** | 每個功能開一個分支，開發完再 merge，main 永遠保持乾淨可用
- **Pull Request** | Fork → branch → PR → Review → Merge，這是開源與團隊協作的標準流程
[/summary]

## 小測驗：檢驗你的 Git 基礎知識

完成本課程後，試試看你能答對幾題：

[quiz type="single"]
Q: 以下哪個指令會將改動加入「暫存區」（staging area）？
- [ ] git commit
- [x] git add
- [ ] git push
- [ ] git status
Hint: 這個指令的比喻是「把東西放進行李箱」。
[/quiz]

[quiz type="bool"]
Q: `git commit` 會自動把改動上傳到 GitHub 嗎？
- [ ] 是
- [x] 否
Hint: commit 只是在本地建立存檔點，上傳需要另一個指令。
[/quiz]

[quiz type="single"]
Q: 在分支上開發完成後，用哪個指令把分支合併回 main？
- [ ] git checkout main
- [x] git merge <branch-name>
- [ ] git pull <branch-name>
- [ ] git add main
Hint: 這個指令的字面意思是「合併」。
[/quiz]

[quiz type="single"]
Q: 當推送被拒絕，提示「remote contains work that you do not have locally」，正確的解法是？
- [x] 先執行 git pull，再執行 git push
- [ ] 執行 git push --force 強制推送
- [ ] 執行 git reset --hard 重置本地
- [ ] 關閉 Terminal 重試
Hint: 遠端有你本地沒有的 commit，你需要先把它們拉下來。
[/quiz]

## 常見問題 FAQ

以下是一些學員常問的問題，點擊展開查看答案：

[accordion]
[item title="merge 和 rebase 有什麼不同？" open]
兩者都是用來合併分支，但歷史記錄的呈現方式不同：

- **git merge**：保留完整的分支歷史，會產生一個「merge commit」。適合團隊協作，因為保留了真實的開發過程。
- **git rebase**：將分支的 commit「重新播放」到目標分支上，歷史呈現線性。適合個人分支整理歷史，但**不應該在共用分支使用**，因為會改寫歷史。

初學者建議：先用 merge，熟悉 Git 後再學習 rebase。
[/item]
[item title="什麼情況下會用到 git push --force？"]
`git push --force` 會用本地的歷史**覆蓋**遠端的歷史。常見場景：

- 你在個人分支上使用 `git rebase` 整理了 commit，需要強制推送更新
- 你不小心 commit 了敏感資料（密碼、token），需要用 `git reset` 退回

**警告：絕對不要在 main 或團隊共用的分支上使用 --force**，因為會丟失別人的 commit。
[/item]
[item title="commit 後發現訊息寫錯，可以修改嗎？"]
可以。使用以下指令修改最後一個 commit 的訊息：

```prompt [label="修改最新 commit 訊息"]
git commit --amend -m "新的正確訊息"
```

注意：這只會修改**最後一個** commit。如果要修改更早的，需要使用 `git rebase -i`（進階操作）。
[/item]
[item title="不小心 commit 到 main 分支，應該要開分支的怎麼辦？"]
如果 commit 還沒有 push，可以用以下步驟補救：

1. 建立新分支並保留目前的改動：`git branch feature/my-work`
2. 退回 main 分支到 commit 之前：`git reset --hard HEAD~1`
3. 切換到新分支繼續工作：`git checkout feature/my-work`

如果已經 push 到遠端，請聯繫團隊成員協助處理，不要自行 reset。
[/item]
[item title=".gitignore 是什麼？為什麼需要它？"]
`.gitignore` 是一個設定檔，告訴 Git「哪些檔案不要追蹤」。常見應該忽略的檔案：

- 編譯產物（`__pycache__/`、`*.pyc`、`dist/`）
- 環境變數和密鑰（`.env`、`*.key`）
- 作業系統產生的隱藏檔案（`.DS_Store`、`Thumbs.db`）
- 編輯器暫存檔（`.vscode/`、`.idea/`）

在專案根目錄建立 `.gitignore` 檔案，一行寫一個要忽略的檔名或 pattern。
[/item]
[/accordion]

> **本節學會了什麼**
> 完整走過了一次真實的團隊協作流程：建立專案、分工開發、提交 PR、Code Review、合併主線、同步最新版本。這八個步驟是每一位軟體工程師每天在做的事，從今天起你也掌握了這套能力。

