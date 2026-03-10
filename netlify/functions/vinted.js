exports.handler = async function(event, context) {
    const requestOrigin = event.headers.origin || event.headers.Origin || "";

    // 1. Liste blanche tolérante (inclut le www. et les environnements de test)
    const allowedOrigins = [
        "https://leonce-equity.com",
        "https://www.leonce-equity.com",
        "http://localhost:8888",
        "http://127.0.0.1:5500",
        "null"
    ];

    const isOriginAllowed = allowedOrigins.includes(requestOrigin) || requestOrigin.endsWith('.netlify.app');
    const corsOrigin = isOriginAllowed ? requestOrigin : "https://leonce-equity.com";

    const headers = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // 2. Blocage des requêtes externes non autorisées (Erreur 403)
    if (requestOrigin && !isOriginAllowed) {
        return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: `Accès refusé. Origine non autorisée : ${requestOrigin}` })
        };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    // 3. Validation stricte du payload
    let payload;
    try {
        payload = JSON.parse(event.body);
        if (!payload || !payload.contents) throw new Error("Structure JSON invalide pour l'API Gemini.");
    } catch (e) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Requête malformée.", details: e.message })
        };
    }

    const apiKey = process.env.vinted_key || process.env.Vinted_key;
    if (!apiKey) {
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: "Clé API manquante dans l'infrastructure Netlify." }) 
        };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
    
    // 4. Timeout pour éviter le crash de la fonction (Erreur 504)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            
            // 5. Interception de la clé API morte (Erreur 401 de Google)
            if (response.status === 401 || response.status === 403) {
                return { 
                    statusCode: response.status, 
                    headers, 
                    body: JSON.stringify({ error: "Ta clé API Google est morte, invalide ou révoquée. Va sur Google AI Studio en générer une nouvelle.", details: errorText }) 
                };
            }

            return { 
                statusCode: response.status, 
                headers,
                body: JSON.stringify({ error: "Erreur API LLM", details: errorText }) 
            };
        }

        const data = await response.json();
        return { statusCode: 200, headers, body: JSON.stringify(data) };

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            return { statusCode: 504, headers, body: JSON.stringify({ error: "Délai dépassé (Timeout). Google n'a pas répondu." }) };
        }
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Erreur interne proxy.", details: error.message }) };
    }
};
