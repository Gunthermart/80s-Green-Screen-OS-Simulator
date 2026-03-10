exports.handler = async function(event, context) {
    const allowedOrigin = "https://leonce-equity.com";
    const requestOrigin = event.headers.origin || event.headers.Origin || "";

    const headers = {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Autoriser les requêtes Preflight du navigateur
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Sécurité stricte : blocage si l'origine n'est pas ton domaine exact
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

    // Récupération de la clé (tolérance sur la majuscule)
    const apiKey = process.env.vinted_key || process.env.Vinted_key;
    if (!apiKey) {
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: "Clé API manquante dans les variables d'environnement Netlify." }) 
        };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: event.body 
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { 
                statusCode: response.status, 
                headers,
                body: JSON.stringify({ error: "Erreur API LLM", details: errorText }) 
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };

    } catch (error) {
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: "Erreur interne proxy." }) 
        };
    }
};
