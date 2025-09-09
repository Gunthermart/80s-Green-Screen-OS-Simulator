// netlify/functions/get-api-key.js

exports.handler = async function(event, context) {
  // Cette fonction est conçue pour être exécutée sur Netlify.
  // Elle récupère la clé API Google Maps à partir des variables d'environnement
  // configurées dans l'interface de Netlify.
  // C'est une méthode sécurisée pour ne pas exposer votre clé dans le code côté client.

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error("La variable d'environnement GOOGLE_MAPS_API_KEY n'est pas définie.");
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: apiKey }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

