// Netlify Serverless Function "IPTV.js" pour contourner les restrictions CORS des flux Radio, TV, RSS & Pluto TV

exports.handler = async function (event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: ""
    };
  }

  const targetUrl = event.queryStringParameters ? event.queryStringParameters.url : null;

  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Paramètre 'url' manquant." })
    };
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });

    const contentType = response.headers.get("content-type") || "text/plain; charset=utf-8";
    const bodyText = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-store, must-revalidate"
      },
      body: bodyText
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Erreur Proxy Node.js IPTV.js", details: err.message })
    };
  }
};
