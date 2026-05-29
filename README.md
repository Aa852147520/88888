# LINE Sports Predictor Bot V6.1 API-Football 版

## V6.1 新增
- API-Football 真實資料串接
- API狀態
- 今日足球
- 即時比分
- 英超/西甲/義甲/德甲/法甲積分榜
- 今日世界盃 / 世界盃賽程 / 世界盃積分榜 優先抓 API
- 保留 Supabase 永久 VIP

## LINE 測試指令
```txt
API狀態
今日足球
即時比分
英超積分榜
世界盃
今日世界盃
世界盃賽程
世界盃積分榜
世界盃 巴西 vs 阿根廷
世界盃主推
今日NBA
VIP名單
```

## Render 環境變數
```txt
LINE_CHANNEL_ACCESS_TOKEN
LINE_CHANNEL_SECRET
ADMIN_USER_ID
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
API_FOOTBALL_KEY
```

## 升級
1. 解壓縮 ZIP
2. GitHub 刪除舊檔案
3. 上傳 V6.1 所有檔案
4. Commit changes
5. Render → Manual Deploy → Deploy latest commit
6. LINE 輸入 API狀態
