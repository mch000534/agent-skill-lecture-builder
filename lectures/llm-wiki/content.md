# 入門導向：什麼是 LLM Wiki
> 本章用一般學員也能理解的方式，建立 LLM Wiki 的基本概念：它不是另一個聊天機器人，而是一套讓知識持續累積的工作方法

## 知識管理工具演進

[timeline]
- 2000s | 傳統 Wiki（MediaWiki） | 企業內部文件協作，需要專門維護人員
- 2010s | Notion / Confluence | 富文本協作平台，但知識結構由平台鎖定
- 2018 | Obsidian / Logseq | Markdown + 本地優先 + 雙向連結，知識屬於使用者
- 2023 | LLM + 知識庫 | AI 協助閱讀、整理、交叉連結，但缺乏制度容易失真
- 2025 | LLM Wiki 工作法 | 結合 Markdown 本機檔案、AI Agent 流程與治理規則
[/timeline]

## 從一次性問答到長期知識庫

### 為什麼光靠聊天不夠
- 一次對話很容易得到漂亮答案，但下次提問又要重新解釋背景
- 聊天紀錄通常是線性的，很難看出概念之間的關係
- 團隊換人、專案延續、研究累積時，需要的是可查找、可更新、可追溯的知識資產
- LLM Wiki 把 AI 的輸出從「即時回答」轉成「可維護的知識頁面」

[compare label-left="一般 LLM 問答" label-right="LLM Wiki 工作法"]
- 每次從零開始問 | 先讀既有 wiki，再補充新知識
- 答案留在聊天紀錄 | 重點整理成 Markdown 頁面
- 很難知道資料來源 | 每個頁面保留來源與更新日期
- 個人臨時使用 | 團隊可以共同維護與檢查
[/compare]

> **LLM Wiki 的重點不是把所有資料塞進 AI**
> 它的重點是讓 AI 幫你把資料整理成可閱讀、可連結、可長期維護的知識結構。
>
> 這種方式比單次 RAG 更像「有編輯制度的知識庫」：資料被消化、命名、分類、交叉引用，而不是每次查詢才臨時拼湊。

[callout type="warning" title="注意：不是所有資料都適合收錄"]
LLM Wiki 強調「有門檻地收錄」。路過提到一次的名詞不需要建頁，低品質或不確定的來源應暫緩收錄。知識庫的價值不在數量，而在可信度與可維護性。
[/callout]

### 一句話定義
[tags]
- [green] LLM Wiki：由 AI 協助維護的互連 Markdown 知識庫
- [blue] 核心格式：資料來源、概念頁、實體頁、比較頁、索引與更新紀錄
- [orange] 使用前提：人類決定哪些來源值得收錄，AI 協助整理與交叉連結
- [purple] 最大風險：若不保留來源與更新紀錄，wiki 會變成看似可信的二手傳聞
[/tags]

## 課程地圖與三種學習視角

### 240 分鐘課程結構
[flow]
1. 入門理解 — 了解 LLM Wiki 是什麼、解決什麼問題
2. 結構設計 — 認識資料夾、頁面類型、frontmatter、索引與 log
3. 實作建立 — 用 Markdown、Obsidian 與 AI Agent 建立第一個 wiki
4. 維護流程 — 練習 ingest、query、lint 三個核心操作
5. 策略落地 — 針對教育、研究與知識管理團隊設計導入方案
6. 期末工作坊 — 小組建立一個可延續的 mini wiki
[/flow]

### 三種受眾會得到什麼
[summary]
- **入門學員** | 能用白話理解 LLM Wiki，知道它和聊天機器人、搜尋引擎、RAG 的差異
- **實作學員** | 能建立 Obsidian 相容的 Markdown wiki，使用 AI Agent 維護頁面、索引與 log
- **策略團隊** | 能設計導入規範、角色分工、品質檢查與教育研究情境的應用流程
[/summary]

[vote id="llm-wiki-starting-point" title="你最想用 LLM Wiki 解決哪一類問題？"]
- 個人學習筆記太分散
- 研究資料無法累積
- 團隊文件過時且難找
- 想讓 AI 更懂特定領域
[/vote]

---

# 結構導向：LLM Wiki 的基本架構
> 先理解資料夾與頁面分工，才能避免把 wiki 做成一堆互不相干的 Markdown 檔案

## 三層架構

### Layer 1：Raw Sources 原始資料層
- 原始資料層存放文章、論文、訪談逐字稿、會議紀錄與圖片
- 原始資料原則上不可修改，因為它是日後追溯的依據
- 每份來源應該保留來源網址、收錄日期與內容雜湊值
- AI 可以閱讀 raw 資料，但不應直接覆寫 raw 資料

### Layer 2：Wiki Pages 知識頁層
- 實體頁：人物、組織、產品、模型、工具
- 概念頁：方法、理論、流程、技術名詞
- 比較頁：兩種工具、兩種方法、兩個觀點的結構化比較
- 查詢頁：值得保存的深度問答或研究綜述

### Layer 3：Schema 制度層
- `SCHEMA.md` 定義命名規則、頁面格式、標籤分類與建立門檻
- `index.md` 是所有頁面的目錄與摘要
- `log.md` 記錄每次新增、更新、查詢與檢查
- 這一層讓 wiki 不只是一堆檔案，而是一個有治理規則的系統

```prompt [label="建議資料夾結構"]
wiki/
├── SCHEMA.md
├── index.md
├── log.md
├── raw/
│   ├── articles/
│   ├── papers/
│   ├── transcripts/
│   └── assets/
├── entities/
├── concepts/
├── comparisons/
└── queries/
```

[callout type="tip" title="實用技巧：先求能跑再求完整"]
不需要一開始就建立所有資料夾。如果某個類別（如 `comparisons/`）暫時沒有內容，可以晚點再建。重要的是先有 `SCHEMA.md`、`index.md`、`log.md` 三個核心檔案，以及 `raw/` 和至少一種頁面目錄。
[/callout]

> **結構是給未來的自己看的**
> 一開始多建立幾個資料夾看似麻煩，但三個月後你會感謝它。
>
> 沒有結構的資料庫只會越來越像雜物房；有結構的 wiki 才能讓 AI 和人類都快速找到上下文。

## 頁面格式與命名規則

### Frontmatter 是頁面的身份證
```prompt [label="概念頁 frontmatter 範例"]
---
title: Retrieval-Augmented Generation
created: 2026-05-24
updated: 2026-05-24
type: concept
tags: [retrieval, knowledge-base, llm]
sources: [raw/articles/rag-overview.md]
confidence: medium
---
```

### 一頁好的 wiki page 應該包含
[flow]
1. 定義 — 用 2 到 4 句話講清楚這是什麼
2. 重點事實 — 列出已知事實、日期、角色或限制
3. 來源 — 說明資訊來自哪份 raw source
4. 交叉連結 — 連到至少兩個相關頁面
5. 開放問題 — 記錄尚未確定或需要補充的地方
[/flow]

### 建立頁面的門檻
[tags]
- [green] 建立頁面：一個概念在多個來源出現，或是某份來源的核心主題
- [blue] 更新頁面：新來源補充了既有頁面的內容
- [orange] 暫不建立：只是路過提到一次的名詞
- [purple] 拆分頁面：單頁超過約 200 行，或同時涵蓋太多子題
[/tags]

### LLM Wiki 核心名詞

[dl]
- Raw Source | 原始資料，包含文章、論文、訪談等，原則上不可修改，作為追溯依據
- Wiki Page | 由 AI 協助整理的知識頁，分為實體頁、概念頁、比較頁、查詢頁
- SCHEMA.md | 制度檔，定義命名規則、頁面格式、標籤分類與建立門檻
- Ingest | 將原始來源收錄進 wiki 的流程：讀制度、查既有、建頁面、更索引
- Query | 基於 wiki 內容回答問題，並有價值時保存為查詢頁的流程
- Lint | 定期健康檢查，找出壞連結、孤兒頁、缺欄位等品質問題
- Wikilinks | 用 `[[page-name]]` 語法連結頁面，形成知識網路
- Confidence | 信心等級，標記該頁面的可信程度（high / medium / low）
[/dl]

[quiz type="single"]
Q: 為什麼 raw/ 目錄中的原始資料通常不應該被 AI 直接修改？
- [ ] 因為 Markdown 不能放在 raw/ 裡
- [x] 因為 raw/ 是追溯來源的依據，應保持不可變
- [ ] 因為 Obsidian 無法讀取 raw/ 目錄
Hint: 想想日後如果 wiki 頁面出現錯誤，要回頭查哪一份材料。
[/quiz]

[quiz type="bool"]
Q: LLM Wiki 的大小就是它的價值嗎？頁面越多越好？
- [ ] 是
- [x] 否
Hint: 想想 lint 章節提到的「信任」問題。
[/quiz]

---

# 實作導向：建立第一個 LLM Wiki
> 本章面向會用 AI Agent、Obsidian 或 Markdown 的學員，帶你從空資料夾建立可運作的 wiki

## 環境準備

### Wiki 搭建進度

[steps-status]
- [done] 理解 LLM Wiki 概念 | 了解三層架構與頁面類型
- [doing] 建立資料夾與核心檔案 | 初始化 wiki/ 目錄、SCHEMA.md、index.md、log.md
- [todo] 第一次 Ingest | 收錄來源、建立概念頁
- [todo] 設定 Query 流程 | 練習從 wiki 產生可追溯回答
- [todo] 執行 Lint 檢查 | 檢查壞連結、孤兒頁、frontmatter 完整性
[/steps-status]

### 你需要的工具
- 一個可編輯 Markdown 的工具：VS Code、Obsidian 或任何文字編輯器
- 一個 AI Agent：可以讀寫檔案、搜尋資料夾、執行基本指令
- 一個明確的 wiki 主題：例如「生成式 AI 教學資源」、「館內展覽知識庫」、「研究文獻整理」
- 一個版本控制方式：Git 或至少定期備份

```prompt [label="建立資料夾"]
mkdir -p ~/wiki/raw/{articles,papers,transcripts,assets}
mkdir -p ~/wiki/{entities,concepts,comparisons,queries}
cd ~/wiki
```

### 建立三個核心檔案
```prompt [label="初始化核心檔案"]
touch SCHEMA.md index.md log.md
```

[flow]
1. `SCHEMA.md` — 寫下 wiki 的主題、規則、頁面格式與標籤分類
2. `index.md` — 建立 Entities、Concepts、Comparisons、Queries 四個區塊
3. `log.md` — 記錄初始化時間、建立者與後續每次更新
[/flow]

### SCHEMA 的最小內容
```prompt [label="SCHEMA.md 最小版"]
# Wiki Schema

## Domain
本 wiki 收錄生成式 AI 教學、工具使用、案例與風險管理相關知識。

## Conventions
- 檔名使用 lowercase-kebab-case
- 每個 wiki page 必須有 YAML frontmatter
- 每個新頁面至少連到 2 個相關頁面
- 新頁面必須加入 index.md
- 每次操作必須追加到 log.md

## Tag Taxonomy
- ai-literacy
- teaching
- llm
- agent
- knowledge-management
- risk
- workflow
```

## 第一次 Ingest：把來源變成知識頁

### Ingest 的基本流程
[flow]
1. 保存 raw source — 將原文存入 `raw/articles/` 或適合的來源資料夾
2. 檢查既有頁面 — 讀 `index.md`，搜尋是否已有相關概念或實體
3. 建立或更新頁面 — 把來源中的重點整理成概念頁或實體頁
4. 加上 wikilinks — 用 `[[page-name]]` 連到相關頁面
5. 更新 index 與 log — 讓日後可以找到這次變更
[/flow]

```prompt [label="給 AI Agent 的 ingest 指令範例"]
請把 raw/articles/llm-wiki-intro.md 收錄進這個 wiki。
先讀 SCHEMA.md、index.md、log.md。
接著判斷需要建立哪些 concept 或 entity pages。
每個新頁面都要有 frontmatter、至少 2 個 wikilinks，並更新 index.md 與 log.md。
不要修改 raw/ 裡的原始檔。
```

> **不要要求 AI 直接「整理一下」**
> 「整理一下」會得到一份漂亮但不可維護的摘要。
>
> 在 LLM Wiki 工作法中，你要明確要求 AI：先讀制度檔、保存來源、檢查既有頁面、更新索引、寫入 log。流程比單次摘要更重要。

### 第一個概念頁範例
```prompt [label="concepts/llm-wiki.md"]
---
title: LLM Wiki
created: 2026-05-24
updated: 2026-05-24
type: concept
tags: [llm, knowledge-management, workflow]
sources: [raw/articles/llm-wiki-intro.md]
confidence: medium
---

# LLM Wiki

LLM Wiki 是一種由 AI Agent 協助維護的 Markdown 知識庫工作法。
它把來源資料整理成可交叉連結、可追溯、可更新的概念頁與實體頁。

## Why It Matters
- 相比單次聊天，LLM Wiki 更適合長期研究與團隊知識累積
- 相比把所有資料交給 RAG，LLM Wiki 會先把知識結構化
- 相比傳統文件庫，LLM Wiki 更重視頁面之間的關係

## Related
- [[knowledge-management]]
- [[ai-agent-workflow]]
```

[quiz type="single"]
Q: Ingest 流程中，建立或更新頁面之前應該先做哪件事？
- [ ] 直接把來源全文貼到 concepts/ 目錄
- [x] 讀取 index.md 並搜尋是否已有相關頁面
- [ ] 先刪除 log.md 避免內容太長
Hint: 目標是避免重複建立同一個概念的多個頁面。
[/quiz]

---

# 維護導向：Query、Lint 與品質控管
> Wiki 建立起來只是開始，真正的價值來自持續查詢、修正與品質檢查

## Query：從 wiki 產生可追溯回答

### 查詢前的三個動作
- 先讀 `index.md`，判斷可能相關的頁面
- 對大型 wiki 使用全文搜尋，避免只靠目錄漏掉內容
- 讀取相關頁面後再綜合回答，並在回答中引用頁面名稱

```prompt [label="查詢指令範例"]
請根據這個 wiki 回答：LLM Wiki 和 RAG 的差異是什麼？
先讀 index.md，搜尋 rag、knowledge base、llm wiki。
回答時請引用你使用的頁面名稱。
如果這個回答值得保存，請建立 queries/llm-wiki-vs-rag.md，並更新 index.md 與 log.md。
```

[compare label-left="一般 AI 回答" label-right="Wiki-based 回答"]
- 可能引用模型記憶或即時推測 | 明確引用 wiki 內的頁面與來源
- 回答完就消失在對話中 | 有價值的回答可保存到 queries/
- 下次問相同問題仍需重做 | 下次可直接讀已整理的查詢頁
- 難以發現知識缺口 | 可把缺口寫入頁面的 Open Questions
[/compare]

### 何時把查詢結果存回 wiki
[tags]
- [green] 保存：跨多頁綜合、比較分析、研究結論、教學可重用內容
- [blue] 更新：答案補充了既有概念頁或比較頁
- [orange] 不保存：單純查某個定義、一次性操作說明
- [purple] 需要標記：信心不足、資料來源單一、或涉及快速變動資訊
[/tags]

## Lint：讓 wiki 不會悄悄腐爛

### 需要定期檢查的問題
[flow]
1. Orphan pages — 沒有任何頁面連到它的孤兒頁
2. Broken wikilinks — `[[link]]` 指向不存在的頁面
3. Index completeness — 有頁面存在但沒有列在 index.md
4. Frontmatter validation — 缺 title、type、tags、sources 等欄位
5. Tag audit — 使用了 SCHEMA 沒定義的標籤
6. Page size — 單頁過長，需要拆分
7. Source drift — raw source 的內容雜湊值不一致
[/flow]

```prompt [label="lint 指令範例"]
請對這個 wiki 做一次健康檢查。
檢查 broken wikilinks、orphan pages、index 是否完整、frontmatter 是否缺欄位、tags 是否都在 SCHEMA.md 中定義。
請按照嚴重程度輸出報告，並把本次 lint 寫入 log.md。
先不要自動修改檔案，除非我確認。
```

> **Wiki 不是越大越好，而是越可信越好**
> 如果一個 wiki 裡有大量孤兒頁、壞連結、未知來源與過時頁面，它反而會降低團隊信任。
>
> 定期 lint 的目的不是追求完美，而是讓知識庫保持可導航、可追溯、可修復。

### 品質控管清單
- [x] 新增頁面前先檢查是否已有相同概念
- [x] 新增頁面後加入 index.md
- [x] 每次操作都更新 log.md
- [x] 重要結論保留來源或信心等級
- [x] 定期檢查壞連結與孤兒頁

[reveal title="最佳實踐：如何建立高品質的 wiki 頁面"]
- **一頁一事**：每個頁面只討論一個概念或實體，避免變成萬用雜燴
- **交叉連結優先**：新頁面建立時，至少連到 2 個既有頁面，讓知識形成網路而非孤島
- **保留不確定性**：用 `confidence` 欄位標記信心等級，低信心頁面更值得被審查
- **定期回顧**：每月花 30 分鐘 lint 一次，比堆積 100 個壞問題好處理
- **人類把關**：AI 負責整理格式、檢查連結、生成草稿；人類負責判斷哪些值得收錄、哪些需要更新
[/reveal]

---

# 策略導向：教育、研究與團隊導入
> LLM Wiki 不只是個人工具，也可以成為教育機構、研究小組與知識密集團隊的共同記憶系統

## 教育場景

### 教育 vs 研究 vs 團隊：場景比較

[compare-table headers="教育場景 | **研究場景** | 團隊場景"]
- 主要目標 | 教學資料累積 | 文獻與方法追蹤 | 決策與經驗沉澱
- 使用者 | 老師與學生 | 研究員與教授 | 專案成員
- 更新頻率 | 每學期整理 | 每週或每篇論文後 | 每個里程碑後
- 關鍵頁面 | queries/ 高品質問答 | comparisons/ 方法比較 | 決策紀錄與案例
- 治理角色 | 老師審核 | 研究助理或 PI | 知識管理負責人
[/compare-table]

### 老師與課程設計者可以怎麼用
- 把課程資料、學生常見問題、案例、延伸閱讀整理成可查詢的教學知識庫
- 每次授課後把新問題與補充資料寫回 wiki，讓課程逐年變好
- 用概念頁整理核心知識，用 queries/ 保存高品質問答
- 用 log.md 追蹤課程內容每次更新的原因

### 學員可以怎麼用
[flow]
1. 課前 — 收錄預習材料，建立關鍵概念頁
2. 課中 — 將討論問題記錄為 raw/transcripts 或 queries
3. 課後 — 把筆記整理成概念頁，補上來源與相關連結
4. 複習 — 從 index.md 或圖譜視角回看概念關係
[/flow]

[vote id="llm-wiki-education-use" title="如果用在課程中，你最想先建立哪一種 wiki？"]
- 課程講義與補充資料 wiki
- 學生問答與常見錯誤 wiki
- 專題研究資料 wiki
- 校內教學資源共用 wiki
[/vote]

## 研究場景

### 文獻閱讀的痛點
- PDF 很多，但讀完後只剩零散標註
- 相同概念在不同論文中命名不一致
- 研究假設、反例、方法比較很難跨文獻追蹤
- 新成員加入時，需要重新口頭講解整個脈絡

### LLM Wiki 的研究流程
[flow]
1. 收錄來源 — 把論文 PDF、摘要、訪談或實驗紀錄放入 raw/
2. 抽取概念 — 建立方法、資料集、模型、限制與爭議頁面
3. 建立比較 — 將方法差異整理到 comparisons/
4. 保存查詢 — 將文獻綜述、研究問題分析存入 queries/
5. 定期審核 — 標記低信心或有衝突的頁面
[/flow]

```prompt [label="研究 wiki 指令範例"]
請閱讀 raw/papers/ 內新加入的三篇論文摘要。
找出共同出現的方法、資料集與限制。
如果已有相關頁面，更新它們；若沒有，依 SCHEMA.md 的門檻建立新頁面。
請建立一份 comparisons/methods-for-domain-adaptation.md，比較三篇論文的方法差異。
所有新頁面都要加入 index.md，並更新 log.md。
```

## 團隊知識管理場景

### 導入前要先決定的事
[tags]
- [green] Domain：這個 wiki 到底收錄什麼，不收錄什麼
- [blue] Roles：誰負責提供來源，誰審核重要頁面，誰定期 lint
- [orange] Cadence：每週、每月或每個專案里程碑後更新
- [purple] Governance：低信心頁面、衝突資訊、過時內容如何處理
[/tags]

### 團隊導入路線圖
[flow]
1. 選一個窄題目 — 不要一開始就做全公司知識庫
2. 設計 SCHEMA — 明確頁面類型、標籤、命名與建立門檻
3. 收錄 10 到 20 份高價值來源 — 先求品質，不求數量
4. 建立示範頁面 — 做出 5 到 10 個可參考的好頁面
5. 設定更新節奏 — 每週 ingest、每月 lint、每季整理架構
6. 訓練使用者提問 — 讓團隊知道如何查 wiki、如何回饋缺口
[/flow]

> **先做一個可信的小 wiki，再擴大**
> 很多知識管理專案失敗，是因為一開始就想整理所有東西。
>
> LLM Wiki 的導入應該從窄領域開始：一門課、一個研究題目、一個專案、一個工具鏈。當小 wiki 真的有用，團隊自然會願意擴展。

[quiz type="single"]
Q: 團隊導入 LLM Wiki 時，最適合的第一步是什麼？
- [ ] 立刻把所有公司文件全部倒進 raw/
- [x] 選一個窄題目，先建立可信的小型 wiki
- [ ] 先規定所有人每天必須寫 10 頁 wiki
Hint: 知識管理要先建立信任與使用習慣，再擴大範圍。
[/quiz]

---

# 工作坊：建立可延續的 Mini Wiki
> 最後一章把概念、實作與策略整合起來，讓學員完成一個能繼續使用的小型 LLM Wiki

## 分組任務

### 選題建議
- 一門課的補充資料 wiki
- 一個研究主題的文獻 wiki
- 一個 AI 工具的使用手冊 wiki
- 一個展覽或教育活動的知識庫
- 一個團隊專案的決策紀錄 wiki

### 90 分鐘工作坊流程
[flow]
1. 10 分鐘 — 選題與定義 Domain
2. 15 分鐘 — 撰寫 SCHEMA.md 的最小版本
3. 20 分鐘 — 收錄 2 到 3 份 raw sources
4. 25 分鐘 — 建立 3 到 5 個概念頁或實體頁
5. 10 分鐘 — 更新 index.md 與 log.md
6. 10 分鐘 — 小組互查壞連結與頁面品質
[/flow]

```prompt [label="工作坊總指令範本"]
你是一位 LLM Wiki 維護助手。
請先讀 SCHEMA.md、index.md、log.md。
我們的 wiki domain 是：生成式 AI 教學資源。
請協助收錄 raw/articles/ 內的新資料，建立或更新必要的 concepts/ 與 entities/ 頁面。
每個頁面必須有 frontmatter、至少 2 個 wikilinks、sources 欄位。
完成後更新 index.md 與 log.md，最後列出你建立與修改的檔案。
```

## 成果檢核

### Mini Wiki 完成標準
- [x] 有清楚的 `SCHEMA.md`，描述 domain、命名規則與標籤分類
- [x] 有 `index.md`，至少列出 3 個頁面與一句話摘要
- [x] 有 `log.md`，記錄初始化與本次 ingest
- [x] 至少 2 份 raw source 被保留在 raw/ 目錄
- [x] 至少 3 個 wiki pages 具備 frontmatter 與 sources
- [x] 每個 wiki page 至少有 2 個 wikilinks 或明確說明為何暫時沒有

### 小組展示問題
[flow]
1. 你們的 wiki domain 是什麼？什麼內容不收錄？
2. 你們建立了哪些頁面？為什麼值得建立？
3. 哪一個頁面最有價值？它連到哪些其他頁面？
4. 目前最大的缺口或低信心內容是什麼？
5. 如果下週繼續維護，第一個要 ingest 的來源是什麼？
[/flow]

> **工作坊真正的成果不是檔案數量**
> 真正的成果是學員能說清楚：這個 wiki 的範圍是什麼、頁面為什麼存在、來源在哪裡、下一步該補什麼。
>
> 只要這四件事清楚，wiki 就有延續的可能。

[quiz type="single"]
Q: 建立新 wiki 頁面時，至少應該連到幾個相關頁面？
- [ ] 不需要連到任何頁面
- [x] 至少 2 個相關頁面
- [ ] 至少 10 個相關頁面
Hint: 參考 SCHEMA.md 最小版的 Conventions 規則。
[/quiz]

---

# 常見問題

## LLM Wiki 常見疑問

[accordion]
[item title="LLM Wiki 和一般用 ChatGPT 整理筆記有什麼不同？" open]
ChatGPT 的輸出停留在對話紀錄，缺乏結構化管理、交叉連結與追溯機制。LLM Wiki 則是把 AI 輸出轉成有 frontmatter、有來源連結、有索引目錄的 Markdown 檔案，可以長期維護。
[/item]
[item title="需要學會使用 Obsidian 嗎？"]
不需要。Obsidian 只是可選的閱讀工具。LLM Wiki 的核心是純 Markdown 檔案，任何文字編輯器（VS Code、Notepad++、甚至系統內建編輯器）都能開啟。Obsidian 的好處是內建圖譜視圖與 wikilinks 支援，但非必要。
[/item]
[item title="raw/ 裡可以放 PDF 或圖片嗎？"]
可以。`raw/` 存放所有原始資料，包含 PDF、圖片、錄音檔等。AI Agent 可以閱讀文字類型的檔案（Markdown、TXT），對於 PDF 或圖片可能需要先轉成文字再收錄。
[/item]
[item title="wiki 越來越大的時候會變慢嗎？"]
由於是純本地 Markdown 檔案，不會有資料庫查詢延遲。但頁面太多時，AI Agent 需要更有效率的搜尋策略（如 `grep` 全文搜尋而非逐頁讀取）。建議每 50-100 頁做一次架構回顧，確認分類是否仍合理。
[/item]
[item title="如何處理衝突的資訊來源？"]
在 wiki 頁面中同時保留兩種觀點，並各自標註來源。可以用 `confidence: low` 標記該頁面，並在「開放問題」區段說明衝突點。比較頁（`comparisons/`）也很適合用來結構化地呈現兩種立場。
[/item]
[/accordion]

---

# 總結：把知識變成可維護的系統
> LLM Wiki 的價值不在於一次整理多少資料，而在於建立一套讓知識持續變好的流程

[summary]
- **入門理解** | LLM Wiki 把一次性問答轉化為可追溯、可更新、可連結的知識庫
- **結構設計** | Raw sources、wiki pages、SCHEMA、index、log 共同構成可維護的三層架構
- **實作建立** | 透過 Markdown、Obsidian 與 AI Agent，可以從空資料夾建立第一個可運作的 wiki
- **維護品質** | Query、ingest、lint 是讓 wiki 持續可信的三個核心操作
- **策略落地** | 教育、研究與團隊導入都應從窄領域、小規模、高信任的 wiki 開始
- **工作坊成果** | 一個好的 mini wiki 必須能說清楚範圍、來源、頁面理由與下一步
[/summary]

[tags]
- [green] 下一步：選一個窄主題，建立 SCHEMA.md
- [blue] 下一步：收錄 2 到 3 份高價值來源
- [orange] 下一步：讓 AI Agent 依流程建立第一批頁面
- [purple] 下一步：每月做一次 lint，保持 wiki 健康
[/tags]
