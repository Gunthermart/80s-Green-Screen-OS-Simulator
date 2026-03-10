exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const apiKey = process.env.Vinted_key;
    if (!apiKey) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Clé API Vinted_key manquante." }) 
        };
    }

    // Passage au modèle Gemini 3.1 Flash-Lite pour une vitesse 2.5x supérieure
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
                body: JSON.stringify({ error: "Erreur API", details: errorText }) 
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Erreur interne proxy." }) 
        };
    }
};
