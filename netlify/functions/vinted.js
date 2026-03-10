exports.handler = async function(event, context) {
    const allowedOrigin = "https://leonce-equity.com";
    const requestOrigin = event.headers.origin || event.headers.Origin || "";

    const headers = {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (requestOrigin && requestOrigin !== allowedOrigin) {
        return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: "Accès refusé. Origine non autorisée." })
        };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    // 1. Validation stricte du payload
    let payload;
    try {
        payload = JSON.parse(event.body);
        
        // Vérification de la structure minimale attendue par l'API Gemini
        if (!payload || typeof payload !== 'object' || !payload.contents || !Array.isArray(payload.contents)) {
            throw new Error("Structure de données non conforme aux attentes de l'API LLM.");
        }
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
            body: JSON.stringify({ error: "Clé API manquante." }) 
        };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    // 2. Mécanisme de Timeout (limite à 8000ms pour anticiper la coupure Netlify de 10s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload), // On renvoie le payload validé et parsé
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
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
        
        // Gestion spécifique de l'erreur de délai
        if (error.name === 'AbortError') {
            return { 
                statusCode: 504, 
                headers, 
                body: JSON.stringify({ error: "Délai d'attente dépassé (Timeout). L'API Google n'a pas répondu à temps." }) 
            };
        }

        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: "Erreur interne du proxy.", details: error.message }) 
        };
    }
};
