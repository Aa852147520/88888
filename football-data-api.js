const API_KEY = process.env.FOOTBALL_DATA_KEY || "";
const BASE = "https://api.football-data.org/v4";

const COMP = {
  PL: { code: "PL", name: "英超" },
  PD: { code: "PD", name: "西甲" },
  SA: { code: "SA", name: "義甲" },
  BL1: { code: "BL1", name: "德甲" },
  FL1: { code: "FL1", name: "法甲" },
  CL: { code: "CL", name: "歐冠" }
};

const COMP_ZH = {
  "Premier League": "英格蘭超級聯賽",
  "Primera Division": "西班牙甲級聯賽",
  "La Liga": "西班牙甲級聯賽",
  "Serie A": "義大利甲級聯賽",
  "Bundesliga": "德國甲級聯賽",
  "Ligue 1": "法國甲級聯賽",
  "UEFA Champions League": "歐洲冠軍聯賽",
  "Copa Libertadores": "南美自由盃",
  "FIFA World Cup": "世界盃",
  "Campeonato Brasileiro Série A": "巴西甲級聯賽"
};

const TEAM_ZH = {
  "Manchester City FC": "曼城", "Manchester City": "曼城",
  "Manchester United FC": "曼聯", "Liverpool FC": "利物浦",
  "Arsenal FC": "兵工廠", "Chelsea FC": "切爾西",
  "Tottenham Hotspur FC": "熱刺", "Newcastle United FC": "紐卡索",
  "Aston Villa FC": "阿斯頓維拉", "West Ham United FC": "西漢姆",
  "Brighton & Hove Albion FC": "布萊頓", "Everton FC": "埃弗頓",
  "Crystal Palace FC": "水晶宮", "Fulham FC": "富勒姆",
  "Wolverhampton Wanderers FC": "狼隊", "AFC Bournemouth": "伯恩茅斯",
  "Real Madrid CF": "皇家馬德里", "FC Barcelona": "巴塞隆納",
  "Club Atlético de Madrid": "馬德里競技", "Sevilla FC": "塞維利亞",
  "Valencia CF": "瓦倫西亞", "Villarreal CF": "比利亞雷阿爾",
  "FC Internazionale Milano": "國際米蘭", "AC Milan": "AC米蘭",
  "Juventus FC": "尤文圖斯", "SSC Napoli": "拿坡里",
  "AS Roma": "羅馬", "SS Lazio": "拉齊奧",
  "FC Bayern München": "拜仁慕尼黑", "Borussia Dortmund": "多特蒙德",
  "RB Leipzig": "萊比錫紅牛", "Bayer 04 Leverkusen": "勒沃庫森",
  "Paris Saint-Germain FC": "巴黎聖日耳曼", "Olympique de Marseille": "馬賽",
  "Olympique Lyonnais": "里昂", "AS Monaco FC": "摩納哥",
  "Cruzeiro EC": "克魯塞羅", "Barcelona SC": "巴塞隆納SC",
  "CA Boca Juniors": "博卡青年", "CD Universidad Católica": "天主教大學"
};

function teamZh(name) { return TEAM_ZH[name] || name; }
function competitionZh(name) { return COMP_ZH[name] || name; }

function statusZh(status) {
  const map = {
    SCHEDULED: "未開賽",
    TIMED: "未開賽",
    IN_PLAY: "進行中",
    LIVE: "進行中",
    PAUSED: "中場休息",
    FINISHED: "全場結束",
    POSTPONED: "延期",
    SUSPENDED: "中斷",
    CANCELED: "取消"
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
  if (!API_KEY) return "FOOTBALL_DATA_KEY 尚未設定。";
  try {
    const data = await apiGet("/competitions");
    return `【Football-Data.org 狀態】\n狀態：已連線 ✅\n可用賽事數：${data.count || 0}`;
  } catch (err) {
    return `Football-Data.org 測試失敗：${err.message}`;
  }
}

function matchLine(m, idx) {
  const home = teamZh(m.homeTeam?.name || "主隊");
  const away = teamZh(m.awayTeam?.name || "客隊");
  const comp = competitionZh(m.competition?.name || "");
  const score = m.score?.fullTime?.home !== null && m.score?.fullTime?.home !== undefined ? `\n⚽ 比分：${m.score.fullTime.home} : ${m.score.fullTime.away}` : "";
  return `${idx + 1}️⃣ ${home} vs ${away}\n🏆 賽事：${comp}\n🕒 時間：${twTime(m.utcDate)}\n📊 狀態：${statusZh(m.status)}${score}`;
}

async function todayMatches() {
  try {
    const data = await apiGet("/matches");
    const games = (data.matches || []).slice(0, 12);
    if (!games.length) return "【VIP 今日足球】今天暫時沒有抓到足球賽事。";
    return `⚽【VIP 今日足球】\n\n${games.map(matchLine).join("\n\n")}`;
  } catch (err) {
    return `【今日足球】抓取失敗：${err.message}`;
  }
}

async function liveScores() {
  try {
    const data = await apiGet("/matches");
    const games = (data.matches || []).filter(m => m.status === "IN_PLAY" || m.status === "PAUSED").slice(0, 12);
    if (!games.length) return "⚽【VIP 即時比分】\n\n目前沒有進行中的足球賽事。";
    return `⚽【VIP 即時比分】\n\n${games.map(matchLine).join("\n\n")}`;
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
    return `⚽【VIP ${info.name}近期賽程】\n\n${games.map(matchLine).join("\n\n")}`;
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
    return `🏆【VIP ${info.name}積分榜 Top10】\n\n${rows.join("\n")}`;
  } catch (err) {
    return `【${info.name}積分榜】抓取失敗：${err.message}`;
  }
}

module.exports = { apiStatus, todayMatches, liveScores, competitionMatches, standings };
