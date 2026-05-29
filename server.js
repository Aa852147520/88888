require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const { createClient } = require("@supabase/supabase-js");
const engine = require("./sports-engine");

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

  if (error) {
    console.error("getVip error:", error);
    return null;
  }
  return data;
}

async function isVip(userId) {
  const data = await getVip(userId);
  if (!data) return false;
  if (data.status !== "active") return false;
  return new Date(data.expire_date + "T23:59:59").getTime() >= Date.now();
}

async function addVip(userId, days = 30, note = "manual") {
  const expireDate = addDays(days);
  const { error } = await supabase
    .from("vip_users")
    .upsert({
      user_id: userId,
      expire_date: expireDate,
      status: "active",
      note,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });

  if (error) throw error;
  return expireDate;
}

async function removeVip(userId) {
  const { error } = await supabase
    .from("vip_users")
    .update({
      status: "inactive",
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId);

  if (error) throw error;
}

async function listVip() {
  const { data, error } = await supabase
    .from("vip_users")
    .select("user_id, expire_date, status, note, updated_at")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

app.get("/", (req, res) => {
  res.send("LINE Sports Predictor Bot V4 Supabase is running. Webhook: /webhook");
});

app.get("/health", async (req, res) => {
  try {
    const { error } = await supabase.from("vip_users").select("user_id").limit(1);
    res.json({
      ok: !error,
      version: "v4-supabase",
      supabase: error ? error.message : "connected",
      time: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
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
    if (text === "開通") {
      reply = `你的開通 ID：\n${userId}\n\n開通請聯絡管理員
      官方LINE:@058gvokk`;
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
      if (vip) {
        reply = `你目前是 VIP 會員 ✅\n到期日：${vipData.expire_date}`;
      } else if (vipData) {
        reply = `你目前不是 VIP 會員。\n狀態：${vipData.status}\n到期日：${vipData.expire_date}\n輸入「加入VIP」查看方案。`;
      } else {
        reply = `你目前不是 VIP 會員。\n輸入「加入VIP」查看方案。`;
      }
    } else if (isAdmin && text.startsWith("開通VIP")) {
      const parts = text.split(/\s+/);
      const target = parts[1];
      const days = Number(parts[2] || 30);
      if (!target) reply = "格式：開通VIP LINE_USER_ID 天數\n例如：開通VIP Uxxxxxxxx 30";
      else {
        const exp = await addVip(target, days, "manual");
        reply = `已開通 VIP ✅\nUser ID：${target}\n到期日：${exp}\n`;
      }
    } else if (isAdmin && text.startsWith("取消VIP")) {
      const parts = text.split(/\s+/);
      const target = parts[1];
      if (!target) reply = "格式：取消VIP LINE_USER_ID";
      else {
        await removeVip(target);
        reply = `已取消 VIP：${target}`;
      }
    } else if (isAdmin && text === "VIP名單") {
      const rows = await listVip();
      if (!rows.length) reply = "目前沒有 VIP 資料。";
      else reply = "【VIP 名單】\n" + rows.map(r => `${r.status === "active" ? "✅" : "❌"} ${r.user_id}\n到期：${r.expire_date}\n狀態：${r.status}`).join("\n\n");
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
  } catch (err) {
    console.error("Command error:", err);
    reply = `系統錯誤：${err.message}\n請管理員檢查 Supabase 設定或 Render Logs。`;
  }

  return client.replyMessage(event.replyToken, { type: "text", text: reply });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ LINE Sports Predictor Bot V4 Supabase running on port ${port}`);
});
