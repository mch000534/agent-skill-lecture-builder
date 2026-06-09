---
name: image-generator-dmxapi-gptimage2
description: 透過 DMXAPI GPT Image 2 為教材自動生成配圖，支援 AI 智能分析與手動標記，互動式確認後批次生成並嵌入 content.md
---

# image-generator-dmxapi-gptimage2

> 禁止使用 emoji。所有溝通與輸出使用繁體中文。

## 觸發條件

當使用者說「生成教材圖片」「幫課程加圖」「跑 image generator」「為 content.md 加圖片」或類似指令時，讀取本檔案並執行以下 Phase 1-4。

## 前置需求

- `.agents/skills/image-generator-dmxapi-gptimage2/.env` 中須設定 `DMXAPI_KEY`
- 模型可選清單：`gpt-image-2-03`、`gpt-image-2`、`gpt-image-2-ssvip`
- 所有可用模型參考：https://www.dmxapi.cn/rmb

## 工作流程

### Phase 1：掃描與分析

1. 讀取指定課程目錄的 `content.md`。
2. 找出所有 `[image-here]` 佔位符（使用者手動標記），標記為**優先處理**。
3. 找出所有 `<!-- TODO: 建議加圖 ... -->` 註解（content-drafting Skill 留下的佔位），標記為**次要處理**，註解內的說明文字作為 prompt 依據。
4. AI 分析每個章節，主動判斷可加圖的四類位置：

   | 類型 | 判斷條件 | 渲染結果 |
   |------|---------|---------|
   | **chapter hero** | `#` 標題下方、`>` 引言之前，且目前無圖 | `<div class="chapter-hero">` 全寬封面 |
   | **獨立圖片** | 在 `##` / `###` 段落間，用於展示架構、截圖、示意圖 | `<figure class="content-image">` 置中 + caption |
   | **image-text 圖文並排** | 緊貼某段文字，作為該段落的輔助（UI 截圖 + 說明） | `<div class="image-text">` 左右並排 |
   | **行內圖片** | 嵌在句子中，通常是 icon 或小型示意 | `<img class="inline-image">` |

   **預設優先使用「獨立圖片」與「image-text」**。chapter hero 每門課建議 2–4 張（只在需要強烈視覺錨點的主章節使用）；行內圖片僅在圖片是語句一部分時使用。

5. **跳過**已有 `![alt](src)` 或 `[image-text]` 的段落，不重複建議。
6. 統計各主章節編號，供後續圖片命名使用。

### Phase 2：互動確認

依序與使用者互動三個步驟：

**Step 1：選擇模型**

提供以下選項讓使用者選擇：

| 模型 | 說明 |
|------|------|
| `gpt-image-2-03` | 較新版本 |
| `gpt-image-2` | 標準版本 |
| `gpt-image-2-ssvip` | 高品質版本 |

提示：https://www.dmxapi.cn/rmb 可檢視所有模型。

**Step 2：選擇全域風格**

提供以下預設風格，使用者也可自訂：

| 風格 | 適合主題 | Prompt 前綴範例 |
|------|---------|----------------|
| 扁平插圖 (flat illustration) | 軟體工具、流程教學 | `Flat design illustration, clean vector style, ...` |
| 技術架構圖 (tech diagram) | 系統設計、網路概念 | `Technical architecture diagram, minimal lines, ...` |
| 情境照片 (photo style) | 軟性主題、開場引言 | `Photorealistic scene, natural lighting, ...` |
| 簡約線條圖 (line art) | 抽象概念、思維方法 | `Minimalist line art drawing, single continuous line, ...` |
| 自訂 | 由使用者描述 | 使用者提供的風格描述 |

所選風格將作為每張圖片 prompt 的統一前綴，確保整套教材視覺一致。

**Step 3：確認圖片計畫表**

輸出如下表格，讓使用者逐項確認：

```text
# 圖片生成計畫

模型：gpt-image-2-ssvip
全域風格：扁平插圖

| # | 類型 | 位置 | 圖片用途 | 建議尺寸 | Prompt |
|---|------|------|---------|---------|--------|
| 1 | hero | # 章節一：開場 | 章節封面 | 1536x1024 | Flat design illustration of... |
| 2 | standalone | ## 什麼是爬蟲 | 概念圖 | 1024x1024 | A diagram showing... |
| 3 | image-text | ### 環境設定 | UI 截圖 | 1024x1024 | Screenshot-style of... |
| 4 | standalone | [image-here] @ L45 | 使用者標記 | 1536x1024 | ... |

類型說明：
- hero        → chapter hero（`#` 標題下方全寬封面）
- standalone  → 內文獨立圖片（段落間置中 + caption）
- image-text  → 圖文並排（搭配文字左右排列）
- inline      → 行內圖片（嵌在句子中，少用）

可執行操作：
- 修改 prompt（「第 2 張改成 ...」）
- 修改尺寸（「第 1 張改成 1024x1024」）
- 修改類型（「第 3 張改成 standalone」）
- 刪除項目（「刪除第 3 張」）
- 新增項目（「在 ## XXX 下面加一張 standalone ...」）
確認後開始生成？(Y/n)
```

使用者確認後進入 Phase 3。

### Phase 3：批次生成

對計畫表中每張圖片，依序執行：

1. 組合完整 prompt：`{全域風格前綴}, {圖片 prompt}`
2. 呼叫腳本：

```bash
node .agents/skills/image-generator-dmxapi-gptimage2/scripts/generate.mjs \
  --prompt "完整 prompt" \
  --size "1536x1024" \
  --model "gpt-image-2-ssvip" \
  --output "lectures/<course>/assets/images/ch1-intro-cover.png"
```

3. 顯示進度：`[1/5] 生成中：ch1-intro-cover.png ...`
4. 圖片存入 `lectures/<course>/assets/images/` 目錄。

**命名規則**：`ch{N}-{slug}.png`，N 為主章節編號，slug 為簡短英文描述。

**尺寸建議**：

| 用途 | 建議尺寸 |
|------|---------|
| 章節封面（橫向） | `1536x1024` |
| 概念圖 / 方圖 | `1024x1024` |
| 直向插圖 | `1024x1536` |
| 預設 | `auto`（由 API 決定） |

**API 參數預設值**：

| 參數 | 預設值 |
|------|-------|
| quality | `auto` |
| output_format | `png` |
| n | `1` |

### Phase 4：回寫 content.md

依圖片計畫表中的「類型」欄位，使用對應的嵌入語法：

1. **`hero`（章節英雄）**：在 `# LABEL：TITLE` 標題與 `>` 引言之間插入獨立圖片（前後各空一行）：

```markdown
# 章節一：開場

![章節封面描述](assets/images/ch1-intro-cover.png)

> 章節引言文字...
```

2. **`standalone`（內文獨立圖片）**：在 `##` / `###` 段落之間獨立成行，前後各空一行：

```markdown
### 爬蟲的運作原理

- 發送請求
- 解析回應
- 擷取資料

![爬蟲三階段流程示意](assets/images/ch2-crawler-flow.png)

> **重點**：每一步都應該加上延遲，避免對目標伺服器造成負擔。
```

3. **`image-text`（圖文並排）**：以 `[image-text]` 元件包裹圖片與文字：

```markdown
[image-text position="right" width="40"]
![環境設定介面截圖](assets/images/ch3-env-setup.png)

設定面板包含三個主要欄位：API Key、Region、Model Name，各欄位說明如下...
[/image-text]
```

4. **`inline`（行內圖片）**：直接嵌在句子中，前後以空白與文字分隔：

```markdown
點擊左側工具列的 ![設定 icon](assets/images/icon-settings.png) 圖示即可開啟。
```

5. **替換佔位符**：
   - 所有 `[image-here]` 必須被替換為對應語法，不能殘留。
   - 所有 `<!-- TODO: 建議加圖 ... -->` 若對應本次生成的圖片，必須一併替換為對應語法（避免 build 後仍可見）。
   - 未對應到生成圖片的 TODO 保留原樣，以便後續批次處理。

6. **不更動既有圖片**：既有 `![alt](src)` 與 `[image-text]` 區塊保持原樣，不重複嵌入。

7. 輸出最終統計：生成 N 張圖片（hero / standalone / image-text / inline 各幾張），已嵌入 content.md。

## 錯誤處理

- `.env` 不存在或缺少 `DMXAPI_KEY`：提示使用者建立 `.env` 並設定 API Key。
- API 回傳錯誤：顯示錯誤訊息，詢問是否重試該張或跳過。
- 所有圖片處理完後，若有失敗項目，列出失敗清單。

## 相關資源

- `.agents/skills/course-page-generator/reference/components.md` — 圖片嵌入語法參考
- `.agents/skills/course-page-generator/scripts/build.mjs` — build 時自動 base64 嵌入本地圖片
