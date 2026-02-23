exports.handler = async function(event, context) {
    // Domaines stricts autorisés à interroger ton proxy
    const allowedOrigins = [
        'https://leonce-equity.com',
        'https://www.leonce-equity.com', 
        'http://localhost:8888'
    ]; 
    const origin = event.headers.origin;
    
    // Vérification de l'origine
    if (origin && !allowedOrigins.includes(origin)) {
        return { statusCode: 403, body: JSON.stringify({ error: "Accès refusé. Origine non autorisée." }) };
    }

    // Filtrage des méthodes
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: "Méthode HTTP non autorisée." }) };
    }

    const apiKey = process.env.NoteLogic_Api_Key;
    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ error: "Erreur serveur : Clé API non configurée." }) };
    }

    try {
        const body = JSON.parse(event.body);
        const userPrompt = body.prompt;
        const systemPrompt = body.system;

        if (!userPrompt) {
            return { statusCode: 400, body: JSON.stringify({ error: "Prompt utilisateur manquant." }) };
        }

        const model = "gemini-2.5-flash-lite"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });

        if (!googleResponse.ok) {
            return { statusCode: googleResponse.status, body: JSON.stringify({ error: `Erreur API Google: ${googleResponse.status}` }) };
        }

        const data = await googleResponse.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin || '*' // L'en-tête dynamique est nécessaire pour le navigateur
            },
            body: JSON.stringify({ text: generatedText })
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Erreur interne lors du traitement." }) };
    }
};
