const TEAM_ZH = {
  // 英超
  "Manchester City": "曼城",
  "Manchester United": "曼聯",
  "Liverpool": "利物浦",
  "Arsenal": "兵工廠",
  "Chelsea": "切爾西",
  "Tottenham": "熱刺",
  "Newcastle": "紐卡索",
  "Aston Villa": "阿斯頓維拉",
  "West Ham": "西漢姆",

  // 西甲
  "Real Madrid": "皇家馬德里",
  "Barcelona": "巴塞隆納",
  "Atletico Madrid": "馬德里競技",
  "Sevilla": "塞維利亞",
  "Valencia": "瓦倫西亞",

  // 義甲
  "Inter": "國際米蘭",
  "Inter Milan": "國際米蘭",
  "AC Milan": "AC米蘭",
  "Juventus": "尤文圖斯",
  "Napoli": "拿坡里",
  "Roma": "羅馬",
  "Lazio": "拉齊奧",

  // 德甲
  "Bayern Munich": "拜仁慕尼黑",
  "Borussia Dortmund": "多特蒙德",
  "RB Leipzig": "萊比錫紅牛",

  // 法甲
  "PSG": "巴黎聖日耳曼",
  "Paris SG": "巴黎聖日耳曼",
  "Marseille": "馬賽",
  "Lyon": "里昂",
  "Monaco": "摩納哥",

  // 南美
  "Boca Juniors": "博卡青年",
  "River Plate": "河床",
  "Flamengo": "佛朗明哥",
  "Palmeiras": "帕爾梅拉斯",
  "Cruzeiro": "克魯塞羅",

  // 奧地利
  "Deutschlandsberger": "德意志蘭茲貝格",
  "Velden": "費爾登",
  "Union Dietach": "迪塔赫聯",
  "Voitsberg": "福伊茨貝格",
  "Gleisdorf 09": "格萊斯多夫09",
  "Junge Wikinger Ried": "里德青年維京人"
};

const LEAGUE_ZH = {
  "English Premier League": "🇬🇧 英格蘭超級聯賽",
  "Spanish La Liga": "🇪🇸 西班牙甲級聯賽",
  "Italian Serie A": "🇮🇹 義大利甲級聯賽",
  "German Bundesliga": "🇩🇪 德國甲級聯賽",
  "French Ligue 1": "🇫🇷 法國甲級聯賽",

  "UEFA Champions League": "🏆 歐洲冠軍聯賽",
  "UEFA Europa League": "🏆 歐霸聯賽",
  "UEFA Europa Conference League": "🏆 歐洲協會聯賽",

  "FIFA World Cup": "🌎 世界盃",

  "Copa Libertadores": "🏆 南美自由盃",
  "Copa Sudamericana": "🏆 南美俱樂部盃",

  "Brazilian Serie A": "🇧🇷 巴西甲級聯賽",
  "Argentina Primera Division": "🇦🇷 阿根廷甲級聯賽",

  "Austrian Bundesliga": "🇦🇹 奧地利超級聯賽",
  "Austrian 2 Liga": "🇦🇹 奧地利乙級聯賽",
  "Austrian Regionalliga Mitte": "🇦🇹 奧地利中部地區聯賽",
  "Austrian Regionalliga West": "🇦🇹 奧地利西部地區聯賽",
  "Austrian Regionalliga East": "🇦🇹 奧地利東部地區聯賽"
};

function zhTeam(name) {
  return TEAM_ZH[name] || name || "未定";
}

function zhLeague(name) {
  return LEAGUE_ZH[name] || name || "足球賽事";
}
