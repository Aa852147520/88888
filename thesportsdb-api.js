const KEY = process.env.THESPORTSDB_KEY || "123";
const BASE = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

const LEAGUE_ZH = {
  "English Premier League": "英格蘭超級聯賽",
  "Spanish La Liga": "西班牙甲級聯賽",
  "Italian Serie A": "義大利甲級聯賽",
  "German Bundesliga": "德國甲級聯賽",
  "French Ligue 1": "法國甲級聯賽",
  "UEFA Champions League": "歐洲冠軍聯賽",
  "UEFA Europa League": "歐霸聯賽",
  "UEFA Europa Conference League": "歐洲協會聯賽",
  "FIFA World Cup": "世界盃",
  "Copa Libertadores": "南美自由盃",
  "Copa Sudamericana": "南美俱樂部盃",
  "Brazilian Serie A": "巴西甲級聯賽",
  "Argentina Primera Division": "阿根廷甲級聯賽",
  "Austrian Regionalliga Mitte": "奧地利地區聯賽",
  "Austrian Bundesliga": "奧地利超級聯賽",
  "Austrian 2 Liga": "奧地利乙級聯賽"
};

const HOT_LEAGUES = new Set([
  "English Premier League",
  "Spanish La Liga",
  "Italian Serie A",
  "German Bundesliga",
  "French Ligue 1",
  "UEFA Champions League",
  "UEFA Europa League",
  "UEFA Europa Conference League",
  "FIFA World Cup",
  "Copa Libertadores",
  "Copa Sudamericana",
  "Brazilian Serie A",
  "Argentina Primera Division"
]);

const TEAM_ZH = {
  "Manchester City": "曼城",
  "Manchester United": "曼聯",
  "Liverpool": "利物浦",
  "Arsenal": "兵工廠",
  "Chelsea": "切爾西",
  "Tottenham": "熱刺",
  "Newcastle": "紐卡索",
  "Aston Villa": "阿斯頓維拉",
  "West Ham": "西漢姆",
  "Real Madrid": "皇家馬德里",
  "Barcelona": "巴塞隆納",
  "Atletico Madrid": "馬德里競技",
  "Sevilla": "塞維利亞",
  "Valencia": "瓦倫西亞",
  "Inter Milan": "國際米蘭",
  "AC Milan": "AC米蘭",
  "Juventus": "尤文圖斯",
  "Napoli": "拿坡里",
  "Roma": "羅馬",
  "Lazio": "拉齊奧",
  "Bayern Munich": "拜仁慕尼黑",
  "Borussia Dortmund": "多特蒙德",
  "RB Leipzig": "萊比錫紅牛",
  "PSG": "巴黎聖日耳曼",
  "Paris SG": "巴黎聖日耳曼",
  "Marseille": "馬賽",
  "Lyon": "里昂",
  "Monaco": "摩納哥",
  "Boca Juniors": "博卡青年",
  "River Plate": "河床",
  "Flamengo": "佛朗明哥",
  "Palmeiras": "帕爾梅拉斯",
  "Cruzeiro": "克魯塞羅",
  "Barcelona SC": "巴塞隆納SC"
};

function zhTeam(name) {
  return TEAM_ZH[name] || name || "未定";
}

function zhLeague(name) {
  return LEAGUE_ZH[name] || name || "足球賽事";
}

function statusZh(status) {
  const map = {
    "NS": "未開賽",
    "LIVE": "進行中",
    "HT": "中場休息",
    "FT": "全場結束",
    "AET": "延長結束",
    "PEN": "點球結束",
    "PST": "延期",
    "CANC": "取消",
    "ABD": "腰斬",
    "SUSP": "中斷",
    "INT": "中斷"
  };
  return map[status] || status || "未開賽";
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

function todayYMD() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

async function safeJson(url) {
  const res = await fetch(url);
  const text = await res.text();

  if (!text || !text.trim().startsWith("{")) {
    throw new Error("TheSportsDB 回傳空白或非JSON資料");
  }

  return JSON.parse(text);
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
  const home = zhTeam(e.strHomeTeam);
  const away = zhTeam(e.strAwayTeam);
  const league = zhLeague(e.strLeague);
  const score =
    e.intHomeScore !== null &&
    e.intHomeScore !== undefined &&
    e.intHomeScore !== ""
      ? `\n⚽ 比分：${e.intHomeScore} : ${e.intAwayScore}`
      : "";

  return `${idx + 1}️⃣ ${home} vs ${away}
🏆 賽事：${league}
🕒 時間：${twTime(e.dateEvent, e.strTime)}
📊 狀態：${statusZh(e.strStatus)}${score}`;
}

async function fetchTodayEvents() {
  const date = todayYMD();
  const data = await safeJson(`${BASE}/eventsday.php?d=${date}&s=Soccer`);
  return data.events || [];
}

async function todaySoccer() {
  try {
    const all = await fetchTodayEvents();
    let events = all.filter(e => HOT_LEAGUES.has(e.strLeague)).slice(0, 12);

    if (!events.length) {
      return `【TheSportsDB 熱門足球】今天暫時沒有抓到熱門聯賽賽事。

你可以輸入：
全部備援足球

查看所有 TheSportsDB 今日足球。`;
    }

    return `⚽【TheSportsDB 熱門足球】

${events.map(eventLine).join("\n\n")}`;
  } catch (err) {
    return `TheSportsDB 今日足球抓取失敗：${err.message}`;
  }
}

async function todaySoccerAll() {
  try {
    const events = (await fetchTodayEvents()).slice(0, 12);

    if (!events.length) {
      return "【TheSportsDB 今日足球】今天暫時沒有抓到足球賽事。";
    }

    return `⚽【TheSportsDB 今日足球 全部】

${events.map(eventLine).join("\n\n")}`;
  } catch (err) {
    return `TheSportsDB 今日足球抓取失敗：${err.message}`;
  }
}

module.exports = {
  apiStatus,
  todaySoccer,
  todaySoccerAll
};
