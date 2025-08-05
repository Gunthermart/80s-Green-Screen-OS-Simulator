// Fonction rapide pour vérifier le statut d'une analyse

import { getStore } from "@netlify/blobs";

exports.handler = async function (event) {
    try {
        const jobId = event.queryStringParameters.jobId;
        if (!jobId) {
            return { statusCode: 400, body: JSON.stringify({ message: "Job ID manquant." }) };
        }

        const store = getStore("analysis_jobs");
        const jobStatus = await store.get(jobId, { type: "json" });

        if (!jobStatus) {
            return { statusCode: 404, body: JSON.stringify({ message: "Job non trouvé." }) };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(jobStatus)
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};
