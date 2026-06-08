# 爬蟲是什麼：網路爬蟲入門概念
> 了解爬蟲的本質與合法使用場景，建立正確的技術認知起點。

### 什麼是網路爬蟲？
- 程式自動存取網頁、下載內容並提取資料的技術
- 本質是模擬瀏覽器的 HTTP 請求行為
- 應用場景：價格比較、資料蒐集、搜尋引擎索引、學術研究

### 爬蟲 vs 瀏覽器

[compare label-left="人工瀏覽器" label-right="爬蟲程式"]
- 點擊網址列輸入 URL | requests.get(url)
- 等待瀏覽器渲染畫面 | 直接取得 HTML 原始碼
- 肉眼查看資料 | BeautifulSoup 解析並提取
- 一次一頁手動操作 | 迴圈批次處理大量頁面
[/compare]

> **爬蟲不是魔法，只是自動化的 HTTP 請求**
> 瀏覽器做的事，爬蟲都可以做到，差別在於速度與規模。

---

# 爬蟲禮儀：合法與負責任地爬取
> 技術能力越強，越需要了解邊界——爬蟲也有行為規範。

## robots.txt：網站的爬蟲聲明

### 什麼是 robots.txt？
- 網站公告「哪些路徑允許被爬取」的文字檔
- 慣例位置：網域根目錄下的 `/robots.txt`
- 遵守與否純屬自律，但違反可能涉及法律與道德問題

### 解讀 robots.txt

```terminal [label="Terminal：查看 Apple 的 robots.txt"]
curl https://www.apple.com/robots.txt
```

```prompt [label="robots.txt 範例解讀"]
User-agent: *          # 適用所有爬蟲
Disallow: /private/    # 禁止爬取 /private/ 路徑
Allow: /public/        # 明確允許 /public/
Crawl-delay: 10        # 建議每次請求間隔 10 秒

User-agent: Googlebot  # 僅對 Google 爬蟲適用
Allow: /               # Google 可爬取全站
```

> **遵守 robots.txt 是爬蟲工程師的基本職業素養**
> 無視聲明大量爬取，輕則被封 IP，重則觸法。

## 請求頻率：用 time.sleep() 保持禮貌

### 為什麼要控制請求速度？
- 過快的請求會讓目標伺服器負載過重，等同 DDoS 攻擊
- 大多數網站會偵測異常高頻請求並封鎖 IP
- 加入延遲能模擬真人行為，降低被封鎖機率

```prompt py [label="Python：加入延遲的爬蟲"]
import requests
import time

urls = [
    "https://example.com/page/1",
    "https://example.com/page/2",
    "https://example.com/page/3",
]

for url in urls:
    response = requests.get(url)
    print(response.status_code)
    time.sleep(2)  # 每次請求後等待 2 秒
```

[flow]
發送第一個請求
取得回應並處理資料
time.sleep(2) — 暫停 2 秒
發送下一個請求
重複直到所有頁面處理完畢
[/flow]

[quiz type="single"]
Q: 以下哪個做法最符合爬蟲禮儀？
- [x] 每次請求後呼叫 time.sleep(2)，並先檢查 robots.txt
- [ ] 用多執行緒同時發出 100 個請求以加快速度
- [ ] 忽略 robots.txt，因為它只是建議性文件
Hint: 網站有權根據請求頻率封鎖 IP，遵守禮儀能讓爬蟲持續運作。
[/quiz]

---

# HTTP 協議：爬蟲底層的溝通語言
> 理解 HTTP 才能真正讀懂爬蟲在做什麼，以及錯誤時如何排查。

## 請求（Request）：客戶端說我想要什麼

### HTTP 請求的四個組成部分
- **方法（Method）**：告訴伺服器要做什麼動作
- **URL**：指明目標資源的位置，如 `http://example.com/todos`
- **頭部（Headers）**：附加說明，如「我接受 JSON 格式」
- **主體（Body）**：僅 POST/PUT 時使用，承載送出的資料

### 常見 HTTP 方法

[tags]
- [green] GET 取得資料
- [blue] POST 送出新資料
- [orange] PUT 更新既有資料
- [purple] DELETE 刪除資料
[/tags]

```prompt py [label="Python requests：不同方法示範"]
import requests

# GET：取得網頁或資料
response = requests.get("https://httpbin.org/get")

# POST：送出表單資料
response = requests.post(
    "https://httpbin.org/post",
    data={"username": "alice", "password": "1234"}
)

# 加上自訂 Headers（模擬瀏覽器）
headers = {"User-Agent": "Mozilla/5.0"}
response = requests.get("https://example.com", headers=headers)
```

## 回應（Response）：伺服器說我給你什麼

### HTTP 回應的三個組成部分
- **狀態碼（Status Code）**：數字表示請求結果
- **頭部（Headers）**：伺服器附加說明，如資料類型
- **主體（Body）**：實際內容，可能是 HTML、JSON 或圖片

### 常見狀態碼速查

[stats]
- 200 | OK | 請求成功，資料已返回
- 201 | Created | 新資源已建立（POST 成功）
- 404 | Not Found | 找不到指定資源
- 500 | Server Error | 伺服器內部錯誤
[/stats]

```prompt py [label="Python：讀取回應內容"]
import requests

response = requests.get("https://httpbin.org/json")

print(response.status_code)   # 200
print(response.headers)       # {'Content-Type': 'application/json', ...}
print(response.text)          # 原始回應字串
print(response.json())        # 自動解析 JSON 為 Python dict
```

> **狀態碼 4xx 是你的問題，5xx 是對方的問題**
> 排查爬蟲錯誤時，先看狀態碼就能快速定位責任方。

---

# HTTPS 與 API：現代網路的兩個關鍵概念
> 幾乎所有現代網站都用 HTTPS，而 API 是爬蟲最乾淨的資料來源。

## HTTP vs HTTPS

### HTTPS 的安全機制

[compare label-left="HTTP" label-right="HTTPS"]
- 明文傳輸 | 加密傳輸（TLS）
- 任何人在同網路可攔截 | 中間人看到的是加密資料
- 無身份驗證 | 憑證確認伺服器真實身份
- http:// | https://
[/compare]

[flow]
瀏覽器向伺服器請求連線
伺服器回傳 SSL 憑證（含公鑰）
瀏覽器驗證憑證是否可信
雙方協商加密金鑰（TLS Handshake）
後續所有資料均以加密傳輸
[/flow]

### Python requests 與 HTTPS
- `requests` 預設驗證 SSL 憑證，遇到無效憑證會拋出錯誤
- 測試環境若遇自簽憑證：`requests.get(url, verify=False)`（正式環境禁用）

## 什麼是 API？

### API vs 直接爬 HTML

[compare label-left="直接爬 HTML" label-right="使用 API"]
- 解析 HTML 結構，脆弱易壞 | JSON 格式，結構穩定
- 網站改版後爬蟲失效 | 版本化 API 保持向後相容
- 可能違反服務條款 | 官方授權的資料取用方式
- BeautifulSoup 解析 | 直接 response.json()
[/compare]

```prompt py [label="Python：呼叫公開 API"]
import requests

# 呼叫 JSONPlaceholder 假 API（練習用）
response = requests.get("https://jsonplaceholder.typicode.com/todos/1")

if response.status_code == 200:
    data = response.json()
    print(data["title"])      # 取得 todo 標題
    print(data["completed"])  # 是否完成
```

> **能用 API 就不要硬爬 HTML**
> 優先檢查網站是否提供公開 API，直接呼叫比解析 HTML 更穩定、更合規。

---

# 開發者工具：爬蟲工程師的分析利器
> Chrome DevTools 是理解網頁請求結構的必備工具，也是爬蟲偵錯的第一步。

## Elements 面板：查看 HTML 結構

### 用檢查元素定位目標資料

[flow]
打開目標網頁
右鍵點擊要爬取的元素 → 選「檢查」
在 Elements 面板找到對應 HTML 標籤
記下 class 或 id 屬性作為選擇器
在 Python 中用 BeautifulSoup 使用此選擇器提取資料
[/flow]

### Elements 面板常用操作
- 滑鼠懸停在 HTML 上，網頁對應元素會反白標示
- 可即時修改 HTML/CSS 預覽效果（不影響伺服器）
- 右鍵 HTML 元素 → 「Copy selector」直接取得 CSS 選擇器

## Network 面板：觀察 HTTP 請求

### 開啟 Network 面板

```terminal [label="快捷鍵開啟 DevTools"]
F12                      # Windows / Linux
Command + Option + I     # Mac

# 切換到 Network 分頁後，重新整理頁面才會出現請求記錄
# 過濾技巧：
# Fetch/XHR — 只看 API 請求（JSON 資料）
# Doc       — 只看頁面文件請求
```

### 從 Network 找到真正的資料來源
- **Headers 分頁**：查看請求 URL、方法、完整 Header
- **Response 分頁**：查看伺服器回傳的原始資料
- **Preview 分頁**：JSON 以樹狀結構展示，方便檢視

> **很多「爬蟲」其實只是呼叫 API**
> 在 Network 的 Fetch/XHR 中，常能直接找到網頁載資料的 API 端點，直接呼叫比解析 HTML 更穩定。

---

# 前端基礎：讀懂爬蟲目標的結構
> 爬蟲目標是 HTML 文件，理解 HTML/CSS/JS 才能精準提取資料。

## HTML：網頁的骨架

### HTML 基本文件結構

```prompt html [label="HTML 基本結構"]
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>網頁標題</title>
</head>
<body>
  <h1>主標題</h1>
  <p>段落文字</p>
  <a href="https://example.com">連結</a>
  <img src="photo.jpg" alt="圖片說明">
  <ul>
    <li>清單項目一</li>
    <li>清單項目二</li>
  </ul>
</body>
</html>
```

### 前端三件套與爬蟲的關係

[tags]
- [blue] HTML 骨架，定義結構（爬蟲的主要解析目標）
- [orange] CSS 樣式，控制外觀（class/id 是爬蟲的定位線索）
- [purple] JavaScript 大腦，加入互動（動態網頁的挑戰來源）
[/tags]

### 爬蟲最常用的 HTML 標籤

[tags]
- [blue] h1~h6 標題文字
- [green] a 超連結（href 屬性含目標 URL）
- [green] img 圖片（src 屬性含圖片路徑）
- [orange] div / span 容器（靠 class 或 id 識別）
- [purple] table / tr / td 表格資料
[/tags]

## CSS 選擇器：精準定位資料

### 四種核心選擇器

[compare label-left="CSS 選擇器語法" label-right="BeautifulSoup 對應用法"]
- `h1`（標籤選擇器） | `soup.find("h1")`
- `.price`（class 選擇器） | `soup.find(class_="price")`
- `#main`（id 選擇器） | `soup.find(id="main")`
- `div.card a`（組合選擇器） | `soup.select("div.card a")`
[/compare]

```prompt py [label="BeautifulSoup：CSS 選擇器實戰"]
from bs4 import BeautifulSoup
import requests

html = requests.get("https://books.toscrape.com").text
soup = BeautifulSoup(html, "html.parser")

# 標籤選擇器：取得所有書名
titles = soup.find_all("h3")

# class 選擇器：取得所有價格
prices = soup.select(".price_color")

# 組合選擇器：取得卡片內的連結
links = soup.select("article.product_pod h3 a")

for link in links:
    print(link.get("href"))    # 取 href 屬性
    print(link.get_text())     # 取文字內容
```

> **select() 用 CSS 選擇器，find_all() 用標籤或屬性**
> 複雜的巢狀結構用 `soup.select("parent child")` 更直覺，簡單搜尋用 `find_all()`。

### 動態網頁與靜態網頁的差異

[tags]
- [green] 靜態網頁：requests + BeautifulSoup 即可完成
- [orange] 動態網頁（JS 渲染）：需 Selenium 或 Playwright 執行 JS
- [blue] 動態網頁（API 載入）：找到 API 端點後直接呼叫
[/tags]

---

# requests 庫：Python 爬蟲的核心工具
> requests 是 Python 最常用的 HTTP 庫，封裝了底層細節，讓你用幾行程式碼完成複雜的網路請求。

## 安裝與基本使用

### 安裝 requests

```terminal [label="Terminal：安裝 requests"]
pip install requests
```

### 發送第一個請求

```prompt py [label="Python：requests 基本用法"]
import requests

# 最基本的 GET 請求
response = requests.get("https://httpbin.org/get")

# 回應物件的常用屬性
print(response.status_code)   # 狀態碼：200
print(response.url)           # 最終請求的 URL（含重定向後）
print(response.headers)       # 回應 Headers（dict）
print(response.text)          # 回應內容（字串）
print(response.content)       # 回應內容（bytes，適合圖片等二進位）
print(response.json())        # 解析 JSON → Python dict（若非 JSON 會拋錯）
```

### 加入 Query Parameters

```prompt py [label="Python：URL 查詢參數"]
import requests

# 方法一：直接寫在 URL（不推薦，難以維護）
response = requests.get("https://httpbin.org/get?page=2&limit=10")

# 方法二：用 params 參數（推薦，自動處理編碼）
params = {"page": 2, "limit": 10, "keyword": "Python 爬蟲"}
response = requests.get("https://httpbin.org/get", params=params)

print(response.url)
# https://httpbin.org/get?page=2&limit=10&keyword=Python+%E7%88%AC%E8%9F%B2
```

## 自訂 Headers 與 Session

### 設定 Headers 模擬瀏覽器

```prompt py [label="Python：自訂 Headers"]
import requests

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "zh-TW,zh;q=0.9",
    "Accept": "text/html,application/xhtml+xml",
}

response = requests.get("https://httpbin.org/headers", headers=headers)
print(response.json())
```

> **User-Agent 是爬蟲偽裝的第一步**
> 預設的 requests User-Agent 是 `python-requests/x.x.x`，許多網站會直接封鎖。設定成瀏覽器的 User-Agent 可大幅降低被封鎖機率。

### Session：保持登入狀態與複用連線

```prompt py [label="Python：使用 Session 保持 Cookie"]
import requests

session = requests.Session()

# Session 自動保存 Cookie，後續請求帶入相同 Cookie
session.headers.update({"User-Agent": "Mozilla/5.0"})

# 第一次請求（例如登入）
login_data = {"username": "alice", "password": "1234"}
session.post("https://httpbin.org/post", data=login_data)

# 後續請求自動帶入登入後的 Cookie
response = session.get("https://httpbin.org/cookies")
print(response.json())

session.close()  # 完成後關閉連線
```

[compare label-left="requests.get() 單次請求" label-right="Session 物件"]
- 每次請求建立新連線 | 複用 TCP 連線，速度更快
- 不保留 Cookie | 自動保存並帶入 Cookie
- 適合一次性請求 | 適合需要登入狀態的爬蟲
- 無法共用 Headers | 可設定全域 Headers
[/compare]

## 錯誤處理與逾時

### Timeout：避免請求卡住

```prompt py [label="Python：設定請求逾時"]
import requests

# 設定 timeout（秒）：connect timeout 與 read timeout
try:
    response = requests.get("https://httpbin.org/delay/3", timeout=5)
    print(response.status_code)
except requests.exceptions.Timeout:
    print("請求逾時，伺服器回應太慢")
except requests.exceptions.ConnectionError:
    print("連線失敗，請確認網路或 URL")
```

### raise_for_status()：自動拋出 HTTP 錯誤

```prompt py [label="Python：優雅的錯誤處理"]
import requests

def safe_get(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # 4xx / 5xx 自動拋出 HTTPError
        return response
    except requests.exceptions.HTTPError as e:
        print(f"HTTP 錯誤：{e.response.status_code}")
    except requests.exceptions.ConnectionError:
        print("無法連線，請確認 URL 或網路")
    except requests.exceptions.Timeout:
        print("請求逾時")
    return None

result = safe_get("https://httpbin.org/status/404")
```

[flow]
呼叫 requests.get(url, timeout=10)
response.raise_for_status() — 4xx/5xx 自動拋錯
處理回應：response.text 或 response.json()
捕捉 HTTPError / ConnectionError / Timeout
記錄錯誤，決定重試或跳過
[/flow]

### 動手練習：完整爬蟲模板

```prompt py [label="Python：爬蟲最佳實踐模板"]
import requests
import time

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
})

def fetch(url, params=None):
    try:
        response = session.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"請求失敗：{e}")
        return None

urls = [
    "https://jsonplaceholder.typicode.com/todos/1",
    "https://jsonplaceholder.typicode.com/todos/2",
    "https://jsonplaceholder.typicode.com/todos/3",
]

for url in urls:
    result = fetch(url)
    if result:
        print(result.json()["title"])
    time.sleep(1)  # 遵守爬蟲禮儀
```

- [x] 安裝 requests：`pip install requests`
- [x] 複製上方模板到本機執行，確認三筆資料正常輸出
- [x] 修改 URL 改為 `https://httpbin.org/get`，觀察回應結構差異
- [x] 故意傳入錯誤 URL（如加上 `/notexist`），確認錯誤捕捉正常運作

---

# BeautifulSoup4：解析 HTML 提取資料
> requests 負責取回網頁，BeautifulSoup 負責從 HTML 中找到你要的資料——兩者是爬蟲的黃金搭檔。

## 安裝與基本解析

### 建立 Soup 物件

```terminal [label="Terminal：安裝 BeautifulSoup4"]
pip install beautifulsoup4
```

```prompt py [label="Python：從 HTML 字串建立 Soup"]
from bs4 import BeautifulSoup
import requests

# 取得網頁
response = requests.get("https://books.toscrape.com")
html = response.text

# 建立 Soup 物件（html.parser 為 Python 內建解析器）
soup = BeautifulSoup(html, "html.parser")

# 取得頁面標題
print(soup.title)        # <title>All products | Books to Scrape...</title>
print(soup.title.text)   # All products | Books to Scrape...
```

### 解析器選擇

[compare label-left="html.parser" label-right="lxml"]
- Python 內建，無需額外安裝 | 需 pip install lxml
- 速度較慢 | 速度快 2–3 倍
- 適合小型爬蟲 | 適合大量頁面的爬蟲
- 容錯能力中等 | 容錯能力強
[/compare]

## find 與 find_all：搜尋元素

### find：找第一個符合的元素

```prompt py [label="Python：find() 基本用法"]
from bs4 import BeautifulSoup
import requests

soup = BeautifulSoup(requests.get("https://books.toscrape.com").text, "html.parser")

# 找第一個 h1
h1 = soup.find("h1")
print(h1.text)   # All products

# 用 class 屬性篩選
first_price = soup.find("p", class_="price_color")
print(first_price.text)   # £51.77

# 取得標籤的屬性值
first_link = soup.find("a")
print(first_link["href"])   # catalogue/a-light-in-the-attic_1000/index.html
```

### find_all：找所有符合的元素

```prompt py [label="Python：find_all() 批次提取"]
from bs4 import BeautifulSoup
import requests

soup = BeautifulSoup(requests.get("https://books.toscrape.com").text, "html.parser")

# 取得所有書名
titles = soup.find_all("h3")
for t in titles[:3]:             # 只印前三個
    print(t.a["title"])

# 取得所有價格
prices = soup.find_all("p", class_="price_color")
for p in prices[:3]:
    print(p.text.strip())

print(f"共找到 {len(prices)} 個價格")   # 20
```

## select：用 CSS 選擇器精準定位

### select vs find_all

[compare label-left="find_all()" label-right="select()"]
- `find_all("p", class_="price")` | `select("p.price")`
- `find_all("a", href=True)` | `select("a[href]")`
- 語法較冗長 | 直接用 CSS 選擇器，更直覺
- 適合簡單搜尋 | 適合巢狀結構或組合條件
[/compare]

```prompt py [label="Python：select() 實戰"]
from bs4 import BeautifulSoup
import requests

soup = BeautifulSoup(requests.get("https://books.toscrape.com").text, "html.parser")

# 取得所有書籍卡片（article 標籤，class=product_pod）
books = soup.select("article.product_pod")
print(f"本頁共 {len(books)} 本書")   # 20

for book in books:
    title  = book.h3.a["title"]
    price  = book.select_one("p.price_color").text.strip()
    rating = book.p["class"][1]          # 取 class 的第二個值：Five / Four...
    stock  = book.select_one("p.availability").text.strip()

    print(f"{title[:40]:40} | {price} | {rating} | {stock}")
```

> **select_one() 等同 find()，select() 等同 find_all()**
> 習慣 CSS 選擇器的人用 select 系列，習慣 HTML 屬性語法的人用 find 系列，兩者可以混用。

## 完整單頁爬蟲

```prompt py [label="Python：完整爬取一頁書籍資料"]
from bs4 import BeautifulSoup
import requests

def scrape_page(url):
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    books = []
    for article in soup.select("article.product_pod"):
        books.append({
            "title":  article.h3.a["title"],
            "price":  article.select_one(".price_color").text.strip(),
            "rating": article.p["class"][1],
            "stock":  article.select_one(".availability").text.strip(),
        })
    return books

result = scrape_page("https://books.toscrape.com")
print(f"爬到 {len(result)} 本書")
for book in result[:3]:
    print(book)
```

- [x] 安裝：`pip install beautifulsoup4`
- [x] 執行完整單頁爬蟲，確認輸出 20 本書的資料
- [x] 修改選擇器，只取書名和評星（移除 price 與 stock）
- [x] 在 DevTools Elements 面板確認 `article.product_pod` 對應的 HTML 結構

---

# pandas：將爬蟲資料存成表格與 CSV
> 爬完資料只是第一步，用 pandas 將清單轉成結構化表格，才能進行分析或交付他人使用。

## 安裝與建立 DataFrame

### 從 List of Dict 直接建立表格

```terminal [label="Terminal：安裝 pandas"]
pip install pandas
```

```prompt py [label="Python：List of Dict → DataFrame"]
import pandas as pd

books = [
    {"title": "Python Crash Course", "price": "£12.99", "rating": "Five"},
    {"title": "Learning Python",     "price": "£39.99", "rating": "Four"},
    {"title": "Automate the Boring", "price": "£17.50", "rating": "Five"},
]

# 一行建立 DataFrame
df = pd.DataFrame(books)
print(df)
#                  title   price rating
# 0  Python Crash Course  £12.99   Five
# 1       Learning Python  £39.99   Four
# 2  Automate the Boring  £17.50   Five

print(df.shape)    # (3, 3) — 3 列 3 欄
print(df.columns)  # Index(['title', 'price', 'rating'], dtype='object')
```

## 資料清理：處理爬蟲的原始格式

### 清理價格欄位為數字

```prompt py [label="Python：清理 price 欄位"]
import pandas as pd

df = pd.DataFrame([
    {"title": "Python Crash Course", "price": "£12.99"},
    {"title": "Learning Python",     "price": "£39.99"},
    {"title": "Automate the Boring", "price": "£17.50"},
])

# 去掉 £ 符號並轉為浮點數
df["price"] = df["price"].str.replace("£", "").astype(float)

print(df.dtypes)
# title     object
# price    float64

print(df["price"].mean())    # 平均價格：23.49
print(df["price"].max())     # 最高價：39.99
print(df["price"].min())     # 最低價：12.99
```

### 篩選與排序

```prompt py [label="Python：篩選與排序 DataFrame"]
import pandas as pd

# 模擬爬完一頁的資料
data = [
    {"title": "Book A", "price": 12.99, "rating": "Five"},
    {"title": "Book B", "price": 39.99, "rating": "Four"},
    {"title": "Book C", "price": 9.99,  "rating": "Five"},
    {"title": "Book D", "price": 25.00, "rating": "Three"},
    {"title": "Book E", "price": 17.50, "rating": "Five"},
]
df = pd.DataFrame(data)

# 篩選評分為 Five 的書
five_star = df[df["rating"] == "Five"]
print(five_star)

# 按價格升冪排列
sorted_df = df.sort_values("price")
print(sorted_df)

# 同時篩選 + 排序
result = df[df["rating"] == "Five"].sort_values("price")
print(result)
```

> **DataFrame 的篩選語法像 Excel 的篩選功能**
> `df[df["欄位"] == "值"]` 是最常用的模式，記住這個就能處理大多數資料篩選需求。

## 儲存資料：CSV 與 Excel

### 一行輸出 CSV

```prompt py [label="Python：輸出 CSV 與 Excel"]
import pandas as pd

df = pd.DataFrame([
    {"title": "Python Crash Course", "price": 12.99, "rating": "Five"},
    {"title": "Learning Python",     "price": 39.99, "rating": "Four"},
])

# 輸出 CSV（index=False 不輸出列索引）
df.to_csv("books.csv", index=False, encoding="utf-8-sig")
# utf-8-sig 讓 Windows Excel 正確顯示中文

# 輸出 Excel（需安裝 openpyxl）
# pip install openpyxl
df.to_excel("books.xlsx", index=False)

# 重新讀入確認
df_check = pd.read_csv("books.csv")
print(df_check)
```

## 爬蟲 + BeautifulSoup + pandas 完整流程

```prompt py [label="Python：爬蟲到 CSV 完整範例"]
import requests
import pandas as pd
from bs4 import BeautifulSoup
import time

def scrape_all_pages(total_pages=3):
    all_books = []
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0"})

    for page in range(1, total_pages + 1):
        url = f"https://books.toscrape.com/catalogue/page-{page}.html"
        print(f"爬取第 {page} 頁...")

        try:
            response = session.get(url, timeout=10)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"第 {page} 頁失敗：{e}")
            continue

        soup = BeautifulSoup(response.text, "html.parser")
        for article in soup.select("article.product_pod"):
            all_books.append({
                "title":  article.h3.a["title"],
                "price":  float(article.select_one(".price_color").text.strip().replace("£", "")),
                "rating": article.p["class"][1],
                "stock":  article.select_one(".availability").text.strip(),
            })

        time.sleep(1)

    return all_books

books = scrape_all_pages(total_pages=3)
df = pd.DataFrame(books)

print(df.shape)                     # (60, 4) — 3 頁 × 20 本
print(df["price"].describe())       # 價格統計摘要
print(df["rating"].value_counts())  # 各評星數量

df.to_csv("books_toscrape.csv", index=False, encoding="utf-8-sig")
print("已儲存 books_toscrape.csv")
```

[flow]
requests.Session.get(url) 取得 HTML
BeautifulSoup 解析，select() 提取各欄位
append 到 all_books 清單
time.sleep(1) 遵守禮儀
所有頁面爬完後建立 DataFrame
清理資料型別（price 轉 float）
df.to_csv() 輸出檔案
[/flow]

- [x] 安裝：`pip install pandas beautifulsoup4`
- [x] 執行完整範例，確認產出 `books_toscrape.csv`
- [x] 用 `df[df["rating"] == "Five"].sort_values("price")` 找出評分最高且最便宜的書
- [x] 嘗試改為輸出 Excel：`df.to_excel("books.xlsx", index=False)`

---

# 實戰案例：完整爬取 books.toscrape.com
> 從思路分析到程式結構，完整走一遍真實爬蟲專案的開發流程。

[callout type="tip" title="本章節附有 Google Colab 練習檔"]
可直接在瀏覽器執行所有範例，無需安裝任何軟體。

[開啟 Colab Notebook](https://colab.research.google.com/drive/1m3Ten-oZ7Alm5A8uzQH96zdEfDCc950G?usp=sharing)
[/callout]

## 第一步：分析目標網站

### 觀察網站結構

[flow]
瀏覽 https://books.toscrape.com
確認網站允許爬取：查看 robots.txt（https://books.toscrape.com/robots.txt）
觀察 URL 規律：首頁 / → 第二頁 catalogue/page-2.html → 共 50 頁
確認每頁有 20 本書，共 1000 本
用 DevTools Elements 面板找出每個欄位的 HTML 結構
[/flow]

### 用 DevTools 定位資料欄位

```prompt html [label="DevTools 觀察結果：每本書的 HTML 結構"]
<article class="product_pod">

  <!-- 評星：class 第二個值就是評分文字 -->
  <p class="star-rating Five"></p>

  <!-- 封面圖與書名連結 -->
  <div class="image_container">
    <a href="catalogue/a-light-in-the-attic_1000/index.html">
      <img src="..." alt="A Light In The Attic">
    </a>
  </div>

  <!-- 書名：在 h3 > a 的 title 屬性（非 a 的文字，文字會被截斷） -->
  <h3>
    <a href="catalogue/..." title="A Light In The Attic">A Light In ...</a>
  </h3>

  <!-- 價格與庫存 -->
  <div class="product_price">
    <p class="price_color">£51.77</p>
    <p class="availability">In stock</p>
  </div>

</article>
```

### 規劃要爬取的欄位

[tags]
- [blue] title：書名（取 a 的 title 屬性，完整不截斷）
- [green] price：價格（去掉 £，轉為 float）
- [orange] rating：評星（取 p.star-rating 的第二個 class 值）
- [purple] availability：庫存狀態（去除空白）
- [blue] url：書籍詳情頁 URL（拼接相對路徑）
[/tags]

## 第二步：設計程式結構

### 把爬蟲拆解為三個函式

[compare label-left="單一大函式（不推薦）" label-right="拆分為小函式（推薦）"]
- 程式碼全堆在一起，難以維護 | 每個函式只做一件事
- 出錯難以定位 | 哪段出錯一目了然
- 無法單獨測試某個步驟 | 可分別測試 fetch / parse / save
- 換網站要大改 | 只需換 parse_page 的選擇器
[/compare]

```prompt py [label="程式結構：三層分工"]
# 第一層：取得 HTML
def fetch_page(session, url):
    """發送請求，返回 BeautifulSoup 物件；失敗返回 None"""

# 第二層：解析單頁
def parse_page(soup):
    """從 soup 提取書籍資料，返回 List of Dict"""

# 第三層：整合翻頁 + 儲存
def scrape_all(total_pages):
    """呼叫 fetch + parse，收集所有頁面，輸出 CSV"""
```

> **每個函式只做一件事（單一職責原則）**
> `fetch_page` 不解析、`parse_page` 不發請求——這樣每一層都能獨立測試，日後換套件也只改一層。

## 第三步：逐步實作

### 實作 fetch_page

```prompt py [label="Python：fetch_page 函式"]
import requests
from bs4 import BeautifulSoup
import time

def fetch_page(session, url):
    """發送 GET 請求，返回解析好的 BeautifulSoup 物件"""
    try:
        response = session.get(url, timeout=10)
        response.raise_for_status()
        response.encoding = 'utf-8'   # 強制 UTF-8，避免 £ 變成 Â£
        return BeautifulSoup(response.text, "html.parser")
    except requests.exceptions.HTTPError as e:
        print(f"  HTTP 錯誤 {e.response.status_code}：{url}")
    except requests.exceptions.ConnectionError:
        print(f"  連線失敗：{url}")
    except requests.exceptions.Timeout:
        print(f"  請求逾時：{url}")
    return None

# 測試 fetch_page
session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0"})

soup = fetch_page(session, "https://books.toscrape.com")
print(soup.title.text)   # All products | Books to Scrape - Sandbox
```

### 實作 parse_page

```prompt py [label="Python：parse_page 函式"]
# href 已包含 catalogue/，base 只需到網域根目錄
BASE_URL = "https://books.toscrape.com/"

def parse_page(soup):
    """從單頁 soup 提取所有書籍資料"""
    books = []
    for article in soup.select("article.product_pod"):

        # 書名：取 title 屬性（a 的文字內容會被截斷）
        title = article.h3.a["title"]

        # 價格：去掉 £ 符號，轉為浮點數
        price = float(
            article.select_one(".price_color").text.strip().replace("£", "")
        )

        # 評星：p.star-rating 的 class 有兩個值，第二個是評分文字
        rating = article.p["class"][1]   # "Five" / "Four" / ...

        # 庫存：去除前後空白與換行
        stock = article.select_one(".availability").text.strip()

        # 詳情頁 URL：href 格式為 catalogue/book-name/index.html
        relative_href = article.h3.a["href"]   # catalogue/a-light.../index.html
        book_url = BASE_URL + relative_href.replace("../", "")

        books.append({
            "title":        title,
            "price":        price,
            "rating":       rating,
            "availability": stock,
            "url":          book_url,
        })
    return books

# 測試 parse_page（接續上方的 soup）
books = parse_page(soup)
print(f"本頁 {len(books)} 本書")
for b in books[:2]:
    print(b)
```

### 實作 scrape_all（翻頁主控）

```prompt py [label="Python：scrape_all 翻頁主控函式"]
import pandas as pd

def scrape_all(total_pages=50):
    """爬取所有頁面，存成 CSV"""
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0"})

    all_books = []

    for page in range(1, total_pages + 1):
        # 第一頁 URL 與後續頁不同
        if page == 1:
            url = "https://books.toscrape.com"
        else:
            url = f"https://books.toscrape.com/catalogue/page-{page}.html"

        print(f"[{page:2d}/{total_pages}] 爬取：{url}")

        soup = fetch_page(session, url)
        if soup is None:
            print(f"  第 {page} 頁跳過")
            continue

        books = parse_page(soup)
        all_books.extend(books)

        time.sleep(1)   # 遵守爬蟲禮儀

    print(f"\n共爬取 {len(all_books)} 本書")
    return all_books
```

## 第四步：執行、分析、輸出

### 完整執行並分析結果

```prompt py [label="Python：執行爬蟲並分析資料"]
# 爬取全部 50 頁（1000 本書）
all_books = scrape_all(total_pages=50)

# 建立 DataFrame
df = pd.DataFrame(all_books)

# 基本統計
print("=== 資料概覽 ===")
print(df.shape)                      # (1000, 5)
print(df.dtypes)
print(df.isnull().sum())             # 檢查是否有缺失值

print("\n=== 價格統計 ===")
print(df["price"].describe())        # count/mean/std/min/max

print("\n=== 各評星數量 ===")
print(df["rating"].value_counts())

print("\n=== 最便宜的五星書 ===")
top5 = df[df["rating"] == "Five"].sort_values("price").head(5)
print(top5[["title", "price"]].to_string(index=False))

# 輸出 CSV
df.to_csv("books_toscrape_full.csv", index=False, encoding="utf-8-sig")
print("\n已儲存 books_toscrape_full.csv")
```

### 完整程式碼彙整（可直接執行）

```prompt py [label="Python：完整爬蟲程式（複製可用）"]
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

# href 已包含 catalogue/，base 只需到網域根目錄
BASE_URL = "https://books.toscrape.com/"

def fetch_page(session, url):
    try:
        r = session.get(url, timeout=10)
        r.raise_for_status()
        r.encoding = 'utf-8'   # 強制 UTF-8，避免 £ 變成 Â£
        return BeautifulSoup(r.text, "html.parser")
    except requests.exceptions.RequestException as e:
        print(f"  請求失敗：{e}")
        return None

def parse_page(soup):
    books = []
    for article in soup.select("article.product_pod"):
        books.append({
            "title":        article.h3.a["title"],
            "price":        float(article.select_one(".price_color").text.strip().replace("£", "")),
            "rating":       article.p["class"][1],
            "availability": article.select_one(".availability").text.strip(),
            "url":          BASE_URL + article.h3.a["href"].replace("../", ""),
        })
    return books

def scrape_all(total_pages=50):
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0"})
    all_books = []

    for page in range(1, total_pages + 1):
        url = "https://books.toscrape.com" if page == 1 else \
              f"https://books.toscrape.com/catalogue/page-{page}.html"
        print(f"[{page:2d}/{total_pages}] {url}")

        soup = fetch_page(session, url)
        if soup:
            all_books.extend(parse_page(soup))
        time.sleep(1)

    return all_books

if __name__ == "__main__":
    books = scrape_all(total_pages=50)
    df = pd.DataFrame(books)
    df.to_csv("books_toscrape_full.csv", index=False, encoding="utf-8-sig")
    print(f"\n完成！共 {len(df)} 本書，已存為 books_toscrape_full.csv")
    print(df[["title", "price", "rating"]].head(10).to_string(index=False))
```

[flow]
Step 1 分析：robots.txt + DevTools 看 HTML 結構
Step 2 設計：規劃 fetch / parse / scrape_all 三層函式
Step 3 實作：先寫 fetch_page，測試通過後寫 parse_page
Step 4 驗證：用單頁測試 parse_page，確認 20 本書資料正確
Step 5 整合：接入 scrape_all，先跑 3 頁確認無誤
Step 6 全量執行：scrape_all(50)，等待約 50 秒完成
Step 7 分析輸出：DataFrame 統計，to_csv 存檔
[/flow]

- [x] 先執行 `scrape_all(total_pages=3)` 確認前 3 頁（60 本書）爬取正確
- [x] 確認 CSV 用 Excel 開啟後中文書名顯示正常
- [x] 執行 `df["rating"].value_counts()` 查看評星分布
- [x] 挑戰：找出所有 `price < 10` 且 `rating == "Five"` 的書

---

# 總結：Python 爬蟲入門全覽
> 從概念到工具，掌握爬蟲工程師的基本技能組合。

[summary]
- **爬蟲本質** | 自動化 HTTP 請求 + 解析 HTML，模擬瀏覽器行為
- **爬蟲禮儀** | 遵守 robots.txt，用 time.sleep() 控制請求頻率
- **HTTP 協議** | 請求（Method + URL + Headers + Body）與回應（狀態碼 + Body）
- **HTTPS 安全** | TLS 加密傳輸，requests 預設驗證 SSL 憑證
- **API 優先** | 能用 API 就不爬 HTML，更穩定更合規
- **開發者工具** | Elements 定位結構，Network 面板找 API 端點
- **CSS 選擇器** | select() 與 find_all() 搭配精準提取目標資料
- **requests 庫** | Session 保持狀態、timeout 防卡死、raise_for_status() 自動錯誤處理
- **BeautifulSoup4** | find/find_all/select 三種搜尋方式，select_one 對應 find
- **pandas** | List of Dict → DataFrame，一行輸出 CSV，篩選排序分析資料
[/summary]
