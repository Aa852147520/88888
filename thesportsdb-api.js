const KEY = process.env.THESPORTSDB_KEY || "123";
const BASE = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

const TEAM_ZH = {
  "Manchester City": "曼城",
  "Manchester United": "曼聯",
  "Liverpool": "利物浦",
  "Arsenal": "兵工廠",
  "Chelsea": "切爾西",
  "Tottenham": "熱刺",

  "Real Madrid": "皇家馬德里",
  "Barcelona": "巴塞隆納",
  "Atletico Madrid": "馬德里競技",

  "Inter": "國際米蘭",
  "Inter Milan": "國際米蘭",
  "AC Milan": "AC米蘭",
  "Juventus": "尤文圖斯",
  "Napoli": "拿坡里",

  "Bayern Munich": "拜仁慕尼黑",
  "Borussia Dortmund": "多特蒙德",

  "PSG": "巴黎聖日耳曼",
  "Paris SG": "巴黎聖日耳曼",

  "Boca Juniors": "博卡青年",
  "River Plate": "河床",

  "Deutschlandsberger": "德意志蘭茲貝格",
  "Velden": "費爾登",
  "Union Dietach": "迪塔赫聯",
  "Voitsberg": "福伊茨貝格",
  "Gleisdorf 09": "格萊斯多夫09",
  "Junge Wikinger Ried": "里德青年維京人"
};

const LEAGUE_ZH = {
  "English Premier League": "🇬🇧 英超",
  "Spanish La Liga": "🇪🇸 西甲",
  "Italian Serie A": "🇮🇹 義甲",
  "German Bundesliga": "🇩🇪 德甲",
  "French Ligue 1": "🇫🇷 法甲",

  "UEFA Champions League": "🏆 歐冠",
  "UEFA Europa League": "🏆 歐霸",
  "UEFA Europa Conference League": "🏆 歐協聯",

  "FIFA World Cup": "🌎 世界盃",

  "Copa Libertadores": "🏆 南美自由盃",
  "Copa Sudamericana": "🏆 南美俱樂部盃",

  "Brazilian Serie A": "🇧🇷 巴甲",
  "Argentina Primera Division": "🇦🇷 阿甲",

  "Austrian Bundesliga": "🇦🇹 奧超",
  "Austrian 2 Liga": "🇦🇹 奧乙",
  "Austrian Regionalliga Mitte": "🇦🇹 奧地利中部地區聯賽",
  "Austrian Regionalliga West": "🇦🇹 奧地利西部地區聯賽",
  "Austrian Regionalliga East": "🇦🇹 奧地利東部地區聯賽"
};

function zhTeam(name) {
  return TEAM_ZH[name] || name || "未定";
}

function zhLeague(name) {
  return LEAGUE_ZH[name] || name || "足球賽事";
}

function statusZh(status) {
  const map = {
    NS: "未開賽",
    LIVE: "進行中",
    HT: "中場休息",
    FT: "全場結束",
    PST: "延期",
    CANC: "取消",
    AET: "延長結束",
    PEN: "點球結束"
  };

  return map[status] || status || "未知";
}

function twTime(date, time) {
  if (!date) return "時間未定";

  const raw = `${date}T${time || "00:00:00"}Z`;

  return new Date(raw).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

async function safeJson(url) {
  const res = await fetch(url);
  const text = await res.text();

  if (!text || !text.trim().startsWith("{")) {
    throw new Error("TheSportsDB 回傳空白或非JSON資料");
  }

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
    return `TheSportsDB 測試失敗：${err.message}`;
  }
}

function eventLine(e, idx) {
  const score =
    e.intHomeScore !== null &&
    e.intHomeScore !== undefined &&
    e.intHomeScore !== ""
      ? `\n⚽ 比分：${e.intHomeScore} : ${e.intAwayScore}`
      : "";

  return `${idx + 1}️⃣ ${zhTeam(e.strHomeTeam)} vs ${zhTeam(e.strAwayTeam)}
🏆 賽事：${zhLeague(e.strLeague)}
🕒 時間：${twTime(e.dateEvent, e.strTime)}
📊 狀態：${statusZh(e.strStatus)}${score}`;
}

async function todaySoccerAll() {
  try {
    const date = todayYMD();

    const data = await safeJson(
      `${BASE}/eventsday.php?d=${date}&s=Soccer`
    );

    const events = (data.events || []).slice(0, 15);

    if (!events.length) {
      return "今天沒有足球賽事";
    }

    return `⚽【TheSportsDB 今日足球 全部】

${events.map(eventLine).join("\n\n")}`;
  } catch (err) {
    return `TheSportsDB 今日足球抓取失敗：${err.message}`;
  }
}

module.exports = {
  apiStatus,
  todaySoccer: todaySoccerAll,
  todaySoccerAll
};
