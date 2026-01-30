// netlify/functions/GetAgenDataAPIKey.js

exports.handler = async function(event, context) {
  // Gestion du Preflight CORS pour autoriser les requêtes depuis le navigateur
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  try {
    // Utilisation du nom exact de ta variable configurée sur Netlify
    const apiKey = process.env.AgenDataAPIKey;

    if (!apiKey) {
      throw new Error("La variable AgenDataAPIKey est introuvable sur Netlify");
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ apiKey: apiKey }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
