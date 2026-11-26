/**
 * Interroge une source certifiée avec un timeout court (350 ms) pour préserver le budget temps Netlify
 */
async function fetchSingleCertifiedSource(source, query) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 350);
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
    const snippet = stripHtmlToCompactText(raw, 200);
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
    .map((r) => r.value)
    .slice(0, 8);

  return `<corpus subject="${escapeXmlAttr(query)}" total_sources="29" active_sources="${activeNodes.length}">\n${activeNodes.join("\n")}\n</corpus>`;
}

/**
 * Extraction et nettoyage déterministe du JSON renvoyé par gemini-4-hydrogen (avec réparation si tronqué)
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
      } catch {}
    }
    // Tentative de réparation automatique si la réponse a été coupée en fin de flux
    if (start !== -1) {
      let candidate = cleaned.slice(start).replace(/,\s*$/, "");
      const quoteCount = (candidate.match(/(?<!\\)"/g) || []).length;
      if (quoteCount % 2 !== 0) candidate += '"';
      const openBraces = (candidate.match(/\{/g) || []).length - (candidate.match(/\}/g) || []).length;
      const openBrackets = (candidate.match(/\[/g) || []).length - (candidate.match(/\]/g) || []).length;
      if (openBrackets > 0) candidate += "]".repeat(openBrackets);
      if (openBraces > 0) candidate += "}".repeat(openBraces);
      try {
        return JSON.parse(candidate);
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
async function callGeminiWithFallback(apiKey, primaryModel, payload, deadlineMs = Date.now() + 8200) {
  const targetModel = primaryModel || "gemini-4-hydrogen";
  const useSearchTool = Boolean(payload?.tools?.length);
  const remainingForModel = deadlineMs - Date.now();
  if (remainingForModel < 1500) {
    return { ok: false, status: 504, error: "Budget temps Netlify atteint avant la synthèse." };
  }

  const baseGenConfig = {
    temperature: 0,
    maxOutputTokens: 2400,
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
  const timeoutMs = Math.max(3000, remainingForModel - 200);
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
  const netlifyDeadlineMs = Date.now() + 8500;
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
        generationConfig: { temperature: 0, maxOutputTokens: 2000, ...(body.generationConfig || {}) }
      },
      netlifyDeadlineMs
    );

    if (!geminiResult.ok) return { statusCode: geminiResult.status, headers, body: JSON.stringify({ error: geminiResult.error }) };
    return { statusCode: 200, headers, body: JSON.stringify(geminiResult.data) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || "Erreur interne StocksAnalyser." }) };
  }
};
