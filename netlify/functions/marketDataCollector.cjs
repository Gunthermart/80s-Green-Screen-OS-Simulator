/**
 * 6. Synthèse Stratégique IA (gemini-4-hydrogen) basée sur les flux macro collectés
 */
async function generateMacroAiSynthesis(snapshot) {
  const apiKey = process.env.StocksAnalyserKey;
  if (!apiKey) return null;

  const modelId = process.env.GEMINI_MODEL || "gemini-4-hydrogen";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3200);

  const summaryInput = JSON.stringify({
    fearAndGreed: snapshot.cnnFearAndGreed?.value ?? null,
    sentiment: snapshot.cnnFearAndGreed?.sentiment ?? null,
    vix: snapshot.cboeIndices?.vix ?? null,
    us10y: snapshot.cmeFedWatch?.us10yYield ?? null,
    bceDepositRate: snapshot.bceRates?.depositRate ?? null,
    oatBundSpreadBps: snapshot.bceRates?.oatBundSpreadBps ?? null,
    cacPerf: snapshot.macroSurprises?.cacPerfLabel ?? null,
    eurUsd: snapshot.creditAndLiquidity?.eurUsdLabel ?? null
  });

  const prompt = `En tant que stratégiste macro Euronext Paris, analyse ces indicateurs temps réel : ${summaryInput}. Réponds en JSON strict : { "regimeHeadline": "Titre court du régime (max 6 mots)", "allocationDirective": "Directive d'allocation et gestion du risque sur Euronext en 2 phrases concises et actionnables." }`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 350,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim());
    return {
      model: modelId,
      regimeHeadline: parsed.regimeHeadline || null,
      allocationDirective: parsed.allocationDirective || null
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Agrégateur principal exécuté en parallèle
 */
async function getMarketRiskBarometerData() {
  const [cnnRes, cboeRes, fedRes, bceRes, eqRes] = await Promise.allSettled([
    fetchCnnFearAndGreed(),
    fetchCboeIndices(),
    fetchCmeFedWatch(),
    fetchEcbRates(),
    fetchEquitiesAndCreditLive()
  ]);

  const eqData = eqRes.status === "fulfilled" ? eqRes.value : {};

  const basePayload = {
    timestamp: new Date().toISOString(),
    cnnFearAndGreed: cnnRes.status === "fulfilled" ? cnnRes.value : null,
    cboeIndices: cboeRes.status === "fulfilled" ? cboeRes.value : null,
    cmeFedWatch: fedRes.status === "fulfilled" ? fedRes.value : null,
    bceRates: bceRes.status === "fulfilled" ? bceRes.value : null,
    creditAndLiquidity: eqData.creditAndLiquidity || null,
    macroSurprises: eqData.macroSurprises || null,
    sectorRotation: eqData.sectorRotation || null
  };

  const aiSynthesis = await generateMacroAiSynthesis(basePayload);
  return {
    ...basePayload,
    aiSynthesis
  };
}

/**
 * 5. Flux Live Actions, Crédit High Yield & Change (CAC 40, Euro Stoxx 50, S&P 500, HYG, EUR/USD)
 */
async function fetchEquitiesAndCreditLive() {
  const [cacRes, stoxxRes, sp500Res, hygRes, eurusdRes] = await Promise.allSettled([
    fetchYahooQuoteMeta("^FCHI"),
    fetchYahooQuoteMeta("^STOXX50E"),
    fetchYahooQuoteMeta("^GSPC"),
    fetchYahooQuoteMeta("HYG"),
    fetchYahooQuoteMeta("EURUSD=X")
  ]);

  const cac = cacRes.status === "fulfilled" ? cacRes.value : null;
  const stoxx = stoxxRes.status === "fulfilled" ? stoxxRes.value : null;
  const sp500 = sp500Res.status === "fulfilled" ? sp500Res.value : null;
  const hyg = hygRes.status === "fulfilled" ? hygRes.value : null;
  const eurusd = eurusdRes.status === "fulfilled" ? eurusdRes.value : null;

  const fmtPct = (v) => (v !== null && v !== undefined ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}%` : "--");

  return {
    creditAndLiquidity: {
      fciLabel: hyg?.changePct !== null && hyg?.changePct !== undefined ? (hyg.changePct >= 0 ? "Souple (HY +)" : "Tendu (HY -)") : "--",
      creditSpreadLabel: hyg ? `HYG ${hyg.price}$ (${fmtPct(hyg.changePct)})` : "--",
      eurUsdLabel: eurusd ? `${eurusd.price.toFixed(4)} $` : "--",
      statusBadge: hyg?.changePct !== null && hyg?.changePct >= -0.3 ? "Crédit Stable" : "Vigilance HY",
      diagnostic: hyg && eurusd
        ? `ETF High Yield (HYG) à ${hyg.price}$ (${fmtPct(hyg.changePct)}) et parité EUR/USD live à ${eurusd.price.toFixed(4)}.`
        : "Flux crédit et change partiellement indisponibles."
    },
    macroSurprises: {
      cacPerfLabel: cac ? fmtPct(cac.changePct) : "--",
      stoxxPerfLabel: stoxx ? fmtPct(stoxx.changePct) : "--",
      sp500PerfLabel: sp500 ? fmtPct(sp500.changePct) : "--",
      statusBadge: cac && cac.changePct >= 0 ? "Momentum Positif" : "Consolidation",
      diagnostic: cac && stoxx && sp500
        ? `Variation séance live : CAC 40 (${fmtPct(cac.changePct)}), Euro Stoxx 50 (${fmtPct(stoxx.changePct)}), S&P 500 (${fmtPct(sp500.changePct)}).`
        : "Flux indices actions en cours de synchronisation."
    },
    sectorRotation: {
      ratioCacStoxx: cac && stoxx && stoxx.price > 0 ? `${roundTo(cac.price / stoxx.price, 2)}x` : "--",
      cacLevelLabel: cac ? `${cac.price.toLocaleString("fr-FR")} pts` : "--",
      betaMultiplier: cac && sp500 && cac.changePct !== null && sp500.changePct !== null
        ? (cac.changePct >= sp500.changePct ? "Surperf. EU" : "Surperf. US")
        : "--",
      regimeBadge: cac && cac.changePct >= 0 ? "Flux Acheteurs EU" : "Sélectivité Défensive",
      diagnostic: cac
        ? `CAC 40 coté en direct à ${cac.price.toLocaleString("fr-FR")} pts (${fmtPct(cac.changePct)}). Privilégier les bilans peu endettés et la génération de FCF.`
        : "Cotations Euronext indisponibles."
    }
  };
}

/**
 * Agrégateur principal exécuté en parallèle
 */
async function getMarketRiskBarometerData() {
  const [cnnRes, cboeRes, fedRes, bceRes, eqRes] = await Promise.allSettled([
    fetchCnnFearAndGreed(),
    fetchCboeIndices(),
    fetchCmeFedWatch(),
    fetchEcbRates(),
    fetchEquitiesAndCreditLive()
  ]);

  const eqData = eqRes.status === "fulfilled" ? eqRes.value : {};

  return {
    timestamp: new Date().toISOString(),
    cnnFearAndGreed: cnnRes.status === "fulfilled" ? cnnRes.value : null,
    cboeIndices: cboeRes.status === "fulfilled" ? cboeRes.value : null,
    cmeFedWatch: fedRes.status === "fulfilled" ? fedRes.value : null,
    bceRates: bceRes.status === "fulfilled" ? bceRes.value : null,
    creditAndLiquidity: eqData.creditAndLiquidity || null,
    macroSurprises: eqData.macroSurprises || null,
    sectorRotation: eqData.sectorRotation || null
  };
}

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const payload = await getMarketRiskBarometerData();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(payload)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Erreur interne collecteur macro." })
    };
  }
};
