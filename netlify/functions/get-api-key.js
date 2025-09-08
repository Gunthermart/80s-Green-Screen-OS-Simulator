// Cette fonction s'exécute sur les serveurs de Netlify.
// Elle récupère de manière sécurisée la clé API depuis les variables d'environnement.
exports.handler = async (event, context) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "La variable d'environnement GOOGLE_MAPS_API_KEY n'est pas configurée sur le serveur." }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ apiKey }),
  };
};