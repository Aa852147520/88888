# LINE 體育預測機器人 MVP

## 功能
- LINE Webhook 接收訊息
- 今日賽事列表
- 輸入「預測 1」取得勝率、信心指數、風險等級
- 輸入「預測 湖人 vs 勇士」可做自訂分析
- 可部署 Render / Railway / VPS

## 本機啟動
```bash
npm install
cp .env.example .env
npm start
```

## LINE Developers 必填
`.env`：
```env
LINE_CHANNEL_ACCESS_TOKEN=你的 token
LINE_CHANNEL_SECRET=你的 secret
```

## Webhook URL
部署後設定：
```text
https://你的網域/webhook
```

## Render 部署
1. 上傳到 GitHub
2. Render > New > Web Service
3. Build Command：`npm install`
4. Start Command：`npm start`
5. Environment Variables 加上：
   - LINE_CHANNEL_ACCESS_TOKEN
   - LINE_CHANNEL_SECRET
6. LINE Developers 後台 Webhook URL 填：`https://你的服務.onrender.com/webhook`

## 後續可升級
- 串接 TheSportsDB / API-Football / Odds API
- MongoDB 儲存會員與預測紀錄
- 管理員後台新增賽事
- VIP 權限控管與到期提醒
- Rich Menu 圖文選單
