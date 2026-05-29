function hashScore(text) {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return sum;
}

function stars(conf) {
  if (conf >= 78) return "★★★★★";
  if (conf >= 70) return "★★★★☆";
  if (conf >= 62) return "★★★☆☆";
  return "★★☆☆☆";
}

function footballAnalysis(matchText, vip = false) {
  if (!matchText) return "格式：足球分析 皇馬 vs 巴薩";
  const h = hashScore(matchText);
  const home = 38 + (h % 24);
  const draw = 18 + (h % 14);
  const away = Math.max(8, 100 - home - draw);
  const over25 = 45 + (h % 32);
  const btts = 42 + (h % 35);
  const cornersLow = 8 + (h % 3);
  const cornersHigh = cornersLow + 2 + (h % 2);
  const conf = 58 + (h % 25);
  const risk = conf >= 74 ? "中低風險" : conf >= 65 ? "中風險" : "中高風險";
  const pick = home >= away ? "主隊不敗 / 保守方向" : "客隊不敗 / 保守方向";
  const vipText = vip ? "\nVIP 進階：可搭配賽程、積分榜、今日主推與串關。" : "\n🔒 免費版只顯示基礎分析；VIP 可看今日足球、主推、串關、爆冷預警。";

  return `【⚽ 足球 AI 分析】

場次：${matchText}

勝平負：
主勝：${home}%
和局：${draw}%
客勝：${away}%

大小球：
大 2.5：${over25}%
小 2.5：${100 - over25}%

雙方進球：
YES：${btts}%
NO：${100 - btts}%

角球預測：
${cornersLow}～${cornersHigh} 顆

建議方向：
${pick}

信心指數：
${stars(conf)} ${conf}%

風險等級：
${risk}${vipText}

提醒：
這是機率分析，不保證命中。`;
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
★★★★☆ 78%

風險：
中低風險`;
}

function footballParlay() {
  return `【VIP 足球串關】

保守 2 關：
1. 曼城不敗
2. 皇馬不敗

進取 3 關：
1. 曼城不敗
2. 皇馬不敗
3. 拜仁大 2.5

提醒：
串關高波動，只建議小注。`;
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

module.exports = {
  footballAnalysis,
  worldCupAnalysis,
  todayMainPick,
  footballParlay,
  upsetAlert
};
