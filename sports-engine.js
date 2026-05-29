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
  const vipExtra = vip ? "\n\nVIP 進階分析：\n1. 建議注碼：小注 1 單位\n2. 進場時間：賽前 30~60 分鐘觀察\n3. 避免條件：臨場主力缺陣、盤口劇烈反向\n4. 串關建議：可作為 2 關其中一關" : "\n\n免費版提醒：\n輸入「加入VIP」可看每日精選、串關、大小分進階分析。";

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
  return `【AI 體育預測 V6 指令】

世界盃：
世界盃
今日世界盃
世界盃賽程
世界盃 巴西 vs 阿根廷
世界盃主推
世界盃串關
爆冷預警

即時賽事：
今日即時賽事
今日NBA
今日MLB
今日NFL
今日NHL
今日足球
即時分析 湖人 vs 勇士

VIP：
每日精選
串關
大小分 湖人 vs 勇士

會員：
我的狀態
加入VIP

目前身分：
${vip ? "VIP 會員 ✅" : "免費會員"}
${isAdmin ? "\n管理員：\n我的ID\n開通VIP USER_ID 30\n取消VIP USER_ID\nVIP名單" : ""}`;
}

function todayGames() { return "請輸入：\n今日即時賽事\n今日NBA\n今日MLB\n今日足球\n今日世界盃"; }
function predictByText(text, vip) { return makePrediction("AI 自訂預測", text, "綜合體育", vip); }
function nbaAnalysis(text, vip) { return makePrediction("NBA AI 分析", text, "NBA 籃球", vip); }
function mlbAnalysis(text, vip) { return makePrediction("MLB AI 分析", text, "MLB 棒球", vip); }
function footballAnalysis(text, vip) { return makePrediction("足球 AI 分析", text, "足球", vip); }
function vipDailyPicks() { return "【VIP 每日精選】\n\n1. 今日 NBA 強勢方\n方向：主隊方向\n信心：72%\n\n2. 今日 MLB 小分場\n方向：小分\n信心：68%\n\n3. 世界盃焦點場\n方向：小球 / 不敗方向\n信心：70%\n\n提醒：請搭配「今日即時賽事」確認開賽時間。"; }
function vipParlay() { return "【VIP 串關推薦】\n\n保守 2 關：\n1. NBA 主隊方向\n2. 世界盃 小球方向\n\n進取 3 關：\n1. NBA 主隊方向\n2. MLB 小分方向\n3. 世界盃 不敗方向\n\n串關高波動，建議小注。"; }
function overUnderAnalysis(text) { return makePrediction("VIP 大小分分析", text, "大小分", true); }
function needVip() { return "此功能為 VIP 專屬 🔒\n\n可解鎖：\n每日精選\n世界盃主推\n串關推薦\n大小分進階分析\n爆冷預警\n\n輸入「加入VIP」查看方案。"; }
function vipInfo() { return "【VIP 方案】\n\n可看：\n1. 每日精選\n2. 世界盃主推\n3. 世界盃串關\n4. 爆冷預警\n5. 大小分分析\n\n請聯絡客服開通。"; }

module.exports = { helpText, todayGames, predictByText, nbaAnalysis, mlbAnalysis, footballAnalysis, vipDailyPicks, vipParlay, overUnderAnalysis, needVip, vipInfo };
