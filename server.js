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
  DG: ["RB01","RB02","RB03","RB04","RB05","RB06","RB07","S01","S02","S03","S04","S05","S06","S07"],
  MT: ["百家樂1","百家樂2","百家樂3","百家樂3A","百家樂5","百家樂6","百家樂7","百家樂8","百家樂9","百家樂10","百家樂11","百家樂12","百家樂13","百家樂13A","百家樂15"]
};

function addDays(days) {
  const d = new Date(Date.now() + Number(days || 30) * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}
async function getVip(userId) {
  const { data, error } = await supabase.from("vip_users").select("user_id,display_name,expire_date,status").eq("user_id", userId).maybeSingle();
  if (error) return null;
  return data;
}
async function isVip(userId) {
  const data = await getVip(userId);
  if (!data || data.status !== "active") return false;
  return new Date(data.expire_date + "T23:59:59").getTime() >= Date.now();
}
async function addVip(name, days = 30) {
  const expireDate = addDays(days);
  const { error } = await supabase.from("vip_users").update({
    status: "active",
    expire_date: expireDate,
    updated_at: new Date().toISOString()
  }).eq("display_name", name);
  if (error) throw error;
  return expireDate;
}
async function removeVip(name) {
  const { error } = await supabase.from("vip_users").update({
    status: "inactive",
    updated_at: new Date().toISOString()
  }).eq("display_name", name);
  if (error) throw error;
}
function roadKey(type = "MAIN", room = "DEFAULT") {
  return `${type}_${room}`.toUpperCase();
}
async function getRoad(userId, key = "MAIN_DEFAULT") {
  const { data, error } = await supabase.from("baccarat_roads").select("road").eq("user_id", userId).eq("road_key", key).maybeSingle();
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
async function getCurrentRoom(userId) {
  const { data, error } = await supabase.from("user_room_sessions").select("room_type,room_code").eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return data;
}
async function setCurrentRoom(userId, type, room) {
  const { error } = await supabase.from("user_room_sessions").upsert({
    user_id: userId,
    room_type: type,
    room_code: room,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });
  if (error) throw error;
}
async function clearCurrentRoom(userId) {
  await supabase.from("user_room_sessions").delete().eq("user_id", userId);
}
function roomTitle(type, room) {
  const icon = type === "DG" ? "🟥" : "🟦";
  return `${icon}【${type} ${room} 即時百家分析】`;
}
function quickReply() {
  return { items: [
    { type:"action", action:{ type:"message", label:"🔴 莊", text:"莊" }},
    { type:"action", action:{ type:"message", label:"🟢 和", text:"和" }},
    { type:"action", action:{ type:"message", label:"🔵 閒", text:"閒" }},
    { type:"action", action:{ type:"message", label:"🏆 DG房號", text:"DG房號" }},
    { type:"action", action:{ type:"message", label:"🎲 MT房號", text:"MT房號" }},
    { type:"action", action:{ type:"message", label:"📋 我的路單", text:"我的路單" }},
    { type:"action", action:{ type:"message", label:"📋 清除路單", text:"清除路單" }}
  ]};
}
function roomQuickReply(type) {
  return { items: ROOMS[type].slice(0, 10).map(room => ({
    type:"action",
    action:{ type:"message", label:`${type} ${room}`, text:`${type} ${room}` }
  }))};
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
✅ 自動房號模式
✅ 下一手建議
✅ 即時信心指數

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
  return `🎰【黃金右腳 AI 百家分析】

✅ 自動房號模式

先選房號：
DG RB01
MT 百家樂1

選好後直接按：
莊  閒  和

系統會自動記錄到目前房號。

常用指令：
目前房號
切換一般
我的路單
清除路單
DG房號
MT房號`;
}
function teachText() {
  return `📘【自動房號模式教學】

1️⃣ 選擇房號
DG RB01
MT 百家樂1

2️⃣ 選好後直接輸入
莊  閒  和

3️⃣ 查目前房號
目前房號

4️⃣ 回一般路單
切換一般`;
}
function roomText(type) {
  const title = type === "DG" ? "🏆【DG 真人百家房號】" : "🎲【MT 真人百家房號】";
  return `${title}

可用房號：

${ROOMS[type].map(r => `🔴 ${r}`).join("\n")}

使用方式：
${type} ${ROOMS[type][0]}

選好房號後，直接按：
莊  閒  和`;
}
function parseRoom(text, type) {
  const parts = text.trim().replace(/\s+/g, " ").split(" ");
  if (parts[0].toUpperCase() !== type) return null;
  const input = parts[1] || "";
  const room = ROOMS[type].find(r => r.toUpperCase() === input.toUpperCase() || r === input);
  const value = parts[2] === "庄" ? "莊" : parts[2];
  if (!room) return { error:`房號不存在，請輸入：${type}房號` };
  if (!value) return { room };
  if (!["莊","閒","和"].includes(value)) return { error:`請輸入 ${type} ${ROOMS[type][0]} 莊  閒  和`, room };
  return { room, value };
}

app.get("/", (req, res) => res.send("LINE Baccarat Bot V14 Auto Room is running"));
app.get("/health", (req, res) => res.json({ ok:true, version:"v14-auto-room" }));
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
    await supabase.from("vip_users").upsert({
      user_id: userId,
      display_name: profile.displayName,
      status: "inactive",
      expire_date: "2099-12-31",
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    return replyText(client, event.replyToken, `🔑【VIP開通資料】

名稱：
${profile.displayName}

請截圖此畫面給客服開通即可。

LINE：
@058gvokk`);
  }

  if (text === "我的狀態") {
    const vip = await isVip(userId);
    const vipData = await getVip(userId);
    const profile = await client.getProfile(userId);

    if (!vip || !vipData) {
      return replyText(client, event.replyToken, `💎【VIP會員狀態】

名稱：
${profile.displayName}

會員等級：
未開通

剩餘天數：
0 天

到期日：
無`);
    }
    const today = new Date();
    const expire = new Date(vipData.expire_date + "T23:59:59");
    const leftDays = Math.max(0, Math.ceil((expire.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    return replyText(client, event.replyToken, `💎【VIP會員】

名稱：
${profile.displayName}

會員等級：
VIP會員

剩餘天數：
${leftDays} 天

到期日：
${vipData.expire_date}`);
  }

  const vip = await isVip(userId);
  if (text === "開始") {
  return replyText(client, event.replyToken, startText());
}

if (text === "即時分析") {
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
  if (text === "目前房號") {
    if (!vip && !isAdmin) return replyText(client, event.replyToken, needVip());
    const cur = await getCurrentRoom(userId);
    if (!cur) return replyText(client, event.replyToken, "目前使用：一般路單\n\n可輸入：DG RB01 或 MT 百家樂1");
    return replyText(client, event.replyToken, `目前房號：\n${cur.room_type} ${cur.room_code}\n\n之後直接按：莊  閒  和`);
  }
  if (text === "切換一般") {
    if (!vip && !isAdmin) return replyText(client, event.replyToken, needVip());
    await clearCurrentRoom(userId);
    return replyText(client, event.replyToken, "✅ 已切換回一般路單");
  }

  let reply = "";
  try {
    if (text.startsWith("開通VIP") && isAdmin) {
  const parts = text.split(/\s+/);
  const name = parts[1];
  const days = Number(parts[2] || 30);

  reply = name
    ? `✅ 已開通 VIP\n\n名稱：\n${name}\n\n到期日：\n${await addVip(name, days)}`
    : "格式：開通VIP 名稱 天數";
}

else if (text.startsWith("取消VIP") && isAdmin) {
  const name = text.split(/\s+/)[1];

  if (!name) {
    reply = "格式：取消VIP 名稱";
  } else {
    await removeVip(name);
    reply = `❌ 已取消 VIP\n\n名稱：\n${name}`;
  }
}

else if (text === "VIP名單" && isAdmin) {
  const { data, error } = await supabase
    .from("vip_users")
    .select("display_name, expire_date, status")
    .order("updated_at", { ascending: false })
    .limit(30);

  if (error) throw error;

  reply = data.length
    ? "👑【VIP名單】\n\n" +
      data.map(r =>
        `${r.status === "active" ? "✅" : "❌"} ${r.display_name}\n到期：${r.expire_date}`
      ).join("\n\n")
    : "目前沒有VIP資料。";
}
    } else if (text.toUpperCase().startsWith("DG ") || text.toUpperCase().startsWith("MT ")) {
      const type = text.toUpperCase().startsWith("DG ") ? "DG" : "MT";
      if (!vip && !isAdmin) reply = needVip();
      else {
        const p = parseRoom(text, type);
        if (!p || p.error) reply = p?.error || "格式錯誤";
        else if (!p.value) {
          await setCurrentRoom(userId, type, p.room);
          const road = await getRoad(userId, roadKey(type, p.room));
          reply = `✅ 已切換房號\n\n目前房號：\n${type} ${p.room}\n\n目前路單：\n${road.length ? road.join(" ") : "尚未建立"}\n\n之後直接按：莊 / 閒 / 和`;
        } else {
          const key = roadKey(type, p.room);
          const road = await getRoad(userId, key);
          road.push(p.value);
          const limited = road.slice(-80);
          await saveRoad(userId, key, limited);
          await setCurrentRoom(userId, type, p.room);
          reply = baccarat.livePredict(limited, roomTitle(type, p.room));
        }
      }
    } else if (text === "我的路單") {
      if (!vip && !isAdmin) reply = needVip();
      else {
        const cur = await getCurrentRoom(userId);
        const key = cur ? roadKey(cur.room_type, cur.room_code) : roadKey("MAIN","DEFAULT");
        const road = await getRoad(userId, key);
        const title = cur ? `${cur.room_type} ${cur.room_code}` : "一般路單";
        reply = road.length ? `📋【${title}】\n\n${road.join(" ")}\n\n總手數：${road.length}` : `${title} 目前沒有路單。`;
      }
    } else if (text === "清除路單") {
      if (!vip && !isAdmin) reply = needVip();
      else {
        const cur = await getCurrentRoom(userId);
        const key = cur ? roadKey(cur.room_type, cur.room_code) : roadKey("MAIN","DEFAULT");
        await clearRoad(userId, key);
        reply = cur ? `✅ 已清除目前房號路單\n\n${cur.room_type} ${cur.room_code}` : "✅ 已清除一般路單";
      }
    } else if (["莊","閒","和","庄"].includes(text)) {
      if (!vip && !isAdmin) reply = needVip();
      else {
        const value = text === "庄" ? "莊" : text;
        const cur = await getCurrentRoom(userId);
        const key = cur ? roadKey(cur.room_type, cur.room_code) : roadKey("MAIN","DEFAULT");
        const road = await getRoad(userId, key);
        road.push(value);
        const limited = road.slice(-80);
        await saveRoad(userId, key, limited);
        reply = cur ? baccarat.livePredict(limited, roomTitle(cur.room_type, cur.room_code)) : baccarat.livePredict(limited);
      }
    } else {
      reply = `收到：「${text}」\n\n請輸入：\n開始\nDG RB01\nMT 百家樂1\n目前房號\n切換一般`;
    }
  } catch (err) {
    console.error("Command error:", err);
    reply = `系統錯誤：${err.message}`;
  }

  return replyText(client, event.replyToken, reply);
}
app.listen(process.env.PORT || 3000, () => console.log("✅ LINE Baccarat Bot V14 Auto Room running"));
