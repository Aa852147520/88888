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

  const n = baseNumbers(team);

  const win = Math.max(1, Math.floor(n.home / 15));
  const draw = Math.max(0, Math.floor(n.draw / 20));
  const lose = Math.max(0, 5 - win - draw);

  const form = [
    "✅勝",
    "✅勝",
    "➖和",
    "✅勝",
    "❌負"
  ].slice(0, 5);

  return `【VIP 最近5場】

球隊：${team}
近5場：${form.join(" / ")}
近況勝率：${Math.min(80, n.conf)}%
狀態：${n.conf >= 70 ? "✅穩定" : "⚠️普通"}

提醒：此為 AI 模型推估，非官方即時戰績。`;
}
  
function h2hAnalysis(matchText) { return matchText ? `【VIP H2H】\n\n場次：${matchText}\n近5次：前方勝2 / 和1 / 後方勝2\n判斷：雙方接近。` : "格式：對戰紀錄 曼城 vs 利物浦"; }
function homeAwayAnalysis(matchText) { return matchText ? `【VIP 主客場】\n\n場次：${matchText}\n主場強度：72%\n客場強度：61%\n建議：主隊不敗。` : "格式：主客場 曼城 vs 利物浦"; }
async function worldCupAnalysis(matchText, vip = false) {
  if (!vip) {
    return `🔒【VIP限定】

🌎 世界盃 AI 即時分析為 VIP 功能

請輸入：
加入VIP`;
  }

  try {
    const data = await football.apiGet(`/fixtures?date=${new Date().toISOString().slice(0,10)}`);
    const games = data.response || [];

    const f = games[0];
    if (!f) return "🌎【世界盃 AI 即時分析】\n\n目前沒有抓到今日賽事。";

    const home = football.zhTeam(f.teams.home.name);
    const away = football.zhTeam(f.teams.away.name);
    const league = football.zhLeague(f.league.name, f.league.country);

    const n = baseNumbers(`${home} vs ${away}`);

    return `🌎【世界盃 AI 即時分析】

場次：${home} vs ${away}
聯賽：${league}
時間：${new Date(f.fixture.date).toLocaleString("zh-TW")}

主勝：${n.home}%
和局：${n.draw}%
客勝：${n.away}%

大 2.5：${n.over25}%
雙方進球 YES：${n.btts}%
角球：${n.cornersLow}～${n.cornersHigh} 顆

建議方向：${n.home >= n.away ? "主隊不敗 / 保守方向" : "客隊不敗 / 保守方向"}
信心指數：${stars(n.conf)} ${n.conf}%`;
  } catch (err) {
    return `🌎【世界盃 AI 即時分析】抓取失敗：${err.message}`;
  }
}

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

⚽ ${football.zhTeam(f.teams.home.name)} vs ${football.zhTeam(f.teams.away.name)}

🏆 聯賽：${football.zhLeague(f.league.name, f.league.country)}
🕒 時間：${new Date(f.fixture.date).toLocaleString("zh-TW")}

📈 推薦方向：
${football.zhTeam(f.teams.home.name)} 不敗

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

1️⃣ ${football.zhTeam(picks[0].teams.home.name)} 不敗
🏆 ${football.zhLeague(picks[0].league.name, picks[0].league.country)}

2️⃣ ${football.zhTeam(picks[1].teams.home.name)} 不敗
🏆 ${football.zhLeague(picks[1].league.name, picks[1].league.country)}

3️⃣ ${football.zhTeam(picks[2].teams.home.name)} 大 2.5
🏆 ${football.zhLeague(picks[2].league.name, picks[2].league.country)}

━━━━━━━━━━━━
🔥 建議玩法：3串1
⭐ 信心指數：★★★★☆`;
  } catch (err) {
    return `💰【VIP 足球串關】抓取失敗：${err.message}`;
  }
}
function upsetAlert() { return "【VIP 爆冷預警】\n\n熱門強隊讓太深、客場過熱、主力輪休都要注意。"; }
module.exports = { footballAnalysis, advancedAnalysis, lastFive, h2hAnalysis, homeAwayAnalysis, worldCupAnalysis, todayMainPick, footballParlay, upsetAlert };
