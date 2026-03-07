exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const apiKey = process.env.vinted_key;
    if (!apiKey) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Configuration serveur invalide : clé API manquante." }) 
        };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: event.body 
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erreur API Gemini:", errorText);
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ error: "Échec de la requête vers le LLM.", details: errorText }) 
            };
        }

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Erreur d'exécution de la fonction:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Erreur interne du serveur proxy." }) 
        };
    }
};
