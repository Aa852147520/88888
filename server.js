require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const { createClient } = require("@supabase/supabase-js");
const engine = require("./sports-engine");
const live = require("./live-games");
const footballApi = require("./api-football-engine");

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const app = express();

function addDays(days) {
  const d = new Date(Date.now() + Number(days || 30) * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

async function getVip(userId) {
  const { data, error } = await supabase
    .from("vip_users")
    .select("user_id, expire_date, status")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return null;
  return data;
}

async function isVip(userId) {
  const data = await getVip(userId);
  if (!data) return false;
  if (data.status !== "active") return false;
  return new Date(data.expire_date + "T23:59:59").getTime() >= Date.now();
}

async function addVip(userId, days = 30) {
  const expireDate = addDays(days);
  const { error } = await supabase
    .from("vip_users")
    .upsert({
      user_id: userId,
      expire_date: expireDate,
      status: "active",
      note: "manual",
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
  if (error) throw error;
  return expireDate;
}

async function removeVip(userId) {
  const { error } = await supabase
    .from("vip_users")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}

async function listVip() {
  const { data, error } = await supabase
    .from("vip_users")
    .select("user_id, expire_date, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data || [];
}

function vipOnly(vip, fn) {
  return vip ? fn() : Promise.resolve(engine.needVip());
}

app.get("/", (req, res) => {
  res.send("LINE Sports Predictor Bot V6.2 VIP Locked is running. Webhook: /webhook");
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    version: "v6.2-vip-locked",
    apiFootball: !!process.env.API_FOOTBALL_KEY,
    time: new Date().toISOString()
  });
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
  const vip = await isVip(userId);
  const vipData = await getVip(userId);
  const isAdmin = ADMIN_USER_ID && userId === ADMIN_USER_ID;
  let reply = "";

  try {
    if (text === "我的ID") {
      reply = `你的 LINE User ID：\n${userId}`;
    } else if (text === "說明" || text.toLowerCase() === "help") {
      reply = engine.helpText(vip, isAdmin);

    // 管理員與狀態
    } else if (text === "API狀態") {
      reply = isAdmin ? await footballApi.apiStatus() : engine.needVip();
    } else if (text === "我的狀態") {
      reply = vip ? `你目前是 VIP 會員 ✅\n到期日：${vipData.expire_date}` : "你目前不是 VIP 會員。\n輸入「加入VIP」查看方案。";
    } else if (text === "VIP" || text === "加入VIP") {
      reply = engine.vipInfo();

    // VIP 鎖定：足球 API
    } else if (text === "今日足球") {
      reply = await vipOnly(vip, () => footballApi.todayFootball());
    } else if (text === "即時比分" || text === "足球比分") {
      reply = await vipOnly(vip, () => footballApi.liveScores());
    } else if (text === "英超積分榜") {
      reply = await vipOnly(vip, () => footballApi.standings("PL"));
    } else if (text === "西甲積分榜") {
      reply = await vipOnly(vip, () => footballApi.standings("PD"));
    } else if (text === "義甲積分榜") {
      reply = await vipOnly(vip, () => footballApi.standings("SA"));
    } else if (text === "德甲積分榜") {
      reply = await vipOnly(vip, () => footballApi.standings("BL1"));
    } else if (text === "法甲積分榜") {
      reply = await vipOnly(vip, () => footballApi.standings("FL1"));

    // 世界盃：說明免費，真實賽程/積分榜/VIP內容鎖定
    } else if (text === "世界盃" || text === "世界盃說明") {
      reply = footballApi.worldCupHelp(vip);
    } else if (text === "今日世界盃") {
      reply = await vipOnly(vip, () => footballApi.todayWorldCup());
    } else if (text === "世界盃賽程") {
      reply = await vipOnly(vip, () => footballApi.worldCupSchedule());
    } else if (text === "世界盃積分榜") {
      reply = await vipOnly(vip, () => footballApi.worldCupStandings());
    } else if (text === "世界盃主推") {
      reply = vip ? footballApi.worldCupMainPick() : engine.needVip();
    } else if (text === "世界盃串關") {
      reply = vip ? footballApi.worldCupParlay() : engine.needVip();
    } else if (text === "爆冷預警" || text === "世界盃爆冷預警") {
      reply = vip ? footballApi.worldCupUpsetAlert() : engine.needVip();
    } else if (text.startsWith("世界盃")) {
      // 免費保留基本世界盃分析，做引流
      reply = footballApi.worldCupPrediction(text.replace("世界盃", "").trim(), vip);

    // 其他即時賽事：VIP 鎖定
    } else if (text === "今日賽事" || text === "今日即時賽事") {
      reply = await vipOnly(vip, () => live.todayAllGames());
    } else if (text.toUpperCase() === "今日NBA") {
      reply = await vipOnly(vip, () => live.todayGamesBySport("NBA"));
    } else if (text.toUpperCase() === "今日MLB") {
      reply = await vipOnly(vip, () => live.todayGamesBySport("MLB"));
    } else if (text.toUpperCase() === "今日NFL") {
      reply = await vipOnly(vip, () => live.todayGamesBySport("NFL"));
    } else if (text.toUpperCase() === "今日NHL") {
      reply = await vipOnly(vip, () => live.todayGamesBySport("NHL"));
    } else if (text.startsWith("即時分析")) {
      reply = await vipOnly(vip, () => live.livePrediction(text.replace("即時分析", "").trim(), vip));

    // VIP 鎖定：分析功能
    } else if (text === "每日精選") {
      reply = vip ? engine.vipDailyPicks() : engine.needVip();
    } else if (text.includes("串關")) {
      reply = vip ? engine.vipParlay() : engine.needVip();
    } else if (text.includes("大小分")) {
      reply = vip ? engine.overUnderAnalysis(text) : engine.needVip();

    // 免費保留基礎分析
    } else if (text.toLowerCase().includes("nba")) {
      reply = engine.nbaAnalysis(text, vip);
    } else if (text.toLowerCase().includes("mlb")) {
      reply = engine.mlbAnalysis(text, vip);
    } else if (text.includes("足球") || text.toLowerCase().includes("football") || text.toLowerCase().includes("soccer")) {
      reply = engine.footballAnalysis(text, vip);
    } else if (text.startsWith("預測")) {
      reply = engine.predictByText(text, vip);

    // 管理員
    } else if (isAdmin && text.startsWith("開通VIP")) {
      const parts = text.split(/\s+/);
      const target = parts[1];
      const days = Number(parts[2] || 30);
      if (!target) reply = "格式：開通VIP LINE_USER_ID 天數";
      else {
        const exp = await addVip(target, days);
        reply = `已開通 VIP ✅\nUser ID：${target}\n到期日：${exp}`;
      }
    } else if (isAdmin && text.startsWith("取消VIP")) {
      const target = text.split(/\s+/)[1];
      if (!target) reply = "格式：取消VIP LINE_USER_ID";
      else {
        await removeVip(target);
        reply = `已取消 VIP：${target}`;
      }
    } else if (isAdmin && text === "VIP名單") {
      const rows = await listVip();
      reply = rows.length ? "【VIP 名單】\n" + rows.map(r => `${r.status === "active" ? "✅" : "❌"} ${r.user_id}\n到期：${r.expire_date}`).join("\n\n") : "目前沒有 VIP 資料。";
    } else {
      reply = `收到：「${text}」

免費可用：
說明
加入VIP
我的狀態
世界盃 巴西 vs 阿根廷
NBA 湖人 vs 勇士
MLB 洋基 vs 道奇

VIP 可用：
今日足球
即時比分
今日世界盃
世界盃賽程
世界盃積分榜
每日精選
世界盃主推
世界盃串關
爆冷預警`;
    }
  } catch (err) {
    console.error("Command error:", err);
    reply = `系統錯誤：${err.message}\n請檢查 Render Logs。`;
  }

  return client.replyMessage(event.replyToken, { type: "text", text: reply });
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ LINE Sports Predictor Bot V6.2 VIP Locked running on port ${port}`));
