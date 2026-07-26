const https = require('https');

exports.handler = async function(event, context) {
  // 1. Accepter uniquement les requêtes POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Méthode non autorisée" })
    };
  }

  // 2. Vérifier la présence de la clé d'environnement
  const apiKey = process.env.StocksAnalyserkey;
  if (!apiKey || apiKey.trim() === "") {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "La variable d'environnement 'StocksAnalyserkey' est manquante sur Netlify." })
    };
  }

  // Target le modèle Google Gemini 2.5 Flash
  const path = `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  return new Promise((resolve) => {
    const postData = event.body || "";

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Referer': 'https://www.leonce.fyi/'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          },
          body: data
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Erreur de connexion à l'API Google: ${e.message}` })
      });
    });

    req.write(postData);
    req.end();
  });
};
