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

const TEAM_ZH = {
  "Manchester City FC": "曼城", "Manchester United FC": "曼聯", "Liverpool FC": "利物浦",
  "Arsenal FC": "兵工廠", "Chelsea FC": "切爾西", "Tottenham Hotspur FC": "熱刺",
  "Real Madrid CF": "皇家馬德里", "FC Barcelona": "巴塞隆納",
  "FC Bayern München": "拜仁慕尼黑", "Borussia Dortmund": "多特蒙德",
  "Paris Saint-Germain FC": "巴黎聖日耳曼", "Juventus FC": "尤文圖斯",
  "AC Milan": "AC米蘭", "FC Internazionale Milano": "國際米蘭"
};

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
  const comp = m.competition?.name || "足球賽事";
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
