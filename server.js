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

function startText() {
  return `🎰【黃金右腳 AI 百家預測 V10】

請輸入路單：

莊 閒 莊 莊 閒

支援指令：
開始
教學
百家預測 莊 閒 莊
我的ID
我的狀態
加入VIP

VIP功能：
✅ AI百家預測
✅ 信心指數
✅ 風險分級
✅ 注碼建議
✅ 長龍/斷龍提醒
✅ 莊閒趨勢分析`;
}

function vipInfo() {
  return `👑【VIP會員方案】

VIP解鎖：
✅ 百家AI預測
✅ 下注建議
✅ 信心百分比
✅ 風險提醒
✅ 長龍/斷龍判斷
✅ 每日主推

管理員開通格式：
開通VIP USER_ID 30`;
}

function needVip() {
  return `🔒 VIP專屬功能

請先開通VIP。

輸入：
加入VIP

或聯絡客服開通。`;
}

function teachText() {
  return `📘【百家預測教學】

請用文字輸入最近路單：

莊 閒 莊 莊 閒
或
百家預測 莊 閒 莊 莊 閒

系統會分析：
1. 莊閒比例
2. 連莊連閒
3. 斷龍機率
4. 下一手方向
5. 信心指數
6. 注碼建議

提醒：
預測僅供參考，請控制風險。`;
}

app.get("/", (req, res) => res.send("LINE Baccarat Bot V10 is running. Webhook: /webhook"));
app.get("/health", (req, res) => res.json({ ok: true, version: "v10" }));

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
    } else if (text.startsWith("開通VIP") && isAdmin) {
      const parts = text.split(/\s+/);
      const target = parts[1];
      const days = Number(parts[2] || 30);
      reply = target ? `已開通 VIP ✅\nUser ID：${target}\n到期日：${await addVip(target, days)}` : "格式：開通VIP LINE_USER_ID 天數";
    } else if (text.startsWith("取消VIP") && isAdmin) {
      const target = text.split(/\s+/)[1];
      if (!target) reply = "格式：取消VIP LINE_USER_ID";
      else {
        await removeVip(target);
        reply = `已取消 VIP：${target}`;
      }
    } else if (text === "VIP名單" && isAdmin) {
      const rows = await listVip();
      reply = rows.length
        ? "【VIP名單】\n" + rows.map(r => `${r.status === "active" ? "✅" : "❌"} ${r.user_id}\n到期：${r.expire_date}`).join("\n\n")
        : "目前沒有VIP資料。";
    } else if (text.includes("莊") || text.includes("閒") || text.startsWith("百家預測")) {
      if (!vip && !isAdmin) reply = needVip();
      else reply = baccarat.predict(text.replace("百家預測", "").trim());
    } else {
      reply = `收到：「${text}」

請輸入：
開始
教學
百家預測 莊 閒 莊 莊 閒
我的狀態
加入VIP`;
    }
  } catch (err) {
    console.error("Command error:", err);
    reply = `系統錯誤：${err.message}`;
  }

  return client.replyMessage(event.replyToken, { type: "text", text: reply });
}

app.listen(process.env.PORT || 3000, () => console.log("✅ LINE Baccarat Bot V10 running"));
