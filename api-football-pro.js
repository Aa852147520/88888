const API_KEY = process.env.API_FOOTBALL_KEY || "";
const BASE = "https://v3.football.api-sports.io";

const TEAM_ZH = {
  // 英超
  "Manchester City": "曼城",
  "Manchester United": "曼聯",
  "Liverpool": "利物浦",
  "Arsenal": "兵工廠",
  "Chelsea": "切爾西",
  "Tottenham": "熱刺",

  // 西甲
  "Real Madrid": "皇家馬德里",
  "Barcelona": "巴塞隆納",
  "Atletico Madrid": "馬德里競技",

  // 德甲
  "Bayern Munich": "拜仁慕尼黑",
  "Borussia Dortmund": "多特蒙德",

  // 法甲
  "Paris Saint Germain": "巴黎聖日耳曼",
  "PSG": "巴黎聖日耳曼",

  // 義甲
  "Inter": "國際米蘭",
  "AC Milan": "AC米蘭",
  "Juventus": "尤文圖斯",
  "Napoli": "拿坡里",
  "Roma": "羅馬",
  "Lazio": "拉齊奧",

  // 南美
  "Boca Juniors": "博卡青年",
  "River Plate": "河床",
  "Cruzeiro EC": "克魯塞羅",
  "Barcelona SC": "巴塞隆納SC",
  "Universidad Catolica": "天主教大學",
  "CD Universidad Católica": "天主教大學",

  // 日本
  "Blaublitz Akita": "秋田藍閃電",
  "Consadole Sapporo": "北海道札幌岡薩多",

  "Montedio Yamagata": "山形山神",
  "Matsumoto Yamaga": "松本山雅",

  "Tochigi SC": "栃木SC",
  "Parceiro Nagano": "長野帕塞羅",

  "Thespakusatsu Gunma": "群馬草津溫泉",
  "FC Gifu": "FC岐阜",

  // 澳洲
  "St. Albans Saints": "聖奧爾本斯聖徒",
  "Preston Lions": "普雷斯頓雄獅"
};

const LEAGUE_ZH = {
  "Premier League": "🇬🇧 英超",
  "La Liga": "🇪🇸 西甲",
  "Serie A": "🇮🇹 義甲",
  "Bundesliga": "🇩🇪 德甲",
  "Ligue 1": "🇫🇷 法甲",

  "Championship": "🏴 英冠",
  "League One": "🏴 英甲",
  "League Two": "🏴 英乙",

  "Eredivisie": "🇳🇱 荷甲",
  "Primeira Liga": "🇵🇹 葡超",
  "Super Lig": "🇹🇷 土超",
  "Belgian Pro League": "🇧🇪 比甲",
  "Swiss Super League": "🇨🇭 瑞士超",

  "A-League": "🇦🇺 澳洲甲",
  "A-League Men": "🇦🇺 澳洲甲",

  "K League 1": "🇰🇷 韓國K1聯賽",
  "K League 2": "🇰🇷 韓國K2聯賽",

  "Chinese Super League": "🇨🇳 中超",
  "Thai League 1": "🇹🇭 泰超",

  "MLS": "🇺🇸 美國職業足球大聯盟",
  "Liga MX": "🇲🇽 墨西哥超級聯賽",
  "Saudi Pro League": "🇸🇦 沙烏地職業聯賽",

  "Veikkausliiga": "🇫🇮 芬超",
  "Eliteserien": "🇳🇴 挪超",
  "Allsvenskan": "🇸🇪 瑞典超",
  "Superettan": "🇸🇪 瑞典甲",
  "1. Division": "🇳🇴 挪甲",

  "UEFA Champions League": "🏆 歐洲冠軍聯賽",
  "UEFA Europa League": "🏆 歐霸聯賽",

  "Copa Libertadores": "🏆 南美自由盃",
  "Copa Sudamericana": "🏆 南美俱樂部盃",

  "World Cup": "🌎 世界盃",

  // 日本
  "J1 League": "🇯🇵 日本J1聯賽",
  "J2 League": "🇯🇵 日本J2聯賽",
  "J3 League": "🇯🇵 日本J3聯賽",
  "J2/J3 League": "🇯🇵 日本聯賽盃",
  "Emperor Cup": "🏆 日本天皇盃",

  // 澳洲
  "Victoria NPL": "🇦🇺 澳洲維多利亞超級聯賽",
  // 奧地利
"Landesliga - Salzburg": "🇦🇹 薩爾斯堡州聯賽",
"Landesliga - Wien": "🇦🇹 維也納州聯賽",

// 愛沙尼亞
"Esiliiga B": "🇪🇪 愛沙尼亞乙B聯賽",

// 波蘭
"Central Youth League": "🇵🇱 波蘭青年聯賽",

// 捷克
"3. liga - MSFL": "🇨🇿 捷克丙級聯賽 MSFL",
"3. liga - CFL A": "🇨🇿 捷克丙級聯賽 CFL A組",
"3. liga - CFL B": "🇨🇿 捷克丙級聯賽 CFL B組",

"4. liga - Divizie A": "🇨🇿 捷克丁級聯賽 A組",
"4. liga - Divizie B": "🇨🇿 捷克丁級聯賽 B組",
"4. liga - Divizie C": "🇨🇿 捷克丁級聯賽 C組",
"4. liga - Divizie D": "🇨🇿 捷克丁級聯賽 D組",
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
    ? `\n⚽ 即時比分：${f.goals.home ?? 0} : ${f.goals.away ?? 0}`
    : "";

  return `${idx + 1}️⃣ ${home} vs ${away}
🏆 聯賽：${league}
🕒 開賽時間：${twTime(f.fixture.date)}
📊 比賽狀態：${status}${elapsed}${goals}`;
}

async function apiStatus() {
  if (!API_KEY) return "【API-Football 狀態】\n尚未設定 API_FOOTBALL_KEY。";
  try {
    const data = await apiGet("/status");
    const account = data.response?.account || {};
    const requests = data.response?.requests || {};
    return `【API-Football 狀態】
狀態：已連線 ✅
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

目前進行中的足球賽事：

${games.map(fixtureLine).join("\n\n")}

━━━━━━━━━━━━
資料來源：API-Football`;
  } catch (err) {
    return `【API-Football 即時比分】抓取失敗：${err.message}`;
  }
}

module.exports = {
  apiStatus,
  liveScores
};
