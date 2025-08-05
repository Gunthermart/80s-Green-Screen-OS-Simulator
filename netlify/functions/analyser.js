// Fichier : netlify/functions/analyser.js
// Version avec une journalisation (logging) ultra-détaillée pour diagnostiquer les réponses vides.

exports.handler = async function (event) {
    console.log("INFO: La fonction Netlify 'analyser' a été appelée.");

    if (event.httpMethod !== 'POST') {
        console.error("ERREUR: La requête a été rejetée car la méthode n'était pas POST.");
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        console.log("INFO: Analyse du corps de la requête...");
        const { prompt, imageData, mimeType } = JSON.parse(event.body);
        console.log(`INFO: Requête analysée avec succès pour le type de média : ${mimeType}`);

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error("ERREUR FATALE: La clé API GEMINI_API_KEY n'est pas configurée sur le serveur.");
            return { statusCode: 500, body: JSON.stringify({ message: "Erreur: La clé API n'est pas configurée sur le serveur." }) };
        }

        console.log("INFO: Appel de l'API Google Gemini...");
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
        console.log(`INFO: L'API Google a répondu avec le statut : ${response.status}`);

        const responseText = await response.text();
        
        if (!response.ok) {
            console.error(`ERREUR de l'API Google. Statut: ${response.status}, Corps: ${responseText}`);
            try {
                const errorData = JSON.parse(responseText);
                return { statusCode: response.status, body: JSON.stringify(errorData.error || { message: 'Erreur inconnue de l\'API Google.'}) };
            } catch (e) {
                 return { statusCode: response.status, body: JSON.stringify({ message: `Erreur non-JSON de l'API Google: ${responseText}`}) };
            }
        }

        if (!responseText) {
            console.error("ERREUR: La réponse de l'API Google est complètement vide.");
            return { statusCode: 500, body: JSON.stringify({ message: "La réponse de l'API était vide." }) };
        }

        console.log("INFO: Analyse de la réponse JSON de l'API Google...");
        const data = JSON.parse(responseText);

        const part = data?.candidates?.[0]?.content?.parts?.[0];
        if (!part || !part.text) {
            const finishReason = data?.candidates?.[0]?.finishReason;
            let errorMessage = "L'analyse a échoué car la réponse de l'API était vide ou mal formée.";
            if (finishReason === 'SAFETY') {
                errorMessage = "L'analyse a été bloquée par les filtres de sécurité de l'API.";
            }
            console.error(`ERREUR: Réponse API invalide. Raison: ${finishReason}. Réponse complète: ${JSON.stringify(data)}`);
            return { statusCode: 422, body: JSON.stringify({ message: errorMessage }) };
        }

        console.log("INFO: Réponse de l'API validée. Envoi de la réponse au client.");
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('ERREUR CRITIQUE dans la fonction Netlify:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Erreur interne du serveur: ${error.message}` })
        };
    }
};