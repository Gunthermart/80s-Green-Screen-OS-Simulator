exports.handler = async function(event, context) {
    // Gestion du CORS pour autoriser les requêtes cross-origin (sécurité navigateur)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Réponse immédiate pour les requêtes de pré-vérification (Preflight)
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    const clientToken = event.headers.authorization?.split(' ')[1];
    
    // DEBUG LOGS (visibles dans l'interface Netlify > Logs de la fonction)
    console.log("--- NOUVELLE REQUÊTE ---");
    console.log("APP_SECRET configuré sur le serveur ?", !!process.env.APP_SECRET);
    console.log("Token reçu du navigateur ?", !!clientToken);

    // Vérification stricte via variable d'environnement Netlify
    if (!process.env.APP_SECRET || clientToken !== process.env.APP_SECRET) {
        console.error("Échec de l'authentification. APP_SECRET manquant ou mot de passe incorrect.");
        return { 
            statusCode: 401, 
            headers,
            body: JSON.stringify({ error: "Accès refusé. Mot de passe invalide ou APP_SECRET non configuré sur Netlify." }) 
        };
    }

    // Récupération de la clé API avec la casse exacte demandée : Vinted_key
    const apiKey = process.env.Vinted_key;
    if (!apiKey) {
        console.error("Erreur : La variable Vinted_key est introuvable dans l'environnement.");
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: "Erreur serveur : clé API Google (Vinted_key) manquante dans l'environnement." }) 
        };
    }

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
                headers,
                body: JSON.stringify({ error: "Échec de la requête vers le LLM.", details: errorText }) 
            };
        }

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Erreur d'exécution du proxy:", error);
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: "Erreur interne du serveur proxy." }) 
        };
    }
};
