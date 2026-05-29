# LINE Sports Predictor Bot V6 世界盃版

## V6 新增
- 世界盃專區
- 今日世界盃
- 世界盃賽程
- 世界盃積分榜
- 世界盃淘汰賽
- 世界盃 AI 分析
- 世界盃主推 VIP
- 世界盃串關 VIP
- 爆冷預警 VIP
- 保留 V5 即時賽事
- 保留 Supabase 永久 VIP

## LINE 指令
```txt
世界盃
今日世界盃
世界盃賽程
世界盃積分榜
世界盃淘汰賽
世界盃 巴西 vs 阿根廷
世界盃主推
世界盃串關
爆冷預警
今日即時賽事
今日NBA
今日MLB
我的狀態
VIP名單
開通VIP Uxxxxxxxx 30
```

## 部署
1. 解壓縮 ZIP
2. GitHub 刪掉舊檔案
3. 上傳 V6 所有檔案
4. Commit changes
5. Render → Manual Deploy → Deploy latest commit

## Render 環境變數
保留原本：
```txt
LINE_CHANNEL_ACCESS_TOKEN
LINE_CHANNEL_SECRET
ADMIN_USER_ID
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

可新增但先不必：
```txt
API_FOOTBALL_KEY
```
