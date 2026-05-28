require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const fs = require("fs");
const path = require("path");
const engine = require("./sports-engine");

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";
const VIP_FILE = path.join(__dirname, "vip-users.json");

const app = express();

function loadVipUsers() {
  try {
    return JSON.parse(fs.readFileSync(VIP_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveVipUsers(data) {
  fs.writeFileSync(VIP_FILE, JSON.stringify(data, null, 2), "utf8");
}

function isVip(userId) {
  const vip = loadVipUsers();
  const exp = vip[userId];
  if (!exp) return false;
  return new Date(exp).getTime() >= Date.now();
}

function addVip(userId, days = 30) {
  const vip = loadVipUsers();
  const expire = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  vip[userId] = expire.toISOString().slice(0, 10);
  saveVipUsers(vip);
  return vip[userId];
}

function removeVip(userId) {
  const vip = loadVipUsers();
  delete vip[userId];
  saveVipUsers(vip);
}

app.get("/", (req, res) => {
  res.send("LINE Sports Predictor Bot V3 SaaS MVP is running. Webhook: /webhook");
});

app.get("/health", (req, res) => {
  res.json({ ok: true, version: "v3", time: new Date().toISOString() });
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
  const userId = event.source.userId || "";
  const vip = isVip(userId);
  const isAdmin = ADMIN_USER_ID && userId === ADMIN_USER_ID;

  let reply = "";

  if (text === "我的ID") {
    reply = `你的帳號ID序號：\n${userId}\n\n     請聯絡管理員開通        
    管理員官方LINE:@058gvokk`;
  } else if (text === "說明" || text.toLowerCase() === "help") {
    reply = engine.helpText(vip, isAdmin);
  } else if (text === "今日賽事") {
    reply = engine.todayGames();
  } else if (text === "每日精選") {
    reply = vip ? engine.vipDailyPicks() : engine.needVip();
  } else if (text.includes("串關")) {
    reply = vip ? engine.vipParlay() : engine.needVip();
  } else if (text.includes("大小分")) {
    reply = vip ? engine.overUnderAnalysis(text) : engine.needVip();
  } else if (text.toLowerCase().includes("nba")) {
    reply = engine.nbaAnalysis(text, vip);
  } else if (text.toLowerCase().includes("mlb")) {
    reply = engine.mlbAnalysis(text, vip);
  } else if (text.includes("足球") || text.toLowerCase().includes("football") || text.toLowerCase().includes("soccer")) {
    reply = engine.footballAnalysis(text, vip);
  } else if (text.startsWith("預測")) {
    reply = engine.predictByText(text, vip);
  } else if (text === "VIP" || text === "加入VIP") {
    reply = engine.vipInfo();
  } else if (text === "我的狀態") {
    reply = vip ? `你目前是 VIP 會員 ✅` : `你目前不是 VIP 會員。輸入「加入VIP」查看方案。`;
  } else if (isAdmin && text.startsWith("開通VIP")) {
    const parts = text.split(/\s+/);
    const target = parts[1];
    const days = Number(parts[2] || 30);
    if (!target) reply = "格式：開通VIP LINE_USER_ID 天數\n例如：開通VIP Uxxxxxxxx 30";
    else {
      const exp = addVip(target, days);
      reply = `已開通 VIP ✅\nUser ID：${target}\n到期日：${exp}`;
    }
  } else if (isAdmin && text.startsWith("取消VIP")) {
    const parts = text.split(/\s+/);
    const target = parts[1];
    if (!target) reply = "格式：取消VIP LINE_USER_ID";
    else {
      removeVip(target);
      reply = `已取消 VIP：${target}`;
    }
  } else if (isAdmin && text === "VIP名單") {
    reply = "【VIP 名單】\n" + JSON.stringify(loadVipUsers(), null, 2);
  } else {
    reply = `收到：「${text}」

可輸入：
說明
今日賽事
預測 湖人 vs 勇士
NBA 湖人 vs 勇士
MLB 洋基 vs 道奇
足球 阿根廷 vs 法國
大小分 湖人 vs 勇士
每日精選
串關
我的狀態
加入VIP`;
  }

  return client.replyMessage(event.replyToken, { type: "text", text: reply });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ LINE Sports Predictor Bot V3 SaaS MVP running on port ${port}`);
});
