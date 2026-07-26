exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  const apiKey = process.env.StocksAnalyserkey;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Variable StocksAnalyserkey manquante" }) };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  try {
    const payload = JSON.parse(event.body);

    // Injection explicite de l'en-tête Referer pour valider la restriction Google Cloud
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
