// Cette fonction s'exécute de manière sécurisée sur les serveurs de Netlify
exports.handler = async function(event, context) {
    // On récupère la variable d'environnement définie dans l'interface Netlify
    const apiKey = process.env.AgenDataAPIKey;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Clé API manquante dans les variables d'environnement Netlify" })
        };
    }

    // On retourne la clé au format JSON
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ AgenDataAPIKey: apiKey })
    };
};
