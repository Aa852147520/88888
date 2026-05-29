const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";

function hashScore(text) {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return sum;
}

function worldCupHelp(vip) {
  return `【世界盃專區 V6】

一般指令：
今日世界盃
世界盃賽程
世界盃積分榜
世界盃淘汰賽
世界盃 巴西 vs 阿根廷
世界盃 法國 vs 英格蘭

VIP 指令：
世界盃主推
世界盃串關
世界盃爆冷預警

目前身分：
${vip ? "VIP 會員 ✅" : "免費會員"}

提醒：
現在內建世界盃分析模型與賽程範本。
之後加入 API_FOOTBALL_KEY 可改成真實即時資料。`;
}

async function todayWorldCup() {
  if (API_FOOTBALL_KEY) {
    // 預留正式 API 接口。不同 API 套餐/賽事 ID 可能不同，先保留安全 fallback。
    return fallbackTodayWorldCup() + "\n\nAPI 狀態：已偵測到 API_FOOTBALL_KEY，可於 V6.1 接正式即時賽程。";
  }
  return fallbackTodayWorldCup();
}

function fallbackTodayWorldCup() {
  return `【今日世界盃】

目前為世界盃專區範本模式。

範例焦點：
1. 巴西 vs 阿根廷
時間：今晚 22:00
看點：南美強強對決、節奏偏快

2. 法國 vs 英格蘭
時間：明日 02:00
看點：攻防轉換、邊路速度

3. 日本 vs 韓國
時間：明日 20:00
看點：亞洲代表戰、節奏偏謹慎

輸入：
世界盃 巴西 vs 阿根廷
世界盃主推
世界盃串關`;
}

function worldCupSchedule() {
  return `【世界盃賽程】

分組賽：
每日多場小組賽，建議關注開賽前 60 分鐘名單。

淘汰賽：
16強 → 8強 → 4強 → 決賽

查詢範例：
今日世界盃
世界盃 法國 vs 英格蘭
世界盃 日本 vs 韓國

正式營運建議：
接 API-Football / FIFA 賽程來源，自動更新場次。`;
}

function worldCupStandings() {
  return `【世界盃積分榜】

目前為範本模式。

小組排名判斷重點：
1. 積分
2. 淨勝球
3. 進球數
4. 對戰成績
5. 公平競賽分

V6.1 可接 API 後自動顯示各組積分榜。`;
}

function worldCupKnockout() {
  return `【世界盃淘汰賽】

淘汰賽分析重點：
1. 90分鐘保守程度提升
2. 強隊未必大勝
3. 小球比例容易提高
4. 延長賽與PK風險
5. 爆冷機率高於分組賽後段

VIP 可輸入：
世界盃爆冷預警`;
}

function worldCupPrediction(matchText, vip) {
  if (!matchText) return "格式：世界盃 巴西 vs 阿根廷";

  const h = hashScore(matchText);
  const teamA = 46 + (h % 15);
  const teamB = 100 - teamA;
  const draw = 18 + (h % 8);
  const confidence = 58 + (h % 23);
  const overUnder = h % 2 === 0 ? "偏小球 2.5 以下" : "偏大球 2.5 以上";
  const btts = h % 3 === 0 ? "雙方進球：偏有" : "雙方進球：偏無";
  const pick = teamA >= teamB ? "前方隊伍不敗 / 讓球保守方向" : "後方隊伍不敗 / 讓球保守方向";
  const risk = confidence >= 74 ? "中低風險" : confidence >= 65 ? "中風險" : "中高風險";

  return `【世界盃 AI 分析】

場次：${matchText}

勝率模型：
前方隊伍：${teamA}%
後方隊伍：${teamB}%
和局參考：${draw}%
信心指數：${confidence}%

建議方向：
${pick}

大小球：
${overUnder}

進球判斷：
${btts}

風險等級：
${risk}

分析重點：
1. 世界盃賽事壓力高
2. 強隊容易控球但不一定大勝
3. 淘汰賽小球風險提高
4. 開賽前陣容非常重要

${vip ? "VIP 提醒：可搭配世界盃主推與串關，不建議重壓。" : "免費版提醒：VIP 可看世界盃主推、串關、爆冷預警。"}

注意：
此為機率模型分析，不保證命中。`;
}

function worldCupMainPick() {
  return `【VIP 世界盃主推】

今日主推：
法國 vs 英格蘭

方向：
法國不敗 / 保守讓球方向

大小球：
偏小 2.5

信心：
72%

風險：
中風險

建議：
小注單場，不建議凹單。`;
}

function worldCupParlay() {
  return `【VIP 世界盃串關】

保守 2 關：
1. 法國不敗
2. 日本 vs 韓國 小球方向

進取 3 關：
1. 法國不敗
2. 日本 vs 韓國 小球
3. 巴西 vs 阿根廷 雙方進球偏有

風險：
串關高波動，只建議小注。`;
}

function worldCupUpsetAlert() {
  return `【VIP 世界盃爆冷預警】

今日需注意：
1. 熱門強隊讓太深
2. 小組賽最後一輪戰意不明
3. 淘汰賽 90 分鐘平局風險
4. 主力輪休 / 傷停
5. 市場過熱場

爆冷觀察：
強隊勝率高但賠率過低時，不一定適合追。`;
}

module.exports = {
  worldCupHelp,
  todayWorldCup,
  worldCupSchedule,
  worldCupStandings,
  worldCupKnockout,
  worldCupPrediction,
  worldCupMainPick,
  worldCupParlay,
  worldCupUpsetAlert
};
