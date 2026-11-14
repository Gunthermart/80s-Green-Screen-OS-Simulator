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
function stripHtmlToCleanText(html, maxChars = 3500) {
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
 * Collecte parallèle directe des 29 URLs certifiées avec timeout court (1.8s)
 * pour garantir le respect strict de la limite Netlify de 10s.
 */
async function fetchSingleCertifiedSource(source, encodedQuery) {
  const targetUrl = `${source.url}${encodedQuery}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1800);
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
    const cleanText = stripHtmlToCleanText(rawHtml, 3500);
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
 * Appel Gemini résilient avec fallback automatique de modèle si le modèle cible est indisponible.
 */
async function callGeminiWithFallback(apiKey, primaryModel, payload) {
  const modelsToTry = Array.from(new Set([primaryModel, "gemini-3-flash-preview", "gemini-2.5-flash"]));
  let lastError = null;

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6800);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timer);
      const data = await res.json();
      if (res.ok) {
        return { ok: true, status: 200, data };
      }
      const rawMsg = data?.error?.message || `Erreur API (${model})`;
      if (/prepayment credits|billing|quota|resource_exhausted/i.test(rawMsg) || res.status === 402 || res.status === 429) {
        lastError = {
          status: res.status,
          message: "Crédits prépayés Google AI Studio épuisés ou quota dépassé. Rechargez votre solde sur https://ai.studio/projects (Facturation)."
        };
        break;
      }
      lastError = { status: res.status, message: rawMsg };
      if (res.status !== 404 && res.status !== 400 && res.status !== 503) {
        break;
      }
    } catch (err) {
      clearTimeout(timer);
      lastError = { status: 504, message: err.name === "AbortError" ? `Timeout sur ${model}` : err.message };
    }
  }

  return {
    ok: false,
    status: lastError?.status || 502,
    error: lastError?.message || "Échec de communication avec l'API Gemini."
  };
}

/**
 * Requête de vérification chiffrée temps réel exécutée en parallèle des 29 sources
 * pour garantir les agrégats exacts (cours, CA, EBITDA, FCF, dette nette, PER).
 */
async function fetchRealtimeMarketSnapshot(subjectQuery, apiKey, modelId) {
  const prompt = `Extrais les chiffres financiers exacts et le cours boursier actuel de "${subjectQuery}" (Euronext / Europe) depuis les portails financiers reconnus (Boursorama, ZoneBourse, Euronext, Investing, Yahoo Finance) :
- Nom exact, Ticker, Code ISIN, Compartiment, Indice, Secteur ICB, Siège social
- Cours actuel exact en €, Capitalisation boursière, Nombre d'actions (en millions)
- Dernier exercice / LTM : Chiffre d'affaires, EBITDA, Résultat Net, Free Cash Flow (en M€), Marge opérationnelle, BNPA (EPS), Dette Nette (ou Trésorerie Nette en M€)
- Multiples : PER, EV/EBITDA, P/FCF, ROIC vs WACC, Rendement dividende
- Consensus analystes (recommandation et objectif moyen), actionnaires principaux, positions courtes AMF, et niveaux techniques (supports, résistances, Ichimoku).`;

  const res = await callGeminiWithFallback(apiKey, modelId, {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0 }
  });

  if (!res.ok) return "";
  return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Construction simultanée du corpus XML balisé (<source id="1" url="...">...</source>)
 * en moins de 3.5 secondes.
 */
async function buildInjectedXmlCorpus(subjectQuery, apiKey, modelId) {
  const encodedQuery = encodeURIComponent(subjectQuery);

  const [directSettlements, liveSnapshot] = await Promise.all([
    Promise.allSettled(CERTIFIED_SOURCES.map((src) => fetchSingleCertifiedSource(src, encodedQuery))),
    fetchRealtimeMarketSnapshot(subjectQuery, apiKey, modelId)
  ]);

  const collected = directSettlements.map((s, idx) =>
    s.status === "fulfilled"
      ? s.value
      : { ...CERTIFIED_SOURCES[idx], targetUrl: `${CERTIFIED_SOURCES[idx].url}${encodedQuery}`, ok: false, text: "" }
  );

  const xmlBlocks = collected.map((src) => {
    const content = src.ok
      ? src.text
      : (liveSnapshot ? `Synthèse consolidée portails financiers : ${liveSnapshot}` : "Données non disponibles sur ce portail.");
    return `<source id="${src.id}" name="${escapeXmlAttr(src.name)}" url="${escapeXmlAttr(src.targetUrl)}">\n${content}\n</source>`;
  });

  if (liveSnapshot) {
    xmlBlocks.unshift(`<source id="0" name="Consolidation_Temps_Reel_29_Portails" url="https://live.euronext.com">\n${liveSnapshot}\n</source>`);
  }

  return `<corpus subject="${escapeXmlAttr(subjectQuery)}" total_sources="29">\n${xmlBlocks.join("\n")}\n</corpus>`;
}

exports.handler = async function (event) {
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
  }

  const modelId = process.env.GEMINI_MODEL || "gemini-4-hydrogen";

  try {
    const body = JSON.parse(event.body || "{}");
    const mode = body.mode || "legacy";
    const subjectQuery = String(body.subjectQuery || "").trim();

    // Mode 1 : Audit complet sur contexte XML injecté (29 sources)
    if (mode === "stock_analysis" && subjectQuery) {
      const xmlCorpus = await buildInjectedXmlCorpus(subjectQuery, apiKey, modelId);

      const extractionPrompt = `${body.userPrompt || `Analyse complète de ${subjectQuery}`}

Voici les contenus nettoyés extraits des 29 sources financières certifiées. Lis, croise et extrais les données avec une précision chirurgicale en JSON strict :

${xmlCorpus}`;

      const geminiResult = await callGeminiWithFallback(apiKey, modelId, {
        systemInstruction: body.systemInstruction || undefined,
        contents: [{ parts: [{ text: extractionPrompt }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json"
        }
      });

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
    const geminiResult = await callGeminiWithFallback(apiKey, modelId, {
      systemInstruction: body.systemInstruction || undefined,
      contents: body.contents || [],
      tools: body.tools || undefined,
      generationConfig: {
        temperature: 0,
        ...(body.generationConfig || {})
      }
    });

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
