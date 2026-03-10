exports.handler = async function(event, context) {
    const requestOrigin = event.headers.origin || event.headers.Origin || "";

    // 1. Définition de la liste blanche des environnements de travail
    const allowedOrigins = [
        "https://leonce-equity.com",
        "https://www.leonce-equity.com",
        "http://localhost:8888",
        "http://localhost:3000",
        "http://127.0.0.1:5500"
    ];

    // Vérification : l'origine est-elle dans la liste, ou est-ce une URL de test Netlify ?
    const isOriginAllowed = allowedOrigins.includes(requestOrigin) || requestOrigin.endsWith('.netlify.app');
    
    // Assignation dynamique de l'en-tête CORS
    const corsOrigin = isOriginAllowed ? requestOrigin : "https://leonce-equity.com";

    const headers = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Blocage de l'intrusion si l'origine n'est pas validée
    if (requestOrigin && !isOriginAllowed) {
        console.warn(`Blocage sécurité CORS. Origine tentée : ${requestOrigin}`);
        return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: `Accès refusé. Origine (${requestOrigin}) non autorisée.` })
        };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    // Validation stricte du payload
    let payload;
    try {
        payload = JSON.parse(event.body);
        
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
            body: JSON.stringify({ error: "Clé API manquante dans les variables d'environnement Netlify." }) 
        };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

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
            
            if (response.status === 401 || response.status === 403) {
                return { 
                    statusCode: response.status, 
                    headers, 
                    body: JSON.stringify({ error: "La clé API Google Gemini est invalide, révoquée ou expirée.", details: errorText }) 
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
