/**
 * Netlify Serverless Function : StocksAnalyser
 * Pipeline déterministe en 2 phases :
 * 1. Collecte parallèle directe (HTML nettoyé) sur les 29 URLs financières certifiées,
 *    complétée si nécessaire par des lots ciblés de recherche (4 à 5 sites max par lot).
 * 2. Injection des 29 contenus nettoyés balisés en XML (<source id="1" url="...">...</source>)
 *    dans la fenêtre de 1 million de tokens de gemini-4-hydrogen avec temperature: 0
 *    et responseSchema strict.
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

/**
 * Nettoyage HTML déterministe : supprime scripts, styles, balises et compresse les espaces.
 */
function stripHtmlToCleanText(html, maxChars = 1200) {
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

/**
 * Collecte parallèle directe des 29 URLs certifiées avec timeout strict (750ms)
 * pour garantir le respect absolu de la limite Netlify de 10s.
 */
async function fetchSingleCertifiedSource(source, encodedQuery) {
  const targetUrl = `${source.url}${encodedQuery}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 750);
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
    if (!res.ok) {
      return { ...source, targetUrl, ok: false, text: "" };
    }
    const rawHtml = await res.text();
    const cleanText = stripHtmlToCleanText(rawHtml, 1200);
    const blocked = /captcha|cloudflare|access denied|enable javascript|just a moment/i.test(cleanText) && cleanText.length < 1500;
    return {
      ...source,
      targetUrl,
      ok: !blocked && cleanText.length > 200,
      text: blocked ? "" : cleanText
    };
  } catch {
    clearTimeout(timer);
    return { ...source, targetUrl, ok: false, text: "" };
  }
}

/**
 * Appel Gemini résilient avec budget temps global (anti-504 Netlify),
 * thinkingBudget: 0 pour latence minimale (< 3s) et fallback automatique.
 */
async function callGeminiWithFallback(apiKey, primaryModel, payload, deadlineMs = Date.now() + 8500) {
  const modelsToTry = Array.from(new Set([primaryModel, "gemini-3-flash-preview", "gemini-2.5-flash"]));
  let lastError = null;

  for (const model of modelsToTry) {
    const remainingForModel = deadlineMs - Date.now();
    if (remainingForModel < 1800) {
      lastError = { status: 504, message: "Budget temps Netlify atteint avant la fin de la synthèse." };
      break;
    }

    const baseGenConfig = {
      temperature: 0,
      thinkingConfig: { thinkingBudget: 0 },
      ...(payload?.generationConfig || {})
    };

    // Si google_search est actif, retirer responseMimeType: "application/json" (incompatible API)
    if (payload?.tools?.length && baseGenConfig.responseMimeType === "application/json") {
      delete baseGenConfig.responseMimeType;
    }

    const effectivePayload = {
      ...payload,
      generationConfig: baseGenConfig
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const controller = new AbortController();
    const timeoutMs = Math.max(2200, Math.min(7200, deadlineMs - Date.now()));
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
        return { ok: true, status: 200, data };
      }
      const rawMsg = data?.error?.message || `Erreur API (${model})`;
      if (/prepayment credits|billing|quota|resource_exhausted/i.test(rawMsg) || res.status === 402 || res.status === 429) {
        return {
          ok: false,
          status: res.status,
          error: "Crédits prépayés Google AI Studio épuisés ou quota dépassé. Rechargez votre solde sur https://ai.studio/projects (Facturation)."
        };
      }
      lastError = { status: res.status, message: rawMsg };
    } catch (err) {
      clearTimeout(timer);
      lastError = { status: 504, message: err.name === "AbortError" ? `Délai dépassé sur ${model}` : err.message };
    }

    if (lastError && lastError.status !== 404 && lastError.status !== 400 && lastError.status !== 503 && lastError.status !== 504) {
      break;
    }
  }

  return {
    ok: false,
    status: lastError?.status || 502,
    error: lastError?.message || "Échec de communication avec l'API Gemini."
  };
}

/**
 * Construction rapide (< 1.2s) du corpus XML balisé des 29 sources certifiées.
 */
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
    const content = src.ok
      ? src.text
      : "Portail protégé ou rendu dynamique : compléter via vérification temps réel sur ce domaine certifié.";
    return `<source id="${src.id}" name="${escapeXmlAttr(src.name)}" url="${escapeXmlAttr(src.targetUrl)}">\n${content}\n</source>`;
  });

  return `<corpus subject="${escapeXmlAttr(subjectQuery)}" total_sources="29">\n${xmlBlocks.join("\n")}\n</corpus>`;
}

exports.handler = async function (event) {
  const functionStartMs = Date.now();
  const netlifyDeadlineMs = functionStartMs + 8900;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Méthode non autorisée. Utilisez POST." })
    };
  }

  const apiKey = process.env.StocksAnalyserKey;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Clé API StocksAnalyserKey manquante dans les variables d'environnement Netlify." })
    };
  const modelId = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

  try {
    const body = JSON.parse(event.body || "{}");
    const mode = body.mode || "legacy";
    const subjectQuery = String(body.subjectQuery || "").trim();

    // Mode 1 : Audit complet ou partiel (29 sources XML)
    if ((mode === "stock_analysis" || mode === "stock_analysis_part1" || mode === "stock_analysis_part2") && subjectQuery) {
      const xmlCorpus = await buildInjectedXmlCorpus(subjectQuery);
      const useLiveSearch = mode !== "stock_analysis_part2";

      const extractionPrompt = `${body.userPrompt || `Analyse complète de ${subjectQuery}`}

RÈGLE DE FORMAT : Réponds UNIQUEMENT avec l'objet JSON brut valide (sans balises markdown \`\`\`json ni texte autour). Sois concis, dense et chirurgical sur chaque champ texte (1 à 2 phrases max par champ).

Voici les contenus extraits des 29 sources financières certifiées. Croise ces données avec les chiffres boursiers et financiers à jour pour produire le JSON exact :

${xmlCorpus}`;

      const geminiResult = await callGeminiWithFallback(
        apiKey,
        modelId,
        {
          systemInstruction: body.systemInstruction || undefined,
          contents: [{ parts: [{ text: extractionPrompt }] }],
          tools: useLiveSearch ? [{ google_search: {} }] : undefined,
          generationConfig: {
            temperature: 0,
            ...(useLiveSearch ? {} : { responseMimeType: "application/json" })
          }
        },
        netlifyDeadlineMs
      );

      if (!geminiResult.ok) {
        return {
          statusCode: geminiResult.status,
          headers,
          body: JSON.stringify({ error: geminiResult.error })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(geminiResult.data)
      };
    }

    // Mode 2 : Appels ciblés (Comparateur VS, Deep Dive, Radar Rumeurs, Stress-Test, Mise à jour fonds)
    const geminiResult = await callGeminiWithFallback(
      apiKey,
      modelId,
      {
        systemInstruction: body.systemInstruction || undefined,
        contents: body.contents || [],
        tools: body.tools || undefined,
        generationConfig: {
          temperature: 0,
          ...(body.generationConfig || {})
        }
      },
      netlifyDeadlineMs
    );

    if (!geminiResult.ok) {
      return {
        statusCode: geminiResult.status,
        headers,
        body: JSON.stringify({ error: geminiResult.error })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(geminiResult.data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Erreur interne StocksAnalyser." })
    };
  }
};
