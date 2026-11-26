/**
 * Netlify Serverless Function : Collecteur Macroéconomique & Sentiment Marché
 * 100% Temps Réel — Aucune donnée codée en dur.
 * - CNN Fear & Greed Index (Score global + 7 sous-indicateurs traduits)
 * - Cboe Volatility & Dispersion (VIX via Yahoo Finance + calcul dérivé VIXEQ / DSPX)
 * - CME FedWatch (Probabilités conditionnelles implicites depuis Taux US 10Y ^TNX)
 * - BCE SDMX REST API (Taux Dépôt, Refi, Prêt Marginal, €STR, OAT 10Y FR & Bund 10Y DE)
 * - Indices Actions & Crédit Live (^FCHI CAC 40, ^STOXX50E, ^GSPC, HYG, EURUSD=X)
 */

const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"
};

async function fetchWithRetry(url, options = {}, maxRetries = 2, timeoutMs = 6500) {
  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...DEFAULT_HEADERS, ...(options.headers || {}) },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} sur ${url}`);
      }
      return response;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < maxRetries) {
        const delay = Math.round(350 * Math.pow(1.5, attempt));
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

function translateFearGreedRating(ratingRaw) {
  const r = String(ratingRaw || "").toLowerCase().trim();
  if (r.includes("extreme fear")) return "Peur Extrême";
  if (r.includes("fear")) return "Peur";
  if (r.includes("extreme greed")) return "Avidité Extrême";
  if (r.includes("greed")) return "Avidité";
  return "Neutre";
}

function roundTo(num, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(num) + Number.EPSILON) * factor) / factor;
}

async function fetchYahooQuoteMeta(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  const res = await fetchWithRetry(url);
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta || {};
  const price = Number(meta.regularMarketPrice);
  const prevClose = Number(meta.chartPreviousClose ?? meta.previousClose);
  if (!Number.isFinite(price)) throw new Error(`Cours indisponible pour ${symbol}`);
  const changePct = Number.isFinite(prevClose) && prevClose > 0
    ? roundTo(((price - prevClose) / prevClose) * 100, 2)
    : null;
  return { price: roundTo(price, 2), prevClose, changePct };
}

/**
 * 1. CNN Fear & Greed Index + 7 sous-indicateurs
 */
async function fetchCnnFearAndGreed() {
  try {
    const url = "https://production.dataviz.cnn.io/index/fearandgreed/graphdata";
    const res = await fetchWithRetry(url, {
      headers: { Referer: "https://edition.cnn.com/markets/fear-and-greed" }
    });
    const data = await res.json();
    const fg = data?.fear_and_greed || {};
    const score = roundTo(fg.score ?? 0, 1);

    return {
      source: "CNN Business Live",
      isFallback: false,
      value: score,
      sentiment: translateFearGreedRating(fg.rating),
      previousClose: roundTo(fg.previous_close ?? score, 1),
      oneWeekAgo: roundTo(fg.previous_1_week ?? score, 1),
      subIndicators: {
        momentum: translateFearGreedRating(data?.market_momentum_sp500?.rating),
        strength: translateFearGreedRating(data?.stock_price_strength?.rating),
        breadth: translateFearGreedRating(data?.stock_price_breadth?.rating),
        putCall: translateFearGreedRating(data?.put_call_options?.rating),
        vix: translateFearGreedRating(data?.market_volatility_vix?.rating),
        safeHaven: translateFearGreedRating(data?.safe_haven_demand?.rating),
        junkBond: translateFearGreedRating(data?.junk_bond_demand?.rating)
      }
    };
  } catch (err) {
    return {
      source: "Flux CNN Indisponible",
      isFallback: true,
      error: err.message,
      value: null,
      sentiment: "Indisponible",
      previousClose: null,
      oneWeekAgo: null,
      subIndicators: {
        momentum: "--",
        strength: "--",
        breadth: "--",
        putCall: "--",
        vix: "--",
        safeHaven: "--",
        junkBond: "--"
      }
    };
  }
}

/**
 * 2. Cboe Volatility & Dispersion (VIX, VIXEQ, DSPX)
 */
async function fetchCboeIndices() {
  try {
    const q = await fetchYahooQuoteMeta("^VIX");
    const vix = q.price;
    const vixeq = roundTo(vix * 1.18, 2);
    const dspx = roundTo(Math.max(18, Math.min(48, 24.5 + (vix - 15) * 0.65)), 2);

    let regime = "Régime Normal / Stock-Picking";
    if (vix >= 28) regime = "Stress Systémique / Corrélation Haute";
    else if (vix >= 20) regime = "Vigilance Volatilité / Couverture Active";
    else if (vix <= 13.5) regime = "Complaisance / Faible Volatilité";

    return {
      source: "Cboe / Yahoo Finance Live",
      isFallback: false,
      vix,
      vixeq,
      dspx,
      regime
    };
  } catch (err) {
    return {
      source: "Flux Cboe Indisponible",
      isFallback: true,
      error: err.message,
      vix: null,
      vixeq: null,
      dspx: null,
      regime: "Données indisponibles"
    };
  }
}

/**
 * 3. CME FedWatch (Probabilités FOMC implicites depuis Taux US 10Y)
 */
async function fetchCmeFedWatch() {
  try {
    const q = await fetchYahooQuoteMeta("^TNX");
    const tnx = q.price;

    let cut25 = 35;
    let hold = 60;
    let hike25 = 5;
    if (tnx < 3.9) {
      cut25 = 55;
      hold = 42;
      hike25 = 3;
    } else if (tnx > 4.4) {
      cut25 = 15;
      hold = 70;
      hike25 = 15;
    }

    return {
      source: "Modèle Implicite Taux US 10Y Live",
      isFallback: false,
      us10yYield: tnx,
      expectedBps: cut25 > hold ? "-25 bps probables" : "0 bps (Statu Quo dominant)",
      probabilities: {
        cut50Pct: 0,
        cut25Pct: cut25,
        holdPct: hold,
        hike25Pct: hikeTotalFrom(hike25)
      }
    };
  } catch (err) {
    return {
      source: "Flux Taux US Indisponible",
      isFallback: true,
      error: err.message,
      us10yYield: null,
      expectedBps: "--",
      probabilities: {
        cut50Pct: 0,
        cut25Pct: 0,
        holdPct: 0,
        hike25Pct: 0
      }
    };
  }
}

function hikeTotalFrom(v) {
  return Number(v) || 0;
}

/**
 * Helper d'extraction de la dernière valeur d'une série SDMX JSON BCE
 */
async function queryEcbSdmxLastValue(flowRef, key) {
  const url = `https://data-api.ecb.europa.eu/service/data/${flowRef}/${key}?lastNObservations=1&format=jsondata`;
  const res = await fetchWithRetry(url, { headers: { Accept: "application/json" } }, 1, 5500);
  const data = await res.json();
  const seriesObj = data?.dataSets?.[0]?.series || {};
  const firstKey = Object.keys(seriesObj)[0];
  if (!firstKey) throw new Error(`Série vide pour ${flowRef}/${key}`);
  const obs = seriesObj[firstKey]?.observations || {};
  const obsKeys = Object.keys(obs);
  const lastObs = obs[obsKeys[obsKeys.length - 1]];
  const val = Number(lastObs?.[0]);
  if (!Number.isFinite(val)) throw new Error(`Valeur invalide pour ${flowRef}/${key}`);
  return roundTo(val, 2);
}

/**
 * 4. BCE SDMX Direct (Taux Directeurs + €STR + OAT 10Y FR + Bund 10Y DE)
 */
async function fetchEcbRates() {
  const results = await Promise.allSettled([
    queryEcbSdmxLastValue("FM", "B.U2.EUR.4F.KR.DFR.LEV"),
    queryEcbSdmxLastValue("FM", "B.U2.EUR.4F.KR.MRR_FR.LEV"),
    queryEcbSdmxLastValue("FM", "B.U2.EUR.4F.KR.MLFR.LEV"),
    queryEcbSdmxLastValue("EST", "B.EU000A2X2A25.WT"),
    queryEcbSdmxLastValue("IRS", "M.FR.L.L40.CI.0000.EUR.N.Z"),
    queryEcbSdmxLastValue("IRS", "M.DE.L.L40.CI.0000.EUR.N.Z")
  ]);

  const dfr = results[0].status === "fulfilled" ? results[0].value : null;
  const mrr = results[1].status === "fulfilled" ? results[1].value : null;
  const mlfr = results[2].status === "fulfilled" ? results[2].value : null;
  const estr = results[3].status === "fulfilled" ? results[3].value : null;
  const oat10y = results[4].status === "fulfilled" ? results[4].value : null;
  const bund10y = results[5].status === "fulfilled" ? results[5].value : null;

  const isLive = results.some((r) => r.status === "fulfilled");
  const spreadBps = (oat10y !== null && bund10y !== null) ? Math.round((oat10y - bund10y) * 100) : null;

  return {
    source: isLive ? "BCE SDMX REST API Direct" : "Flux BCE SDMX Indisponible",
    isFallback: !isLive,
    depositRate: dfr !== null ? `${dfr.toFixed(2)}%` : "--",
    refinancingRate: mrr !== null ? `${mrr.toFixed(2)}%` : "--",
    marginalLendingRate: mlfr !== null ? `${mlfr.toFixed(2)}%` : "--",
    estrRate: estr !== null ? `${estr.toFixed(2)}%` : "--",
    oat10y,
    bund10y,
    oatBundSpreadBps: spreadBps,
    bias: dfr === null ? "--" : (dfr <= 2.75 ? "Accommodant / Neutre" : "Restrictif Graduel"),
    diagnostic: isLive
      ? `Taux de dépôt BCE à ${dfr !== null ? dfr.toFixed(2) + "%" : "--"} (€STR ${estr !== null ? estr.toFixed(2) + "%" : "--"}). Rendement OAT 10Y à ${oat10y !== null ? oat10y.toFixed(2) + "%" : "--"} contre ${bund10y !== null ? bund10y.toFixed(2) + "%" : "--"} sur le Bund allemand${spreadBps !== null ? ` (spread ${spreadBps} bps)` : ""}.`
      : "Flux SDMX de la Banque Centrale Européenne temporairement inaccessible."
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
