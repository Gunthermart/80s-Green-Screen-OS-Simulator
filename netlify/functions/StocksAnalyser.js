// netlify/functions/StocksAnalyser.js
export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Méthode non autorisée" }) 
    };
  }

  const apiKey = process.env.StocksAnalyserKey || process.env.StocksAnalyserkey;

  if (!apiKey || apiKey.trim() === "") {
    return { 
      statusCode: 400, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        error: "La variable d'environnement 'StocksAnalyserKey' est manquante ou vide sur Netlify. Veuillez la configurer dans Site settings > Environment variables." 
      }) 
    };
  }

  // Utilisation de Gemini 2.5 Flash avec Google Search Grounding
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`;

  try {
    const payload = JSON.parse(event.body);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Erreur interne du serveur lors de l'appel à l'IA." })
    };
  }
}
