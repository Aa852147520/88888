async function handleEvent(event, client) {
  if (event.type !== "message" || event.message.type !== "text") return;

  const text = event.message.text.trim();
  const userId = event.source.userId || "";

  // 極速回覆區：不查 Supabase、不查 API
  if (text === "說明" || text.toLowerCase() === "help") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: helpText(false, false)
    });
  }

  if (text === "加入VIP" || text === "VIP") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: vipInfo()
    });
  }

  if (text === "開通") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `你的開通密鑰：\n${userId}
      請聯絡管理員開通: @058gvokk`
    });
  }

  const vip = await isVip(userId);
  const vipData = await getVip(userId);
  const isAdmin = ADMIN_USER_ID && userId === ADMIN_USER_ID;
  let reply = "";

  try {
    if (text === "我的狀態") {
      reply = vip
        ? `你目前是 VIP 會員 ✅\n到期日：${vipData.expire_date}`
        : "你目前不是 VIP 會員。\n輸入「加入VIP」查看方案。";
    }

    else if (text.startsWith("足球分析")) {
      reply = ai.footballAnalysis(text.replace("足球分析", "").trim(), vip);
    }

    else if (text.startsWith("世界盃 ")) {
      reply = ai.worldCupAnalysis(text.replace("世界盃", "").trim(), vip);
    }

    else if (text === "API狀態") {
      reply = isAdmin
        ? await apiFootball.apiStatus() + "\n\n" + await footballData.apiStatus() + "\n\n" + await tdb.apiStatus()
        : needVip();
    }

    else if (text === "即時比分" || text === "足球比分" || text === "專業即時比分") {
      reply = await vipOnly(vip, () => smartLiveScores());
    }

    else if (text === "今日足球") {
      reply = await vipOnly(vip, () => smartTodayFootball());
    }

    else if (text === "備援今日足球") {
      reply = await vipOnly(vip, () => tdb.todaySoccer());
    }

    else if (text === "熱門足球") {
      reply = await vipOnly(vip, () => tdb.todaySoccer());
    }

    else if (text === "全部備援足球") {
      reply = await vipOnly(vip, () => tdb.todaySoccerAll());
    }

    else if (text === "英超賽程") {
      reply = await vipOnly(vip, () => footballData.competitionMatches("PL"));
    }

    else if (text === "西甲賽程") {
      reply = await vipOnly(vip, () => footballData.competitionMatches("PD"));
    }

    else if (text === "義甲賽程") {
      reply = await vipOnly(vip, () => footballData.competitionMatches("SA"));
    }

    else if (text === "德甲賽程") {
      reply = await vipOnly(vip, () => footballData.competitionMatches("BL1"));
    }

    else if (text === "法甲賽程") {
      reply = await vipOnly(vip, () => footballData.competitionMatches("FL1"));
    }

    else if (text === "歐冠賽程") {
      reply = await vipOnly(vip, () => footballData.competitionMatches("CL"));
    }

    else if (text === "英超積分榜") {
      reply = await vipOnly(vip, () => footballData.standings("PL"));
    }

    else if (text === "西甲積分榜") {
      reply = await vipOnly(vip, () => footballData.standings("PD"));
    }

    else if (text === "義甲積分榜") {
      reply = await vipOnly(vip, () => footballData.standings("SA"));
    }

    else if (text === "德甲積分榜") {
      reply = await vipOnly(vip, () => footballData.standings("BL1"));
    }

    else if (text === "法甲積分榜") {
      reply = await vipOnly(vip, () => footballData.standings("FL1"));
    }

    else if (text === "歐冠積分榜") {
      reply = await vipOnly(vip, () => footballData.standings("CL"));
    }

    else if (text.startsWith("進階分析")) {
      reply = vip ? ai.advancedAnalysis(text.replace("進階分析", "").trim()) : needVip();
    }

    else if (text.startsWith("最近5場")) {
      reply = vip ? ai.lastFive(text.replace("最近5場", "").trim()) : needVip();
    }

    else if (text.startsWith("對戰紀錄")) {
      reply = vip ? ai.h2hAnalysis(text.replace("對戰紀錄", "").trim()) : needVip();
    }

    else if (text.startsWith("主客場")) {
      reply = vip ? ai.homeAwayAnalysis(text.replace("主客場", "").trim()) : needVip();
    }

    else if (text === "今日主推") {
      reply = vip ? ai.todayMainPick() : needVip();
    }

    else if (text === "足球串關") {
      reply = vip ? ai.footballParlay() : needVip();
    }

    else if (text === "爆冷預警") {
      reply = vip ? ai.upsetAlert() : needVip();
    }

    else if (isAdmin && text.startsWith("開通VIP")) {
      const parts = text.split(/\s+/);
      const target = parts[1];
      const days = Number(parts[2] || 30);

      if (!target) {
        reply = "格式：開通VIP LINE_USER_ID 天數";
      } else {
        reply = `已開通 VIP ✅\nUser ID：${target}\n到期日：${await addVip(target, days)}`;
      }
    }

    else if (isAdmin && text.startsWith("取消VIP")) {
      const target = text.split(/\s+/)[1];

      if (!target) {
        reply = "格式：取消VIP LINE_USER_ID";
      } else {
        await removeVip(target);
        reply = `已取消 VIP：${target}`;
      }
    }

    else if (isAdmin && text === "VIP名單") {
      const rows = await listVip();

      reply = rows.length
        ? "【VIP 名單】\n" + rows.map(r => `${r.status === "active" ? "✅" : "❌"} ${r.user_id}\n到期：${r.expire_date}`).join("\n\n")
        : "目前沒有 VIP 資料。";
    }

    else if (isAdmin && text === "VIP統計") {
      const c = await countVip();
      reply = `【VIP 統計】\n總筆數：${c.total}\n有效VIP：${c.active}\n過期/停用：${c.expired}`;
    }

    else {
      reply = `收到：「${text}」

免費：
足球分析 皇馬 vs 巴薩
加入VIP
我的ID

VIP：
即時比分
專業即時比分
今日足球
熱門足球
進階分析 曼城 vs 利物浦
今日主推`;
    }
  } catch (err) {
    console.error("Command error:", err);
    reply = `系統錯誤：${err.message}\n請檢查 Render Logs。`;
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: reply
  });
}

app.listen(process.env.PORT || 3000, () => console.log("✅ LINE Football AI V11 Pro Live running"));
