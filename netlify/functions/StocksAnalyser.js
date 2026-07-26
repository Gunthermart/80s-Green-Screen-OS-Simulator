exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Méthode non autorisée" }) 
    };
  }

  // Récupération de la clé depuis les variables Netlify
  const apiKey = process.env.StocksAnalyserkey;

  if (!apiKey || apiKey.trim() === "") {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: "La variable d'environnement StocksAnalyserkey est manquante ou vide sur Netlify." 
      }) 
    };
  }

  // URL vers le modèle Gemini Flash 3.6
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  try {
    const payload = JSON.parse(event.body);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://www.leonce.fyi/"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
