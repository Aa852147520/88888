require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const {
  helpText,
  todayGames,
  predictByText,
  nbaAnalysis,
  mlbAnalysis,
  footballAnalysis,
  parlayTips,
  vipInfo,
  riskNotice
} = require("./sports-engine");

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const app = express();

app.get("/", (req, res) => {
  res.send("LINE Sports Predictor Bot V2 is running. Webhook: /webhook");
});

app.post("/webhook", line.middleware(config), async (req, res) => {
  try {
    const client = new line.Client(config);
    const events = req.body.events || [];
    await Promise.all(events.map(event => handleEvent(event, client)));
    res.status(200).end();
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).end();
  }
});

async function handleEvent(event, client) {
  if (event.type !== "message" || event.message.type !== "text") return;

  const text = event.message.text.trim();
  let reply = "";

  if (["說明", "help", "功能"].includes(text.toLowerCase())) {
    reply = helpText();
  } else if (text.includes("今日賽事")) {
    reply = todayGames();
  } else if (text.toLowerCase().includes("nba")) {
    reply = nbaAnalysis(text);
  } else if (text.toLowerCase().includes("mlb")) {
    reply = mlbAnalysis(text);
  } else if (text.includes("足球") || text.toLowerCase().includes("football") || text.toLowerCase().includes("soccer")) {
    reply = footballAnalysis(text);
  } else if (text.includes("串關")) {
    reply = parlayTips();
  } else if (text.toLowerCase().includes("vip") || text.includes("加入VIP") || text.includes("加入vip")) {
    reply = vipInfo();
  } else if (text.startsWith("預測")) {
    reply = predictByText(text);
  } else if (text.includes("風險")) {
    reply = riskNotice();
  } else {
    reply = `收到：「${text}」

你可以輸入：
1. 說明
2. 今日賽事
3. NBA 湖人 vs 勇士
4. MLB 洋基 vs 道奇
5. 足球 阿根廷 vs 法國
6. 串關
7. VIP`;
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: reply
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ LINE Sports Predictor Bot V2 running on port ${port}`);
});
