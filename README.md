# Han En Clinic Treatment Record Portal

涵恩婦產科診所自費療程紀錄系統。此版本包含：

- 診所內網前端頁面
- 醫護登入
- 病患身份驗證後填寫自己的療程資料與簽名
- 醫護後台查詢、編輯、PDF 匯出
- SQLite 後端儲存
- 稽核紀錄

## VM 部署

```bash
cd /var/www
git clone https://github.com/tomboy03150426/Hanen.git hanen
cd hanen
npm install
npm start
```

預設服務位置：

```text
http://VM_IP:4173
```

如果已經 clone 過：

```bash
cd /var/www/hanen
git pull
npm install
npm start
```

## 正式執行建議

建議使用 process manager，例如 pm2：

```bash
npm install -g pm2
cd /var/www/hanen
pm2 start server.js --name hanen
pm2 save
```

## 環境變數

可建立 `.env`：

```env
PORT=4173
DATA_DIR=/var/www/hanen/data
DB_PATH=/var/www/hanen/data/hanen.sqlite
SESSION_TTL_MS=43200000
```

## 預設測試帳號

```text
doctor.hsu / demo1234
nurse.chen / demo1234
```

第一次啟動會自動建立 SQLite 資料庫與測試帳號。

## 資料備份

正式資料庫預設在：

```text
data/hanen.sqlite
```

`data/` 不會進 Git，請在 VM 上定期備份：

```bash
cp data/hanen.sqlite data/hanen.sqlite.$(date +%F).bak
```

## 使用流程

1. 醫護或櫃台先登入醫護後台。
2. 到「櫃台開單」建立病患當次療程紀錄。
3. 病患在平板輸入姓名、身分證字號、生日後填寫表單。
4. 病患完成簽名與送出後，醫護後台會看到需要補填的施作細節。
5. 醫護可在個別病患頁面匯出 PDF。

## GitHub 更新到 VM

本機修改完成並推上 GitHub 後，VM 只要：

```bash
cd /var/www/hanen
git pull
npm install
pm2 restart hanen
```

若沒有使用 pm2，則停止原本的 `npm start` 後重新執行。
