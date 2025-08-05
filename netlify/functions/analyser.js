// Fichier : netlify/functions/analyser.js
// Cette version ajoute une validation robuste de la réponse de l'API Google
// pour éviter les erreurs de JSON vide et fournir des messages clairs.

exports.handler = async function (event) {
    // On s'assure que la requête est de type POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 1. Récupérer les données envoyées par la page web
        const { prompt, imageData, mimeType } = JSON.parse(event.body);

        // 2. Récupérer la clé API depuis les variables d'environnement de Netlify
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ message: "Erreur: La clé API n'est pas configurée sur le serveur." }) };
        }

        // 3. Appeler l'API Google
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
        
        // --- NOUVEAU BLOC DE VALIDATION ---
        // On vérifie si la réponse de Google est valide avant de la renvoyer.
        const part = data?.candidates?.[0]?.content?.parts?.[0];
        if (!part || !part.text) {
            // Si la réponse est vide, c'est probablement à cause des filtres de sécurité ou d'un timeout.
            const finishReason = data?.candidates?.[0]?.finishReason;
            let errorMessage = "L'analyse a échoué car la réponse de l'API était vide.";
            if (finishReason === 'SAFETY') {
                errorMessage = "L'analyse a été bloquée par les filtres de sécurité de l'API.";
            } else if (finishReason === 'RECITATION') {
                 errorMessage = "L'analyse a été bloquée pour des raisons de contenu.";
            }
            console.error('Réponse API invalide:', JSON.stringify(data));
            // On renvoie un statut d'erreur clair au client.
            return { statusCode: 422, body: JSON.stringify({ message: errorMessage }) };
        }
        // --- FIN DU BLOC DE VALIDATION ---

        // 4. Renvoyer la réponse de Google (qui est maintenant validée) à la page web
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