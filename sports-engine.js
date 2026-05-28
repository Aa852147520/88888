function pct(n) {
  return `${Math.round(n)}%`;
}

function hashScore(text) {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return sum;
}

function makePrediction(title, text, sport = "綜合體育") {
  const h = hashScore(text);
  const home = 48 + (h % 13);
  const away = 100 - home;
  const confidence = 55 + (h % 24);
  const overUnder = h % 2 === 0 ? "偏大分" : "偏小分";
  const risk = confidence >= 72 ? "中低風險" : confidence >= 63 ? "中風險" : "高風險";
  const pick = home >= away ? "主隊方向" : "客隊方向";

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
5. 風險控管

提醒：
這是機率分析，不是保證命中。請控制注碼，避免重壓。`;
}

function helpText() {
  return `【AI 體育預測 V2 指令】

基本指令：
今日賽事
預測 湖人 vs 勇士
NBA 湖人 vs 勇士
MLB 洋基 vs 道奇
足球 阿根廷 vs 法國
串關
VIP
風險

V2 新功能：
✅ NBA 分析
✅ MLB 分析
✅ 足球分析
✅ 大小分方向
✅ 串關推薦
✅ VIP 會員雛形
✅ 風險提示`;
}

function todayGames() {
  return `【今日賽事範例】

1. NBA 湖人 vs 勇士
2. NBA 塞爾提克 vs 熱火
3. MLB 洋基 vs 道奇
4. 足球 阿根廷 vs 法國

輸入範例：
預測 1
NBA 湖人 vs 勇士
MLB 洋基 vs 道奇
足球 阿根廷 vs 法國`;
}

function predictByText(text) {
  if (text.trim() === "預測 1") return makePrediction("今日重點預測", "NBA 湖人 vs 勇士", "NBA");
  if (text.trim() === "預測 2") return makePrediction("今日重點預測", "NBA 塞爾提克 vs 熱火", "NBA");
  if (text.trim() === "預測 3") return makePrediction("今日重點預測", "MLB 洋基 vs 道奇", "MLB");
  return makePrediction("AI 自訂預測", text, "綜合體育");
}

function nbaAnalysis(text) {
  return makePrediction("NBA AI 分析", text, "NBA 籃球");
}

function mlbAnalysis(text) {
  return makePrediction("MLB AI 分析", text, "MLB 棒球");
}

function footballAnalysis(text) {
  return makePrediction("足球 AI 分析", text, "足球");
}

function parlayTips() {
  return `【AI 串關推薦 V2】

今日串關方向：
1. NBA 主隊勝率 60% 以上
2. MLB 小分方向
3. 足球 雙方進球：偏保守

建議串法：
保守：2 關
進取：3 關
不建議：5 關以上重壓

風險等級：
中高風險

提醒：
串關波動很大，只適合小注娛樂，不能保證獲利。`;
}

function vipInfo() {
  return `【VIP 功能雛形】

VIP 可開放：
1. 每日精選 3 場
2. 串關推薦
3. 大小分分析
4. 賽前風險提醒
5. 專屬客服
6. 每日推播

目前版本：
V2 已保留 VIP 指令入口。
之後可接金流、自動開通、到期提醒。`;
}

function riskNotice() {
  return `【風險提醒】

體育預測只能做機率分析。
沒有任何系統可以保證穩贏。

建議：
1. 單場不重壓
2. 嚴格設定停損
3. 不追輸
4. 串關小注
5. 連紅也不要放大注碼`;
}

module.exports = {
  helpText,
  todayGames,
  predictByText,
  nbaAnalysis,
  mlbAnalysis,
  footballAnalysis,
  parlayTips,
  vipInfo,
  riskNotice
};
