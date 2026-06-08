# 審閱報告：Python 網路爬蟲入門

## 章節節奏診斷

| 章節 | 說明 | 範例 | 實作 | 整體評估 |
|------|------|------|------|---------|
| #1 爬蟲是什麼 | ✅ | ✅ compare + insight | ⚠️ 缺動手引導 | 中 |
| #2 爬蟲禮儀 | ✅ | ✅ code blocks + flow | ✅ quiz + flow | 佳 |
| #3 HTTP 協議 | ✅ | ✅ code blocks + stats | ⚠️ 缺練習引導 | 中 |
| #4 HTTPS 與 API | ✅ | ✅ compare + code | ⚠️ 缺動手引導 | 中 |
| #5 開發者工具 | ✅ | ✅ flow + terminal | ⚠️ flow 為主但缺明確練習 | 中 |
| #6 前端基礎 | ✅ | ✅ code + compare | ✅ 可執行程式碼 | 佳 |
| #7 總結 | ✅ summary | — | — | 佳 |

（圖例：✅ 完整  ⚠️ 薄弱  ❌ 缺失）

---

## 正面肯定

- **第 2 章「爬蟲禮儀」**結構最完整，說明→範例→quiz 形成完整閉環，是本課程的示範章節
- **第 6 章「前端基礎」**的 compare 選擇器對照表設計出色，直接對應 BeautifulSoup 用法，降低轉換認知負擔
- 全篇 prompt block 均為真實可執行程式碼，無假設性範例
- 最後章節有 `[summary]` 完整收尾

---

## 各章節改善建議

### 章節 1：爬蟲是什麼

- **實作層薄弱**：章節末缺少「動手試試」的引導。建議在 insight box 後新增一張卡片：

  ```markdown
  ### 動手確認：第一個 HTTP 請求
  - [x] 安裝 requests：`pip install requests`
  - [x] 在 Python REPL 執行：`import requests; r = requests.get("https://httpbin.org/get"); print(r.status_code)`
  - [x] 確認輸出為 200，表示請求成功
  ```

### 章節 3：HTTP 協議

- **實作層薄弱**：兩個子章節均以 prompt block 收尾，但缺乏「現在你來試試」的明確引導。建議在最後的 prompt block 後加入 checklist：

  ```markdown
  ### 練習：用 httpbin.org 觀察請求與回應
  - [x] 執行 `requests.get("https://httpbin.org/get")` 查看回應結構
  - [x] 執行 `requests.post("https://httpbin.org/post", data={"key": "value"})` 送出資料
  - [x] 故意打錯 URL，觀察狀態碼（應出現 404）
  ```

### 章節 4：HTTPS 與 API

- **實作層薄弱**：API 的對比說明與程式碼範例很清晰，但沒有引導學員實際動手呼叫。建議在 insight box 後加入：

  ```markdown
  ### 練習：呼叫公開 API 取得資料
  - [x] 執行程式碼取得第一筆 todo：`requests.get("https://jsonplaceholder.typicode.com/todos/1").json()`
  - [x] 修改 URL 取得不同資源：`/todos/5`、`/posts/1`
  - [x] 用 Network 面板觀察請求，對比直接在 Python 呼叫的結果
  ```

### 章節 5：開發者工具

- **實作層偏弱**：flow 步驟詳細但停在「記下選擇器」，沒有完成閉環到「實際在 Python 中使用」。建議在章節末新增：

  ```markdown
  ### 練習：從 DevTools 到 Python
  - [x] 打開 https://books.toscrape.com
  - [x] 右鍵點擊任一書名 → 檢查，記下對應的 HTML 標籤與 class
  - [x] 在 Network 面板的 Doc 分頁，找到頁面請求的完整 URL
  - [x] 用 requests + BeautifulSoup 用該選擇器提取所有書名
  ```

---

## 全篇品質

**裸段落**：未發現裸段落，結構化程度良好。

**卡片密度**：各章節卡片數均在合理範圍（3–6 張）。

**元件多樣性**：flow、compare、tags、prompt block、insight box、quiz、summary 均有使用，多樣性佳。唯第 1 章與第 4 章缺少 `[quiz]` 或 `- [x]` checklist 類的互動元件。

**時間估算**：預估總時長 95–115 分鐘（無設定目標時長）。若課程預計為 90 分鐘，建議精簡第 3 章（合併 Request/Response 的 prompt block 示範）或將 HTTPS 流程說明（[flow]）簡化為 compare 元件。

---

## 優先修改清單

1. 【高優先】章節 3 補充實作層：加入 httpbin.org 練習 checklist
2. 【高優先】章節 5 補充閉環：加入「從 DevTools 到 Python」的練習卡片
3. 【中優先】章節 1 補充實作層：加入第一個 HTTP 請求的動手確認
4. 【中優先】章節 4 補充引導：在 API 練習後明確給出動手步驟
5. 【低優先】若時長限制為 90 分鐘，考慮精簡第 3 章的 stats 元件說明
