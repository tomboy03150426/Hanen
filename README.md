# 涵恩婦產科診所｜自費療程紀錄系統

這個版本已從展示用 prototype 往正式上線前端規格靠攏，重點不再只是畫面，而是把實際系統會需要的前端約束先立起來。

## 目前已補上的上線向能力

1. 患者端與醫護端權限分流
   - 患者只能透過已簽發的 QR token 進入自己的資料
   - 醫護端必須以帳密登入後才能查詢與編輯
2. 表單權限拆分
   - 患者端只填左側欄位：日期、付款狀態、困擾量表、治療後反饋、簽名
   - 醫護端只編輯右側欄位：模式、強度、施作部位 / 時間、護理師
3. 多療程表單架構
   - 患者登入後只顯示需要填寫的表單區塊
   - 目前前端已支援 `磁波椅` 與 `陰道雷射` 兩種療程項目切換
   - 後續新增療程時可沿用同一套 treatment catalog 結構
4. 本機持久化
   - 使用 `localStorage` 暫存患者資料、醫護登入狀態與最近編輯結果
5. 正式流程驗證
   - token 格式檢查
   - 未簽發 token 不允許登入
   - 患者送出時會驗證姓名、生日、病歷號、困擾量表、反饋與簽名
   - 已簽名資料如果再被患者修改，簽名會自動失效並要求重簽
6. 基礎稽核軌跡
   - 本機會留下登入、送出、簽名、醫護修改的 audit trail

## 檔案

- `index.html`: 主介面與頁面結構
- `styles.css`: 品牌樣式、表格與互動狀態
- `app.js`: 前端狀態管理、登入權限、驗證、簽名、資料持久化
- `database-schema.sql`: 對應正式落地的資料庫結構

## 示範帳號

- 患者 token：`HE-2026-0428-LIN`
- 醫師：`doctor.hsu / demo1234`
- 護理師：`nurse.chen / demo1234`

## 正式上線前仍建議補上

1. 後端 API 與真正的認證
   - 患者 QR token 應由後端短時效簽發
   - 醫護登入應改用真正帳號系統、JWT / session cookie
2. 真實 QR code 產生與驗證
   - 目前畫面仍是前端示範入口
   - 正式版應由後端產生可掃描 payload
3. 個資與簽名檔安全
   - 簽名圖片應存物件儲存或加密檔案系統
   - 病歷號、聯絡方式、日志應依院所規範加密與控管
4. 更完整的權限矩陣
   - 醫師 / 護理師可再細分查閱、編輯、結案、列印權限
5. 稽核與法遵
   - 後端 audit log
   - 欄位異動歷程
   - IP / user agent / 操作來源紀錄

## 建議 API 切點

### 患者端

- `POST /api/patient-access/verify-token`
- `GET /api/patient-access/forms/:token`
- `PUT /api/patient-access/forms/:token`
- `POST /api/patient-access/forms/:token/signature`

### 醫護端

- `POST /api/staff-auth/login`
- `POST /api/staff-auth/logout`
- `GET /api/treatment-records`
- `GET /api/treatment-records/:id`
- `PUT /api/treatment-records/:id/sessions/:sessionNo`

## 備註

目前這份仍是純前端版本，但資料流、權限邏輯與欄位責任已經開始按正式系統思維整理，後續接 Laravel、Node/Express、NestJS 或 Supabase 都可以順著這個結構往下接。
