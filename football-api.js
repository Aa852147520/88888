const API_KEY = process.env.API_FOOTBALL_KEY || "";
const BASE = "https://v3.football.api-sports.io";

const LEAGUES = {
  PL: { id: 39, name: "英超" },
  PD: { id: 140, name: "西甲" },
  SA: { id: 135, name: "義甲" },
  BL1: { id: 78, name: "德甲" },
  FL1: { id: 61, name: "法甲" }
};

const TEAM_ZH = {
  "Manchester City": "曼城", "Manchester United": "曼聯", "Liverpool": "利物浦",
  "Arsenal": "兵工廠", "Chelsea": "切爾西", "Tottenham": "熱刺",
  "Tottenham Hotspur": "熱刺", "Newcastle": "紐卡索", "Newcastle United": "紐卡索",
  "Aston Villa": "阿斯頓維拉", "West Ham": "西漢姆", "West Ham United": "西漢姆",
  "Brighton": "布萊頓", "Everton": "埃弗頓", "Crystal Palace": "水晶宮",
  "Fulham": "富勒姆", "Wolves": "狼隊", "Wolverhampton Wanderers": "狼隊",
  "Brentford": "布倫特福德", "Nottingham Forest": "諾丁漢森林",
  "Bournemouth": "伯恩茅斯", "Leicester": "萊斯特城", "Leicester City": "萊斯特城",
  "Real Madrid": "皇家馬德里", "Barcelona": "巴塞隆納", "Atletico Madrid": "馬德里競技",
  "Sevilla": "塞維利亞", "Valencia": "瓦倫西亞", "Villarreal": "比利亞雷阿爾",
  "Real Sociedad": "皇家社會", "Athletic Club": "畢爾包競技", "Athletic Bilbao": "畢爾包競技",
  "Real Betis": "皇家貝提斯", "Girona": "赫羅納", "Osasuna": "奧薩蘇納",
  "Inter": "國際米蘭", "Inter Milan": "國際米蘭", "AC Milan": "AC米蘭",
  "Milan": "AC米蘭", "Juventus": "尤文圖斯", "Napoli": "拿坡里",
  "Roma": "羅馬", "Lazio": "拉齊奧", "Atalanta": "亞特蘭大",
  "Fiorentina": "佛羅倫斯", "Bologna": "波隆那",
  "Bayern Munich": "拜仁慕尼黑", "Bayern München": "拜仁慕尼黑",
  "Borussia Dortmund": "多特蒙德", "Dortmund": "多特蒙德",
  "RB Leipzig": "萊比錫紅牛", "Bayer Leverkusen": "勒沃庫森",
  "Eintracht Frankfurt": "法蘭克福", "VfB Stuttgart": "斯圖加特",
  "Paris Saint Germain": "巴黎聖日耳曼", "Paris Saint-Germain": "巴黎聖日耳曼",
  "PSG": "巴黎聖日耳曼", "Marseille": "馬賽", "Lyon": "里昂",
  "Monaco": "摩納哥", "Lille": "里爾", "Rennes": "雷恩",
  "Nice": "尼斯", "Lens": "朗斯",
  "Argentina": "阿根廷", "Brazil": "巴西", "France": "法國", "England": "英格蘭",
  "Spain": "西班牙", "Germany": "德國", "Italy": "義大利", "Portugal": "葡萄牙",
  "Netherlands": "荷蘭", "Belgium": "比利時", "Croatia": "克羅埃西亞",
  "Japan": "日本", "South Korea": "韓國", "Korea Republic": "韓國",
  "USA": "美國", "United States": "美國", "Mexico": "墨西哥"
};

const LEAGUE_ZH = {
  "Premier League": "英格蘭超級聯賽",
  "La Liga": "西班牙甲級聯賽",
  "Serie A": "義大利甲級聯賽",
  "Bundesliga": "德國甲級聯賽",
  "Ligue 1": "法國甲級聯賽",
  "UEFA Champions League": "歐洲冠軍聯賽",
  "World Cup": "世界盃"
};

function teamNameZh(name) { return TEAM_ZH[name] || name; }
function leagueNameZh(name) { return LEAGUE_ZH[name] || name; }

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function twTime(dateStr) {
  return new Date(dateStr).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false
  });
}

function statusZh(status) {
  const map = {
    "TBD": "時間未定", "NS": "未開賽", "1H": "上半場", "HT": "中場休息",
    "2H": "下半場", "ET": "延長賽", "P": "點球大戰", "FT": "全場結束",
    "AET": "延長結束", "PEN": "點球結束", "PST": "延期", "CANC": "取消",
    "SUSP": "中斷", "INT": "中斷", "ABD": "腰斬", "WO": "棄權"
  };
  return map[status] || status || "未知";
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
  const home = teamNameZh(f.teams.home.name);
  const away = teamNameZh(f.teams.away.name);
  const league = leagueNameZh(f.league.name);
  const status = statusZh(f.fixture.status.short);
  const elapsed = f.fixture.status.elapsed ? `｜分鐘：${f.fixture.status.elapsed}'` : "";
  const goals = f.goals.home !== null || f.goals.away !== null ? `｜比分：${f.goals.home ?? 0}：${f.goals.away ?? 0}` : "";
  return `${idx + 1}. ${home} vs ${away}
聯賽：${league}
開賽時間：${twTime(f.fixture.date)}
狀態：${status}${elapsed}${goals}`;
}

async function todayFootball() {
  try {
    const data = await apiGet(`/fixtures?date=${today()}`);
    const games = (data.response || []).slice(0, 12);
    if (!games.length) return "【今日足球】今天暫時沒有抓到足球賽事。";
    return `【VIP 今日足球】

${games.map(fixtureLine).join("\n\n")}`;
  } catch (err) { return `【今日足球】抓取失敗：${err.message}`; }
}

async function liveScores() {
  try {
    const data = await apiGet("/fixtures?live=all");
    const games = (data.response || []).slice(0, 12);
    if (!games.length) return "【VIP 即時比分】目前沒有進行中的足球賽事。";
    return `【VIP 足球即時比分】

${games.map(fixtureLine).join("\n\n")}`;
  } catch (err) { return `【即時比分】抓取失敗：${err.message}`; }
}

async function standings(code = "PL") {
  const info = LEAGUES[code] || LEAGUES.PL;
  const season = 2024;
  try {
    const data = await apiGet(`/standings?league=${info.id}&season=${season}`);
    const rows = data.response?.[0]?.league?.standings?.[0] || [];
    if (!rows.length) return `【${info.name}積分榜】目前沒有資料。`;
    const top = rows.slice(0, 10).map(r =>
      `${r.rank}. ${teamNameZh(r.team.name)}｜積分：${r.points}｜場次：${r.all.played}｜勝${r.all.win} 和${r.all.draw} 負${r.all.lose}｜得失：${r.goalsDiff}`
    );
    return `【VIP ${info.name}積分榜 Top10】
賽季：${season}

${top.join("\n")}`;
  } catch (err) { return `【${info.name}積分榜】抓取失敗：${err.message}`; }
}

module.exports = { apiStatus, todayFootball, liveScores, standings };
