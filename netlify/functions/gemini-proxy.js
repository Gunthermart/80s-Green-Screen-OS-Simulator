exports.handler = async function(event, context) {
    const allowedOrigins = [
        'https://leonce-equity.com',
        'https://www.leonce-equity.com', 
        'http://localhost:8888'
    ]; 
    const origin = event.headers.origin;
    
    const headers = {
        'Access-Control-Allow-Origin': (origin && allowedOrigins.includes(origin)) ? origin : allowedOrigins[0],
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (origin && !allowedOrigins.includes(origin)) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: `Accès refusé. Origine non autorisée: ${origin}` }) };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: "Méthode HTTP non autorisée." }) };
    }

    const apiKey = process.env.NoteLogic_Api_Key;
    if (!apiKey) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Erreur serveur : Clé API non configurée." }) };
    }

    try {
        const body = JSON.parse(event.body);
        const userPrompt = body.prompt;
        const systemPrompt = body.system;

        if (!userPrompt) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: "Prompt utilisateur manquant." }) };
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
            return { statusCode: googleResponse.status, headers, body: JSON.stringify({ error: `Erreur API Google: ${googleResponse.status}` }) };
        }

        const data = await googleResponse.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ text: generatedText })
        };

    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Erreur interne lors du traitement." }) };
    }
};
