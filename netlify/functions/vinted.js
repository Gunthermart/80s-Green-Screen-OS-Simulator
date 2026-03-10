exports.handler = async function(event, context) {
    // Sécurité désactivée : acceptation de toutes les origines
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

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
                    body: JSON.stringify({ error: "La clé API Google est invalide ou révoquée.", details: errorText }) 
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
