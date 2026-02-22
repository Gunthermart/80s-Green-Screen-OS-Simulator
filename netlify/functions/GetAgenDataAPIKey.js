// Cette fonction s'exécute de manière sécurisée sur les serveurs de Netlify
exports.handler = async function(event, context) {
    // On récupère la variable d'environnement définie dans l'interface Netlify
    const apiKey = process.env.AgenDataAPIKey;

    // Configuration des en-têtes de réponse pour le JSON et la sécurité
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Permet d'éviter certains blocages CORS en test
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
    };

    // Gestion de la requête de pré-vérification (CORS)
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    if (!apiKey) {
        console.error("ERREUR : La variable d'environnement AgenDataAPIKey n'est pas configurée dans Netlify.");
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: "Clé API manquante",
                details: "Assurez-vous d'avoir ajouté 'AgenDataAPIKey' dans les variables d'environnement de votre site Netlify."
            })
        };
    }

    // On retourne la clé au format JSON attendu par NoteLogic
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ AgenDataAPIKey: apiKey })
    };
};
