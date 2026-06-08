# 觀念：什麼是 Vibe Coding？
> 用自然語言驅動程式碼生成——你描述「要做什麼」，AI 負責「怎麼寫」。

### 傳統寫爬蟲 vs Vibe Coding

[compare label-left="傳統寫法" label-right="Vibe Coding"]
- 查文件找正確 API | 直接用白話文告訴 AI 你要做什麼
- 逐行思考語法細節 | 描述需求，審查並測試 AI 產出
- 卡關自己翻 Stack Overflow | 把錯誤訊息貼給 AI，一起解決
- 技能核心：記住語法 | 技能核心：精準描述問題、驗證結果
[/compare]

> **Vibe Coding 不是把程式外包給 AI，而是和 AI 結對程式設計**
> 你仍然需要理解程式在做什麼，才能判斷 AI 的輸出是否正確。爬蟲特別適合這個模式——每個網站結構都不同，與其死記 selector，不如讓 AI 分析 HTML 再告訴你怎麼取。

### 為什麼爬蟲特別適合 Vibe Coding？

[tags]
- [green] HTML 可以直接貼給 AI，讓它找出正確的 CSS 選擇器
- [blue] 錯誤訊息格式固定，AI 幾乎都能直接給出修正方案
- [orange] 每個網站的結構獨特，Vibe Coding 比死記語法更有彈性
- [purple] 爬蟲邏輯重複性高（取資料、翻頁、存檔），AI 很擅長生成這類樣板
[/tags]

### Vibe Coding 工程師的核心能力轉變

[compare label-left="以前重要的技能" label-right="Vibe Coding 時代更重要的技能"]
- 記住 BeautifulSoup 的各種參數 | 清楚描述「我要從哪裡取什麼資料」
- 手寫翻頁迴圈邏輯 | 提供 URL 規律給 AI，讓它生成翻頁邏輯
- 查文件找例外處理方式 | 把真實錯誤訊息貼給 AI，描述預期行為
- 自己找 CSS 選擇器 | 複製 HTML 給 AI，讓它找出最穩健的選擇器
[/compare]

```prompt [label="Vibe Coding 的一次完整互動範例"]
學員：我有一個 HTML，裡面書名被截斷了：
      <a href="catalogue/..." title="A Light In The Attic">A Light In ...</a>
      我要取完整書名，要用哪個屬性？

Gemini：應取 title 屬性而非 a 的文字內容，
        用 article.h3.a["title"] 即可取到完整書名。

學員執行後：確認輸出 "A Light In The Attic"，正確。
```

[vote id="v1" title="你現在是怎麼寫爬蟲的？"]
- 完全自己寫，不用 AI
- 偶爾問 AI，但大部分自己寫
- 大量依賴 AI，但有時看不懂它產出的程式碼
- AI 幫我產出，我負責測試和調整
[/vote]

### 開始之前：確認你的工具

- [x] 開啟 gemini.google.com，確認可以正常對話
- [x] 在 Gemini 貼入以下句子，確認它能回應：
      「我想學習爬蟲，我已有 Python 基礎，請給我一句鼓勵」
- [x] 開啟 colab.research.google.com，確認可以新增 Notebook 並執行儲存格

---

# 工具：建立你的 AI 爬蟲環境
> 選對工具，讓 AI 能看到你的程式碼、執行結果和錯誤——上下文越完整，AI 的協助越精準。

## 工具選擇：哪種 AI 適合爬蟲？

### 對話式 vs 整合式 AI

[compare label-left="對話式 AI（gemini.google.com）" label-right="整合式 AI（Colab + Gemini）"]
- 需手動複製貼上程式碼與輸出 | 直接在 Colab 執行，AI 能看到輸出結果
- 無法執行程式碼 | 可在同一介面執行、觀察、修正
- 適合一次性提問 | 適合持續開發與迭代流程
- 無需安裝 | 開啟瀏覽器即可使用，無需本機環境
[/compare]

> **爬蟲開發首選 Colab + Gemini**
> 爬蟲常常要「執行 → 看輸出 → 修正 → 再執行」。Colab 讓你在瀏覽器直接執行 Python，搭配 Gemini 提問，不需要複製貼上、不需要本機安裝套件。

### 本課程使用 Google Colab + Gemini

[flow]
開啟 colab.research.google.com（登入 Google 帳號）
新增 Notebook，點選右上角「連線」取得執行環境
在儲存格執行 pip install requests beautifulsoup4 pandas
點選右側 Gemini 圖示開啟 AI 側邊欄
描述需求，取得程式碼後貼入儲存格執行
[/flow]

```terminal [label="Colab 儲存格：安裝爬蟲套件"]
!pip install requests beautifulsoup4 pandas
```

> **gemini.google.com 也可以並行使用**
> 在瀏覽器開兩個分頁：一個跑 Colab，一個開 Gemini 對話。把 Colab 的錯誤訊息或 HTML 貼到 Gemini，取得修正建議後再回到 Colab 執行。

## 環境準備：Colab 爬蟲工作區設定

### 在 Colab 安裝套件

Colab 的執行環境每次重新連線都會重置，第一個儲存格固定裝套件：

```terminal [label="Colab 儲存格 1：安裝套件"]
!pip install requests beautifulsoup4 pandas -q
```

### 開場白：告訴 Gemini 你的工作環境

每次開啟新的 Gemini 對話，先說明你的環境，能讓 AI 產出更合適的程式碼：

```prompt [label="Gemini 對話開場白範本"]
我正在用 Google Colab（Python 3.10）寫網路爬蟲，已安裝 requests、beautifulsoup4 和 pandas。
我想從 books.toscrape.com 爬取書名和價格，請幫我寫可以直接貼進 Colab 儲存格的程式碼。
```

### 給 AI 的三個必要資訊

[tags]
- [blue] 目標網站 URL：讓 AI 知道要爬哪裡
- [green] 想要的資料欄位：書名、價格、連結... 越具體越好
- [orange] 已有的程式碼：貼出現有程式碼，讓 AI 在此基礎上擴充
[/tags]

- [x] 開啟 colab.research.google.com，登入 Google 帳號
- [x] 新增 Notebook，在儲存格執行 `!pip install requests beautifulsoup4 pandas`
- [x] 開啟 Gemini 側邊欄或另開 gemini.google.com，準備好提問視窗

---

# 技巧：如何和 AI 協作寫爬蟲
> 給 AI 的資訊越具體，它產出的程式碼越能直接使用——這一章練的就是「如何問對問題」。

## 結構化 Prompt：六段式提問框架

### 為什麼要結構化提問？

隨意提問讓 AI 猜測意圖，結構化提問讓 AI 有完整上下文，直接給出可用答案：

[tags]
- [blue] 【角色】定義 AI 扮演的專家身份，讓它用對應角度思考
- [green] 【任務】說明你要 AI 做什麼，一次只做一件事
- [orange] 【背景】你的環境、已知條件、目前程式碼進度
- [purple] 【要求】輸出的具體限制、格式規格、邊界條件
- [blue] 【範例】一個輸入 + 預期輸出的具體例子，比說明更有效
- [green] 【輸出格式】程式碼、列點、表格... 期望的呈現方式
[/tags]

> **【範例】是六段中最有效的一段**
> 給 AI 一個具體的輸入 + 預期輸出，比寫三段說明更能讓它理解你的意圖。爬蟲場景中，HTML + 預期 dict 就是完美的一對範例。

### 六段式 vs 隨意提問的差距

[compare label-left="隨意提問" label-right="六段式結構化提問"]
- 「幫我寫 parse_book 函式」 | 【角色】定義專家身份 + 【背景】貼 HTML + 【範例】給預期輸出
- AI 猜測欄位和格式 | AI 直接產出符合規格的函式
- 常需要 2–3 輪修正 | 通常第一輪就能用
- 不知道哪裡說得不清楚 | 結構清晰，出錯容易定位原因
[/compare]

## 提供 HTML 上下文：讓 AI 找選擇器

### 為什麼要貼 HTML 給 AI？

- 爬蟲最常見的問題是「selector 找不到資料」，原因幾乎都是 HTML 結構和你想像的不同
- 直接把目標元素的 HTML 貼給 AI，讓它找出最穩健的選擇器，比自己猜快得多
- AI 看到真實 HTML 才能給出可執行的答案——描述「我想爬書名」不如貼 HTML 直接

```prompt [label="如何取得目標 HTML（DevTools 操作）"]
1. 在 Chrome 打開目標網頁
2. 右鍵點擊想爬的資料（如書名）→ 選「檢查」
3. 在 Elements 面板找到該元素
4. 右鍵該 HTML 行 → Copy → Copy outerHTML
5. 把複製的 HTML 貼到 AI 的對話框中
```

### 好的提問方式 vs 模糊的提問方式

[compare label-left="模糊提問（AI 容易猜錯）" label-right="具體提問（AI 直接給出可用答案）"]
- 「幫我爬 books.toscrape.com 的書名」 | 「以下是書籍 article 的 HTML，幫我用 select() 取出 title 屬性和價格（去掉 £）：[貼 HTML]」
- 「為什麼找不到元素？」 | 「`soup.find('p', class_='price')` 回傳 None，以下是實際 HTML，請找出正確的選擇器：[貼 HTML]」
- 「幫我加翻頁功能」 | 「URL 規律：第 1 頁是 /，第 2 頁起是 /catalogue/page-N.html，共 50 頁，請幫我加翻頁迴圈和 1 秒延遲：[貼程式碼]」
[/compare]

### 範例：套用六段式框架的提問

```prompt [label="六段式提問：從 HTML 到 parse 函式"]
【角色】你是一位熟悉 BeautifulSoup 的 Python 爬蟲工程師。

【任務】幫我寫一個 parse_book(article) 函式，從單一書籍 HTML 卡片中提取資料。

【背景】我在 Google Colab 上執行，已安裝 beautifulsoup4，Python 3.10。

【要求】
- 回傳 dict，包含 title、price（float）、rating（文字）、in_stock（bool）
- title 從 h3 > a 的 title 屬性取（不是 a 的文字，文字會被截斷）
- price 去掉 £ 符號後轉 float
- rating 取 p.star-rating 的第二個 class 值（如 "Three"）
- 每個欄位若取不到則回傳 None，不拋錯

【範例】
輸入 HTML：
<article class="product_pod">
  <p class="star-rating Three"></p>
  <h3><a href="catalogue/..." title="Soumission">Soumission</a></h3>
  <div class="product_price">
    <p class="price_color">£50.10</p>
    <p class="availability">In stock</p>
  </div>
</article>

預期輸出：
{"title": "Soumission", "price": 50.10, "rating": "Three", "in_stock": True}

【輸出格式】只輸出 Python 函式程式碼，不需要額外說明文字。
```

> **貼 HTML 是爬蟲 Vibe Coding 最重要的技巧**
> AI 看到實際 HTML 後幾乎不會猜錯 selector。不要用「我想爬 XX 欄位」這種描述，直接貼 HTML 讓 AI 分析。

## 處理錯誤：把報錯完整貼給 AI

### 爬蟲最常見的三種錯誤

[tags]
- [orange] AttributeError: NoneType：selector 找不到元素，貼 HTML 讓 AI 重新找
- [blue] HTTPError: 403 / 429：被封鎖，讓 AI 建議 Header 或延遲策略
- [purple] JSONDecodeError：回應不是 JSON，貼 response.text 讓 AI 診斷
[/tags]

```prompt [label="範例：把錯誤貼給 AI 修正"]
執行以下程式碼時出現錯誤，請幫我找出原因並修正：

程式碼：
price = soup.find("p", class_="price_color").text.strip()

錯誤訊息：
AttributeError: 'NoneType' object has no attribute 'text'

以下是出錯頁面的實際 HTML（從 DevTools 複製）：
<div class="product_price">
  <p class="price_color">£50.10</p>
</div>
```

### 讓 AI 加入防禦性程式碼

```prompt [label="AI 提示詞：要求加入錯誤處理"]
這個爬蟲在大部分書籍頁面正常，但某些頁面會出現 AttributeError。
請幫我為 parse_book() 函式加入防禦性程式碼：
1. 每個 find/select 都要處理回傳 None 的情況
2. 若取不到某欄位，用 None 代替，不要讓整個程式崩潰
3. 加入 try/except，失敗時 print 出問題的 URL
```

## 迭代改進：一步步擴充功能

### 爬蟲功能擴充的節奏

[flow]
Step 1：先讓單頁爬蟲正常運作（取到正確資料）
Step 2：讓 AI 加入翻頁邏輯（提供 URL 規律）
Step 3：讓 AI 加入錯誤處理和請求延遲
Step 4：讓 AI 加入資料清理（統一欄位格式）
Step 5：讓 AI 加入 pandas 輸出 CSV
[/flow]

> **每次只讓 AI 做一件事**
> 不要一次叫 AI「寫一個完整爬蟲，要有翻頁、錯誤處理、資料清理和 CSV 輸出」。先讓基本功能跑起來，再一步步擴充——每一步都容易驗證，出錯也容易定位。

[quiz type="single"]
Q: 爬蟲出現 `AttributeError: 'NoneType' object has no attribute 'text'`，最好的 AI 提問方式是？
- [x] 貼出錯誤訊息 + 出錯的程式碼行 + 對應的實際 HTML
- [ ] 直接問「為什麼會出現 AttributeError？」
- [ ] 問「BeautifulSoup 的 find() 什麼情況下會回傳 None？」
Hint: AI 需要具體的上下文才能給出可用的答案，光問概念無法幫你修正這段特定程式碼。
[/quiz]

### 練習：試著問 Gemini 一次

- [x] 打開 books.toscrape.com，右鍵點擊任一書名 → 「檢查」→ 在 Elements 面板右鍵 → Copy outerHTML
- [x] 把複製的 HTML 貼入 Gemini，問它「如何用 BeautifulSoup 取出完整書名」
- [x] 確認 Gemini 的回答中提到了 title 屬性，而非直接取 a 的文字

---

# 實戰：從 prompt 到完整爬蟲
> 完整走一遍 AI 輔助爬蟲的開發流程，從描述需求到產出 CSV，感受 Vibe Coding 的節奏。

## 任務說明：爬取 books.toscrape.com 前三頁

> **先跑 3 頁，再跑全部**
> 實戰時先設 total_pages=3 確認輸出正確，比一次跑 50 頁出錯再找原因節省時間。這是 Vibe Coding 迭代思維的體現：每次只驗證一小步，確認後再擴大規模。

### 給 AI 的初始需求描述

```prompt [label="六段式提問：完整爬蟲初始需求"]
【角色】你是一位熟悉 requests、BeautifulSoup 和 pandas 的 Python 爬蟲工程師。

【任務】幫我寫一個完整的爬蟲，爬取 books.toscrape.com 前三頁的書籍資料。

【背景】
- 執行環境：Google Colab，Python 3.10，已安裝 requests、beautifulsoup4、pandas
- URL 規律：第 1 頁 https://books.toscrape.com，
            第 2 頁起 https://books.toscrape.com/catalogue/page-N.html

【要求】
- 目標欄位：title（h3>a 的 title 屬性）、price（float，去掉 £）、
            rating（Five/Four/Three/Two/One）、in_stock（bool）
- 每頁請求後等待 1 秒（遵守爬蟲禮儀）
- 單頁失敗時 print 錯誤並跳過，不中斷整體執行
- 最後用 pandas 輸出 books.csv，編碼 utf-8-sig

【範例】
預期 CSV 前兩筆：
title,price,rating,in_stock
A Light In The Attic,51.77,Three,True
Tipping the Velvet,53.74,One,True

【輸出格式】輸出完整可執行的 Python 程式碼，包含所有 import，可直接貼入 Colab 儲存格執行。
```

## Vibe Coding 開發流程

[steps-status]
- [done] 描述需求 | 提供 URL、目標欄位、技術限制和輸出格式
- [done] 取得初稿 | AI 產出完整爬蟲程式碼
- [doing] 執行與驗證 | 在終端機執行，確認筆數和欄位格式正確
- [todo] 回饋修正 | 把執行結果（含不符預期的地方）貼回 AI
- [todo] 功能擴充 | 基礎功能確認後，再請 AI 加入新功能
[/steps-status]

### 執行後的常見狀況與對應 AI 提問

```prompt [label="狀況一：price 出現 Â£ 亂碼"]
執行後 price 欄位出現 Â£ 而不是 £，請幫我修正編碼問題。
目前程式碼取 price 的方式：
price_text = article.select_one(".price_color").text.strip()
price = float(price_text.replace("£", ""))
```

```prompt [label="狀況二：確認 AI 選擇器是否正確"]
執行後第一頁取到 20 本書，請幫我加一行 debug 輸出，
印出第一本書的完整 dict，讓我確認每個欄位的格式正確。
```

```prompt [label="狀況三：擴充到全部 50 頁"]
前三頁測試正常，現在請幫我改成爬全部 50 頁。
URL 規律：第 1 頁是 https://books.toscrape.com，
第 2 頁起是 https://books.toscrape.com/catalogue/page-N.html，共 50 頁。
```

## 驗收：確認 AI 產出的程式碼真的正確

### 用這個 checklist 驗證結果

- [x] 第一頁取到 20 本書（books.toscrape.com 每頁固定 20 本）
- [x] price 欄位是 float，不含 £ 符號
- [x] rating 欄位是文字（Five / Four / Three...），不是數字
- [x] CSV 用 Excel 開啟後，title 欄書名顯示正常（無亂碼）
- [x] 終端機每頁印出進度，確認沒有靜默跳過任何頁面

> **驗證是 Vibe Coding 中你最重要的工作**
> AI 產出的程式碼語法正確，不代表邏輯正確。「爬完 60 筆沒報錯」不等於「60 筆資料都正確」。每次執行後主動確認關鍵數值。

### 讓 AI 幫你交叉驗證結果

```prompt [label="讓 AI 確認輸出結果是否合理"]
爬蟲執行完畢，輸出前三筆如下：

title                    price  rating   in_stock
A Light In The Attic     51.77  Three    True
Tipping the Velvet       53.74  One      True
Soumission               50.10  One      True

請確認：
1. price 範圍合理嗎（books.toscrape.com 書價約 10–60 英鎊）？
2. rating 格式正確嗎（應為 Five/Four/Three/Two/One）？
3. 有沒有明顯的欄位對應錯誤？
```

---

# SuperPrompt：讓 AI 幫你寫更好的 Prompt
> 當你不確定怎麼描述需求，就讓 SuperPrompt 透過提問幫你釐清——它問，你答，它輸出。

## 什麼是 SuperPrompt？

### 兩階段智能提問架構

SuperPrompt 是一個 Gemini Gem（客製化 AI 角色），專門幫你把模糊想法轉化為專業 Prompt：

[compare label-left="自己寫 Prompt" label-right="用 SuperPrompt 輔助"]
- 需要自己知道如何結構化描述 | AI 透過提問引導你釐清需求
- 框架選擇靠自己判斷 | 自動從 10 大框架中挑最適配的
- 需要多輪修改才夠精準 | 第一輪就產出可直接使用的 Prompt
- 適合需求已清楚的情境 | 適合需求模糊或不知如何開口的情境
[/compare]

[flow]
Phase 1：頭腦風暴釐清（互動模式）
SuperPrompt 提出 1-3 個精確提問，挖掘你的真實需求
你回答後，SuperPrompt 評估是否已涵蓋 80% 核心元素
達成條件後，自動進入 Phase 2
Phase 2：框架自動適配（輸出模式）
從 10 大框架中自動選最適配的一個
輸出完整、專業、可直接複製的 Prompt
[/flow]

### 10 大框架速覽

[tags]
- [blue] CO-STAR 最通用：Context + Objective + Style + Tone + Audience + Response
- [green] ICIO 任務導向：Input + Context + Instruction + Output
- [orange] CRISPE 角色扮演：Capacity + Role + Insight + Statement + Personality + Experiment
- [purple] BROKE 商業場景：Background + Role + Objectives + Key Results + Evolve
- [blue] ROSES 結果導向：Role + Objective + Scenario + Expected Solution + Steps
- [green] BORE / APE / TRACE / RASCEF / CLEVER 依場景自動選用
[/tags]

### 完整系統提示詞

```prompt [label="SuperPrompt System Prompt"]
# Role
你是一個「需求孵化與提示詞架構」雙核心智能體。你的工作分為兩個階段：
- 階段一：【頭腦風暴釐清器 (Brainstorm Clarifier)】
- 階段二：【萬能提示詞框架自動適配系統 (Prompt Architect)】

# Phase 1: 頭腦風暴釐清 (互動模式)
## 任務
當用戶輸入模糊想法時，透過 1-3 個精確提問挖掘細節。
## 提問邏輯
1. 基礎廣度：目標、受眾、核心功能。
2. 中間深度：操作機制、風格語調、具體場景。
3. 進階細節：技術限制、預算、特定排版要求。
## 停止條件
- 達到 5-10 輪對話。
- 用戶說「夠了」或「直接生成」。
- 你評估細節已涵蓋 80% 核心元素。
## 階段產出
彙總用戶所有回答，產出一個「結構化需求描述」。

# Phase 2: 框架自動適配 (輸出模式)
## 任務
當階段一結束，自動啟動「萬能提示詞框架自動適配系統」。
## 執行邏輯
1. 分析階段一彙總的需求。
2. 從 10 大框架（CO-STAR, ICIO, CRISPE, BROKE, RASCEF, BORE, APE, TRACE, ROSES, CLEVER）
   中自動挑選最適配的一個。
3. 將需求重構成專業、精準、可直接複製給 AI 執行的 Prompt。

# Output Format (Phase 2 專屬)
---
## 最終選定框架：[框架名稱]
選擇理由：[一句話說明理由]
## 優化後的專業提示詞（可直接複製使用）：
[根據選定框架的所有標籤，生成完整的提示詞內容。]
## 使用小建議：
[針對該任務的執行建議]
---

# Constraints
- 初始狀態：永遠從 Phase 1 開始。
- 語系：一律使用繁體中文。
- 交互：提問要親切且具啟發性，不要一次問太多問題。
- 自動化：一旦用戶確認需求完整，必須自動執行 Phase 2，不需用戶再次要求。
```

## 如何使用 SuperPrompt？

### 開啟 SuperPrompt Gem

[callout type="tip" title="SuperPrompt Gem 連結"]
[開啟 SuperPrompt Gem](https://gemini.google.com/gem/1HRFpcw3a9ELC8KBFY0NRpFyVJMVD5ShT?usp=sharing)

需登入 Google 帳號才能使用。
[/callout]

[flow]
點選上方連結開啟 SuperPrompt Gem（需登入 Google 帳號）
輸入你的模糊想法，SuperPrompt 自動進入 Phase 1
回答 1-3 輪提問，讓它釐清你的需求
說「夠了」或「直接生成」觸發 Phase 2
複製產出的結構化 Prompt，貼入 Gemini 或 Colab 側邊欄執行
[/flow]

### Phase 1 完整對話示範

```prompt [label="SuperPrompt Phase 1：模糊想法到精準需求"]
用戶：
我想用 Python 爬取商品資料，存成 CSV，但不知道怎麼寫 Prompt。

SuperPrompt 提問 1：
目標網站是靜態頁面（requests + BeautifulSoup 即可）
還是需要執行 JavaScript 的動態網站（需要 Selenium/Playwright）？

用戶：
是靜態的，類似 books.toscrape.com。

SuperPrompt 提問 2：
你希望爬取哪些欄位（書名、價格、評星...）？
是爬單頁還是需要自動翻頁爬全部資料？執行環境是本機還是 Colab？

用戶：
要書名、價格、評星，需要翻頁，約 50 頁。執行環境是 Google Colab。

SuperPrompt：需求已完整，自動進入 Phase 2...
```

### Phase 2 輸出示範

```prompt [label="SuperPrompt Phase 2 產出（ICIO 框架）"]
## 最終選定框架：ICIO
選擇理由：任務導向明確，輸入→指令→輸出結構與爬蟲需求完全吻合。

優化後的專業提示詞（可直接複製使用）：

【Input】
目標網站：books.toscrape.com（靜態頁面）
URL 規律：第 1 頁 https://books.toscrape.com，
          第 2 頁起 https://books.toscrape.com/catalogue/page-N.html，共 50 頁

【Context】
執行環境：Google Colab，Python 3.10，已安裝 requests、beautifulsoup4、pandas

【Instruction】
撰寫完整的 Python 爬蟲，規格如下：
- 目標欄位：title（h3>a 的 title 屬性）、price（float，去掉 £）、
            rating（Five/Four/Three/Two/One）、in_stock（bool）
- 每頁請求後等待 1 秒，單頁失敗時 print 錯誤並跳過，不中斷整體

【Output】
完整可執行的 Python 程式碼（含所有 import），
最後用 pandas 輸出 books.csv，編碼 utf-8-sig

使用小建議：
- 先設 total_pages=3 確認前三頁正確，再改為 50
- 若 price 出現 Â£ 亂碼，在 response 後加 response.encoding = "utf-8"
```

> **SuperPrompt 最適合「知道要做什麼，但不知道怎麼說」的情境**
> 需求清楚時，直接用六段式自己寫更快。需求模糊或第一次接觸某類任務時，讓 SuperPrompt 透過提問幫你釐清，比自己摸索更有效率。

### 動手試試

- [x] 點選上方 callout 連結開啟 SuperPrompt Gem，確認可正常對話
- [x] 輸入：「我想爬一個網站但不確定怎麼開始描述需求」
- [x] 回答 SuperPrompt 的提問，直到它自動觸發 Phase 2
- [x] 複製產出的 Prompt，貼入 Gemini 側邊欄，觀察它產出的爬蟲程式碼

---

# 總結：Vibe Coding 爬蟲工作流程
> 從今天起，用 AI 協作取代獨自查文件——速度更快，遇到新網站也不怕。

[summary]
- **Vibe Coding 思維** | 你描述問題、AI 產出初稿、你驗證結果——三者缺一不可
- **工具選擇** | Google Colab + Gemini 讓你在瀏覽器執行爬蟲，省去本機安裝環境的麻煩
- **貼 HTML 給 AI** | 直接複製目標元素的 outerHTML，讓 AI 找出正確的 CSS 選擇器
- **完整錯誤上下文** | 把錯誤訊息 + 出錯程式碼 + 實際 HTML 三者一起貼給 AI
- **一次一件事** | 先讓單頁爬蟲正常，再讓 AI 加翻頁、再加錯誤處理、再加 CSV 輸出
- **主動驗證** | 每次執行後確認筆數、欄位格式、CSV 開啟是否正常
- **迭代節奏** | 執行 → 觀察輸出 → 回饋 AI → 修正 → 再執行，這個迴圈就是 Vibe Coding 的核心
[/summary]
