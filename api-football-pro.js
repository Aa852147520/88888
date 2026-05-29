const API_KEY = process.env.API_FOOTBALL_KEY || "";
const BASE = "https://v3.football.api-sports.io";

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
  "Bayern Munich": "拜仁慕尼黑",
  "Borussia Dortmund": "多特蒙德",
  "Paris Saint Germain": "巴黎聖日耳曼",
  "PSG": "巴黎聖日耳曼",
  "Inter": "國際米蘭",
  "AC Milan": "AC米蘭",
  "Juventus": "尤文圖斯",
  "Napoli": "拿坡里",
  "Roma": "羅馬",
  "Lazio": "拉齊奧",
  "Boca Juniors": "博卡青年",
  "River Plate": "河床"
};

const LEAGUE_ZH = {
  "Premier League": "英格蘭超級聯賽",
  "La Liga": "西班牙甲級聯賽",
  "Serie A": "義大利甲級聯賽",
  "Bundesliga": "德國甲級聯賽",
  "Ligue 1": "法國甲級聯賽",
  "UEFA Champions League": "歐洲冠軍聯賽",
  "UEFA Europa League": "歐霸聯賽",
  "Copa Libertadores": "南美自由盃",
  "World Cup": "世界盃"
};

function zhTeam(name) { return TEAM_ZH[name] || name || "未定"; }
function zhLeague(name) { return LEAGUE_ZH[name] || name || "足球賽事"; }

function statusZh(short) {
  const map = {
    "TBD": "時間未定",
    "NS": "未開賽",
    "1H": "上半場",
    "HT": "中場休息",
    "2H": "下半場",
    "ET": "延長賽",
    "BT": "補時",
    "P": "點球大戰",
    "SUSP": "中斷",
    "INT": "中斷",
    "FT": "全場結束",
    "AET": "延長結束",
    "PEN": "點球結束",
    "PST": "延期",
    "CANC": "取消",
    "ABD": "腰斬",
    "AWD": "判定勝負",
    "WO": "棄權"
  };
  return map[short] || short || "未知";
}

async function apiGet(path) {
  if (!API_KEY) throw new Error("尚未設定 API_FOOTBALL_KEY");
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": API_KEY }
  });
  const data = await res.json();

  if (!res.ok) throw new Error(`API-Football HTTP ${res.status}`);
  if (data.errors && Object.keys(data.errors).length) {
    const errText = JSON.stringify(data.errors);
    if (errText.includes("suspended")) throw new Error("API-Football 帳號目前停用");
    throw new Error(`API-Football error: ${errText}`);
  }

  return data;
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

function fixtureLine(f, idx) {
  const home = zhTeam(f.teams.home.name);
  const away = zhTeam(f.teams.away.name);
  const league = zhLeague(f.league.name);
  const status = statusZh(f.fixture.status.short);
  const elapsed = f.fixture.status.elapsed ? `｜${f.fixture.status.elapsed}'` : "";
  const goals = f.goals.home !== null || f.goals.away !== null
    ? `\n⚽ 比分：${f.goals.home ?? 0} : ${f.goals.away ?? 0}`
    : "";

  return `${idx + 1}️⃣ ${home} vs ${away}
🏆 賽事：${league}
🕒 時間：${twTime(f.fixture.date)}
📊 狀態：${status}${elapsed}${goals}`;
}

async function apiStatus() {
  if (!API_KEY) return "【API-Football 狀態】\n尚未設定 API_FOOTBALL_KEY。";
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
    return `【API-Football 狀態】
測試失敗：${err.message}`;
  }
}

async function liveScores() {
  if (!API_KEY) return "【API-Football 即時比分】尚未設定 API_FOOTBALL_KEY。";

  try {
    const data = await apiGet("/fixtures?live=all");
    const games = (data.response || []).slice(0, 15);

    if (!games.length) {
      return "【API-Football 即時比分】目前沒有進行中的足球賽事。";
    }

    return `⚡【VIP 專業即時比分】

${games.map(fixtureLine).join("\n\n")}

資料源：API-Football`;
  } catch (err) {
    return `【API-Football 即時比分】抓取失敗：${err.message}`;
  }
}

module.exports = {
  apiStatus,
  liveScores
};
