function stars(conf) {
  if (conf >= 85) return "★★★★★";
  if (conf >= 75) return "★★★★☆";
  if (conf >= 65) return "★★★☆☆";
  return "★★☆☆☆";
}

function normalizeRoad(text) {
  return (text || "")
    .replace(/[，,]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(x => ["莊","閒","和","庄","Banker","Player"].includes(x))
    .map(x => x === "庄" || x === "Banker" ? "莊" : x === "Player" ? "閒" : x);
}

function count(arr, val) {
  return arr.filter(x => x === val).length;
}

function lastStreak(arr) {
  if (!arr.length) return { side:"", count:0 };
  const last = arr[arr.length - 1];
  let n = 0;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === last) n++;
    else break;
  }
  return { side:last, count:n };
}

function alternationScore(arr) {
  const noTie = arr.filter(x => x !== "和");
  if (noTie.length < 4) return 0;
  let alt = 0;
  for (let i = 1; i < noTie.length; i++) {
    if (noTie[i] !== noTie[i - 1]) alt++;
  }
  return Math.round((alt / (noTie.length - 1)) * 100);
}

function corePredict(road) {
  const banker = count(road, "莊");
  const player = count(road, "閒");
  const tie = count(road, "和");
  const noTie = road.filter(x => x !== "和");
  const streak = lastStreak(noTie);
  const alt = alternationScore(road);

  let next = "莊";
  let reason = "";
  let conf = 66;
  let model = "即時短線模型";

  if (streak.count >= 4) {
    next = streak.side;
    reason = `即時盤勢分析，目前 ${streak.count} 連${streak.side}，AI判斷仍有續龍機會，但需控注。`;
    conf = 76 + Math.min(10, streak.count * 2);
    model = "長龍續走模型";
  } else if (streak.count === 3) {
    next = streak.side === "莊" ? "閒" : "莊";
    reason = `即時盤勢分析，目前出現 3 連${streak.side}，AI判斷斷龍機率提高。`;
    conf = 74;
    model = "斷龍模型";
  } else if (alt >= 70) {
    const last = noTie[noTie.length - 1] || "莊";
    next = last === "莊" ? "閒" : "莊";
    reason = `即時盤勢分析，目前跳局比例 ${alt}% ，AI判斷延續一莊一閒節奏。`;
    conf = 73;
    model = "跳局模型";
  } else {
    const last = noTie[noTie.length - 1] || "莊";
    next = last === "莊" ? "閒" : "莊";
    reason = "即時盤勢分析中，目前路單節奏穩定，AI偵測下一手出現反向機率較高。";
    conf = 64 + (road.length % 9);
    model = "短線反向模型";
  }

  return {
    banker, player, tie, streak, alt, next, reason, conf, model,
    risk: conf >= 82 ? "低" : conf >= 72 ? "中低" : conf >= 64 ? "中" : "高",
    unit: conf >= 84 ? "2注" : "1注",
    color: next === "莊" ? "🔴" : "🔵"
  };
}

function predict(text) {
  const road = normalizeRoad(text);
  if (road.length < 3) {
    return `🎰【AI百家預測】

路單太短，請至少輸入3手以上。

範例：
莊 閒 莊 莊 閒`;
  }
  return livePredict(road);
}

function livePredict(road, title = "⚡【黃金右腳 即時百家分析】") {
  if (!road || road.length < 3) {
    return `${title}

目前路單：
${(road || []).join(" ") || "尚未建立"}

總手數：${(road || []).length}

請至少輸入3手以上，系統會開始分析下一手。`;
  }

  const r = corePredict(road);

  return `${title}

目前路單：
${road.join(" ")}

總手數：${road.length}

統計：莊：${r.banker}閒：${r.player}和：${r.tie}

目前型態：
${r.streak.count}連${r.streak.side || "無"}

跳局比例：${r.alt}%

分析模型：${r.model}

━━━━━━━━━━━━

下一手建議：${r.next} ${r.color}

即時信心指數：${stars(r.conf)} ${r.conf}%

建議注碼：${r.unit}

風險：${r.risk}

AI判斷：${r.reason}

⚠️ 僅供參考，請控制注碼。`;
}

module.exports = { predict, livePredict };
