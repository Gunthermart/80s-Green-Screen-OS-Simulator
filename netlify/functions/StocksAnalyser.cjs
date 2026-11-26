/**
 * Netlify Serverless Function : StocksAnalyser.cjs
 * Collecte déterministe parallèle sur les 29 sources financières certifiées + cotations Yahoo Finance
 * et synthèse JSON via l'API gemini-4-hydrogen sous contrainte stricte de temps Netlify (< 7,2s).
 */

const CERTIFIED_SOURCES = [
  { id: "euronext", name: "Euronext Live", buildUrl: (q) => `https://live.euronext.com/fr/search_instruments/${encodeURIComponent(q)}` },
  { id: "amf_bdif", name: "AMF BDIF", buildUrl: (q) => `https://bdif.amf-france.org/fr?recherche=${encodeURIComponent(q)}` },
  { id: "boursorama", name: "Boursorama", buildUrl: (q) => `https://www.boursorama.com/recherche/${encodeURIComponent(q)}` },
  { id: "zonebourse", name: "Zonebourse", buildUrl: (q) => `https://www.zonebourse.com/recherche/?q=${encodeURIComponent(q)}` },
  { id: "investing", name: "Investing.com FR", buildUrl: (q) => `https://fr.investing.com/search/?q=${encodeURIComponent(q)}` },
  { id: "abcbourse", name: "ABC Bourse", buildUrl: (q) => `https://www.abcbourse.com/cotations/recherche?q=${encodeURIComponent(q)}` },
  { id: "tradingsat", name: "BFM Bourse / TradingSat", buildUrl: (q) => `https://www.tradingsat.com/recherche.html?q=${encodeURIComponent(q)}` },
  { id: "lesechos", name: "Les Echos Investir", buildUrl: (q) => `https://investir.lesechos.fr/recherche?q=${encodeURIComponent(q)}` },
  { id: "capital", name: "Capital Bourse", buildUrl: (q) => `https://www.capital.fr/recherche?q=${encodeURIComponent(q)}` },
  { id: "boursier", name: "Boursier.com", buildUrl: (q) => `https://www.boursier.com/recherche/?q=${encodeURIComponent(q)}` },
  { id: "morningstar", name: "Morningstar FR", buildUrl: (q) => `https://www.morningstar.fr/fr/screener/security.aspx?q=${encodeURIComponent(q)}` },
  { id: "yahoo_fr", name: "Yahoo Finance FR", buildUrl: (q) => `https://fr.finance.yahoo.com/lookup?s=${encodeURIComponent(q)}` },
  { id: "reuters", name: "Reuters Markets", buildUrl: (q) => `https://www.reuters.com/site-search/?query=${encodeURIComponent(q)}` },
  { id: "ft", name: "Financial Times Markets", buildUrl: (q) => `https://markets.ft.com/data/search?query=${encodeURIComponent(q)}` },
  { id: "marketscreener", name: "MarketScreener", buildUrl: (q) => `https://www.marketscreener.com/search/?q=${encodeURIComponent(q)}` },
  { id: "simplywall", name: "Simply Wall St", buildUrl: (q) => `https://simplywall.st/search?q=${encodeURIComponent(q)}` },
  { id: "gurufocus", name: "GuruFocus", buildUrl: (q) => `https://www.gurufocus.com/stock_list.php?search=${encodeURIComponent(q)}` },
  { id: "stockopedia", name: "Stockopedia", buildUrl: (q) => `https://www.stockopedia.com/search/?q=${encodeURIComponent(q)}` },
  { id: "finviz", name: "Finviz", buildUrl: (q) => `https://finviz.com/search.ashx?p=${encodeURIComponent(q)}` },
  { id: "macrotrends", name: "Macrotrends", buildUrl: (q) => `https://www.macrotrends.net/stocks/research?q=${encodeURIComponent(q)}` },
  { id: "seekingalpha", name: "Seeking Alpha", buildUrl: (q) => `https://seekingalpha.com/search?q=${encodeURIComponent(q)}` },
  { id: "tradingview", name: "TradingView", buildUrl: (q) => `https://fr.tradingview.com/symbols/?search=${encodeURIComponent(q)}` },
  { id: "centralcharts", name: "CentralCharts", buildUrl: (q) => `https://www.centralcharts.com/fr/recherche?q=${encodeURIComponent(q)}` },
  { id: "hiway", name: "Hiway / Quantalys", buildUrl: (q) => `https://www.quantalys.com/Recherche?q=${encodeURIComponent(q)}` },
  { id: "infogreffe", name: "Infogreffe / Pappers", buildUrl: (q) => `https://www.pappers.fr/recherche?q=${encodeURIComponent(q)}` },
  { id: "societe", name: "Societe.com", buildUrl: (q) => `https://www.societe.com/cgi-bin/search?champs=${encodeURIComponent(q)}` },
  { id: "easybourse", name: "EasyBourse", buildUrl: (q) => `https://www.easybourse.com/recherche/?q=${encodeURIComponent(q)}` },
  { id: "fortuneo", name: "Fortuneo Bourse", buildUrl: (q) => `https://bourse.fortuneo.fr/recherche?q=${encodeURIComponent(q)}` },
  { id: "saxo", name: "Saxo Banque", buildUrl: (q) => `https://www.home.saxo/fr-fr/search?q=${encodeURIComponent(q)}` }
];

function escapeXmlAttr(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripHtmlToCompactText(html, maxLen = 280) {
  if (!html) return "";
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

/**
 * Interroge une source certifiée avec un timeout court (450 ms) pour préserver le budget temps Netlify
 */
async function fetchSingleCertifiedSource(source, query) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 450);
  try {
    const res = await fetch(source.buildUrl(query), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"
      },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const raw = await res.text();
    const snippet = stripHtmlToCompactText(raw, 240);
    if (!snippet || snippet.length < 30 || /cloudflare|attention required|enable javascript/i.test(snippet)) {
      return null;
    }
    return `<source id="${escapeXmlAttr(source.id)}" name="${escapeXmlAttr(source.name)}">${escapeXmlAttr(snippet)}</source>`;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Agrège en parallèle les extraits actifs des 29 sources certifiées au format XML compact
 */
async function buildInjectedXmlCorpus(query) {
  const settled = await Promise.allSettled(
    CERTIFIED_SOURCES.map((src) => fetchSingleCertifiedSource(src, query))
  );
  const activeNodes = settled
    .filter((r) => r.status === "fulfilled" && Boolean(r.value))
    .map((r) => r.value);

  return `<corpus subject="${escapeXmlAttr(query)}" total_sources="29" active_sources="${activeNodes.length}">\n${activeNodes.join("\n")}\n</corpus>`;
}

/**
 * Récupère en direct le snapshot de marché Yahoo Finance (cours, devise, capitalisation, PER, news)
 */
async function fetchLiveMarketSnapshot(query) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 800);
  try {
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=5`;
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal
    });
    if (!searchRes.ok) {
      clearTimeout(timer);
      return "";
    }
    const searchData = await searchRes.json();
    const quotes = searchData?.quotes || [];
    const euronextQuote =
      quotes.find((q) => /\.PA$/i.test(q.symbol || "") || q.exchange === "PAR") ||
      quotes[0];

    let detailLine = "";
    if (euronextQuote?.symbol) {
      const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(euronextQuote.symbol)}?range=5d&interval=1d`;
      const chartRes = await fetch(chartUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: controller.signal
      });
      if (chartRes.ok) {
        const chartData = await chartRes.json();
        const meta = chartData?.chart?.result?.[0]?.meta;
        if (meta) {
          detailLine = `Symbole: ${meta.symbol} | Devise: ${meta.currency || "EUR"} | Cours Live: ${meta.regularMarketPrice ?? "--"} | Clôture Préc.: ${meta.chartPreviousClose ?? "--"} | Plus Haut 52s: ${meta.fiftyTwoWeekHigh ?? "--"} | Plus Bas 52s: ${meta.fiftyTwoWeekLow ?? "--"}`;
        }
      }
    }
    clearTimeout(timer);

    const newsLines = (searchData?.news || [])
      .slice(0, 5)
      .map((n) => `- [${n.publisher || "Source"}] ${n.title || ""}`);

    return [detailLine, ...newsLines].filter(Boolean).join("\n");
  } catch {
    clearTimeout(timer);
    return "";
  }
}

/**
 * Collecte rapide d'actualités ciblées pour les modes Gérants, Radar Rumeurs et Comparateur VS
 */
async function fetchTargetedWebDigest(searchTopic) {
  const query = String(searchTopic || "Euronext Paris OPA AMF Small Mid Caps").trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 850);
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=4&newsCount=8`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return "";
    const data = await res.json();
    const newsLines = (data?.news || []).slice(0, 8).map((n) => `- [${n.publisher || "Source"}] ${n.title || ""}`);
    const quoteLines = (data?.quotes || []).slice(0, 4).map((q) => `- Titre: ${q.longname || q.shortname || q.symbol} (${q.symbol})`);
    return [...quoteLines, ...newsLines].join("\n");
  } catch {
    clearTimeout(timer);
    return "";
  }
}

/**
 * Extraction et nettoyage déterministe du JSON renvoyé par gemini-4-hydrogen
 */
function parseAndCleanModelJson(rawText) {
  if (!rawText) return null;
  const cleaned = String(rawText)
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Appel principal vers l'API gemini-4-hydrogen avec gestion stricte de la deadline Netlify
 */
async function callGeminiWithFallback(apiKey, primaryModel, payload, deadlineMs = Date.now() + 7000) {
  const targetModel = primaryModel || "gemini-4-hydrogen";
  const useSearchTool = Boolean(payload?.tools?.length);
  const remainingForModel = deadlineMs - Date.now();
  if (remainingForModel < 1500) {
    return { ok: false, status: 504, error: "Budget temps Netlify atteint avant la synthèse." };
  }

  const baseGenConfig = {
    temperature: 0,
    maxOutputTokens: 1250,
    thinkingConfig: { thinkingBudget: 0 },
    ...(payload?.generationConfig || {})
  };

  if (useSearchTool) delete baseGenConfig.responseMimeType;
  else baseGenConfig.responseMimeType = "application/json";

  const effectivePayload = {
    ...payload,
    tools: useSearchTool ? payload.tools : undefined,
    generationConfig: baseGenConfig
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const controller = new AbortController();
  const timeoutMs = Math.max(2500, remainingForModel - 250);
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(effectivePayload),
      signal: controller.signal
    });
    clearTimeout(timer);
    const data = await res.json();
    if (res.ok) {
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const mergedText = parts.map((p) => p?.text || "").filter(Boolean).join("\n");
      const parsedJson = parseAndCleanModelJson(mergedText);
      if (parsedJson && data?.candidates?.[0]?.content) {
        data.candidates[0].content.parts = [{ text: JSON.stringify(parsedJson) }];
        data.parsedJson = parsedJson;
        return { ok: true, status: 200, data };
      }
      return { ok: false, status: 502, error: `Réponse JSON non exploitable sur ${targetModel}` };
    }
    const rawMsg = data?.error?.message || `Erreur API (${targetModel})`;
    if (/prepayment credits|billing|quota|resource_exhausted/i.test(rawMsg) || res.status === 402 || res.status === 429) {
      return {
        ok: false,
        status: res.status,
        error: "Crédits prépayés Google AI Studio épuisés ou quota dépassé."
      };
    }
    return { ok: false, status: res.status, error: rawMsg };
  } catch (err) {
    clearTimeout(timer);
    return {
      ok: false,
      status: 504,
      error: err.name === "AbortError" ? `Délai dépassé sur ${targetModel} (${timeoutMs} ms)` : err.message
    };
  }
}

/**
 * Handler Netlify Serverless (POST /.netlify/functions/StocksAnalyser)
 */
exports.handler = async function (event) {
  const netlifyDeadlineMs = Date.now() + 7200;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Méthode non autorisée." }) };

  const apiKey = process.env.StocksAnalyserKey;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Clé API StocksAnalyserKey manquante dans Netlify." }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const modelId = body.model || process.env.GEMINI_MODEL || "gemini-4-hydrogen";
    const mode = body.mode || "legacy";
    const subjectQuery = String(body.subjectQuery || "").trim();

    // Mode 1 : Audit fondamental & technique d'un titre Euronext (29 sources + Yahoo Live)
    if ((mode === "stock_analysis" || mode === "stock_analysis_part1" || mode === "stock_analysis_part2") && subjectQuery) {
      const [xmlCorpus, liveSnapshot] = await Promise.all([
        body.skipCorpusFetch
          ? Promise.resolve(`<corpus subject="${escapeXmlAttr(subjectQuery)}" total_sources="29">Synthèse complémentaire.</corpus>`)
          : buildInjectedXmlCorpus(subjectQuery),
        fetchLiveMarketSnapshot(subjectQuery)
      ]);

      const extractionPrompt = `${body.userPrompt || `Analyse complète de ${subjectQuery}`}\n\nDONNÉES TEMPS RÉEL :\n${liveSnapshot || subjectQuery}\n\n${xmlCorpus}`;

      const geminiResult = await callGeminiWithFallback(
        apiKey,
        modelId,
        {
          systemInstruction: body.systemInstruction || undefined,
          contents: [{ parts: [{ text: extractionPrompt }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json" }
        },
        netlifyDeadlineMs
      );

      if (!geminiResult.ok) return { statusCode: geminiResult.status, headers, body: JSON.stringify({ error: geminiResult.error }) };
      return { statusCode: 200, headers, body: JSON.stringify(geminiResult.data) };
    }

    // Mode 2 : Appels ciblés (Scan Gérants, Radar Rumeurs, Comparateur VS, Deep Dive)
    let enrichedContents = body.contents || [];
    if (Array.isArray(enrichedContents) && enrichedContents[0]?.parts?.[0]?.text) {
      const liveDigest = await fetchTargetedWebDigest(subjectQuery || "Euronext Paris Small Mid Caps AMF");
      if (liveDigest) {
        enrichedContents = [
          {
            ...enrichedContents[0],
            parts: [
              {
                text: `${enrichedContents[0].parts[0].text}\n\nCONTEXTE & FLUX FINANCIERS EN DIRECT :\n${liveDigest}`
              }
            ]
          }
        ];
      }
    }

    const geminiResult = await callGeminiWithFallback(
      apiKey,
      modelId,
      {
        systemInstruction: body.systemInstruction || undefined,
        contents: enrichedContents,
        tools: body.useGoogleGrounding ? body.tools : undefined,
        generationConfig: { temperature: 0, maxOutputTokens: 1150, ...(body.generationConfig || {}) }
      },
      netlifyDeadlineMs
    );

    if (!geminiResult.ok) return { statusCode: geminiResult.status, headers, body: JSON.stringify({ error: geminiResult.error }) };
    return { statusCode: 200, headers, body: JSON.stringify(geminiResult.data) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || "Erreur interne StocksAnalyser." }) };
  }
};
