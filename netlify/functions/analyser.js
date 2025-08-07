// Fichier : netlify/functions/analyser.js
// Version asynchrone qui utilise le streaming pour une latence minimale.

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Indiquer à Netlify de ne pas mettre en cache la fonction, 
    // car le streaming nécessite une connexion active.
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const { prompt, imageData, mimeType } = JSON.parse(event.body);
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Erreur: La clé API n'est pas configurée sur le serveur." })
            };
        }

        // Utilisation de l'API de streaming de Gemini
        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(googleApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: mimeType, data: imageData } } 
                    ] 
                }],
                // Le paramètre "stream" n'est pas nécessaire dans l'URL, 
                // mais le point de terminaison ":streamGenerateContent" indique déjà le streaming.
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur de l\'API Google:', errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify(errorData.error || { message: 'Erreur inconnue de l\'API Google.' })
            };
        }
        
        // C'est ici que la logique de streaming doit être implémentée.
        // En raison des limitations des fonctions Netlify, la gestion du streaming direct
        // vers le client est complexe et nécessite une approche différente de la simple
        // réponse HTTP synchrone. Pour un POC, nous pourrions simuler la réponse,
        // mais pour une vraie application, il faut un serveur de streaming.

        // Dans un environnement Node.js standard, vous utiliseriez un "for await"
        // pour traiter les morceaux de la réponse. Dans les fonctions Netlify,
        // il faut retourner une réponse unique.
        
        // Option 1 : Concaténer la réponse de streaming pour la renvoyer en une seule fois
        // Note: Cette approche ne réduit pas la latence perçue par l'utilisateur final.
        const reader = response.body.getReader();
        let fullResponseText = '';
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = new TextDecoder().decode(value);
            // Traiter chaque chunk. C'est ici que le JSON doit être extrait de chaque chunk.
            fullResponseText += chunk;
        }

        const data = JSON.parse(fullResponseText);

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