const API_KEY = process.env.FOOTBALL_DATA_KEY || "";
const BASE = "https://api.football-data.org/v4";

const TEAM_ZH = {
  // 英超
  "Manchester City FC": "曼城",
  "Manchester United FC": "曼聯",
  "Liverpool FC": "利物浦",
  "Arsenal FC": "兵工廠",
  "Chelsea FC": "切爾西",
  "Tottenham Hotspur FC": "熱刺",
  "Newcastle United FC": "紐卡索",
  "Aston Villa FC": "阿斯頓維拉",

  // 西甲
  "Real Madrid CF": "皇家馬德里",
  "FC Barcelona": "巴塞隆納",
  "Club Atlético de Madrid": "馬德里競技",
  "Sevilla FC": "塞維利亞",
  "Valencia CF": "瓦倫西亞",

  // 義甲
  "FC Internazionale Milano": "國際米蘭",
  "Inter Milan": "國際米蘭",
  "AC Milan": "AC米蘭",
  "Juventus FC": "尤文圖斯",
  "SSC Napoli": "拿坡里",
  "AS Roma": "羅馬",
  "SS Lazio": "拉齊奧",

  // 德甲
  "FC Bayern München": "拜仁慕尼黑",
  "Borussia Dortmund": "多特蒙德",
  "RB Leipzig": "萊比錫紅牛",
  "Bayer 04 Leverkusen": "勒沃庫森",

  // 法甲
  "Paris Saint-Germain FC": "巴黎聖日耳曼",
  "Olympique de Marseille": "馬賽",
  "Olympique Lyonnais": "里昂",
  "AS Monaco FC": "摩納哥",

  // 世界盃常見
  "Brazil": "巴西",
  "Argentina": "阿根廷",
  "France": "法國",
  "Germany": "德國",
  "Spain": "西班牙",
  "England": "英格蘭",
  "Portugal": "葡萄牙",
  "Netherlands": "荷蘭",

  // 南美自由盃
  "CA Boca Juniors": "博卡青年",
  "Boca Juniors": "博卡青年",

  "CD Universidad Católica": "天主教大學",
  "Universidad Católica": "天主教大學",

  "Cruzeiro EC": "克魯塞羅",
  "Cruzeiro": "克魯塞羅",

  "Barcelona SC": "巴塞隆納SC",

  "River Plate": "河床",
  "Flamengo": "佛朗明哥",
  "Palmeiras": "帕爾梅拉斯"
};

const COMP_ZH = {
  "Premier League": "🇬🇧 英超",
  "Primera Division": "🇪🇸 西甲",
  "La Liga": "🇪🇸 西甲",
  "Serie A": "🇮🇹 義甲",
  "Bundesliga": "🇩🇪 德甲",
  "Ligue 1": "🇫🇷 法甲",

  "UEFA Champions League": "🏆 歐洲冠軍聯賽",
  "UEFA Europa League": "🏆 歐霸聯賽",

  "FIFA World Cup": "🌎 世界盃",

  "Copa Libertadores": "🏆 南美自由盃",
  "Copa Sudamericana": "🏆 南美俱樂部盃",

  "Campeonato Brasileiro Série A": "🇧🇷 巴西甲級聯賽",
  "Argentina Primera Division": "🇦🇷 阿根廷甲級聯賽"
};

function teamZh(name) {
  return TEAM_ZH[name] || name;
}

function competitionZh(name) {
  return COMP_ZH[name] || name;
}

function teamZh(name) { return TEAM_ZH[name] || name; }

function statusZh(status) {
  const map = {
    SCHEDULED: "未開賽", TIMED: "未開賽", IN_PLAY: "進行中",
    PAUSED: "中場休息", FINISHED: "全場結束", POSTPONED: "延期",
    SUSPENDED: "中斷", CANCELED: "取消"
  };
  return map[status] || status || "未知";
}

function twTime(utc) {
  return new Date(utc).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

async function apiGet(path) {
  if (!API_KEY) throw new Error("尚未設定 FOOTBALL_DATA_KEY");
  const res = await fetch(`${BASE}${path}`, { headers: { "X-Auth-Token": API_KEY } });
  const data = await res.json();
  if (!res.ok) throw new Error(`Football-Data API ${res.status}: ${data.message || JSON.stringify(data)}`);
  return data;
}

async function apiStatus() {
  if (!API_KEY) return "【Football-Data.org 狀態】\nFOOTBALL_DATA_KEY 尚未設定。";
  try {
    const data = await apiGet("/competitions");
    return `【Football-Data.org 狀態】
狀態：已連線 ✅
可用賽事數：${data.count || 0}`;
  } catch (err) {
    return `【Football-Data.org 狀態】
測試失敗：${err.message}`;
  }
}

function matchLine(m, idx) {
  const home = teamZh(m.homeTeam?.name || "主隊");
  const away = teamZh(m.awayTeam?.name || "客隊");
  const comp = competitionZh(m.competition?.name) || "足球賽事";
  const score = m.score?.fullTime?.home !== null && m.score?.fullTime?.home !== undefined
    ? `\n⚽ 比分：${m.score.fullTime.home} : ${m.score.fullTime.away}`
    : "";
  return `${idx + 1}️⃣ ${home} vs ${away}
🏆 賽事：${comp}
🕒 時間：${twTime(m.utcDate)}
📊 狀態：${statusZh(m.status)}${score}`;
}

async function todayMatches() {
  try {
    const data = await apiGet("/matches");
    const games = (data.matches || []).slice(0, 12);
    if (!games.length) return "【VIP 今日足球】今天暫時沒有抓到足球賽事。";
    return `⚽【VIP 今日足球】

${games.map(matchLine).join("\n\n")}`;
  } catch (err) {
    return `【今日足球】抓取失敗：${err.message}`;
  }
}

async function liveScores() {
  try {
    const data = await apiGet("/matches");
    const games = (data.matches || []).filter(m => m.status === "IN_PLAY" || m.status === "PAUSED").slice(0, 12);
    if (!games.length) return "⚽【VIP 即時比分】\n\n目前沒有進行中的足球賽事。";
    return `⚽【VIP 即時比分】

${games.map(matchLine).join("\n\n")}`;
  } catch (err) {
    return `【即時比分】抓取失敗：${err.message}`;
  }
}

async function competitionMatches(code = "PL") {
  const info = COMP[code] || COMP.PL;
  try {
    const data = await apiGet(`/competitions/${info.code}/matches?status=SCHEDULED`);
    const games = (data.matches || []).slice(0, 12);
    if (!games.length) return `【${info.name}賽程】目前沒有抓到未開賽賽程。`;
    return `⚽【VIP ${info.name}近期賽程】

${games.map(matchLine).join("\n\n")}`;
  } catch (err) {
    return `【${info.name}賽程】抓取失敗：${err.message}`;
  }
}

async function standings(code = "PL") {
  const info = COMP[code] || COMP.PL;
  try {
    const data = await apiGet(`/competitions/${info.code}/standings`);
    const table = data.standings?.[0]?.table || [];
    if (!table.length) return `【${info.name}積分榜】目前沒有資料。`;
    const rows = table.slice(0, 10).map(r => `${r.position}. ${teamZh(r.team.name)}｜積分：${r.points}｜場次：${r.playedGames}｜勝${r.won} 和${r.draw} 負${r.lost}｜得失：${r.goalDifference}`);
    return `🏆【VIP ${info.name}積分榜 Top10】

${rows.join("\n")}`;
  } catch (err) {
    return `【${info.name}積分榜】抓取失敗：${err.message}`;
  }
}

module.exports = { apiStatus, todayMatches, liveScores, competitionMatches, standings };
