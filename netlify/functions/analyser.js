// Fichier : netlify/functions/analyser.js
// Version synchrone qui gère les deux types d'analyse.

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt, imageData, mimeType } = JSON.parse(event.body);
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ message: "Erreur: La clé API n'est pas configurée sur le serveur." }) };
        }

        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: mimeType, data: imageData } } 
                    ] 
                }],
                generationConfig: { "responseMimeType": "application/json" }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erreur de l\'API Google:', data);
            return { statusCode: response.status, body: JSON.stringify(data.error || { message: 'Erreur inconnue de l\'API Google.'}) };
        }
        
        const part = data?.candidates?.[0]?.content?.parts?.[0];
        if (!part || !part.text) {
            const finishReason = data?.candidates?.[0]?.finishReason;
            let errorMessage = "L'analyse a échoué car la réponse de l'API était vide ou mal formée.";
            if (finishReason === 'SAFETY') {
                errorMessage = "L'analyse a été bloquée par les filtres de sécurité de l'API.";
            }
            return { statusCode: 422, body: JSON.stringify({ message: errorMessage }) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Erreur critique dans la fonction Netlify:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Erreur interne du serveur: ${error.message}` })
        };
    }
};
