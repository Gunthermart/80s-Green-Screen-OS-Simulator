/**
 * Netlify Serverless Function (.cjs) : StocksAnalyser
 * Optimisée sous la barre des 7.5s (anti-504 Netlify) avec flux d'actualités live en parallèle.
 */

const CERTIFIED_SOURCES = [
  { id: 1, name: "Boursorama", url: "https://www.boursorama.com/recherche/" },
  { id: 2, name: "ZoneBourse", url: "https://www.zonebourse.com/recherche/?q=" },
  { id: 3, name: "Euronext Live", url: "https://live.euronext.com/fr/search_instruments/" },
  { id: 4, name: "ABC Bourse", url: "https://www.abcbourse.com/marches/recherche?q=" },
  { id: 5, name: "Bourse Direct", url: "https://www.boursedirect.fr/fr/recherche?q=" },
  { id: 6, name: "Investing France", url: "https://fr.investing.com/search/?q=" },
  { id: 7, name: "Yahoo Finance FR", url: "https://fr.finance.yahoo.com/lookup?s=" },
  { id: 8, name: "Les Echos Investir", url: "https://investir.lesechos.fr/recherche?q=" },
  { id: 9, name: "Le Revenu", url: "https://www.lerevenu.com/?s=" },
  { id: 10, name: "Capital Bourse", url: "https://www.capital.fr/recherche?q=" },
  { id: 11, name: "Tradingsat BFM", url: "https://www.tradingsat.com/recherche/?q=" },
  { id: 12, name: "EasyBourse", url: "https://www.easybourse.com/recherche/?q=" },
  { id: 13, name: "Fortuneo Bourse", url: "https://bourse.fortuneo.fr/recherche?q=" },
  { id: 14, name: "AMF BDIF", url: "https://bdif.amf-france.org/fr?recherche=" },
  { id: 15, name: "Euronext Notices", url: "https://live.euronext.com/fr/products/equities/company-news?q=" },
  { id: 16, name: "TradingView FR", url: "https://fr.tradingview.com/symbols/" },
  { id: 17, name: "MarketScreener", url: "https://www.marketscreener.com/search/?q=" },
  { id: 18, name: "Morningstar FR", url: "https://www.morningstar.fr/fr/util/screener.aspx?q=" },
  { id: 19, name: "SimplyWallSt", url: "https://simplywall.st/search?q=" },
  { id: 20, name: "GuruFocus", url: "https://www.gurufocus.com/stock/" },
  { id: 21, name: "Finviz", url: "https://finviz.com/search.ashx?p=" },
  { id: 22, name: "SeekingAlpha", url: "https://seekingalpha.com/search?q=" },
  { id: 23, name: "Reuters Markets", url: "https://www.reuters.com/site-search/?query=" },
  { id: 24, name: "Bloomberg Europe", url: "https://www.bloomberg.com/search?query=" },
  { id: 25, name: "Financial Times", url: "https://www.ft.com/search?q=" },
  { id: 26, name: "Cercle Finance", url: "https://www.cerclefinance.com/default.asp?pub=recherche&q=" },
  { id: 27, name: "Boursier.com", url: "https://www.boursier.com/recherche?q=" },
  { id: 28, name: "Hiboo Expert", url: "https://www.hiboo.expert/recherche?q=" },
  { id: 29, name: "Societe.com", url: "https://www.societe.com/cgi-bin/search?champs=" }
];

function stripHtmlToCleanText(html, maxChars = 700) {
  if (!html) return "";
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, maxChars);
}

function escapeXmlAttr(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function fetchSingleCertifiedSource(source, encodedQuery) {
  const targetUrl = `${source.url}${encodedQuery}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 400);
  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8"
      },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) return { ...source, targetUrl, ok: false, text: "" };
    const rawHtml = await res.text();
    const cleanText = stripHtmlToCleanText(rawHtml, 700);
    const blocked = /captcha|cloudflare|access denied|enable javascript|just a moment/i.test(cleanText) && cleanText.length < 1500;
    return {
      ...source,
      targetUrl,
      ok: !blocked && cleanText.length > 180,
      text: blocked ? "" : cleanText
    };
  } catch {
    clearTimeout(timer);
    return { ...source, targetUrl, ok: false, text: "" };
  }
}

function parseAndCleanModelJson(rawText) {
  if (!rawText) return null;
  const cleaned = String(rawText)
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  let parsed = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        parsed = JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  if (Array.isArray(parsed)) parsed = parsed[0] || null;
  const keys = parsed ? Object.keys(parsed) : [];
  if (keys.length === 1 && parsed[keys[0]] && typeof parsed[keys[0]] === "object" && !Array.isArray(parsed[keys[0]])) {
    return parsed[keys[0]];
  }
  return parsed;
}

async function callGeminiWithFallback(apiKey, primaryModel, payload, deadlineMs = Date.now() + 7400) {
  const baseCandidates = Array.from(new Set([primaryModel, "gemini-2.5-flash"]));
  const attempts = payload?.tools?.length
    ? [
        { model: primaryModel, useTools: true },
        { model: "gemini-2.5-flash", useTools: false }
      ]
    : baseCandidates.map((m) => ({ model: m, useTools: false }));

  let lastError = null;

  for (const attempt of attempts) {
    const remainingForModel = deadlineMs - Date.now();
    if (remainingForModel < 1500) {
      lastError = { status: 504, message: "Budget temps Netlify atteint avant la fin de la synthèse." };
      break;
    }

    const baseGenConfig = {
      temperature: 0,
      maxOutputTokens: 2200,
      thinkingConfig: { thinkingBudget: 0 },
      ...(payload?.generationConfig || {})
    };

    if (attempt.useTools) delete baseGenConfig.responseMimeType;
    else baseGenConfig.responseMimeType = "application/json";

    const effectivePayload = {
      ...payload,
      tools: attempt.useTools ? payload.tools : undefined,
      generationConfig: baseGenConfig
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(attempt.model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const controller = new AbortController();
    const timeoutMs = attempt.useTools
      ? Math.max(1800, Math.min(2400, remainingForModel - 2600))
      : Math.max(1800, Math.min(5200, remainingForModel));
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
        lastError = { status: 502, message: `JSON non exploitable sur ${attempt.model}` };
        continue;
      }
      const rawMsg = data?.error?.message || `Erreur API (${attempt.model})`;
      if (/prepayment credits|billing|quota|resource_exhausted/i.test(rawMsg) || res.status === 402 || res.status === 429) {
        return {
          ok: false,
          status: res.status,
          error: "Crédits prépayés Google AI Studio épuisés ou quota dépassé."
        };
      }
      lastError = { status: res.status, message: rawMsg };
    } catch (err) {
      clearTimeout(timer);
      lastError = { status: 504, message: err.name === "AbortError" ? `Délai dépassé sur ${attempt.model}` : err.message };
    }
  }

  return {
    ok: false,
    status: lastError?.status || 502,
    error: lastError?.message || "Échec de communication avec l'API Gemini."
  };
}

async function buildInjectedXmlCorpus(subjectQuery) {
  const encodedQuery = encodeURIComponent(subjectQuery);
  const directSettlements = await Promise.allSettled(
    CERTIFIED_SOURCES.map((src) => fetchSingleCertifiedSource(src, encodedQuery))
  );
  const collected = directSettlements.map((s, idx) =>
    s.status === "fulfilled"
      ? s.value
      : { ...CERTIFIED_SOURCES[idx], targetUrl: `${CERTIFIED_SOURCES[idx].url}${encodedQuery}`, ok: false, text: "" }
  );
  const xmlBlocks = collected.map((src) => {
    const content = src.ok ? src.text : "Portail protégé ou rendu dynamique.";
    return `<source id="${src.id}" name="${escapeXmlAttr(src.name)}" url="${escapeXmlAttr(src.targetUrl)}">\n${content}\n</source>`;
  });
  return `<corpus subject="${escapeXmlAttr(subjectQuery)}" total_sources="29">\n${xmlBlocks.join("\n")}\n</corpus>`;
}

async function fetchLiveMarketSnapshot(subjectQuery) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 850);
  try {
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(subjectQuery)}&quotesCount=5&newsCount=5`;
    const searchRes = await fetch(searchUrl, { headers: { "User-Agent": "Mozilla/5.0" }, signal: controller.signal });
    if (!searchRes.ok) {
      clearTimeout(timer);
      return "";
    }
    const searchJson = await searchRes.json();
    const quotes = searchJson?.quotes || [];
    const news = (searchJson?.news || [])
      .slice(0, 4)
      .map((n) => `[${n.publisher || "Actu"}] ${n.title || ""}`)
      .join(" ; ");
    const bestQuote =
      quotes.find((q) => String(q.symbol || "").endsWith(".PA") || String(q.symbol || "").endsWith(".AS") || String(q.symbol || "").endsWith(".BR")) ||
      quotes[0];
    if (!bestQuote?.symbol) {
      clearTimeout(timer);
      return news ? `Actualités récentes : ${news}` : "";
    }
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(bestQuote.symbol)}?interval=1d&range=1mo`;
    const chartRes = await fetch(chartUrl, { headers: { "User-Agent": "Mozilla/5.0" }, signal: controller.signal });
    clearTimeout(timer);
    if (!chartRes.ok) {
      return `Symbole identifié: ${bestQuote.symbol} | Nom: ${bestQuote.longname || bestQuote.shortname || subjectQuery}${news ? ` | Actus: ${news}` : ""}`;
    }
    const chartJson = await chartRes.json();
    const meta = chartJson?.chart?.result?.[0]?.meta || {};
    return [
      `Nom officiel: ${bestQuote.longname || bestQuote.shortname || subjectQuery}`,
      `Ticker Yahoo: ${bestQuote.symbol}`,
      `Place: ${meta.fullExchangeName || bestQuote.exchDisp || "Euronext"}`,
      `Devise: ${meta.currency || "EUR"}`,
      `Cours actuel: ${meta.regularMarketPrice ?? "N/A"} ${meta.currency || "EUR"}`,
      news ? `Actualités récentes: ${news}` : ""
    ].filter(Boolean).join(" | ");
  } catch {
    clearTimeout(timer);
    return "";
  }
}

async function fetchEuronextLiveNewsDigest() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 850);
  try {
    const url = "https://query1.finance.yahoo.com/v1/finance/search?q=Euronext%20Paris%20OPA%20AMF%20contrat&quotesCount=0&newsCount=8";
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return "";
    const data = await res.json();
    const items = (data?.news || []).slice(0, 8);
    if (items.length === 0) return "";
    return items.map((n) => `- [${n.publisher || "Source"}] ${n.title || ""}`).join("\n");
  } catch {
    clearTimeout(timer);
    return "";
  }
}

exports.handler = async function (event) {
  const netlifyDeadlineMs = Date.now() + 7400;
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

  const modelId = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

  try {
    const body = JSON.parse(event.body || "{}");
    const mode = body.mode || "legacy";
    const subjectQuery = String(body.subjectQuery || "").trim();

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

    // Mode 2 : Appels ciblés (Radar Rumeurs, Comparateur VS, Deep Dive, Scan Gérants)
    let enrichedContents = body.contents || [];
    if (body.tools?.length && Array.isArray(enrichedContents) && enrichedContents[0]?.parts?.[0]?.text) {
      const liveNews = await fetchEuronextLiveNewsDigest();
      if (liveNews) {
        enrichedContents = [
          {
            ...enrichedContents[0],
            parts: [
              {
                text: `${enrichedContents[0].parts[0].text}\n\nDÉPÊCHES FINANCIÈRES EURONEXT EN DIRECT :\n${liveNews}`
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
        tools: body.tools || undefined,
        generationConfig: { temperature: 0, ...(body.generationConfig || {}) }
      },
      netlifyDeadlineMs
    );

    if (!geminiResult.ok) return { statusCode: geminiResult.status, headers, body: JSON.stringify({ error: geminiResult.error }) };
    return { statusCode: 200, headers, body: JSON.stringify(geminiResult.data) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || "Erreur interne StocksAnalyser." }) };
  }
};
