// Fonction rapide pour vérifier le statut d'une analyse
// Version avec journalisation détaillée pour le débogage

import { getStore } from "@netlify/blobs";

exports.handler = async function (event) {
    console.log("INFO: La fonction 'check-status' a été appelée.");

    try {
        const jobId = event.queryStringParameters.jobId;
        if (!jobId) {
            console.error("ERREUR: Job ID manquant dans la requête.");
            return { statusCode: 400, body: JSON.stringify({ message: "Job ID manquant." }) };
        }
        console.log(`INFO: Vérification du statut pour le Job ID : ${jobId}`);

        const store = getStore("analysis_jobs");
        console.log("INFO: Accès au magasin de données (blobs)...");
        const jobStatus = await store.get(jobId, { type: "json" });

        if (!jobStatus) {
            console.warn(`AVERTISSEMENT: Job ID non trouvé dans le magasin : ${jobId}`);
            return { statusCode: 404, body: JSON.stringify({ message: "Job non trouvé ou expiré." }) };
        }
        
        console.log(`INFO: Statut trouvé pour le Job ID ${jobId}: ${jobStatus.status}`);
        return {
            statusCode: 200,
            body: JSON.stringify(jobStatus)
        };

    } catch (error) {
        console.error(`ERREUR CRITIQUE dans la fonction 'check-status':`, error);
        return { statusCode: 500, body: JSON.stringify({ message: `Erreur interne du serveur: ${error.message}` }) };
    }
};