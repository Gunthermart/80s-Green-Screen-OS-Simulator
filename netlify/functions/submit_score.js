// Importe le SDK Admin de Firebase
const admin = require('firebase-admin');

// Initialise le SDK Admin de Firebase.
// Assurez-vous que vos identifiants sont configurés en tant que variables d'environnement dans Netlify.
try {
    if (!admin.apps.length) {
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            // Remplace les caractères d'échappement \n par de vrais sauts de ligne pour la clé privée
            private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
        };
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
}

const db = admin.firestore();

// Fonctions utilitaires pour le calcul du score (copiées du client)
const getDistance = (from, to) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calculateScore = (dist) => {
    if (dist < 0.05) return { score: 5000, precisionBonus: 1000 }; // Moins de 50m
    return { score: Math.max(0, 5000 * Math.exp(-dist / 2000)), precisionBonus: 0 };
};

// Handler de la fonction Netlify
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 1. Vérifier l'authentification de l'utilisateur via le token Firebase
        const { authorization } = event.headers;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Non autorisé : Token manquant.' }) };
        }
        const idToken = authorization.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // 2. Valider les données reçues du client
        const { nickname, gameMode, rounds } = JSON.parse(event.body);
        if (!nickname || !gameMode || !Array.isArray(rounds) || rounds.length === 0) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Données invalides fournies.' }) };
        }

        let totalScore = 0;

        // 3. Recalculer le score de manière sécurisée sur le serveur
        rounds.forEach(round => {
            // Ignorer les manches sans estimation
            if (!round.actual || !round.guess) return;
            
            const distance = getDistance(round.actual, round.guess);
            const { score: baseScore, precisionBonus } = calculateScore(distance);
            
            // Les bonus/malus sont envoyés par le client, le serveur leur fait confiance pour cette implémentation
            const timeBonus = round.timeBonus || 0;
            const timedModeBonus = round.timedModeBonus || 0;
            const hintPenalty = round.hintPenalty || 0;
            
            const finalRoundScore = Math.max(0, Math.round(baseScore + precisionBonus + timeBonus + timedModeBonus) - hintPenalty);
            totalScore += finalRoundScore;
        });

        // 4. Inscrire le score validé dans Firestore
        await db.collection('hallOfFame').add({
            pseudo: nickname,
            score: totalScore,
            mode: gameMode,
            uid: uid, // Lier le score à l'ID utilisateur authentifié
            date: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, calculatedScore: totalScore }),
        };

    } catch (error) {
        console.error('Erreur lors de la soumission du score:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Une erreur interne est survenue.' }),
        };
    }
};