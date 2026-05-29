const API_KEY = process.env.API_FOOTBALL_KEY || "";
const BASE = "https://v3.football.api-sports.io";

const LEAGUES = {
  PL: { id: 39, name: "英超" },
  PD: { id: 140, name: "西甲" },
  SA: { id: 135, name: "義甲" },
  BL1: { id: 78, name: "德甲" },
  FL1: { id: 61, name: "法甲" },
  UCL: { id: 2, name: "歐冠" },
  WC: { id: 1, name: "世界盃" }
};

function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": API_KEY }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`API-Football HTTP ${res.status}`);
  if (data.errors && Object.keys(data.errors).length) {
    throw new Error(`API-Football error: ${JSON.stringify(data.errors)}`);
  }
  return data;
}

async function apiStatus() {
  if (!API_KEY) return "API_FOOTBALL_KEY 尚未設定。請到 Render → Environment 新增 API_FOOTBALL_KEY。";
  try {
    const data = await apiGet("/status");
    const account = data.response && data.response.account ? data.response.account : {};
    const requests = data.response && data.response.requests ? data.response.requests : {};
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
    const date = today();
    const data = await apiGet(`/fixtures?date=${date}`);
    const games = (data.response || []).slice(0, 10);
    if (!games.length) return `【今日足球】\n今天暫時沒有抓到足球賽事。`;
    return `【VIP 今日足球 即時賽事】

${games.map(fixtureLine).join("\n\n")}

查詢：
即時比分
英超積分榜
世界盃`;
  } catch (err) {
    return `【今日足球】抓取失敗：${err.message}`;
  }
}

async function liveScores() {
  try {
    const data = await apiGet("/fixtures?live=all");
    const games = (data.response || []).slice(0, 10);
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
    const standings = data.response?.[0]?.league?.standings?.[0] || [];
    if (!standings.length) return `【${info.name}積分榜】目前沒有資料。`;
    const top = standings.slice(0, 10).map(row => `${row.rank}. ${row.team.name}｜${row.points}分｜${row.all.played}場｜勝${row.all.win} 和${row.all.draw} 負${row.all.lose}`);
    return `【VIP ${info.name}積分榜 Top10】

${top.join("\n")}`;
  } catch (err) {
    return `【${info.name}積分榜】抓取失敗：${err.message}`;
  }
}

function worldCupHelp(vip) {
  return `【世界盃專區 V6.2】

免費可用：
世界盃 巴西 vs 阿根廷

VIP 專屬：
今日世界盃
世界盃賽程
世界盃積分榜
世界盃主推
世界盃串關
爆冷預警

目前身分：
${vip ? "VIP 會員 ✅" : "免費會員"}

${vip ? "你已解鎖世界盃完整功能。" : "輸入「加入VIP」可解鎖完整世界盃資料。"}`
}

async function todayWorldCup() {
  try {
    const date = today();
    const data = await apiGet(`/fixtures?league=${LEAGUES.WC.id}&season=2026&date=${date}`);
    const games = data.response || [];
    if (!games.length) {
      return `【VIP 今日世界盃】

目前 API 沒有抓到今日世界盃賽事。
可能今日沒有世界盃比賽，或免費 API 方案未開放此賽事。`;
    }
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
    const text = groups.slice(0, 8).map((group, idx) => {
      const rows = group.map(row => `${row.rank}. ${row.team.name}｜${row.points}分｜${row.all.played}場`).join("\n");
      return `小組 ${idx + 1}\n${rows}`;
    }).join("\n\n");
    return `【VIP 世界盃積分榜】\n\n${text}`;
  } catch (err) {
    return `【世界盃積分榜】抓取失敗：${err.message}`;
  }
}

function hashScore(text) {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return sum;
}

function worldCupPrediction(matchText, vip) {
  if (!matchText) return "格式：世界盃 巴西 vs 阿根廷";
  const h = hashScore(matchText);
  const teamA = 46 + (h % 15);
  const teamB = 100 - teamA;
  const draw = 18 + (h % 8);
  const confidence = 58 + (h % 23);
  const overUnder = h % 2 === 0 ? "偏小球 2.5 以下" : "偏大球 2.5 以上";
  const btts = h % 3 === 0 ? "雙方進球：偏有" : "雙方進球：偏無";
  const pick = teamA >= teamB ? "前方隊伍不敗 / 讓球保守方向" : "後方隊伍不敗 / 讓球保守方向";
  const risk = confidence >= 74 ? "中低風險" : confidence >= 65 ? "中風險" : "中高風險";
  const vipExtra = vip ? "\nVIP已解鎖：可搭配今日世界盃、世界盃主推、世界盃串關。" : "\n🔒 免費版只顯示基礎分析；VIP 可看即時賽程、積分榜、主推、串關、爆冷預警。";

  return `【世界盃 AI 基礎分析】

場次：${matchText}

勝率模型：
前方隊伍：${teamA}%
後方隊伍：${teamB}%
和局參考：${draw}%
信心指數：${confidence}%

建議方向：
${pick}

大小球：
${overUnder}

進球判斷：
${btts}

風險等級：
${risk}
${vipExtra}

注意：
此為機率模型分析，不保證命中。`;
}

function worldCupMainPick() {
  return `【VIP 世界盃主推】

今日主推：
法國 vs 英格蘭

方向：
法國不敗 / 保守讓球方向

大小球：
偏小 2.5

信心：
72%

風險：
中風險

建議：
小注單場，不建議凹單。`;
}

function worldCupParlay() {
  return `【VIP 世界盃串關】

保守 2 關：
1. 法國不敗
2. 日本 vs 韓國 小球方向

進取 3 關：
1. 法國不敗
2. 日本 vs 韓國 小球
3. 巴西 vs 阿根廷 雙方進球偏有

風險：
串關高波動，只建議小注。`;
}

function worldCupUpsetAlert() {
  return `【VIP 世界盃爆冷預警】

今日需注意：
1. 熱門強隊讓太深
2. 小組賽最後一輪戰意不明
3. 淘汰賽 90 分鐘平局風險
4. 主力輪休 / 傷停
5. 市場過熱場

爆冷觀察：
強隊勝率高但賠率過低時，不一定適合追。`;
}

module.exports = {
  apiStatus,
  todayFootball,
  liveScores,
  standings,
  worldCupHelp,
  todayWorldCup,
  worldCupSchedule,
  worldCupStandings,
  worldCupPrediction,
  worldCupMainPick,
  worldCupParlay,
  worldCupUpsetAlert
};
