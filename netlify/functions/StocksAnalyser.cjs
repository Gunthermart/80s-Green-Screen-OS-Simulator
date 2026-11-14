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

const STOCK_AUDIT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    companyInfo: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING" },
        ticker: { type: "STRING" },
        isin: { type: "STRING" },
        market: { type: "STRING" },
        index: { type: "STRING" },
        icbSector: { type: "STRING" },
        headquarters: { type: "STRING" },
        summary: { type: "STRING" },
        competitivePositioning: { type: "STRING" }
      },
      required: ["name", "ticker", "isin", "market", "index", "icbSector", "headquarters", "summary", "competitivePositioning"]
    },
    cfaPersona: {
      type: "OBJECT",
      properties: {
        roe: { type: "STRING" },
        debtEbitda: { type: "STRING" },
        moatRating: { type: "STRING" },
        fcfQuality: { type: "STRING" },
        factsVsForecasts: { type: "STRING" }
      },
      required: ["roe", "debtEbitda", "moatRating", "fcfQuality", "factsVsForecasts"]
    },
    cmtPersona: {
      type: "OBJECT",
      properties: {
        rrRatio: { type: "STRING" },
        invalidationCondition: { type: "STRING" },
        levelsText: { type: "STRING" },
        scenarioText: { type: "STRING" }
      },
      required: ["rrRatio", "invalidationCondition", "levelsText", "scenarioText"]
    },
    mnaPersona: {
      type: "OBJECT",
      properties: {
        bearPrice: { type: "STRING" },
        basePrice: { type: "STRING" },
        bullPrice: { type: "STRING" },
        waccFormula: { type: "STRING" },
        assumptionsText: { type: "STRING" }
      },
      required: ["bearPrice", "basePrice", "bullPrice", "waccFormula", "assumptionsText"]
    },
    bayesianPerspective: {
      type: "OBJECT",
      properties: {
        probBullish: { type: "STRING" },
        expectedRange: { type: "STRING" },
        peadVal: { type: "STRING" },
        peadText: { type: "STRING" },
        peadBar: { type: "STRING" },
        macroVal: { type: "STRING" },
        macroText: { type: "STRING" },
        macroBar: { type: "STRING" },
        gammaVal: { type: "STRING" },
        gammaText: { type: "STRING" },
        gammaBar: { type: "STRING" },
        summary: { type: "STRING" }
      },
      required: ["probBullish", "expectedRange", "peadVal", "peadText", "peadBar", "macroVal", "macroText", "macroBar", "gammaVal", "gammaText", "gammaBar", "summary"]
    },
    financialKPIs: {
      type: "OBJECT",
      properties: {
        period: { type: "STRING" },
        revenue: { type: "STRING" },
        ebitda: { type: "STRING" },
        netIncome: { type: "STRING" },
        fcf: { type: "STRING" },
        operatingMargin: { type: "STRING" },
        eps: { type: "STRING" },
        marketCap: { type: "STRING" },
        netDebt: { type: "STRING" },
        fcfMillionsNumeric: { type: "NUMBER" },
        netDebtMillionsNumeric: { type: "NUMBER" },
        sharesMillionsNumeric: { type: "NUMBER" },
        currentPriceNumeric: { type: "NUMBER" }
      },
      required: [
        "period", "revenue", "ebitda", "netIncome", "fcf", "operatingMargin",
        "eps", "marketCap", "netDebt", "fcfMillionsNumeric", "netDebtMillionsNumeric",
        "sharesMillionsNumeric", "currentPriceNumeric"
      ]
    },
    debtStructure: {
      type: "OBJECT",
      properties: {
        grossDebt: { type: "STRING" },
        cash: { type: "STRING" },
        costOfDebt: { type: "STRING" },
        creditRating: { type: "STRING" },
        fixedRatePct: { type: "NUMBER" },
        variableRatePct: { type: "NUMBER" },
        maturitySTPct: { type: "NUMBER" },
        maturityMTPct: { type: "NUMBER" },
        maturityLTPct: { type: "NUMBER" }
      },
      required: ["grossDebt", "cash", "costOfDebt", "creditRating", "fixedRatePct", "variableRatePct", "maturitySTPct", "maturityMTPct", "maturityLTPct"]
    },
    healthScores: {
      type: "OBJECT",
      properties: {
        piotroskiScore: { type: "NUMBER" },
        piotroskiAnalysis: { type: "STRING" },
        altmanZScore: { type: "STRING" },
        altmanAnalysis: { type: "STRING" },
        pegRatio: { type: "STRING" },
        pegBadge: { type: "STRING" },
        pegAnalysis: { type: "STRING" },
        dividendYield: { type: "STRING" },
        dividendSafety: { type: "STRING" },
        dividendAnalysis: { type: "STRING" },
        debtEbitda: { type: "STRING" },
        interestCoverage: { type: "STRING" }
      },
      required: [
        "piotroskiScore", "piotroskiAnalysis", "altmanZScore", "altmanAnalysis",
        "pegRatio", "pegBadge", "pegAnalysis", "dividendYield", "dividendSafety",
        "dividendAnalysis", "debtEbitda", "interestCoverage"
      ]
    },
    valuationMultiples: {
      type: "OBJECT",
      properties: {
        peRatio: { type: "STRING" },
        evEbitda: { type: "STRING" },
        pFCF: { type: "STRING" },
        roicWacc: { type: "STRING" }
      },
      required: ["peRatio", "evEbitda", "pFCF", "roicWacc"]
    },
    growthAnalysis: {
      type: "OBJECT",
      properties: {
        cagrHist: { type: "STRING" },
        cagrEpsEst: { type: "STRING" },
        revisionTrend: { type: "STRING" },
        lastSurprise: { type: "STRING" },
        historicalGrowthSummary: { type: "STRING" },
        growthOutlook: { type: "STRING" },
        growthDrivers: { type: "ARRAY", items: { type: "STRING" } },
        marketRumors: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              source: { type: "STRING" },
              credibility: { type: "STRING" },
              text: { type: "STRING" }
            }
          }
        }
      },
      required: ["cagrHist", "cagrEpsEst", "revisionTrend", "lastSurprise", "historicalGrowthSummary", "growthOutlook", "growthDrivers", "marketRumors"]
    },
    governanceAndCapital: {
      type: "OBJECT",
      properties: {
        majorShareholders: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              percentage: { type: "STRING" }
            }
          }
        },
        governanceNotes: { type: "STRING" }
      },
      required: ["majorShareholders", "governanceNotes"]
    },
    perspectives: {
      type: "OBJECT",
      properties: {
        guidanceSummary: { type: "STRING" },
        strategicPillars: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["guidanceSummary", "strategicPillars"]
    },
    analystConsensusAndNews: {
      type: "OBJECT",
      properties: {
        consensusRecommendation: { type: "STRING" },
        targetPriceAvg: { type: "STRING" },
        consensusSummary: { type: "STRING" }
      },
      required: ["consensusRecommendation", "targetPriceAvg", "consensusSummary"]
    },
    documentedRisks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          category: { type: "STRING" },
          description: { type: "STRING" }
        }
      }
    },
    shortInterest: {
      type: "OBJECT",
      properties: {
        shortCapitalPct: { type: "STRING" },
        shortSqueezePotential: { type: "STRING" },
        shortAnalysis: { type: "STRING" }
      },
      required: ["shortCapitalPct", "shortSqueezePotential", "shortAnalysis"]
    },
    portfolioEntryIndicators: {
      type: "OBJECT",
      properties: {
        grahamStatus: { type: "STRING" },
        grahamDesc: { type: "STRING" },
        kellyValue: { type: "STRING" },
        kellyDesc: { type: "STRING" },
        kijunStatus: { type: "STRING" },
        kijunDesc: { type: "STRING" }
      },
      required: ["grahamStatus", "grahamDesc", "kellyValue", "kellyDesc", "kijunStatus", "kijunDesc"]
    },
    leonceDiagnostic: {
      type: "OBJECT",
      properties: {
        overallScore: { type: "NUMBER" },
        stAnalysis: { type: "STRING" },
        mtAnalysis: { type: "STRING" }
      },
      required: ["overallScore", "stAnalysis", "mtAnalysis"]
    },
    tradingPlan: {
      type: "OBJECT",
      properties: {
        entryZone: { type: "STRING" },
        stopLoss: { type: "STRING" },
        tp1: { type: "STRING" },
        tp2: { type: "STRING" },
        ichimokuKumo: { type: "STRING" },
        ichimokuTK: { type: "STRING" },
        ichimokuChikou: { type: "STRING" },
        tradeExamples: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              rrRatio: { type: "STRING" },
              setupSummary: { type: "STRING" },
              entry: { type: "STRING" },
              stopLoss: { type: "STRING" },
              target: { type: "STRING" }
            }
          }
        }
      },
      required: ["entryZone", "stopLoss", "tp1", "tp2", "ichimokuKumo", "ichimokuTK", "ichimokuChikou", "tradeExamples"]
    },
    qvmComposite: {
      type: "OBJECT",
      properties: {
        overallScore: { type: "NUMBER" },
        qualityScore: { type: "NUMBER" },
        valuationScore: { type: "NUMBER" },
        momentumScore: { type: "NUMBER" },
        qualityAnalysis: { type: "STRING" },
        valuationAnalysis: { type: "STRING" },
        momentumAnalysis: { type: "STRING" }
      },
      required: ["overallScore", "qualityScore", "valuationScore", "momentumScore", "qualityAnalysis", "valuationAnalysis", "momentumAnalysis"]
    }
  },
  required: [
    "companyInfo", "cfaPersona", "cmtPersona", "mnaPersona", "bayesianPerspective",
    "financialKPIs", "debtStructure", "healthScores", "valuationMultiples",
    "growthAnalysis", "governanceAndCapital", "perspectives", "analystConsensusAndNews",
    "documentedRisks", "shortInterest", "portfolioEntryIndicators", "leonceDiagnostic",
    "tradingPlan", "qvmComposite"
  ]
};

/**
 * Nettoyage HTML déterministe : supprime scripts, styles, balises et compresse les espaces.
 */
function stripHtmlToCleanText(html, maxChars = 14000) {
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
 * Collecte parallèle directe des 29 URLs certifiées avec timeout court.
 */
async function fetchSingleCertifiedSource(source, encodedQuery) {
  const targetUrl = `${source.url}${encodedQuery}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3200);
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
    const cleanText = stripHtmlToCleanText(rawHtml, 12000);
    const blocked = /captcha|cloudflare|access denied|enable javascript|just a moment/i.test(cleanText) && cleanText.length < 1500;
    return {
      ...source,
      targetUrl,
      ok: !blocked && cleanText.length > 250,
      text: blocked ? "" : cleanText
    };
  } catch {
    clearTimeout(timer);
    return { ...source, targetUrl, ok: false, text: "" };
  }
}

/**
 * Complément par petits lots ciblés (4 à 5 sites maximum par appel Gemini Search)
 * pour les sources protégées contre le scraping direct.
 */
async function fetchMissingBatchesViaSearch(subjectQuery, missingSources, apiKey, modelId) {
  if (!missingSources.length) return new Map();

  const batches = [];
  for (let i = 0; i < missingSources.length; i += 5) {
    batches.push(missingSources.slice(i, i + 5));
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const batchResults = await Promise.allSettled(
    batches.map(async (batch) => {
      const siteFilters = batch.map((s) => `site:${new URL(s.url).hostname}`).join(" OR ");
      const prompt = `Recherche factuelle ciblée sur "${subjectQuery}" uniquement sur ce lot de ${batch.length} sources financières : ${batch.map((s) => `${s.name} (${new URL(s.url).hostname})`).join(", ")}.
Requête de recherche ciblée : "${subjectQuery}" (${siteFilters}).
Extrais uniquement les faits vérifiés : cours actuel, variation, capitalisation, CA, EBITDA, résultat net, FCF, dette nette, nombre d'actions, PER, EV/EBITDA, consensus et actualités récentes.`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0 }
        })
      });
      if (!res.ok) return [];
      const data = await res.json();
      const snippet = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return batch.map((s) => ({ id: s.id, text: snippet }));
    })
  );

  const enrichedMap = new Map();
  for (const r of batchResults) {
    if (r.status === "fulfilled") {
      for (const item of r.value) {
        enrichedMap.set(item.id, item.text);
      }
    }
  }
  return enrichedMap;
}

/**
 * Construction du corpus XML balisé (<source id="1" url="...">...</source>)
 */
async function buildInjectedXmlCorpus(subjectQuery, apiKey, modelId) {
  const encodedQuery = encodeURIComponent(subjectQuery);

  // 1. Collecte déterministe en parallèle sur les 29 URLs
  const directSettlements = await Promise.allSettled(
    CERTIFIED_SOURCES.map((src) => fetchSingleCertifiedSource(src, encodedQuery))
  );

  const collected = directSettlements.map((s, idx) =>
    s.status === "fulfilled"
      ? s.value
      : { ...CERTIFIED_SOURCES[idx], targetUrl: `${CERTIFIED_SOURCES[idx].url}${encodedQuery}`, ok: false, text: "" }
  );

  // 2. Identification des sources protégées (anti-bot) et collecte par lots de 5 max
  const missingSources = collected.filter((c) => !c.ok);
  const fallbackMap = await fetchMissingBatchesViaSearch(subjectQuery, missingSources, apiKey, modelId);

  const xmlBlocks = collected.map((src) => {
    const content = src.ok ? src.text : (fallbackMap.get(src.id) || "Données non disponibles sur ce portail.");
    return `<source id="${src.id}" name="${escapeXmlAttr(src.name)}" url="${escapeXmlAttr(src.targetUrl)}">\n${content}\n</source>`;
  });

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

    // Mode 1 : Audit complet sur contexte XML injecté (29 sources) + responseSchema strict
    if (mode === "stock_analysis" && subjectQuery) {
      const xmlCorpus = await buildInjectedXmlCorpus(subjectQuery, apiKey, modelId);

      const extractionPrompt = `${body.userPrompt || `Analyse complète de ${subjectQuery}`}

Voici les 29 contenus nettoyés extraits des portails financiers certifiés. Lis, croise et extrais les données avec une précision chirurgicale :

${xmlCorpus}`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const geminiRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: body.systemInstruction || undefined,
          contents: [{ parts: [{ text: extractionPrompt }] }],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
            responseSchema: STOCK_AUDIT_RESPONSE_SCHEMA
          }
        })
      });

      const geminiData = await geminiRes.json();
      if (!geminiRes.ok) {
        return {
          statusCode: geminiRes.status,
          headers,
          body: JSON.stringify({ error: geminiData?.error?.message || "Erreur API gemini-4-hydrogen." })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(geminiData)
      };
    }

    // Mode 2 : Appels ciblés (Comparateur VS, Deep Dive, Radar Rumeurs, Stress-Test, Mise à jour fonds)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = {
      systemInstruction: body.systemInstruction || undefined,
      contents: body.contents || [],
      tools: body.tools || undefined,
      generationConfig: {
        temperature: 0,
        ...(body.generationConfig || {})
      }
    };

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
      return {
        statusCode: geminiRes.status,
        headers,
        body: JSON.stringify({ error: geminiData?.error?.message || "Erreur API gemini-4-hydrogen." })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(geminiData)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Erreur interne StocksAnalyser." })
    };
  }
};
