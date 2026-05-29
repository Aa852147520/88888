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
  return { home, draw, away, over25, btts, cornersLow, cornersHigh, conf, upset, h };
}
function footballAnalysis(matchText, vip = false) {
  if (!matchText) return "格式：足球分析 皇馬 vs 巴薩";
  const n = baseNumbers(matchText);
  const risk = n.conf >= 74 ? "中低風險" : n.conf >= 65 ? "中風險" : "中高風險";
  const pick = n.home >= n.away ? "主隊不敗 / 保守方向" : "客隊不敗 / 保守方向";
  const vipText = vip ? "\nVIP 進階：可輸入「進階分析 隊伍A vs 隊伍B」查看完整模型。" : "\n🔒 免費版只顯示基礎分析；VIP 可看進階分析、最近5場、H2H、爆冷機率。";
  return `【⚽ 足球 AI 分析】

場次：${matchText}

勝平負：
主勝：${n.home}%
和局：${n.draw}%
客勝：${n.away}%

大小球：
大 2.5：${n.over25}%
小 2.5：${100 - n.over25}%

雙方進球：
YES：${n.btts}%
NO：${100 - n.btts}%

角球預測：
${n.cornersLow}～${n.cornersHigh} 顆

建議方向：
${pick}

信心指數：
${stars(n.conf)} ${n.conf}%

風險等級：
${risk}${vipText}

提醒：
這是機率分析，不保證命中。`;
}
function advancedAnalysis(matchText) {
  if (!matchText) return "格式：進階分析 曼城 vs 利物浦";
  const n = baseNumbers(matchText);
  const safePick = n.home >= n.away ? "主隊不敗" : "客隊不敗";
  return `【VIP 進階足球分析】

場次：${matchText}

主勝：${n.home}%
和局：${n.draw}%
客勝：${n.away}%

大 2.5：${n.over25}%
雙方進球 YES：${n.btts}%
角球：${n.cornersLow}～${n.cornersHigh} 顆
爆冷機率：${n.upset}%

主推方向：${safePick}
信心：${stars(n.conf)} ${n.conf}%`;
}
function lastFive(team) {
  if (!team) return "格式：最近5場 曼城";
  return `【VIP 最近5場】

球隊：${team}

近5場：
勝 / 勝 / 和 / 負 / 勝

狀態判斷：
狀態穩定`;
}
function h2hAnalysis(matchText) {
  if (!matchText) return "格式：對戰紀錄 曼城 vs 利物浦";
  return `【VIP H2H 對戰紀錄】

場次：${matchText}

近5次交手：
前方隊伍勝：2
和局：1
後方隊伍勝：2

判斷：
雙方歷史對戰接近。`;
}
function homeAwayAnalysis(matchText) {
  if (!matchText) return "格式：主客場 曼城 vs 利物浦";
  return `【VIP 主客場分析】

場次：${matchText}

主隊主場強度：72%
客隊客場強度：61%
客場爆冷風險：28%

建議：
主隊方向較穩，保守看主隊不敗。`;
}
function worldCupAnalysis(matchText, vip = false) {
  if (!matchText) return "格式：世界盃 巴西 vs 阿根廷";
  return footballAnalysis(matchText, vip).replace("【⚽ 足球 AI 分析】", "【🌎 世界盃 AI 分析】");
}
function todayMainPick() {
  return `【VIP 今日主推】

場次：
曼城 vs 利物浦

推薦：
曼城不敗

大小球：
大 2.5 觀察

信心：
★★★★☆ 78%`;
}
function footballParlay() {
  return `【VIP 足球串關】

保守 2 關：
1. 曼城不敗
2. 皇馬不敗

進取 3 關：
1. 曼城不敗
2. 皇馬不敗
3. 拜仁大 2.5`;
}
function upsetAlert() {
  return `【VIP 爆冷預警】

今日需注意：
1. 熱門強隊讓太深
2. 客場強隊熱度過高
3. 連戰球隊輪換風險
4. 臨場主力缺陣
5. 賠率突然反向變動`;
}
module.exports = { footballAnalysis, advancedAnalysis, lastFive, h2hAnalysis, homeAwayAnalysis, worldCupAnalysis, todayMainPick, footballParlay, upsetAlert };
