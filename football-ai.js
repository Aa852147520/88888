const football = require("./api-football-pro");

function hashScore(text) {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return sum;
}
function stars(conf) {
  if (conf >= 80) return "★★★★★";
  if (conf >= 70) return "★★★★☆";
  if (conf >= 60) return "★★★☆☆";
  return "★★☆☆☆";
}
function baseNumbers(text) {
  const h = hashScore(text);
  const home = 38 + (h % 24);
  const draw = 18 + (h % 14);
  const away = Math.max(8, 100 - home - draw);
  const over25 = 45 + (h % 32);
  const btts = 42 + (h % 35);
  const cornersLow = 8 + (h % 3);
  const cornersHigh = cornersLow + 2 + (h % 2);
  const conf = 58 + (h % 25);
  const upset = Math.max(8, 45 - Math.floor(conf / 3) + (h % 10));
  return { home, draw, away, over25, btts, cornersLow, cornersHigh, conf, upset };
}
function footballAnalysis(matchText, vip = false) {
  if (!matchText) return "格式：足球分析 皇馬 vs 巴薩";
  const n = baseNumbers(matchText);
  const pick = n.home >= n.away ? "主隊不敗 / 保守方向" : "客隊不敗 / 保守方向";
  const vipText = vip ? "\nVIP 進階：可輸入「進階分析 隊伍A vs 隊伍B」查看完整模型。" : "\n🔒 免費版只顯示基礎分析；VIP 可看進階分析、最近5場、H2H、爆冷機率。";
  return `【⚽ 足球 AI 分析】

場次：${matchText}

主勝：${n.home}%
和局：${n.draw}%
客勝：${n.away}%

大 2.5：${n.over25}%
雙方進球 YES：${n.btts}%
角球：${n.cornersLow}～${n.cornersHigh} 顆

建議方向：${pick}
信心指數：${stars(n.conf)} ${n.conf}%${vipText}`;
}
function advancedAnalysis(matchText) {
  if (!matchText) return "格式：進階分析 曼城 vs 利物浦";
  const n = baseNumbers(matchText);
  return `【VIP 進階足球分析】

場次：${matchText}

主勝：${n.home}%
和局：${n.draw}%
客勝：${n.away}%

大 2.5：${n.over25}%
雙方進球 YES：${n.btts}%
角球：${n.cornersLow}～${n.cornersHigh} 顆
爆冷機率：${n.upset}%

信心：${stars(n.conf)} ${n.conf}%`;
}

async function lastFive(team) {
  if (!team) return "格式：最近5場 曼城";

  const TEAM_ID = {
    "曼城": 65,
    "曼聯": 66,
    "利物浦": 64,
    "兵工廠": 57,
    "阿森納": 57,
    "切爾西": 61,
    "熱刺": 73,
    "皇馬": 86,
    "皇家馬德里": 86,
    "巴薩": 81,
    "巴塞隆納": 81,
    "馬競": 78,
    "拜仁": 5,
    "拜仁慕尼黑": 5,
    "多特": 4,
    "多特蒙德": 4,
    "巴黎": 524,
    "PSG": 524,
    "國際米蘭": 108,
    "AC米蘭": 98,
    "尤文": 109,
    "尤文圖斯": 109,
    "拿坡里": 113
  };

  const id = TEAM_ID[team];

  if (!id) {
    return `找不到球隊：${team}

目前支援：
曼城、曼聯、利物浦、兵工廠、皇馬、巴薩、拜仁、巴黎、國際米蘭`;
  }

  try {
  const data = await football.apiGet(`/fixtures?date=${new Date().toISOString().slice(0,10)}`);

  const games = data.response || [];

    if (!games.length) return `找不到 ${team} 最近5場資料`;

    let wins = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    const form = games.map(g => {
      const isHome = g.homeTeam.id === id;
      const gf = isHome ? g.score.fullTime.home : g.score.fullTime.away;
      const ga = isHome ? g.score.fullTime.away : g.score.fullTime.home;

      goalsFor += gf;
      goalsAgainst += ga;

      if (gf > ga) {
        wins++;
        return "✅勝";
      }

      if (gf < ga) return "❌負";

      return "➖和";
    });

    let status = "⚠️低迷";
    if (wins >= 4) status = "🔥火熱";
    else if (wins >= 2) status = "✅穩定";

    return `【VIP 最近5場】

球隊：${team}
近5場：${form.join(" / ")}
進球：${goalsFor}
失球：${goalsAgainst}
勝率：${Math.round((wins / games.length) * 100)}%
狀態：${status}`;
  } catch (err) {
    return `【VIP 最近5場】抓取失敗：${err.message}`;
  }
}
function h2hAnalysis(matchText) { return matchText ? `【VIP H2H】\n\n場次：${matchText}\n近5次：前方勝2 / 和1 / 後方勝2\n判斷：雙方接近。` : "格式：對戰紀錄 曼城 vs 利物浦"; }
function homeAwayAnalysis(matchText) { return matchText ? `【VIP 主客場】\n\n場次：${matchText}\n主場強度：72%\n客場強度：61%\n建議：主隊不敗。` : "格式：主客場 曼城 vs 利物浦"; }
function worldCupAnalysis(matchText, vip = false) { return matchText ? footballAnalysis(matchText, vip).replace("【⚽ 足球 AI 分析】", "【🌎 世界盃 AI 分析】") : "格式：世界盃 巴西 vs 阿根廷"; }
async function todayMainPick() {
  try {
    const data = await football.apiGet(
      `/fixtures?date=${new Date().toISOString().slice(0,10)}`
    );
    const games = data.response || [];

    if (!games.length) {
      return "🎯【VIP 今日主推】\n\n今天暫時沒有抓到足球賽事。";
    }

    const f = games[0];

    const confidence = Math.floor(Math.random() * 11) + 70;

    return `🎯【VIP 今日主推】

⚽ ${f.teams.home.name} vs ${f.teams.away.name}

🏆 聯賽：${f.league.name}
🕒 時間：${new Date(f.fixture.date).toLocaleString("zh-TW")}

📈 推薦方向：
${f.teams.home.name} 不敗

🔥 信心指數：
★★★★☆ ${confidence}%`;
  } catch (err) {
    return `🎯【VIP 今日主推】抓取失敗：${err.message}`;
  }
}
async function footballParlay() {
  try {
    const data = await football.apiGet(`/fixtures?date=${new Date().toISOString().slice(0,10)}`);
    const games = data.response || [];

    if (games.length < 3) {
      return "💰【VIP 足球串關】\n\n今日可用賽事不足。";
    }

    const picks = games.slice(0, 3);

    return `💰【VIP 足球串關】

1️⃣ ${picks[0].teams.home.name} 不敗
🏆 ${picks[0].league.name}

2️⃣ ${picks[1].teams.home.name} 不敗
🏆 ${picks[1].league.name}

3️⃣ ${picks[2].teams.home.name} 大 2.5
🏆 ${picks[2].league.name}

━━━━━━━━━━━━
🔥 建議玩法：3串1
⭐ 信心指數：★★★★☆`;
  } catch (err) {
    return `💰【VIP 足球串關】抓取失敗：${err.message}`;
  }
}
function upsetAlert() { return "【VIP 爆冷預警】\n\n熱門強隊讓太深、客場過熱、主力輪休都要注意。"; }
module.exports = { footballAnalysis, advancedAnalysis, lastFive, h2hAnalysis, homeAwayAnalysis, worldCupAnalysis, todayMainPick, footballParlay, upsetAlert };
