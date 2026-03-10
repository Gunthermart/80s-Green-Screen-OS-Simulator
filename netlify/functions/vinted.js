exports.handler = async function(event, context) {
    const allowedOrigin = "https://leonce-equity.com";
    const requestOrigin = event.headers.origin || event.headers.Origin || "";

    const headers = {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Gestion des requêtes de pré-vérification du navigateur (Preflight)
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Blocage strict si la requête ne vient pas de ton site
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

    const apiKey = process.env.Vinted_key;
    if (!apiKey) {
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: "Clé API Vinted_key manquante." }) 
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
                body: JSON.stringify({ error: "Erreur API", details: errorText }) 
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
