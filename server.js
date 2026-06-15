require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const { createClient } = require("@supabase/supabase-js");
const baccarat = require("./baccarat-ai");

const app = express();
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";
const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");

const ROOMS = {
  DG: ["A01","A02","A03","A05","A08","B01","B02","B03","C01","C02"],
  MT: ["B01","B02","B03","B05","B08","C01","C02","C03","D01","D02"]
};

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

function roadKey(type = "MAIN", room = "DEFAULT") {
  return `${type}_${room}`.toUpperCase();
}

async function getRoad(userId, key = "MAIN_DEFAULT") {
  const { data, error } = await supabase
    .from("baccarat_roads")
    .select("road")
    .eq("user_id", userId)
    .eq("road_key", key)
    .maybeSingle();
  if (error || !data) return [];
  return Array.isArray(data.road) ? data.road : [];
}

async function saveRoad(userId, key, road) {
  const { error } = await supabase.from("baccarat_roads").upsert({
    user_id: userId,
    road_key: key,
    road,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,road_key" });
  if (error) throw error;
}

async function clearRoad(userId, key = "MAIN_DEFAULT") {
  await saveRoad(userId, key, []);
}

function quickReply() {
  return {
    items: [
      { type:"action", action:{ type:"message", label:"🔴 莊", text:"莊" }},
      { type:"action", action:{ type:"message", label:"🟢 和", text:"和" }},
      { type:"action", action:{ type:"message", label:"🔵 閒", text:"閒" }},
      { type:"action", action:{ type:"message", label:"🏆 DG房號", text:"DG房號" }},
      { type:"action", action:{ type:"message", label:"🎲 MT房號", text:"MT房號" }},
      { type:"action", action:{ type:"message", label:"📋 我的路單", text:"我的路單" }}
    ]
  };
}

function roomQuickReply(type) {
  return {
    items: ROOMS[type].slice(0, 10).map(room => ({
      type:"action",
      action:{ type:"message", label:`${type} ${room}`, text:`${type} ${room}` }
    }))
  };
}

function replyText(client, token, text, qr = quickReply()) {
  return client.replyMessage(token, { type:"text", text, quickReply: qr });
}

function vipInfo() {
  return `👑【VIP會員方案】

VIP解鎖：
✅ 即時百家分析
✅ DG房號獨立路單
✅ MT房號獨立路單
✅ 下一手建議
✅ 即時信心指數
✅ 注碼建議
✅ 長龍/斷龍提醒

請聯絡客服開通🔒
LINE:@058gvokk`;
}

function needVip() {
  return `🔒 VIP專屬功能

此功能僅限 VIP 會員使用。

請輸入：
加入VIP

請聯絡客服開通🔒
LINE:@058gvokk`;
}

function startText() {
  return `🎰【黃金右腳 AI 百家分析 V13】

VIP會員專屬：

✅ 即時百家分析
✅ DG房號獨立路單
✅ MT房號獨立路單
✅ 即時信心指數
✅ 風險分級
✅ 長龍／斷龍提醒

一般路單：
莊 / 閒 / 和

DG房號：
DG房號
DG A01 莊
DG A01 閒
DG A01 和

MT房號：
MT房號
MT B01 莊
MT B01 閒
MT B01 和`;
}

function teachText() {
  return `📘【DG / MT 房號即時分析教學】

一般即時分析：
莊 / 閒 / 和

DG房號：
DG房號
DG A01 莊
DG A01 閒
DG A01 和

MT房號：
MT房號
MT B01 莊
MT B01 閒
MT B01 和

查詢：
我的路單
我的DG路單
我的DG路單 A01
我的MT路單
我的MT路單 B01

清除：
清除路單
清除DG路單
清除DG路單 A01
清除MT路單
清除MT路單 B01`;
}

function roomText(type) {
  const title = type === "DG" ? "🏆【DG 真人百家房號】" : "🎲【MT 真人百家房號】";
  return `${title}

可用房號：

${ROOMS[type].map(r => `🔴 ${r}`).join("\n")}

使用方式：
${type} ${ROOMS[type][0]} 莊
${type} ${ROOMS[type][0]} 閒
${type} ${ROOMS[type][0]} 和

查詢：
我的${type}路單
我的${type}路單 ${ROOMS[type][0]}

清除：
清除${type}路單
清除${type}路單 ${ROOMS[type][0]}

每個房號皆為獨立路單與獨立AI分析。`;
}

function parseRoom(text, type) {
  const parts = text.trim().replace(/\s+/g, " ").split(" ");
  if (parts[0].toUpperCase() !== type) return null;
  const room = (parts[1] || "").toUpperCase();
  const value = parts[2] === "庄" ? "莊" : parts[2];

  if (!room || !ROOMS[type].includes(room)) return { error:`房號不存在，請輸入：${type}房號`, room };
  if (!value) return { room };
  if (!["莊","閒","和"].includes(value)) return { error:`請輸入 ${type} ${ROOMS[type][0]} 莊 / 閒 / 和`, room };
  return { room, value };
}

app.get("/", (req, res) => res.send("LINE Baccarat Bot V13 DG MT Room is running. Webhook: /webhook"));
app.get("/health", (req, res) => res.json({ ok:true, version:"v13-dg-mt-room" }));

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

  if (text === "加入VIP" || text === "VIP") return replyText(client, event.replyToken, vipInfo());

  if (text === "開通") {
    const profile = await client.getProfile(userId);
    return replyText(client, event.replyToken, `🔑【VIP開通資料】

名稱：
${profile.displayName}

請將此畫面截圖傳給客服開通。

LINE：
@058gvokk`);
  }

  if (text === "我的狀態") {
    const vip = await isVip(userId);
    const vipData = await getVip(userId);
    return replyText(client, event.replyToken, vip ? `你目前是 VIP 會員 ✅
到期日：${vipData.expire_date}` : "你目前不是 VIP 會員。\n輸入「加入VIP」查看方案。");
  }

  const vip = await isVip(userId);

  if (text === "開始" || text === "即時分析") {
    if (!vip && !isAdmin) return replyText(client, event.replyToken, needVip());
    return replyText(client, event.replyToken, startText());
  }

  if (text === "教學") {
    if (!vip && !isAdmin) return replyText(client, event.replyToken, needVip());
    return replyText(client, event.replyToken, teachText());
  }

  if (text === "DG房號") {
    if (!vip && !isAdmin) return replyText(client, event.replyToken, needVip());
    return replyText(client, event.replyToken, roomText("DG"), roomQuickReply("DG"));
  }

  if (text === "MT房號") {
    if (!vip && !isAdmin) return replyText(client, event.replyToken, needVip());
    return replyText(client, event.replyToken, roomText("MT"), roomQuickReply("MT"));
  }

  let reply = "";

  try {
    if (text.startsWith("開通VIP") && isAdmin) {
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

    else if (text.toUpperCase().startsWith("DG ") || text.toUpperCase().startsWith("MT ")) {
      const type = text.toUpperCase().startsWith("DG ") ? "DG" : "MT";
      if (!vip && !isAdmin) reply = needVip();
      else {
        const p = parseRoom(text, type);
        if (!p || p.error) reply = p?.error || `格式：${type} ${ROOMS[type][0]} 莊 / 閒 / 和`;
        else if (!p.value) {
          const road = await getRoad(userId, roadKey(type, p.room));
          reply = road.length
            ? `${type === "DG" ? "🏆" : "🎲"}【${type} ${p.room} 路單】\n\n${road.join(" ")}\n\n總手數：${road.length}`
            : `${type} ${p.room} 目前沒有路單。\n請輸入：${type} ${p.room} 莊 / 閒 / 和`;
        } else {
          const key = roadKey(type, p.room);
          const road = await getRoad(userId, key);
          road.push(p.value);
          const limited = road.slice(-80);
          await saveRoad(userId, key, limited);
          reply = baccarat.livePredict(limited, `${type === "DG" ? "🏆" : "🎲"}【${type} ${p.room} 即時百家分析】`);
        }
      }
    }

    else if (text === "我的DG路單" || text === "我的MT路單") {
      const type = text.startsWith("我的DG") ? "DG" : "MT";
      if (!vip && !isAdmin) reply = needVip();
      else {
        const lines = [];
        for (const room of ROOMS[type]) {
          const road = await getRoad(userId, roadKey(type, room));
          if (road.length) lines.push(`${type} ${room}：${road.join(" ")}（${road.length}手）`);
        }
        reply = lines.length ? `${type === "DG" ? "🏆" : "🎲"}【我的${type}路單】\n\n${lines.join("\n\n")}` : `目前沒有${type}路單。\n請輸入：${type}房號`;
      }
    }

    else if (text.startsWith("我的DG路單 ") || text.startsWith("我的MT路單 ")) {
      const type = text.startsWith("我的DG") ? "DG" : "MT";
      if (!vip && !isAdmin) reply = needVip();
      else {
        const room = text.split(/\s+/)[1]?.toUpperCase();
        if (!ROOMS[type].includes(room)) reply = `房號不存在，請輸入：${type}房號`;
        else {
          const road = await getRoad(userId, roadKey(type, room));
          reply = road.length ? `${type === "DG" ? "🏆" : "🎲"}【${type} ${room} 路單】\n\n${road.join(" ")}\n\n總手數：${road.length}` : `${type} ${room} 目前沒有路單。`;
        }
      }
    }

    else if (text === "清除DG路單" || text === "清除MT路單") {
      const type = text.includes("DG") ? "DG" : "MT";
      if (!vip && !isAdmin) reply = needVip();
      else {
        for (const room of ROOMS[type]) await clearRoad(userId, roadKey(type, room));
        reply = `✅ 已清除全部 ${type} 房號路單。`;
      }
    }

    else if (text.startsWith("清除DG路單 ") || text.startsWith("清除MT路單 ")) {
      const type = text.startsWith("清除DG") ? "DG" : "MT";
      if (!vip && !isAdmin) reply = needVip();
      else {
        const room = text.split(/\s+/)[1]?.toUpperCase();
        if (!ROOMS[type].includes(room)) reply = `房號不存在，請輸入：${type}房號`;
        else {
          await clearRoad(userId, roadKey(type, room));
          reply = `✅ 已清除 ${type} ${room} 路單。`;
        }
      }
    }

    else if (text === "清除路單") {
      if (!vip && !isAdmin) reply = needVip();
      else {
        await clearRoad(userId, roadKey("MAIN", "DEFAULT"));
        reply = "✅ 已清除你的一般百家路單。\n\n請開始輸入：莊 / 閒 / 和";
      }
    }

    else if (text === "我的路單") {
      if (!vip && !isAdmin) reply = needVip();
      else {
        const road = await getRoad(userId, roadKey("MAIN", "DEFAULT"));
        reply = road.length ? `🎰【你的一般路單】\n\n${road.join(" ")}\n\n總手數：${road.length}` : "目前沒有一般路單。\n請輸入：莊 / 閒 / 和";
      }
    }

    else if (["莊","閒","和","庄"].includes(text)) {
      if (!vip && !isAdmin) reply = needVip();
      else {
        const value = text === "庄" ? "莊" : text;
        const key = roadKey("MAIN", "DEFAULT");
        const road = await getRoad(userId, key);
        road.push(value);
        const limited = road.slice(-80);
        await saveRoad(userId, key, limited);
        reply = baccarat.livePredict(limited);
      }
    }

    else if (text.includes("莊") || text.includes("閒") || text.startsWith("百家預測")) {
      if (!vip && !isAdmin) reply = needVip();
      else reply = baccarat.predict(text.replace("百家預測", "").trim());
    }

    else {
      reply = `收到：「${text}」

請輸入：
開始
DG房號
MT房號
DG A01 莊
MT B01 莊
我的DG路單
我的MT路單
加入VIP`;
    }
  } catch (err) {
    console.error("Command error:", err);
    reply = `系統錯誤：${err.message}`;
  }

  return replyText(client, event.replyToken, reply);
}

app.listen(process.env.PORT || 3000, () => console.log("✅ LINE Baccarat Bot V13 DG MT Room running"));
