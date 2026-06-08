# Colab 起步：你的免費雲端 Python 環境
> 不需要安裝任何軟體，用瀏覽器就能學 Python——Google Colab 是零基礎入門的最佳起點。

## 什麼是 Google Colab？

### Colab 讓你立刻開始寫程式
- Google 提供的免費雲端 Python 執行環境
- 不需安裝 Python，不需設定環境，開瀏覽器就能用
- 程式碼與筆記混在同一份文件（Notebook），非常適合學習
- 自動儲存到 Google Drive，換電腦也能繼續

### Colab vs 自己安裝 Python

[compare label-left="自己安裝 Python" label-right="Google Colab"]
- 需安裝 Python、設定環境變數 | 開瀏覽器登入 Google 即可
- 安裝套件可能出錯 | 爬蟲常用套件已預裝
- 只能在這台電腦用 | 任何裝置都能存取
- 適合有經驗的開發者 | 適合初學者快速上手
[/compare]

## 開啟第一個 Notebook

### 操作步驟

[flow]
1. 前往 colab.research.google.com — 需登入 Google 帳號
2. 點擊「新建筆記本」
3. 點擊第一個儲存格 — 看到空白的 Notebook
4. 輸入程式碼 — 按 Shift + Enter 執行
5. 觀察輸出結果 — 儲存格下方會出現輸出
[/flow]

### Colab 的兩種儲存格

[tags]
- [blue] 程式碼儲存格：輸入 Python 程式碼，按 Shift+Enter 執行
- [orange] 文字儲存格：用 Markdown 寫筆記說明，不會執行
[/tags]

### 你的第一行程式碼

```prompt py [label="Colab：執行你的第一行程式碼"]
print("Hello, World!")
print("我要學 Python 爬蟲！")
```

- [x] 前往 colab.research.google.com 開啟新 Notebook
- [x] 在第一個儲存格輸入 `print("Hello, World!")`
- [x] 按 Shift + Enter，確認下方出現 `Hello, World!`
- [x] 新增一個儲存格，試著印出自己的名字

---

# 變數與資料型別：Python 的基本單位
> 變數是程式的記憶體，資料型別決定你能對資料做什麼——這是寫任何程式的起點。

## 變數：給資料一個名字

### 什麼是變數？
- 想像變數是一個有標籤的盒子，可以放入任何東西
- 用 `=` 把值放進盒子，之後用名字取出來用
- Python 不需要先宣告型別，直接賦值即可

```prompt py [label="Colab：變數的基本用法"]
# 字串（文字）
name = "Alice"
url = "https://books.toscrape.com"

# 整數
age = 25
page_number = 1

# 浮點數（小數）
price = 12.99

# 印出變數
print(name)         # Alice
print(url)          # https://books.toscrape.com
print(page_number)  # 1
```

### 爬蟲常用的三種資料型別

[tags]
- [blue] str（字串）：網頁文字、URL、書名、價格文字
- [green] int（整數）：頁碼、數量、狀態碼
- [orange] float（浮點數）：價格（數字版）、評分
[/tags]

```prompt py [label="Colab：用 type() 查看資料型別"]
title = "Python Crash Course"
page = 3
rating = 4.5

print(type(title))   # <class 'str'>
print(type(page))    # <class 'int'>
print(type(rating))  # <class 'float'>
```

## f-string：把變數拼進文字

### 為什麼需要 f-string？
- 爬蟲常需要動態組合 URL，例如換頁時 `?page=2`、`?page=3`
- f-string 讓你把變數直接嵌入字串，不需要用 `+` 拼接

```prompt py [label="Colab：f-string 動態組合 URL"]
base_url = "https://books.toscrape.com/catalogue/page-{}.html"
page = 1

# 方法一：format()（舊寫法）
url = base_url.format(page)

# 方法二：f-string（推薦，Python 3.6+）
url = f"https://books.toscrape.com/catalogue/page-{page}.html"
print(url)  # https://books.toscrape.com/catalogue/page-1.html

# 換頁只要改 page 的值
page = 5
url = f"https://books.toscrape.com/catalogue/page-{page}.html"
print(url)  # https://books.toscrape.com/catalogue/page-5.html
```

> **f-string 是爬蟲組合 URL 的標準做法**
> 翻頁爬蟲幾乎都用 `f"...{page}..."` 動態產生每一頁的 URL。

### 動手練習

- [x] 在 Colab 建立三個變數：`book_title`、`book_price`、`book_page`，分別存入字串、浮點數、整數
- [x] 用 `print(type(...))` 確認每個變數的型別
- [x] 用 f-string 印出：`書名：[title]，價格：[price] 元，第 [page] 頁`

---

# 條件判斷與迴圈：讓程式會思考和重複
> 爬蟲需要判斷「這頁有沒有資料」、重複「翻頁直到最後一頁」——if 和 for 是核心工具。

## if：讓程式做決定

### if / elif / else 結構

```prompt py [label="Colab：if 條件判斷"]
status_code = 200

if status_code == 200:
    print("請求成功，可以繼續解析")
elif status_code == 404:
    print("頁面不存在，跳過這個 URL")
elif status_code == 429:
    print("請求太頻繁，需要等待")
else:
    print(f"未知狀態碼：{status_code}")
```

### 爬蟲中常見的判斷場景

```prompt py [label="Colab：爬蟲常用的條件判斷"]
price_text = "£12.99"
stock_text = "In stock"

# 判斷是否有庫存
if "In stock" in stock_text:
    print("有庫存，值得爬取")

# 判斷回應是否成功
response_ok = True
if response_ok:
    print("解析資料")
else:
    print("略過，記錄錯誤")
```

## for 迴圈：批次處理的關鍵

### 用 for 逐一處理清單

```prompt py [label="Colab：for 迴圈基本用法"]
# 逐一印出書名清單
book_titles = ["Book A", "Book B", "Book C", "Book D"]

for title in book_titles:
    print(title)

# 用 range() 產生數字序列（翻頁爬蟲）
for page in range(1, 6):  # 1, 2, 3, 4, 5
    url = f"https://books.toscrape.com/catalogue/page-{page}.html"
    print(url)
```

### 爬蟲翻頁模式

```prompt py [label="Colab：模擬翻頁爬蟲結構"]
import time

total_pages = 5

for page in range(1, total_pages + 1):
    url = f"https://example.com/page/{page}"
    print(f"正在爬取第 {page} 頁：{url}")
    # （之後這裡會放 requests.get(url)）
    time.sleep(1)  # 每頁間隔 1 秒

print("所有頁面爬取完畢")
```

[flow]
1. page = 1 — 組合 URL
2. requests.get(url) — 取得頁面
3. 解析頁面 — 提取資料
4. time.sleep(1) — 暫停一秒
5. page += 1 — 進入下一輪迴圈
6. 重複直到 page > total_pages
[/flow]

[quiz type="single"]
Q: 要爬取第 1 到第 10 頁，range() 應該怎麼寫？
- [x] range(1, 11)
- [ ] range(1, 10)
- [ ] range(0, 10)
Hint: range(start, stop) 包含 start，但不包含 stop，所以要到第 10 頁需要 stop=11。
[/quiz]

---

# 函式與模組：組織你的爬蟲程式碼
> 函式讓你把重複的步驟打包成一個名字，模組讓你使用別人寫好的強大工具。

## def：定義函式

### 為什麼需要函式？
- 爬蟲有許多重複的動作：「發請求 → 確認狀態碼 → 解析 → 返回資料」
- 把這個流程包成函式，每次只需呼叫一行

```prompt py [label="Colab：定義與呼叫函式"]
# 定義函式
def greet(name):
    message = f"你好，{name}！歡迎學習 Python 爬蟲"
    return message

# 呼叫函式
result = greet("Alice")
print(result)  # 你好，Alice！歡迎學習 Python 爬蟲

result2 = greet("Bob")
print(result2)  # 你好，Bob！歡迎學習 Python 爬蟲
```

### 爬蟲函式的基本模式

```prompt py [label="Colab：爬蟲函式的骨架"]
def fetch_page(url):
    """取得網頁內容，失敗回傳 None"""
    # 之後這裡會放 requests.get(url)
    print(f"正在取得：{url}")
    return None  # 暫時先回傳 None

def build_url(base, page):
    """組合翻頁 URL"""
    return f"{base}/page-{page}.html"

# 使用函式
base = "https://books.toscrape.com/catalogue"
for page in range(1, 4):
    url = build_url(base, page)
    fetch_page(url)
```

## import：使用現成的模組

### Python 標準函式庫

```prompt py [label="Colab：import 常用模組"]
import time
import random

# time.sleep()：暫停執行（爬蟲禮儀必備）
print("開始等待...")
time.sleep(2)
print("等待結束")

# random.uniform()：產生隨機浮點數（讓請求間隔不那麼規律）
delay = random.uniform(1.0, 3.0)
print(f"這次等待 {delay:.2f} 秒")
time.sleep(delay)
```

### 安裝並匯入第三方套件

```terminal [label="Colab：安裝套件（在儲存格執行）"]
!pip install requests beautifulsoup4
```

```prompt py [label="Colab：匯入爬蟲套件"]
import requests
from bs4 import BeautifulSoup

print("requests 版本：", requests.__version__)
print("套件匯入成功，可以開始爬蟲了！")
```

> **Colab 已預裝 requests，通常不需要額外安裝**
> `!pip install` 指令前面的 `!` 代表在 Colab 執行 shell 指令，不是 Python 程式碼。

---

# List 與 Dictionary：爬蟲的資料容器
> 爬蟲從網頁取得的資料幾乎都存進 List 或 Dictionary，熟練這兩個結構是爬蟲的基礎。

## List（清單）：有順序的資料集合

### List 基本操作

```prompt py [label="Colab：List 基本操作"]
# 建立 List
book_titles = ["Book A", "Book B", "Book C"]

# 取得元素（索引從 0 開始）
print(book_titles[0])   # Book A
print(book_titles[-1])  # Book C（最後一個）

# 新增元素（爬蟲邊爬邊收集資料）
book_titles.append("Book D")
print(book_titles)  # ['Book A', 'Book B', 'Book C', 'Book D']

# 取得長度
print(len(book_titles))  # 4
```

### 爬蟲收集資料的標準模式

```prompt py [label="Colab：用 List 收集爬蟲結果"]
# 模擬從多頁收集書名
all_books = []  # 空 List，準備收集資料

# 假設每頁爬到 3 本書
page1_books = ["Book A", "Book B", "Book C"]
page2_books = ["Book D", "Book E", "Book F"]

for book in page1_books:
    all_books.append(book)

for book in page2_books:
    all_books.append(book)

print(f"共收集到 {len(all_books)} 本書")
print(all_books)
```

## Dictionary（字典）：有標籤的資料集合

### Dictionary 基本操作

```prompt py [label="Colab：Dictionary 基本操作"]
# 建立 Dictionary（key: value 對）
book = {
    "title": "Python Crash Course",
    "price": 12.99,
    "rating": 4,
    "in_stock": True
}

# 取得值
print(book["title"])    # Python Crash Course
print(book["price"])    # 12.99

# 新增或更新欄位
book["url"] = "https://books.toscrape.com/..."
book["price"] = 11.50   # 更新價格

print(book)
```

### 一筆爬蟲資料 = 一個 Dictionary

```prompt py [label="Colab：用 List of Dict 儲存多筆資料"]
# 每本書用一個 dict 儲存，所有書放進 List
books = []

# 模擬爬取三本書的資料
raw_data = [
    ("Python Crash Course", "£12.99", "Five"),
    ("Learning Python",     "£39.99", "Four"),
    ("Automate the Boring", "£17.50", "Five"),
]

for title, price, rating in raw_data:
    book = {
        "title": title,
        "price": price,
        "rating": rating
    }
    books.append(book)

# 印出所有書
for book in books:
    print(f"{book['title']} — {book['price']}")
```

> **List of Dictionaries 是爬蟲存放結果的標準格式**
> 之後轉成 CSV 或 Excel，只需一行：`pandas.DataFrame(books).to_csv("output.csv")`

[quiz type="single"]
Q: 要取得 `book["title"]` 的值，book 必須是什麼型別？
- [x] dict（字典）
- [ ] list（清單）
- [ ] str（字串）
Hint: 用中括號加字串 key 取值是 dict 的語法，list 用數字索引取值。
[/quiz]

---

# 字串操作：處理爬蟲取得的原始文字
> 爬蟲抓到的資料往往是髒的——有多餘空白、奇怪符號或混雜的格式，字串操作讓你清理它。

## 清理文字：strip、replace、split

### 爬蟲最常用的字串方法

```prompt py [label="Colab：字串清理方法"]
# 爬蟲常見的「髒」資料
raw_price = "  £12.99\n"
raw_title = "  Python Crash Course  "
raw_rating = "Five stars"

# strip()：去除首尾空白與換行符
clean_price = raw_price.strip()
print(clean_price)   # £12.99

# replace()：替換字元
price_number = clean_price.replace("£", "")
print(price_number)  # 12.99

# 轉為數字才能做計算
price = float(price_number)
print(price + 1)     # 13.99

# split()：切割字串
parts = raw_rating.split(" ")
print(parts)         # ['Five', 'stars']
print(parts[0])      # Five（取評分文字）
```

### 常用字串方法速查

[tags]
- [blue] .strip() 去除首尾空白和換行
- [green] .replace("舊", "新") 替換字元
- [orange] .split("分隔符") 切割為 List
- [purple] .lower() / .upper() 統一大小寫
[/tags]

## 判斷與搜尋字串

```prompt py [label="Colab：字串判斷方法"]
stock_text = "In stock (22 available)"
title = "  Python Web Scraping  "

# in：判斷是否包含某段文字
if "In stock" in stock_text:
    print("有庫存")

# startswith / endswith
url = "https://books.toscrape.com"
if url.startswith("https"):
    print("安全連線")

# strip() + lower() 組合處理
clean = title.strip().lower()
print(clean)  # python web scraping
```

### 完整資料清理練習

```prompt py [label="Colab：模擬清理爬蟲原始資料"]
# 模擬從網頁抓到的原始資料（未處理）
raw_books = [
    {"title": "  Python Crash Course  ", "price": "£12.99", "rating": "Five stars"},
    {"title": "\nLearning Python\n",     "price": "£39.99", "rating": "Four stars"},
    {"title": "Automate the Boring  ",   "price": "£17.50", "rating": "Five stars"},
]

cleaned_books = []
for book in raw_books:
    cleaned = {
        "title":  book["title"].strip(),
        "price":  float(book["price"].replace("£", "")),
        "rating": book["rating"].split(" ")[0]  # 只取 "Five"
    }
    cleaned_books.append(cleaned)

for book in cleaned_books:
    print(f"{book['title']:30} | £{book['price']:.2f} | {book['rating']}")
```

- [x] 在 Colab 執行上方程式碼，確認輸出格式整齊
- [x] 新增第四本書到 `raw_books`，確認清理後也能正確輸出
- [x] 試著用 `sorted(cleaned_books, key=lambda b: b["price"])` 按價格排序

---

# 總結：Python 爬蟲前置技能全覽
> 你已掌握學習爬蟲所需的 Python 基礎，下一步是把這些工具組合起來實際爬取網站。

[summary]
- **Google Colab** | 免安裝的雲端 Python 環境，Shift+Enter 執行，適合快速實驗
- **變數與型別** | str / int / float，用 f-string 動態組合 URL
- **條件與迴圈** | if 判斷狀態碼，for + range() 實現翻頁爬蟲
- **函式與模組** | def 封裝重複邏輯，import requests 載入爬蟲工具
- **List** | append() 收集多頁資料，len() 統計數量
- **Dictionary** | 每筆資料一個 dict，List of Dict 是標準輸出格式
- **字串操作** | strip() 去空白，replace() 去符號，split() 切割文字
[/summary]

[bonus title="下一步：開始你的第一個完整爬蟲"]
學完 Python 基礎後，推薦的學習路徑：

1. 學習 `requests` 庫——發送 HTTP 請求、處理回應
2. 學習 `BeautifulSoup`——解析 HTML、用 CSS 選擇器提取資料
3. 第一個實戰目標：爬取 `books.toscrape.com`（專為練習設計的假書店）

```prompt py [label="第一個完整爬蟲（預覽）"]
import requests
from bs4 import BeautifulSoup

url = "https://books.toscrape.com"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

books = []
for article in soup.select("article.product_pod"):
    title = article.h3.a["title"]
    price = article.select_one(".price_color").text.strip()
    books.append({"title": title, "price": price})

for book in books:
    print(f"{book['title']} — {book['price']}")
```
[/bonus]
