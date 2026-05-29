require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const { createClient } = require("@supabase/supabase-js");
const football = require("./football-data-api");
const tdb = require("./thesportsdb-api");
const ai = require("./football-ai");

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
  const { data } = await supabase.from("vip_users").select("user_id, expire_date, status").eq("user_id", userId).maybeSingle();
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
  const { error } = await supabase.from("vip_users").update({ status: "inactive", updated_at: new Date().toISOString() }).eq("user_id", userId);
  if (error) throw error;
}

async function listVip(limit = 30) {
  const { data, error } = await supabase.from("vip_users").select("user_id, expire_date, status, updated_at").order("updated_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

async function countVip() {
  const rows = await listVip(1000);
  const active = rows.filter(r => r.status === "active" && new Date(r.expire_date + "T23:59:59").getTime() >= Date.now()).length;
  return { total: rows.length, active, expired: rows.length - active };
}

function needVip() {
  return `🔒 VIP 專屬功能

VIP 可使用：
✅ 今日足球
✅ 即時比分
✅ 熱門足球
✅ TheSportsDB 備援熱門賽事
✅ 五大聯賽賽程 / 積分榜
✅ 進階分析
✅ 今日主推 / 足球串關 / 爆冷預警

請聯絡客服開通 VIP。`;
}

function vipInfo() {
  return `【⚽ 足球 AI VIP】

VIP 解鎖：
1. 今日足球 / 即時比分
2. 熱門足球賽事
3. TheSportsDB 備援資料
4. 五大聯賽賽程 / 積分榜
5. 進階足球 AI 分析
6. 今日主推 / 串關 / 爆冷預警

管理員開通：
開通VIP USER_ID 30`;
}

function helpText(vip, isAdmin) {
  return `【⚽ 足球 AI V10.1 中文熱門版】

免費可用：
足球分析 皇馬 vs 巴薩
世界盃 巴西 vs 阿根廷
加入VIP
我的狀態

VIP 專屬：
今日足球
即時比分
備援今日足球
熱門足球
英超賽程 / 英超積分榜
西甲賽程 / 西甲積分榜
義甲賽程 / 義甲積分榜
德甲賽程 / 德甲積分榜
法甲賽程 / 法甲積分榜
歐冠賽程 / 歐冠積分榜
進階分析 曼城 vs 利物浦
今日主推
足球串關
爆冷預警

目前身分：
${vip ? "VIP 會員 ✅" : "免費會員"}
${isAdmin ? "\n\n管理員：我的ID / 開通VIP / 取消VIP / VIP名單 / VIP統計 / API狀態" : ""}`;
}

function vipOnly(vip, fn) {
  return vip ? fn() : Promise.resolve(needVip());
}

async function smartTodayFootball() {
  const main = await football.todayMatches();
  if (!main.includes("抓取失敗") && !main.includes("暫時沒有抓到")) return main;
  const backup = await tdb.todaySoccer();
  return `${main}\n\n---\n備援資料源 TheSportsDB：\n\n${backup}`;
}

app.get("/", (req, res) => res.send("LINE Football AI V10.1 ZH Filter is running. Webhook: /webhook"));
app.get("/health", (req, res) => res.json({
  ok: true,
  version: "v10.1-zh-filter",
  footballData: !!process.env.FOOTBALL_DATA_KEY,
  thesportsdb: true,
  supabase: !!process.env.SUPABASE_URL
}));

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
  const vip = await isVip(userId);
  const vipData = await getVip(userId);
  const isAdmin = ADMIN_USER_ID && userId === ADMIN_USER_ID;
  let reply = "";

  try {
    if (text === "說明" || text.toLowerCase() === "help") reply = helpText(vip, isAdmin);
    else if (text === "我的ID") reply = `你的 LINE User ID：\n${userId}`;
    else if (text === "我的狀態") reply = vip ? `你目前是 VIP 會員 ✅\n到期日：${vipData.expire_date}` : "你目前不是 VIP 會員。\n輸入「加入VIP」查看方案。";
    else if (text === "加入VIP" || text === "VIP") reply = vipInfo();

    else if (text.startsWith("足球分析")) reply = ai.footballAnalysis(text.replace("足球分析", "").trim(), vip);
    else if (text.startsWith("世界盃 ")) reply = ai.worldCupAnalysis(text.replace("世界盃", "").trim(), vip);

    else if (text === "API狀態") reply = isAdmin ? await football.apiStatus() + "\n\n" + await tdb.apiStatus() : needVip();

    else if (text === "今日足球") reply = await vipOnly(vip, () => smartTodayFootball());
    else if (text === "備援今日足球") reply = await vipOnly(vip, () => tdb.todaySoccer());
    else if (text === "熱門足球") reply = await vipOnly(vip, () => tdb.todaySoccer());
    else if (text === "全部備援足球") reply = await vipOnly(vip, () => tdb.todaySoccerAll());
    else if (text === "即時比分" || text === "足球比分") reply = await vipOnly(vip, () => football.liveScores());

    else if (text === "英超賽程") reply = await vipOnly(vip, () => football.competitionMatches("PL"));
    else if (text === "西甲賽程") reply = await vipOnly(vip, () => football.competitionMatches("PD"));
    else if (text === "義甲賽程") reply = await vipOnly(vip, () => football.competitionMatches("SA"));
    else if (text === "德甲賽程") reply = await vipOnly(vip, () => football.competitionMatches("BL1"));
    else if (text === "法甲賽程") reply = await vipOnly(vip, () => football.competitionMatches("FL1"));
    else if (text === "歐冠賽程") reply = await vipOnly(vip, () => football.competitionMatches("CL"));

    else if (text === "英超積分榜") reply = await vipOnly(vip, () => football.standings("PL"));
    else if (text === "西甲積分榜") reply = await vipOnly(vip, () => football.standings("PD"));
    else if (text === "義甲積分榜") reply = await vipOnly(vip, () => football.standings("SA"));
    else if (text === "德甲積分榜") reply = await vipOnly(vip, () => football.standings("BL1"));
    else if (text === "法甲積分榜") reply = await vipOnly(vip, () => football.standings("FL1"));
    else if (text === "歐冠積分榜") reply = await vipOnly(vip, () => football.standings("CL"));

    else if (text.startsWith("進階分析")) reply = vip ? ai.advancedAnalysis(text.replace("進階分析", "").trim()) : needVip();
    else if (text.startsWith("最近5場")) reply = vip ? ai.lastFive(text.replace("最近5場", "").trim()) : needVip();
    else if (text.startsWith("對戰紀錄")) reply = vip ? ai.h2hAnalysis(text.replace("對戰紀錄", "").trim()) : needVip();
    else if (text.startsWith("主客場")) reply = vip ? ai.homeAwayAnalysis(text.replace("主客場", "").trim()) : needVip();

    else if (text === "今日主推") reply = vip ? ai.todayMainPick() : needVip();
    else if (text === "足球串關") reply = vip ? ai.footballParlay() : needVip();
    else if (text === "爆冷預警") reply = vip ? ai.upsetAlert() : needVip();

    else if (isAdmin && text.startsWith("開通VIP")) {
      const parts = text.split(/\s+/);
      const target = parts[1];
      const days = Number(parts[2] || 30);
      if (!target) reply = "格式：開通VIP LINE_USER_ID 天數";
      else reply = `已開通 VIP ✅\nUser ID：${target}\n到期日：${await addVip(target, days)}`;
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
    } else if (isAdmin && text === "VIP統計") {
      const c = await countVip();
      reply = `【VIP 統計】\n總筆數：${c.total}\n有效VIP：${c.active}\n過期/停用：${c.expired}`;
    } else {
      reply = `收到：「${text}」

免費：
足球分析 皇馬 vs 巴薩
加入VIP

VIP：
今日足球
即時比分
熱門足球
備援今日足球
全部備援足球
進階分析 曼城 vs 利物浦
今日主推`;
    }
  } catch (err) {
    console.error("Command error:", err);
    reply = `系統錯誤：${err.message}\n請檢查 Render Logs。`;
  }

  return client.replyMessage(event.replyToken, { type: "text", text: reply });
}

app.listen(process.env.PORT || 3000, () => console.log("✅ LINE Football AI V10.1 ZH Filter running"));
