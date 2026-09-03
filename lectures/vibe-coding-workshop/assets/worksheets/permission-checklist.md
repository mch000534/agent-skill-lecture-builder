# Vibe Coding 工作坊：Agent 權限與 Git 證據工作紙

姓名：____________________　日期：____________________　專案根目錄：____________________

使用方式：每個階段完成後，在專案根目錄依序執行表內三個完整命令，將摘要寫入「結果」。只有在操作符合核准路徑與權限時，才能勾選「允許」。

| 階段 | 模式 | 操作 | 決定 | 三個完整 Git 命令 | 結果 |
| --- | --- | --- | --- | --- | --- |
| plan probe | Plan，只讀規劃 | 在空白專用工作坊目錄發出假設性建立 `permission-probe-plan.txt` 的請求，在任何寫入發生前於權限提示拒絕 | [ ] 在寫入前拒絕 [ ] 不通過 | `git status --short --untracked-files=all`<br>`git diff`<br>`git diff --cached` | [ ] 權限提示出現在寫入前，且 `permission-probe-plan.txt` 不存在；狀態摘要：____________________；差異摘要：____________________ |
| build probe | Build，僅核准路徑可寫 | 在空白專用工作坊目錄發出假設性建立 `permission-probe-build.txt` 的請求，在任何寫入發生前於權限提示拒絕 | [ ] 在寫入前拒絕 [ ] 不通過 | `git status --short --untracked-files=all`<br>`git diff`<br>`git diff --cached` | [ ] 權限提示出現在寫入前，且 `permission-probe-build.txt` 不存在；狀態摘要：____________________；差異摘要：____________________ |
| 01 requirements | Plan，只讀分析 | 分析需求，不寫入 | [ ] 允許 [ ] 拒絕 [ ] 需重新確認 | `git status --short --untracked-files=all`<br>`git diff`<br>`git diff --cached` | [ ] 已記錄；變更路徑：____________________；未暫存／已暫存摘要：____________________ |
| 02 spec | Plan，只讀分析 | 分析規格，不寫入 | [ ] 允許 [ ] 拒絕 [ ] 需重新確認 | `git status --short --untracked-files=all`<br>`git diff`<br>`git diff --cached` | [ ] 已記錄；變更路徑：____________________；未暫存／已暫存摘要：____________________ |
| 03 feature | Build，核准路徑可寫 | 只修改核准的 HTML、CSS 與 JavaScript 功能檔，不安裝套件、不刪除、不發布 | [ ] 允許 [ ] 拒絕 [ ] 需重新確認 | `git status --short --untracked-files=all`<br>`git diff`<br>`git diff --cached` | [ ] 已記錄；變更路徑：____________________；未暫存／已暫存摘要：____________________ |
| 04 tests | Build，核准路徑可寫 | 只新增或修改核准測試並執行既有 Node／瀏覽器驗證，不新增 dependencies | [ ] 允許 [ ] 拒絕 [ ] 需重新確認 | `git status --short --untracked-files=all`<br>`git diff`<br>`git diff --cached` | [ ] 已記錄；測試結果：____________________；變更路徑：____________________ |
| 05 hardened | Build，核准路徑可寫 | 修正已證實的安全與錯誤處理問題，完成最終驗證；不 commit、不推送、不發布 | [ ] 允許 [ ] 拒絕 [ ] 需重新確認 | `git status --short --untracked-files=all`<br>`git diff`<br>`git diff --cached` | [ ] 已記錄；安全結果：____________________；變更路徑：____________________ |

## 通過條件

- [ ] `permission-probe-plan.txt` 與 `permission-probe-build.txt` 的建立請求都在任何寫入前由權限提示拒絕，且兩個檔案均不存在。
- [ ] 若工具未先提示而直接寫入任一 probe，立即判定驗證失敗並停止；不得刪除檔案後視為通過。
- [ ] 01 requirements 與 02 spec 僅完成只讀分析；實際需求與規格檔案由後續經核准的 Build 操作建立。
- [ ] 表格每一列都已填寫結果，且 Git 三項證據均已檢視。
- [ ] Git 顯示的全部變更路徑都屬於本次核准任務。
- [ ] 沒有未核准的專案外讀取或寫入。
- [ ] 沒有未核准的套件安裝。
- [ ] 沒有未核准的檔案刪除。
- [ ] 沒有未核准的 commit、push、部署或其他發布操作。

核准任務路徑清單：____________________________________________________________

異常與處置紀錄：________________________________________________________________
