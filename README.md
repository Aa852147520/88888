# LINE Sports Predictor Bot V3 SaaS MVP

## V3 功能
- LINE 體育預測 Bot
- 免費 / VIP 權限判斷
- 每日精選
- 串關推薦
- 大小分分析
- 管理員開通 VIP
- VIP 名單 JSON 儲存
- Health Check `/health`

## Render 環境變數
```txt
LINE_CHANNEL_ACCESS_TOKEN=你的 Token
LINE_CHANNEL_SECRET=你的 Secret
ADMIN_USER_ID=你的 LINE User ID
```

## 如何取得 ADMIN_USER_ID
部署成功後，用自己的 LINE 對機器人輸入：
```txt
我的ID
```
把回傳的 User ID 貼到 Render 的 `ADMIN_USER_ID`。

改完後：
```txt
Manual Deploy → Deploy latest commit
```

## Webhook
```txt
https://你的Render網址.onrender.com/webhook
```

## 一般指令
```txt
說明
今日賽事
預測 湖人 vs 勇士
NBA 湖人 vs 勇士
MLB 洋基 vs 道奇
足球 阿根廷 vs 法國
我的狀態
加入VIP
```

## VIP 指令
```txt
每日精選
串關
大小分 湖人 vs 勇士
```

## 管理員指令
```txt
我的ID
開通VIP USER_ID 30
取消VIP USER_ID
VIP名單
```

## 注意
Render 免費版重啟後，檔案儲存可能不穩定。正式商用建議改接資料庫，例如 Supabase、Firebase、PostgreSQL。
