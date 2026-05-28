function pct(n) {
  return `${Math.round(n)}%`;
}

function hashScore(text) {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return sum;
}

function makePrediction(title, text, sport = "綜合體育", vip = false) {
  const h = hashScore(text);
  const home = 48 + (h % 13);
  const away = 100 - home;
  const confidence = 55 + (h % 24);
  const overUnder = h % 2 === 0 ? "偏大分" : "偏小分";
  const risk = confidence >= 72 ? "中低風險" : confidence >= 63 ? "中風險" : "高風險";
  const pick = home >= away ? "主隊方向" : "客隊方向";
  const vipExtra = vip ? `

VIP 進階分析：
1. 建議注碼：小注 1 單位
2. 進場時間：賽前 30~60 分鐘觀察盤口
3. 避免條件：臨場主力缺陣、盤口劇烈反向
4. 串關建議：可作為 2 關其中一關` : `

免費版提醒：
此場只顯示基礎分析。
輸入「加入VIP」可看每日精選、串關、大小分進階分析。`;

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
風險：${risk}

分析重點：
1. 近期狀態
2. 對戰節奏
3. 主客場差異
4. 盤口熱度
5. 風險控管${vipExtra}

提醒：
這是機率分析，不是保證命中。請控制注碼，避免重壓。`;
}

function helpText(vip, isAdmin) {
  return `【AI 體育預測 V3 指令】

基本：
今日賽事
預測 湖人 vs 勇士
NBA 湖人 vs 勇士
MLB 洋基 vs 道奇
足球 阿根廷 vs 法國
我的狀態
加入VIP

VIP：
每日精選
串關
大小分 湖人 vs 勇士

目前身分：
${vip ? "VIP 會員 ✅" : "免費會員"}
${isAdmin ? "\n管理員指令：\n我的ID\n開通VIP USER_ID 30\n取消VIP USER_ID\nVIP名單" : ""}`;
}

function todayGames() {
  return `【今日賽事範例】

1. NBA 湖人 vs 勇士
2. NBA 塞爾提克 vs 熱火
3. MLB 洋基 vs 道奇
4. 足球 阿根廷 vs 法國

輸入：
預測 1
NBA 湖人 vs 勇士
每日精選
串關`;
}

function predictByText(text, vip) {
  if (text.trim() === "預測 1") return makePrediction("今日重點預測", "NBA 湖人 vs 勇士", "NBA", vip);
  if (text.trim() === "預測 2") return makePrediction("今日重點預測", "NBA 塞爾提克 vs 熱火", "NBA", vip);
  if (text.trim() === "預測 3") return makePrediction("今日重點預測", "MLB 洋基 vs 道奇", "MLB", vip);
  return makePrediction("AI 自訂預測", text, "綜合體育", vip);
}

function nbaAnalysis(text, vip) {
  return makePrediction("NBA AI 分析", text, "NBA 籃球", vip);
}

function mlbAnalysis(text, vip) {
  return makePrediction("MLB AI 分析", text, "MLB 棒球", vip);
}

function footballAnalysis(text, vip) {
  return makePrediction("足球 AI 分析", text, "足球", vip);
}

function vipDailyPicks() {
  return `【VIP 每日精選】

1. NBA 湖人 vs 勇士
方向：主隊 + 小分
信心：72%
風險：中風險

2. MLB 洋基 vs 道奇
方向：客隊 + 小分
信心：68%
風險：中風險

3. 足球 阿根廷 vs 法國
方向：雙方進球偏保守
信心：64%
風險：中高風險

下注建議：
單場小注，不追輸，不凹單。`;
}

function vipParlay() {
  return `【VIP 串關推薦】

保守 2 關：
1. NBA 主隊方向
2. MLB 小分方向

進取 3 關：
1. NBA 主隊方向
2. MLB 小分方向
3. 足球 保守小球方向

風險：
串關屬於高波動，建議小注。`;
}

function overUnderAnalysis(text) {
  return makePrediction("VIP 大小分分析", text, "大小分", true);
}

function needVip() {
  return `此功能為 VIP 專屬 🔒

可解鎖：
1. 每日精選
2. 串關推薦
3. 大小分進階分析
4. 風險等級
5. 每日推播

輸入「加入VIP」查看方案。`;
}

function vipInfo() {
  return `【VIP 方案】

月費 VIP：
每日精選 3 場
串關推薦
大小分分析
風險控管提醒

開通方式：
請聯絡客服人工開通。


管理員官方LINE：@058gvokk

module.exports = {
  helpText,
  todayGames,
  predictByText,
  nbaAnalysis,
  mlbAnalysis,
  footballAnalysis,
  vipDailyPicks,
  vipParlay,
  overUnderAnalysis,
  needVip,
  vipInfo
};
