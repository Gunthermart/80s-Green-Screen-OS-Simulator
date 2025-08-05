// Fonction d'arrière-plan pour lancer une analyse longue

import { getStore } from "@netlify/blobs";
import { randomUUID } from "crypto";

exports.handler = async function (event) {
    try {
        const { prompt, imageData, mimeType } = JSON.parse(event.body);
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ message: "Clé API non configurée." }) };
        }

        // 1. Créer un Job ID unique et un magasin de données
        const jobId = randomUUID();
        const store = getStore("analysis_jobs");

        // 2. Enregistrer l'état initial du job
        await store.setJSON(jobId, { status: "pending", timestamp: Date.now() });

        // 3. Répondre IMMÉDIATEMENT au client avec le Job ID
        // La suite du code s'exécutera en arrière-plan.
        setTimeout(async () => {
            try {
                const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
                const response = await fetch(googleApiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: imageData } }] }],
                        generationConfig: { "responseMimeType": "application/json" }
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.error?.message || "Erreur de l'API Google.");
                }

                // Valider la réponse de Google
                const part = data?.candidates?.[0]?.content?.parts?.[0];
                if (!part || !part.text) {
                    const finishReason = data?.candidates?.[0]?.finishReason || "unknown";
                    throw new Error(`Réponse de l'API vide ou invalide. Raison: ${finishReason}`);
                }

                // 4. Mettre à jour le statut du job avec le résultat final
                await store.setJSON(jobId, { status: "complete", result: data });

            } catch (error) {
                // En cas d'erreur, mettre à jour le statut avec le message d'erreur
                await store.setJSON(jobId, { status: "failed", error: error.message });
            }
        }, 0);
        
        return {
            statusCode: 202, // 202 Accepted: La requête est acceptée, le traitement commence.
            body: JSON.stringify({ jobId })
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};
