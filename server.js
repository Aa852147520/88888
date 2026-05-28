



require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const { predictMatch, todayMatches, formatPrediction, helpText } = require('./sports-engine');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

if (!config.channelAccessToken || !config.channelSecret) {
  console.warn('⚠️ 請先設定 LINE_CHANNEL_ACCESS_TOKEN 與 LINE_CHANNEL_SECRET');
}

const app = express();
const client = new line.Client(config);

app.get('/', (_, res) => {
  res.send('LINE Sports Predictor Bot is running. Webhook: /webhook');
});

app.post('/webhook', line.middleware(config), async (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return null;
  const text = event.message.text.trim();
  const reply = routeText(text, event.source.userId);
  return client.replyMessage(event.replyToken, { type: 'text', text: reply });
}

function routeText(text, userId) {
  const lower = text.toLowerCase();

  if (['help', '說明', '功能', '指令'].some(k => lower.includes(k))) return helpText();
  if (['今日賽事', '賽事', 'today'].some(k => lower.includes(k))) {
    return todayMatches().map(m => `#${m.id} ${m.league}\n${m.home} vs ${m.away}\n開賽：${m.time}`).join('\n\n');
  }

  // 指令格式：預測 1 或 分析 2
  const matchId = text.match(/(?:預測|分析|predict)\s*#?(\d+)/i)?.[1];
  if (matchId) {
    const match = todayMatches().find(m => String(m.id) === String(matchId));
    if (!match) return '找不到這場賽事，請輸入「今日賽事」查看可分析的場次。';
    return formatPrediction(predictMatch(match));
  }

  // 自訂格式：預測 湖人 vs 勇士
  const custom = text.match(/(?:預測|分析)\s*(.+?)\s*(?:vs|VS|對|v)\s*(.+)/);
  if (custom) {
    const match = {
      id: 'custom', league: '自訂賽事', time: '未指定',
      home: custom[1].trim(), away: custom[2].trim(),
      homeForm: 55, awayForm: 50, homeAttack: 54, awayAttack: 51,
      homeDefense: 51, awayDefense: 50, injuryImpactHome: 3, injuryImpactAway: 3,
      homeAdvantage: 4, marketHeatHome: 50, marketHeatAway: 50
    };
    return formatPrediction(predictMatch(match));
  }

  if (lower.includes('id')) return `你的 LINE User ID：${userId || '無法取得'}`;

  return '輸入「今日賽事」查看場次，或輸入「預測 1」取得分析。\n輸入「說明」看完整指令。';
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ LINE Sports Predictor Bot running on port ${port}`));
