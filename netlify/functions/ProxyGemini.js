exports.handler = async function(event, context) {
    // 1. SÉCURITÉ CORS : Définir les domaines autorisés (A MODIFIER)
    const allowedOrigins = [
        'http://localhost:8888', // Pour vos tests en local
        'http://localhost:3000',
        'https://https://leonce-equity.com/notelogic/index.html' // <-- REMPLACEZ PAR VOTRE VRAI DOMAINE
    ];

    const origin = event.headers.origin;

    const headers = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // 2. PREFLIGHT (Gérer les requêtes préliminaires des navigateurs)
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    // 3. VERROUILLAGE (Rejeter ce qui ne vient pas de votre domaine)
    if (origin && !allowedOrigins.includes(origin)) {
        console.warn(`[BLOCAGE] Tentative d'accès depuis une origine non autorisée : ${origin}`);
        return { statusCode: 403, headers, body: JSON.stringify({ error: "Accès refusé. Origine non autorisée." }) };
    }

    // Rejeter tout ce qui n'est pas une requête POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: "Méthode HTTP non autorisée." }) };
    }

    // 4. RÉCUPÉRATION DE LA CLÉ (Isolée sur le serveur Netlify)
    const apiKey = process.env.NoteLogic_Api_Key;
    if (!apiKey) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Clé API manquante sur le serveur." }) };
    }

    // 5. EXÉCUTION DE LA REQUÊTE VERS GOOGLE
    try {
        const body = JSON.parse(event.body);
        const userText = body.text;
        const systemPrompt = body.systemPrompt;
        const model = "gemini-2.5-flash-lite"; // Modèle ultra-rapide forcé côté backend

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userText }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return { statusCode: response.status, headers, body: JSON.stringify(data) };
        }

        // 6. RENVOI DU RÉSULTAT AU FRONTEND
        return { statusCode: 200, headers, body: JSON.stringify(data) };

    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Erreur interne du proxy : " + error.message }) };
    }
};
