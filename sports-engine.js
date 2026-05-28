const matches = [
  {
    id: 1, league: 'NBA', time: '今日 08:30', home: 'Celtics', away: 'Knicks',
    homeForm: 68, awayForm: 59, homeAttack: 72, awayAttack: 64,
    homeDefense: 66, awayDefense: 61, injuryImpactHome: 4, injuryImpactAway: 8,
    homeAdvantage: 5, marketHeatHome: 61, marketHeatAway: 39
  },
  {
    id: 2, league: 'MLB', time: '今日 10:10', home: 'Dodgers', away: 'Padres',
    homeForm: 63, awayForm: 57, homeAttack: 70, awayAttack: 62,
    homeDefense: 60, awayDefense: 58, injuryImpactHome: 5, injuryImpactAway: 6,
    homeAdvantage: 4, marketHeatHome: 58, marketHeatAway: 42
  },
  {
    id: 3, league: '足球', time: '今晚 21:00', home: 'Japan', away: 'Korea',
    homeForm: 60, awayForm: 61, homeAttack: 58, awayAttack: 60,
    homeDefense: 62, awayDefense: 63, injuryImpactHome: 3, injuryImpactAway: 4,
    homeAdvantage: 3, marketHeatHome: 47, marketHeatAway: 53
  }
];

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

function teamScore(m, side) {
  const home = side === 'home';
  const form = home ? m.homeForm : m.awayForm;
  const attack = home ? m.homeAttack : m.awayAttack;
  const defense = home ? m.homeDefense : m.awayDefense;
  const injury = home ? m.injuryImpactHome : m.injuryImpactAway;
  const heat = home ? m.marketHeatHome : m.marketHeatAway;
  const advantage = home ? m.homeAdvantage : 0;

  // 權重可依你的打法調整：近況35%、攻擊25%、防守20%、主場10%、傷兵-10%、市場熱度5%
  return form * 0.35 + attack * 0.25 + defense * 0.2 + advantage * 1.4 - injury * 1.2 + heat * 0.05;
}

function predictMatch(m) {
  const homeScore = teamScore(m, 'home');
  const awayScore = teamScore(m, 'away');
  const diff = homeScore - awayScore;
  const homeProb = clamp(Math.round(sigmoid(diff / 9) * 100), 8, 92);
  const awayProb = 100 - homeProb;
  const confidence = clamp(Math.round(Math.abs(diff) * 6.5), 10, 88);
  const pick = homeProb >= awayProb ? m.home : m.away;
  const risk = confidence >= 70 ? '低～中' : confidence >= 48 ? '中' : '高';
  const lean = confidence >= 70 ? '主推' : confidence >= 48 ? '小注觀察' : '不建議重注';

  return { match: m, homeScore, awayScore, homeProb, awayProb, confidence, pick, risk, lean };
}

function formatPrediction(r) {
  const m = r.match;
  return `📊 ${m.league} 體育預測分析\n${m.home} vs ${m.away}\n開賽：${m.time}\n\n勝率預估：\n${m.home}：${r.homeProb}%\n${m.away}：${r.awayProb}%\n\n建議方向：${r.pick}\n信心指數：${r.confidence}/100\n風險：${r.risk}\n策略：${r.lean}\n\n分析因子：近況、攻防、主場、傷兵、市場熱度。\n提醒：這是機率分析，不保證結果，請做好風險控管。`;
}

function todayMatches() { return matches; }

function helpText() {
  return `🏀 體育預測 LINE 機器人指令\n\n1. 今日賽事\n查看目前可分析場次\n\n2. 預測 1\n分析指定賽事編號\n\n3. 預測 湖人 vs 勇士\n自訂兩隊分析\n\n4. id\n查看你的 LINE User ID\n\n可升級功能：會員權限、後台新增賽事、爬取即時賽程/API、推播預測、VIP 到期提醒。`;
}

module.exports = { predictMatch, todayMatches, formatPrediction, helpText };
