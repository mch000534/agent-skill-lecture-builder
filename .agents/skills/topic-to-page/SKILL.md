---
name: topic-to-page
description: 從主題到課程頁面的完整工作流，串聯 content-drafting → content-review → course-page-generator 三個階段，適合從零開始建立新課程。每個 Phase 結束後暫停確認，使用者可隨時插入修改。
---

# Topic to Page（完整課程生成流程）

> **禁止使用 Emoji**：所有生成內容一律不得使用 emoji。

## 觸發條件

當使用者說：
- 「從主題到頁面」「完整流程」「一鍵生成課程」「幫我完整做一個課程」
- 或明確要求跑完 drafting → review → build 三個步驟

---

## 輸入參數

| 參數 | 說明 | 必填 |
|------|------|------|
| `topic` | 課程主題（一句話描述） | 是 |
| `audience` | 目標受眾，含前置知識描述 | 是 |
| `duration` | 課程總時長（分鐘） | 是 |
| `course_dir` | 課程目錄路徑（如 `lectures/my-course`） | 否（自動推導） |

若缺少任何必填參數，先詢問後再繼續。`course_dir` 若未指定，依 `content-drafting/SKILL.md` 的慣例目錄規則自動推導。

---

## Phase 1：起草內容

**讀取並執行** `.agents/skills/content-drafting/SKILL.md` Step 1–6，將輸出寫入 `<course_dir>/content.md`。

**圖片規劃（生成草稿時即主動保留位置）**：

依 `content-drafting/SKILL.md` 的圖片使用時機，在 content.md 中主動加入三類圖片語法：

| 類型 | 語法 | 時機 | 建議數量 |
|------|------|------|---------|
| **chapter hero** | `# LABEL：TITLE` 下、`>` 引言前獨立一行 `![alt](images/xxx.png)` | 最具視覺錨點的 2–4 個主章節 | 每門課 2–4 張 |
| **standalone** | 段落間獨立一行 `![alt](images/xxx.png)` | 每個主章節平均 1–3 張（流程、架構、截圖） | 每章 1–3 張 |
| **image-text** | `[image-text]...[/image-text]` | UI 截圖 + 欄位說明等圖文並排情境 | 視需要 |

**無圖時佔位**：用 `<!-- TODO: 建議加圖 — {用途描述} -->` 標記位置（而非 `[image-here]`），供 Phase 3 或後續 `image-generator` Skill 批次生成。

完成後輸出：
- 章節大綱表（章節編號、標題、預計時間、主要元件）
- **圖片計畫表**：列出所有 hero / standalone / image-text 位置，含 alt 文字與用途。若使用者後續想用 `image-generator` 批次生成，這張表即為 Phase 2 的起點
- 缺圖清單（若有 `<!-- TODO: 建議加圖 -->` 標記）

**暫停並詢問**：
> 草稿已寫入 `<course_dir>/content.md`，圖片計畫表如上。
> 是否繼續進行內容審閱？若需要先修改，完成後說「繼續 Phase 2」即可。

---

## Phase 2：審閱並存檔

**讀取並執行** `.agents/skills/content-review/SKILL.md` Step 1–4，以 `<course_dir>/content.md` 為輸入。

完成後：
1. 將審閱報告以 **Markdown 格式**寫入 `<course_dir>/review-report.md`（使用 Write 工具，覆蓋舊檔）
2. 在對話中展示完整報告內容（含「章節節奏診斷」、「圖片多樣性」、「優先修改清單」段落）

**根據報告給出建議**：
- 若「章節節奏診斷」表中有 2 個以上章節評估為「需改善」→ 建議先依「優先修改清單」修改 content.md 再 build
- 若「圖片多樣性」段落指出 hero 過多（>4 張）或 TODO 殘留 → 建議：
  - hero 過多：挑選 2–4 張最具視覺錨點的章節保留，其他改為 standalone
  - TODO 殘留：在 Phase 3 之前或之後執行 `image-generator` Skill 批次生成
- 若所有章節均為「佳」或「中」（無「需改善」）→ 可直接繼續 Phase 3

**暫停並詢問**：
> 審閱報告已存為 `<course_dir>/review-report.md`。
> 是否繼續生成課程頁面？若需要先修改或跑 image-generator 生成配圖，完成後說「繼續 Phase 3」即可。

---

## Phase 3：生成頁面

content.md 已存在，從 **Step 2** 開始執行（跳過 Step 0–1 的輸入偵測與草稿生成）。

### Step 2.5（可選）：批次生成配圖

若 Phase 1/2 的圖片計畫表仍有 `<!-- TODO: 建議加圖 -->` 未處理，且使用者說「幫我生成圖片」或「加圖」：

**讀取並執行** `.agents/skills/image-generator-dmxapi-gptimage2/SKILL.md` Phase 1–4，把計畫表中的四類位置（hero / standalone / image-text / inline）批次生成並嵌入 content.md。

### Step 2.6（建議）：語法驗證

執行 `node .agents/skills/course-page-generator/scripts/validate.mjs <course_dir>`，確認 content.md 語法無誤。重點留意：

- `[image-here]` 殘留
- `![](...)` 空 alt
- 泛用 alt 文字（image / img / picture / 圖片 / 截圖）
- chapter hero 超過 4 張

若使用者在 Phase 2 後手動編輯過內容，此步驟尤其重要。

### Step 3–4：建置

**讀取並執行** `.agents/skills/course-page-generator/SKILL.md` Step 2–4：

- Step 2：確認或建立 `<course_dir>/config.yaml`（含偵測 GitHub Pages 前綴）
- Step 3：執行 `node .agents/skills/course-page-generator/scripts/build.mjs <course_dir>`
- Step 4：執行 `node .agents/skills/course-page-generator/scripts/generate-og.mjs <course_dir>`

完成後告知：
- `<course_dir>/index.html` 輸出路徑
- `<course_dir>/assets/og-image.jpg` 輸出路徑
- 圖片統計：hero N 張 / standalone N 張 / image-text N 張 / inline N 張
- 預覽指令：`node .agents/skills/course-page-generator/scripts/dev.mjs <course_dir>`

---

## 中止與恢復

使用者在任一 Phase 後說「先等一下」「我要先改」「暫停」時：
- 停止並等待，不自動繼續
- 告知恢復方式：說「繼續 Phase 2」或「繼續 Phase 3」從指定階段重新執行

若使用者說「繼續」但未指定 Phase，從最近未完成的 Phase 繼續。

---

## 參考資源

- 起草：[content-drafting/SKILL.md](../content-drafting/SKILL.md)
- 審閱：[content-review/SKILL.md](../content-review/SKILL.md)
- 生成頁面：[course-page-generator/SKILL.md](../course-page-generator/SKILL.md)
- 配圖生成（Phase 3 Step 2.5 可選）：[image-generator-dmxapi-gptimage2/SKILL.md](../image-generator-dmxapi-gptimage2/SKILL.md)
