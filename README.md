# LINE Sports Predictor Bot V4 Supabase 永久 VIP 版

## V4 解決什麼問題？
Render 免費版會重置檔案，所以 V3 的 `vip-users.json` 可能消失。
V4 改用 Supabase 資料庫永久保存 VIP 名單。

## 新增功能
- Supabase 永久 VIP
- VIP 到期日永久保存
- Render 重啟不掉會員
- 管理員開通 / 取消 VIP
- VIP 名單查詢
- `/health` 檢查 Supabase 是否連線成功

## 需要的 Render 環境變數
```txt
LINE_CHANNEL_ACCESS_TOKEN=你的 LINE Token
LINE_CHANNEL_SECRET=你的 LINE Secret
ADMIN_USER_ID=你的 LINE User ID
SUPABASE_URL=你的 Supabase Project URL
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service_role key
```

## Supabase 建表
到 Supabase → SQL Editor → New query
貼上 `supabase-schema.sql` 內容，按 Run。

## Webhook
```txt
https://你的Render網址.onrender.com/webhook
```

## 測試指令
```txt
說明
我的狀態
今日賽事
每日精選
串關
大小分 湖人 vs 勇士
我的ID
VIP名單
開通VIP Uxxxxxxxx 30
取消VIP Uxxxxxxxx
```

## 注意
`SUPABASE_SERVICE_ROLE_KEY` 很重要，不要公開。
只能放在 Render Environment Variables。
