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

完成後輸出：
- 章節大綱表（章節編號、標題、預計時間、主要元件）
- 缺圖清單（若有 `<!-- TODO: 建議加圖 -->` 標記）

**暫停並詢問**：
> 草稿已寫入 `<course_dir>/content.md`。
> 是否繼續進行內容審閱？若需要先修改，完成後說「繼續 Phase 2」即可。

---

## Phase 2：審閱並存檔

**讀取並執行** `.agents/skills/content-review/SKILL.md` Step 1–4，以 `<course_dir>/content.md` 為輸入。

完成後：
1. 將審閱報告以 **Markdown 格式**寫入 `<course_dir>/review-report.md`（使用 Write 工具，覆蓋舊檔）
2. 在對話中展示完整報告內容

**根據報告給出建議**：
- 若「章節節奏診斷」表中有 2 個以上章節評估為「需改善」→ 建議先依「優先修改清單」修改 content.md 再 build
- 若所有章節均為「佳」或「中」（無「需改善」）→ 可直接繼續 Phase 3

**暫停並詢問**：
> 審閱報告已存為 `<course_dir>/review-report.md`。
> 是否繼續生成課程頁面？若需要先修改，完成後說「繼續 Phase 3」即可。

---

## Phase 3：生成頁面

content.md 已存在，從 **Step 2** 開始執行（跳過 Step 0–1 的輸入偵測與草稿生成）。

**讀取並執行** `.agents/skills/course-page-generator/SKILL.md` Step 2–4：

- Step 2：確認或建立 `<course_dir>/config.yaml`（含偵測 GitHub Pages 前綴）
- Step 2.5（建議）：執行 `node .agents/skills/course-page-generator/scripts/validate.mjs <course_dir>` 確認 content.md 語法無誤；若使用者在 Phase 2 後手動編輯過內容，此步驟尤其重要
- Step 3：執行 `node .agents/skills/course-page-generator/scripts/build.mjs <course_dir>`
- Step 4：執行 `node .agents/skills/course-page-generator/scripts/generate-og.mjs <course_dir>`

完成後告知：
- `<course_dir>/index.html` 輸出路徑
- `<course_dir>/assets/og-image.jpg` 輸出路徑
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
