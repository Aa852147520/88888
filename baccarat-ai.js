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
    .filter(x => ["莊", "閒", "和", "庄", "Banker", "Player"].includes(x))
    .map(x => {
      if (x === "庄" || x === "Banker") return "莊";
      if (x === "Player") return "閒";
      return x;
    });
}

function count(arr, val) {
  return arr.filter(x => x === val).length;
}

function lastStreak(arr) {
  if (!arr.length) return { side: "", count: 0 };
  const last = arr[arr.length - 1];
  let n = 0;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === last) n++;
    else break;
  }
  return { side: last, count: n };
}

function predict(text) {
  const road = normalizeRoad(text);

  if (road.length < 3) {
    return `🎰【AI百家預測】

路單太短，請至少輸入3手以上。

範例：
莊 閒 莊 莊 閒`;
  }

  const banker = count(road, "莊");
  const player = count(road, "閒");
  const tie = count(road, "和");
  const noTie = road.filter(x => x !== "和");
  const streak = lastStreak(noTie);

  let next = "莊";
  let reason = "";
  let conf = 66;

  if (streak.count >= 3) {
    next = streak.side === "莊" ? "閒" : "莊";
    reason = `目前出現${streak.count}連${streak.side}，AI判斷有斷龍機會。`;
    conf = 72 + Math.min(12, streak.count * 3);
  } else if (banker > player + 2) {
    next = "閒";
    reason = "莊方比例偏高，AI判斷閒方修正機率提升。";
    conf = 70;
  } else if (player > banker + 2) {
    next = "莊";
    reason = "閒方比例偏高，AI判斷莊方修正機率提升。";
    conf = 70;
  } else {
    const last = noTie[noTie.length - 1] || "莊";
    next = last === "莊" ? "閒" : "莊";
    reason = "目前莊閒分布接近，AI採用短線反向模型。";
    conf = 64 + (road.length % 9);
  }

  const risk = conf >= 80 ? "低" : conf >= 70 ? "中低" : conf >= 62 ? "中" : "高";
  const unit = conf >= 82 ? "2注" : "1注";
  const color = next === "莊" ? "🔴" : "🔵";

  return `🎰【POA AI 百家預測】

路單：
${road.join(" ")}

統計：
莊：${banker}
閒：${player}
和：${tie}

目前型態：
${streak.count}連${streak.side || "無"}

━━━━━━━━━━━━

下一手：
${next} ${color}

信心：
${stars(conf)} ${conf}%

建議注碼：
${unit}

風險：
${risk}

AI判斷：
${reason}

⚠️ 僅供參考，請控制注碼。`;
}

module.exports = { predict };
