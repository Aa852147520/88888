const KEY = process.env.THESPORTSDB_KEY || "3";
const BASE = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

const LEAGUE_ZH = {
  "English Premier League": "英格蘭超級聯賽",
  "Spanish La Liga": "西班牙甲級聯賽",
  "Italian Serie A": "義大利甲級聯賽",
  "German Bundesliga": "德國甲級聯賽",
  "French Ligue 1": "法國甲級聯賽",
  "UEFA Champions League": "歐洲冠軍聯賽",
  "Copa Libertadores": "南美自由盃"
};

const TEAM_ZH = {
  "Manchester City": "曼城", "Manchester United": "曼聯", "Liverpool": "利物浦",
  "Arsenal": "兵工廠", "Chelsea": "切爾西", "Tottenham": "熱刺",
  "Real Madrid": "皇家馬德里", "Barcelona": "巴塞隆納", "Atletico Madrid": "馬德里競技",
  "Bayern Munich": "拜仁慕尼黑", "Borussia Dortmund": "多特蒙德",
  "PSG": "巴黎聖日耳曼", "Paris SG": "巴黎聖日耳曼",
  "Boca Juniors": "博卡青年", "River Plate": "河床"
};

function zhTeam(name) { return TEAM_ZH[name] || name || "未定"; }
function zhLeague(name) { return LEAGUE_ZH[name] || name || "足球賽事"; }

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

async function apiStatus() {
  try {
    const res = await fetch(`${BASE}/all_sports.php`);
    const data = await res.json();
    return `【TheSportsDB 狀態】\n狀態：已連線 ✅\nKey：${KEY}\n項目數：${data.sports ? data.sports.length : 0}`;
  } catch (err) {
    return `TheSportsDB 測試失敗：${err.message}`;
  }
}

function eventLine(e, idx) {
  const home = zhTeam(e.strHomeTeam);
  const away = zhTeam(e.strAwayTeam);
  const league = zhLeague(e.strLeague);
  const score = e.intHomeScore !== null && e.intHomeScore !== "" ? `\n⚽ 比分：${e.intHomeScore} : ${e.intAwayScore}` : "";
  return `${idx + 1}️⃣ ${home} vs ${away}
🏆 賽事：${league}
🕒 時間：${twTime(e.dateEvent, e.strTime)}
📊 狀態：${e.strStatus || "未開賽"}${score}`;
}

async function todaySoccer() {
  try {
    const res = await fetch(`${BASE}/eventsday.php?s=Soccer`);
    const data = await res.json();
    const events = (data.events || []).slice(0, 12);
    if (!events.length) return "【TheSportsDB 今日足球】暫時沒有抓到足球賽事。";
    return `⚽【TheSportsDB 今日足球】\n\n${events.map(eventLine).join("\n\n")}`;
  } catch (err) {
    return `TheSportsDB 今日足球抓取失敗：${err.message}`;
  }
}

module.exports = { apiStatus, todaySoccer };
