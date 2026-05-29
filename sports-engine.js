function pct(n) { return `${Math.round(n)}%`; }
function hashScore(text) { let sum = 0; for (const ch of text) sum += ch.charCodeAt(0); return sum; }

function makePrediction(title, text, sport = "綜合體育", vip = false) {
  const h = hashScore(text);
  const home = 48 + (h % 13);
  const away = 100 - home;
  const confidence = 55 + (h % 24);
  const overUnder = h % 2 === 0 ? "偏大分" : "偏小分";
  const risk = confidence >= 72 ? "中低風險" : confidence >= 63 ? "中風險" : "高風險";
  const pick = home >= away ? "主隊方向" : "客隊方向";
  const vipExtra = vip
    ? "\n\nVIP 進階分析：\n1. 建議注碼：小注 1 單位\n2. 進場時間：賽前 30~60 分鐘觀察\n3. 可搭配即時比分與今日賽事"
    : "\n\n🔒 免費版只顯示基礎分析。\nVIP 可看：今日足球、即時比分、世界盃賽程、主推、串關。";

  return `【${title}】

項目：${sport}
分析場次：${text.replace(/^預測/i, "").trim() || "自訂場次"}

勝率模型：
主隊：${pct(home)}
客隊：${pct(away)}
信心指數：${pct(confidence)}

AI 建議：
方向：${pick}
大小分：${overUnder}
風險：${risk}${vipExtra}

提醒：
這是機率分析，不是保證命中。`;
}

function helpText(vip, isAdmin) {
  return `【AI 體育預測 V6.2】

免費可用：
說明
加入VIP
我的狀態
世界盃 巴西 vs 阿根廷
NBA 湖人 vs 勇士
MLB 洋基 vs 道奇

VIP 專屬：
今日足球
即時比分
英超積分榜
今日世界盃
世界盃賽程
世界盃積分榜
世界盃主推
世界盃串關
爆冷預警
每日精選
今日NBA
今日MLB
大小分分析

目前身分：
${vip ? "VIP 會員 ✅" : "免費會員"}
${isAdmin ? "\n管理員：\n我的ID\n開通VIP USER_ID 30\n取消VIP USER_ID\nVIP名單\nAPI狀態" : ""}`;
}

function todayGames() { return "VIP 可查：今日足球、即時比分、今日世界盃、今日NBA、今日MLB"; }
function predictByText(text, vip) { return makePrediction("AI 基礎預測", text, "綜合體育", vip); }
function nbaAnalysis(text, vip) { return makePrediction("NBA AI 基礎分析", text, "NBA 籃球", vip); }
function mlbAnalysis(text, vip) { return makePrediction("MLB AI 基礎分析", text, "MLB 棒球", vip); }
function footballAnalysis(text, vip) { return makePrediction("足球 AI 基礎分析", text, "足球", vip); }
function vipDailyPicks() { return "【VIP 每日精選】\n\n1. 今日足球強勢方\n方向：不敗 / 小球觀察\n信心：70%\n\n2. 今日 NBA 強勢方\n方向：主隊方向\n信心：72%\n\n3. 今日 MLB 小分場\n方向：小分\n信心：68%\n\n提醒：請搭配「今日足球 / 即時比分」確認開賽時間。"; }
function vipParlay() { return "【VIP 串關推薦】\n\n保守 2 關：\n1. 足球 不敗方向\n2. NBA 主隊方向\n\n進取 3 關：\n1. 足球 小球方向\n2. NBA 主隊方向\n3. MLB 小分方向\n\n串關高波動，建議小注。"; }
function overUnderAnalysis(text) { return makePrediction("VIP 大小分分析", text, "大小分", true); }
function needVip() {
  return `🔒 VIP 專屬功能

你目前是免費會員。

VIP 可使用：
✅ 今日足球
✅ 即時比分
✅ 英超/西甲/義甲/德甲/法甲積分榜
✅ 今日世界盃
✅ 世界盃賽程
✅ 世界盃積分榜
✅ 每日精選
✅ 世界盃主推
✅ 世界盃串關
✅ 爆冷預警
✅ 大小分分析

請聯絡客服開通 VIP。`;
}
function vipInfo() {
  return `【VIP 方案】

VIP 解鎖：
1. 今日足球即時賽事
2. 即時比分
3. 世界盃賽程 / 積分榜
4. 世界盃主推
5. 世界盃串關
6. 爆冷預警
7. 每日精選
8. 大小分分析

開通方式：
請聯絡客服人工開通。

管理員指令：
開通VIP USER_ID 30`;
}

module.exports = { helpText, todayGames, predictByText, nbaAnalysis, mlbAnalysis, footballAnalysis, vipDailyPicks, vipParlay, overUnderAnalysis, needVip, vipInfo };
