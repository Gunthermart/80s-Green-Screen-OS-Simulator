exports.handler = async function(event, context) {
    // 1. Définition de l'unique domaine autorisé
    const allowedOrigin = "https://leonce-equity.com";
    const requestOrigin = event.headers.origin || event.headers.Origin || "";

    const headers = {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // 2. Réponse immédiate pour les requêtes Preflight des navigateurs
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // 3. SÉCURITÉ : Blocage strict si la requête ne vient pas de ton site web
    if (requestOrigin !== allowedOrigin) {
        console.warn(`Intrusion bloquée. Origine falsifiée ou non autorisée : ${requestOrigin}`);
        return { 
            statusCode: 403, 
            headers,
            body: JSON.stringify({ error: "Accès refusé. Protection réseau stricte activée. Origine invalide." }) 
        };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    // 4. Récupération de la clé Google
    const apiKey = process.env.Vinted_key;
    if (!apiKey) {
        console.error("Erreur serveur : variable Vinted_key introuvable dans l'environnement Netlify.");
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: "Erreur d'infrastructure : clé Google API manquante." }) 
        };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // 5. Exécution de la requête relais
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: event.body 
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erreur API Gemini:", errorText);
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
        console.error("Erreur critique lors de l'exécution du proxy:", error);
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: "Crash interne du serveur proxy." }) 
        };
    }
};
