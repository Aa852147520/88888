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
  "Preston Lions": "普雷斯頓雄獅",

  // 愛沙尼亞
"Narva U21": "納爾瓦U21",
"JK Tabasalu": "塔巴薩魯",

// 韓國
"Yeoju Sejong": "驪州世宗",
"Daejeon Korail": "大田韓國鐵路",

// 澳洲
"Olympic": "奧林匹克FC",
"Brisbane City": "布里斯本城",

// 奧地利
"Bürmoos": "布爾莫斯",
"Salzburger AK": "薩爾斯堡AK",
"Slovan HAC": "斯洛文HAC",
"Wienerberg": "維也納山",

// 捷克
"Zbrojovka Brno II": "布爾諾B隊",
"Hlučín": "赫魯欽",
"Sigma Olomouc II": "奧洛穆茨B隊",
"Blansko": "布蘭斯科",
"Uničov": "烏尼喬夫",
"Slovácko II": "斯洛瓦茨科B隊",
"Znojmo": "茲諾伊莫",
"Sparta Brno": "布爾諾斯巴達",

// 越南
"Ha Noi": "河內FC",
"Ho Chi Minh": "胡志明市FC",
"Viettel": "越電信FC",
"Da Nang": "峴港FC",
"Nam Dinh": "南定FC",

// 瑞典
"IF Brommapojkarna": "布羅馬波卡納",
"Hammarby FF": "哈馬比",
"IFK Goteborg": "哥德堡",
"BK Hacken": "赫根",

// 肯亞
"GOR Mahia": "高爾馬希亞",
"AFC Leopards": "AFC獵豹",
"Tusker": "塔斯克",

 // 德國
"Hilden": "希爾登",
"Monheim": "蒙海姆",
"SG Wattenscheid 09": "瓦滕沙伊德09",
"Lippstadt 08": "利普施塔特08",
"Finnentrop / Bamenohl": "芬嫩特羅普/巴門諾爾",
"Schermbeck": "舍姆貝克",
"Bornheim": "博恩海姆",
"VfL Vichttal": "菲希塔爾",
"Teutonia Weiden": "魏登條頓尼亞",
"SSV Merten": "梅爾滕",
"Eintracht Hohkeppel": "霍克佩爾",
"Düren Merzenich": "迪倫梅爾策尼希",

// 波蘭青年
"Śląsk Wrocław U19": "弗羅茨瓦夫U19",
"Jagiellonia U19": "喬治羅尼亞U19",

// 瑞典
"Lidingö": "利丁厄",
"Falu BS": "法魯BS",

// 國家隊
"Switzerland": "瑞士",
"Jordan": "約旦",

// 巴西
"Itaquá Athletico Clube": "伊塔誇競技",
"Barcelona EC": "巴塞隆納EC",
"BOA": "博阿",
"Guarani MG": "瓜拉尼MG",

// 葡萄牙
"Oliveira Hospital": "奧利維拉醫院",
"Atlético Malveira": "馬爾韋拉競技",

// 肯亞
"Nairobi United": "奈洛比聯",

// 西班牙女足
"Athletic Club W": "畢爾包競技女足",
"Alhama W": "阿爾哈馬女足",
"Levante W": "萊萬特女足",
"FC Levante Badalona": "萊萬特巴達洛納女足",

// 巴西
"RB Bragantino": "RB布拉干蒂諾",
"Internacional": "國際體育會",

// 挪威
"Arendal": "阿倫達爾",
"Sotra": "索特拉",
"Kvik Halden": "奎克哈爾登",
"Lysekloster": "呂瑟克洛斯特",
"Notodden": "諾托登",
"jerv": "耶爾夫",
"Levanger": "萊萬厄爾",
"Junkeren": "容克倫",
"Aalesund II": "奧勒松B隊",
"Strindheim": "斯特林海姆",

// 瑞典女足
"Husqvarna W": "胡斯克瓦納女足",
"Linköping W": "林雪平女足",

"Espanyol W": "西班牙人女足",
"Sevilla W": "塞維利亞女足",
"Madrid CFF W": "馬德里CFF女足",
"Barcelona W": "巴塞隆納女足",  
};

const LEAGUE_ZH = {
  "Premier League": "🇬🇧 英超",
  "La Liga": "🇪🇸 西甲",
  
  "Italy Serie A": "🇮🇹 義甲",
  "Brazil Serie A": "🇧🇷 巴西甲級聯賽",
  "Brazil Serie B": "🇧🇷 巴西乙級聯賽",
  
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
  "K3 League": "🇰🇷 韓國K3聯賽",

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

// 女子聯賽
"Primera División Femenina": "🇪🇸 西班牙女子甲級聯賽",
"Damallsvenskan": "🇸🇪 瑞典女子超級聯賽",

// 挪威
"2. Division - Group 1": "🇳🇴 挪威乙級聯賽 第1組",
"2. Division - Group 2": "🇳🇴 挪威乙級聯賽 第2組",
"3. Division - Girone 2": "🇳🇴 挪威丙級聯賽 第2組",  

// 瑞典
"Division 2 - Norra Götaland": "🇸🇪 瑞典乙級聯賽 北約塔蘭組",
"Division 2 - Norra Svealand": "🇸🇪 瑞典乙級聯賽 北斯韋阿蘭組",
"Division 2 - Södra Svealand": "🇸🇪 瑞典乙級聯賽 南斯韋阿蘭組",
"Division 2 - Västra Götaland": "🇸🇪 瑞典乙級聯賽 西約塔蘭組",
  
// 瑞典女足次級聯賽
"Elitettan": "🇸🇪 瑞典女子甲級聯賽",

// 越南
"V.League 1": "🇻🇳 越南甲級聯賽",

// 肯亞
"FKF Premier League": "🇰🇪 肯亞超級聯賽",

// 挪威
"3. Division - Girone 4": "🇳🇴 挪威丙級聯賽 第4組",

// 德國地區聯賽
"Oberliga - Niederrhein": "🇩🇪 德國高級聯賽 下萊茵區",
"Oberliga - Westfalen": "🇩🇪 德國高級聯賽 威斯特法倫區",
"Oberliga - Mittelrhein": "🇩🇪 德國高級聯賽 中萊茵區",

// 國際友誼賽
"Friendlies": "🌍 國際友誼賽",

// 巴西
"Paulista Série B": "🇧🇷 巴西聖保羅州乙級聯賽",
"Mineiro - 2": "🇧🇷 巴西米內羅乙級聯賽",

// 葡萄牙
"Campeonato de Portugal Prio - Promotion Round": "🇵🇹 葡萄牙錦標聯賽升級附加賽",

"Queensland NPL": "🇦🇺 澳洲昆士蘭超級聯賽",  
  
};

function zhTeam(name) { return TEAM_ZH[name] || name || "未定"; }
function zhLeague(name, country) {
  const key = `${country} ${name}`;
  return LEAGUE_ZH[key] || LEAGUE_ZH[name] || name;
}
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
  console.log(
  "League:",
  f.league.country,
  f.league.name
);
  
  const home = zhTeam(f.teams.home.name);
  const away = zhTeam(f.teams.away.name);
  const league = zhLeague(
  f.league.name,
  f.league.country
);
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
