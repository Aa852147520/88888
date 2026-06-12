require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const { createClient } = require("@supabase/supabase-js");
const baccarat = require("./baccarat-ai");

const app = express();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function addDays(days) {
  const d = new Date(Date.now() + Number(days || 30) * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

async function getVip(userId) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
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
  if (!data || data.status !== "active") return false;
  return new Date(data.expire_date + "T23:59:59").getTime() >= Date.now();
}

async function addVip(userId, days = 30) {
  const expireDate = addDays(days);
  const { error } = await supabase.from("vip_users").upsert({
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

async function listVip(limit = 30) {
  const { data, error } = await supabase
    .from("vip_users")
    .select("user_id, expire_date, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

async function getRoad(userId) {
  const { data, error } = await supabase
    .from("baccarat_roads")
    .select("road")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return [];
  return Array.isArray(data.road) ? data.road : [];
}

async function saveRoad(userId, road) {
  const { error } = await supabase.from("baccarat_roads").upsert({
    user_id: userId,
    road,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });

  if (error) throw error;
}

async function clearRoad(userId) {
  await saveRoad(userId, []);
}

function startText() {
  return `🎰【即時百家分析教學】

即時分析玩法：
直接輸入：
莊
閒
和

系統會自動累積路單並分析下一手。

常用指令：
開始
教學
我的路單
清除路單
我的ID
我的狀態
加入VIP

一次輸入整串也可以：
百家預測 莊 閒 莊 莊 閒`;
}

function vipInfo() {
  return `👑【VIP會員方案】

VIP解鎖：
✅ 即時百家分析
✅ 每位會員獨立路單
✅ 自動累積莊閒和
✅ 下一手建議
✅ 信心百分比
✅ 風險分級
✅ 注碼建議
✅ 長龍/斷龍提醒

請聯絡客服開通🔒
LINE:@058gvokk`;
}

function needVip() {
  return `🔒 VIP專屬功能

請先開通VIP。

輸入：
加入VIP

請聯絡客服開通🔒
LINE:@058gvokk`;
}

function teachText() {
  return `📘【即時百家分析教學】

1. 開局輸入：
清除路單

2. 每一手結束後輸入：
莊
或
閒
或
和

3. 系統會自動回覆：
目前路單
莊閒統計
連莊連閒
下一手建議
信心指數
注碼建議

也可以一次輸入：
百家預測 莊 閒 莊 莊 閒`;
}

app.get("/", (req, res) => res.send("LINE Baccarat Bot V11 Live is running. Webhook: /webhook"));
app.get("/health", (req, res) => res.json({ ok: true, version: "v11-live" }));

app.post("/webhook", line.middleware(config), async (req, res) => {
  try {
    const client = new line.Client(config);
    await Promise.all((req.body.events || []).map(event => handleEvent(event, client)));
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
  const isAdmin = ADMIN_USER_ID && userId === ADMIN_USER_ID;

  if (text === "開始" || text === "說明" || text.toLowerCase() === "help") {
    return client.replyMessage(event.replyToken, { type: "text", text: startText() });
  }

  if (text === "教學") {
    return client.replyMessage(event.replyToken, { type: "text", text: teachText() });
  }

  if (text === "加入VIP" || text === "VIP") {
    return client.replyMessage(event.replyToken, { type: "text", text: vipInfo() });
  }

  if (text === "我的ID") {
    return client.replyMessage(event.replyToken, { type: "text", text: `你的 LINE User ID：\n${userId}` });
  }

  const vip = await isVip(userId);
  const vipData = await getVip(userId);
  let reply = "";

  try {
    if (text === "我的狀態") {
      reply = vip
        ? `你目前是 VIP 會員 ✅\n到期日：${vipData.expire_date}`
        : "你目前不是 VIP 會員。\n輸入「加入VIP」查看方案。";
    }

    else if (text.startsWith("開通VIP") && isAdmin) {
      const parts = text.split(/\s+/);
      const target = parts[1];
      const days = Number(parts[2] || 30);
      reply = target ? `已開通 VIP ✅\nUser ID：${target}\n到期日：${await addVip(target, days)}` : "格式：開通VIP LINE_USER_ID 天數";
    }

    else if (text.startsWith("取消VIP") && isAdmin) {
      const target = text.split(/\s+/)[1];
      if (!target) reply = "格式：取消VIP LINE_USER_ID";
      else {
        await removeVip(target);
        reply = `已取消 VIP：${target}`;
      }
    }

    else if (text === "VIP名單" && isAdmin) {
      const rows = await listVip();
      reply = rows.length
        ? "【VIP名單】\n" + rows.map(r => `${r.status === "active" ? "✅" : "❌"} ${r.user_id}\n到期：${r.expire_date}`).join("\n\n")
        : "目前沒有VIP資料。";
    }

    else if (text === "清除路單") {
      if (!vip && !isAdmin) reply = needVip();
      else {
        await clearRoad(userId);
        reply = "✅ 已清除你的百家路單。\n\n請開始輸入：莊 / 閒 / 和";
      }
    }

    else if (text === "我的路單") {
      if (!vip && !isAdmin) reply = needVip();
      else {
        const road = await getRoad(userId);
        reply = road.length
          ? `🎰【你的目前路單】\n\n${road.join(" ")}\n\n總手數：${road.length}`
          : "目前沒有路單。\n請輸入：莊 / 閒 / 和";
      }
    }

    else if (["莊", "閒", "和", "庄"].includes(text)) {
      if (!vip && !isAdmin) {
        reply = needVip();
      } else {
        const value = text === "庄" ? "莊" : text;
        const road = await getRoad(userId);
        road.push(value);
        const limitedRoad = road.slice(-80);
        await saveRoad(userId, limitedRoad);
        reply = baccarat.livePredict(limitedRoad);
      }
    }

    else if (text.includes("莊") || text.includes("閒") || text.startsWith("百家預測")) {
      if (!vip && !isAdmin) {
        reply = needVip();
      } else {
        const roadText = text.replace("百家預測", "").trim();
        reply = baccarat.predict(roadText);
      }
    }

    else {
      reply = `收到：「${text}」

請輸入：
開始
教學
莊
閒
和
我的路單
清除路單
加入VIP`;
    }

  } catch (err) {
    console.error("Command error:", err);
    reply = `系統錯誤：${err.message}`;
  }

 return client.replyMessage(event.replyToken, {
type: "text",
text: reply,
quickReply: {
items: [
{
type: "action",
action: {
type: "message",
label: "🔴 莊",
text: "莊"
}
},
{
type: "action",
action: {
type: "message",
label: "🟢 和",
text: "和"
}
},
{
type: "action",
action: {
type: "message",
label: "🔵 閒",
text: "閒"
}
},
{
type: "action",
action: {
type: "message",
label: "📋 我的路單",
text: "我的路單"
}
},
{
type: "action",
action: {
type: "message",
label: "🗑️ 清除路單",
text: "清除路單"
}
}
]
}
});
}

app.listen(process.env.PORT || 3000, () => console.log("✅ LINE Baccarat Bot V11 Live running"));
