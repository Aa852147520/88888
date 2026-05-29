const KEY = process.env.THESPORTSDB_KEY || "123";
const BASE = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

const HOT_LEAGUES = new Set([
  "English Premier League", "Spanish La Liga", "Italian Serie A",
  "German Bundesliga", "French Ligue 1", "UEFA Champions League",
  "UEFA Europa League", "Copa Libertadores", "Copa Sudamericana",
  "Brazilian Serie A", "Argentina Primera Division"
]);

const LEAGUE_ZH = {
  "English Premier League": "英格蘭超級聯賽",
  "Spanish La Liga": "西班牙甲級聯賽",
  "Italian Serie A": "義大利甲級聯賽",
  "German Bundesliga": "德國甲級聯賽",
  "French Ligue 1": "法國甲級聯賽",
  "UEFA Champions League": "歐洲冠軍聯賽",
  "UEFA Europa League": "歐霸聯賽",
  "Copa Libertadores": "南美自由盃"
};

function zhLeague(name) { return LEAGUE_ZH[name] || name || "足球賽事"; }

function statusZh(status) {
  const map = { NS: "未開賽", LIVE: "進行中", HT: "中場休息", FT: "全場結束", PST: "延期", CANC: "取消" };
  return map[status] || status || "未開賽";
}

function twTime(date, time) {
  if (!date) return "時間未定";
  return new Date(`${date}T${time || "00:00:00"}Z`).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false
  });
}

async function safeJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  if (!text || !text.trim().startsWith("{")) throw new Error("TheSportsDB 回傳空白或非JSON資料");
  return JSON.parse(text);
}

function todayYMD() {
  return new Date().toISOString().slice(0, 10);
}

async function apiStatus() {
  try {
    const data = await safeJson(`${BASE}/all_sports.php`);
    return `【TheSportsDB 狀態】
狀態：已連線 ✅
Key：${KEY}
項目數：${data.sports ? data.sports.length : 0}`;
  } catch (err) {
    return `【TheSportsDB 狀態】
測試失敗：${err.message}`;
  }
}

function eventLine(e, idx) {
  const score = e.intHomeScore !== null && e.intHomeScore !== undefined && e.intHomeScore !== ""
    ? `\n⚽ 比分：${e.intHomeScore} : ${e.intAwayScore}`
    : "";
  return `${idx + 1}️⃣ ${e.strHomeTeam || "主隊"} vs ${e.strAwayTeam || "客隊"}
🏆 賽事：${zhLeague(e.strLeague)}
🕒 時間：${twTime(e.dateEvent, e.strTime)}
📊 狀態：${statusZh(e.strStatus)}${score}`;
}

async function fetchTodayEvents() {
  const data = await safeJson(`${BASE}/eventsday.php?d=${todayYMD()}&s=Soccer`);
  return data.events || [];
}

async function todaySoccer() {
  try {
    const all = await fetchTodayEvents();
    const events = all.filter(e => HOT_LEAGUES.has(e.strLeague)).slice(0, 12);
    if (!events.length) return "【TheSportsDB 熱門足球】今天暫時沒有抓到熱門聯賽賽事。\n\n可輸入：全部備援足球";
    return `⚽【TheSportsDB 熱門足球】

${events.map(eventLine).join("\n\n")}`;
  } catch (err) {
    return `TheSportsDB 今日足球抓取失敗：${err.message}`;
  }
}

async function todaySoccerAll() {
  try {
    const events = (await fetchTodayEvents()).slice(0, 12);
    if (!events.length) return "【TheSportsDB 今日足球】今天暫時沒有抓到足球賽事。";
    return `⚽【TheSportsDB 今日足球 全部】

${events.map(eventLine).join("\n\n")}`;
  } catch (err) {
    return `TheSportsDB 今日足球抓取失敗：${err.message}`;
  }
}

module.exports = { apiStatus, todaySoccer, todaySoccerAll };
