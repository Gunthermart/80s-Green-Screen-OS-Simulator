exports.handler = async function(event, context) {
    // Netlify va chercher la variable d'environnement que vous avez configurée
    const apiKey = process.env.NoteLogic_Api_Key;

    // Sécurité : si la clé n'est pas trouvée côté serveur
    if (!apiKey) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Variable NoteLogic_Api_Key introuvable sur le serveur Netlify." })
        };
    }

    // Renvoie la clé au format JSON attendu par notre application
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ NoteLogic_Api_Key: apiKey })
    };
};
