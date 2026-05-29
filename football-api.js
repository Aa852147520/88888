const API_KEY = process.env.API_FOOTBALL_KEY || "";
const BASE = "https://v3.football.api-sports.io";

const LEAGUES = {
  PL: { id: 39, name: "英超" },
  PD: { id: 140, name: "西甲" },
  SA: { id: 135, name: "義甲" },
  BL1: { id: 78, name: "德甲" },
  FL1: { id: 61, name: "法甲" },
  WC: { id: 1, name: "世界盃" }
};

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function twTime(dateStr) {
  return new Date(dateStr).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

async function apiGet(path) {
  if (!API_KEY) throw new Error("尚未設定 API_FOOTBALL_KEY");
  const res = await fetch(`${BASE}${path}`, { headers: { "x-apisports-key": API_KEY } });
  const data = await res.json();
  if (!res.ok) throw new Error(`API-Football HTTP ${res.status}`);
  if (data.errors && Object.keys(data.errors).length) throw new Error(`API-Football error: ${JSON.stringify(data.errors)}`);
  return data;
}

async function apiStatus() {
  if (!API_KEY) return "API_FOOTBALL_KEY 尚未設定。";
  try {
    const data = await apiGet("/status");
    const account = data.response?.account || {};
    const requests = data.response?.requests || {};
    return `【API-Football 狀態】

狀態：已連線 ✅
方案：${account.plan || "未知"}
今日已用：${requests.current || 0}
今日上限：${requests.limit_day || "未知"}`;
  } catch (err) {
    return `API-Football 測試失敗：${err.message}`;
  }
}

function fixtureLine(f, idx) {
  const home = f.teams.home.name;
  const away = f.teams.away.name;
  const league = f.league.name;
  const status = f.fixture.status.short;
  const goals = f.goals.home !== null || f.goals.away !== null ? `｜${f.goals.home ?? 0}:${f.goals.away ?? 0}` : "";
  return `${idx + 1}. ${home} vs ${away}
聯賽：${league}
時間：${twTime(f.fixture.date)}｜狀態：${status}${goals}`;
}

async function todayFootball() {
  try {
    const data = await apiGet(`/fixtures?date=${today()}`);
    const games = (data.response || []).slice(0, 12);
    if (!games.length) return "【今日足球】今天暫時沒有抓到足球賽事。";
    return `【VIP 今日足球】

${games.map(fixtureLine).join("\n\n")}`;
  } catch (err) {
    return `【今日足球】抓取失敗：${err.message}`;
  }
}

async function liveScores() {
  try {
    const data = await apiGet("/fixtures?live=all");
    const games = (data.response || []).slice(0, 12);
    if (!games.length) return "【VIP 即時比分】目前沒有進行中的足球賽事。";
    return `【VIP 足球即時比分】

${games.map(fixtureLine).join("\n\n")}`;
  } catch (err) {
    return `【即時比分】抓取失敗：${err.message}`;
  }
}

async function standings(code = "PL") {
  const info = LEAGUES[code] || LEAGUES.PL;
  const season = new Date().getFullYear();
  try {
    const data = await apiGet(`/standings?league=${info.id}&season=${season}`);
    const rows = data.response?.[0]?.league?.standings?.[0] || [];
    if (!rows.length) return `【${info.name}積分榜】目前沒有資料。`;
    const top = rows.slice(0, 10).map(r => `${r.rank}. ${r.team.name}｜${r.points}分｜${r.all.played}場｜勝${r.all.win} 和${r.all.draw} 負${r.all.lose}`);
    return `【VIP ${info.name}積分榜 Top10】

${top.join("\n")}`;
  } catch (err) {
    return `【${info.name}積分榜】抓取失敗：${err.message}`;
  }
}

async function todayWorldCup() {
  try {
    const data = await apiGet(`/fixtures?league=${LEAGUES.WC.id}&season=2026&date=${today()}`);
    const games = data.response || [];
    if (!games.length) return "【VIP 今日世界盃】目前 API 沒有抓到今日世界盃賽事。";
    return `【VIP 今日世界盃】

${games.map(fixtureLine).join("\n\n")}`;
  } catch (err) {
    return `【今日世界盃】抓取失敗：${err.message}`;
  }
}

async function worldCupSchedule() {
  try {
    const data = await apiGet(`/fixtures?league=${LEAGUES.WC.id}&season=2026`);
    const games = (data.response || []).slice(0, 15);
    if (!games.length) return "【VIP 世界盃賽程】目前 API 沒有回傳賽程。";
    return `【VIP 世界盃賽程 前15場】

${games.map(fixtureLine).join("\n\n")}`;
  } catch (err) {
    return `【世界盃賽程】抓取失敗：${err.message}`;
  }
}

async function worldCupStandings() {
  try {
    const data = await apiGet(`/standings?league=${LEAGUES.WC.id}&season=2026`);
    const groups = data.response?.[0]?.league?.standings || [];
    if (!groups.length) return "【VIP 世界盃積分榜】目前 API 沒有回傳積分榜。";
    return `【VIP 世界盃積分榜】\n\n` + groups.slice(0, 8).map((group, idx) => {
      const rows = group.map(r => `${r.rank}. ${r.team.name}｜${r.points}分｜${r.all.played}場`).join("\n");
      return `小組 ${idx + 1}\n${rows}`;
    }).join("\n\n");
  } catch (err) {
    return `【世界盃積分榜】抓取失敗：${err.message}`;
  }
}

module.exports = { apiStatus, todayFootball, liveScores, standings, todayWorldCup, worldCupSchedule, worldCupStandings };
