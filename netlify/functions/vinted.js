exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Sécurité : Blocage immédiat si le mot de passe ne correspond pas à la variable d'environnement Netlify APP_SECRET
    const clientToken = event.headers.authorization?.split(' ')[1];
    if (!process.env.APP_SECRET || clientToken !== process.env.APP_SECRET) {
        return { 
            statusCode: 401, 
            body: JSON.stringify({ error: "Accès non autorisé. Le mot de passe système est invalide ou APP_SECRET n'est pas configuré sur Netlify." }) 
        };
    }

    const apiKey = process.env.vinted_key;
    if (!apiKey) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Configuration serveur invalide : clé API Google manquante." }) 
        };
    }

    // Utilisation du modèle de production stable, fini les versions preview instables
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: event.body 
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erreur API Google:", errorText);
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ error: "Échec de la requête vers l'IA.", details: errorText }) 
            };
        }

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Erreur interne:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Erreur interne du serveur proxy." }) 
        };
    }
};
