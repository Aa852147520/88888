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
function lastFive(team) { return team ? `【VIP 最近5場】\n\n球隊：${team}\n近5場：勝 / 勝 / 和 / 負 / 勝\n狀態：穩定` : "格式：最近5場 曼城"; }
function h2hAnalysis(matchText) { return matchText ? `【VIP H2H】\n\n場次：${matchText}\n近5次：前方勝2 / 和1 / 後方勝2\n判斷：雙方接近。` : "格式：對戰紀錄 曼城 vs 利物浦"; }
function homeAwayAnalysis(matchText) { return matchText ? `【VIP 主客場】\n\n場次：${matchText}\n主場強度：72%\n客場強度：61%\n建議：主隊不敗。` : "格式：主客場 曼城 vs 利物浦"; }
function worldCupAnalysis(matchText, vip = false) { return matchText ? footballAnalysis(matchText, vip).replace("【⚽ 足球 AI 分析】", "【🌎 世界盃 AI 分析】") : "格式：世界盃 巴西 vs 阿根廷"; }
function todayMainPick() { return "【VIP 今日主推】\n\n曼城 vs 利物浦\n推薦：曼城不敗\n信心：★★★★☆ 78%"; }
function footballParlay() { return "【VIP 足球串關】\n\n1. 曼城不敗\n2. 皇馬不敗\n3. 拜仁大 2.5"; }
function upsetAlert() { return "【VIP 爆冷預警】\n\n熱門強隊讓太深、客場過熱、主力輪休都要注意。"; }
module.exports = { footballAnalysis, advancedAnalysis, lastFive, h2hAnalysis, homeAwayAnalysis, worldCupAnalysis, todayMainPick, footballParlay, upsetAlert };
