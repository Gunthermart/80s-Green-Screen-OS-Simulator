// Fichier : netlify/functions/analyser.js

exports.handler = async function (event, context) {
    // On vérifie que la requête est bien de type POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 1. Récupérer les données envoyées par la page web
        const body = JSON.parse(event.body);
        const { prompt, imageData } = body;

        // 2. Récupérer la clé API depuis les variables d'environnement de Netlify (sécurisé)
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ message: "Clé API non configurée sur le serveur." }) };
        }

        // 3. Appeler l'API Google en ajoutant la clé secrète
        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: "image/png", data: imageData } }
                    ]
                }],
                generationConfig: { "responseMimeType": "application/json" }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erreur de l\'API Google:', data);
            return { statusCode: response.status, body: JSON.stringify(data) };
        }
        
        // 4. Renvoyer la réponse de Google à la page web
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Erreur dans la fonction Netlify:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};