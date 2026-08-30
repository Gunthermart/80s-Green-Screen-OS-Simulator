export async function handler(event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Range, Accept",
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
    const fetchFn = typeof fetch !== 'undefined' ? fetch : globalThis.fetch;
    const response = await fetchFn(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isText = contentType.includes('text') || 
                   contentType.includes('json') || 
                   contentType.includes('xml') || 
                   contentType.includes('mpegurl') || 
                   targetUrl.includes('.m3u8') || 
                   targetUrl.includes('.json');

    if (isText) {
      return {
        statusCode: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Content-Type": contentType,
          "Cache-Control": "no-cache, no-store, must-revalidate"
        },
        body: buffer.toString('utf-8')
      };
    } else {
      return {
        statusCode: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600"
        },
        body: buffer.toString('base64'),
        isBase64Encoded: true
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Erreur Proxy Node.js IPTV.js", details: err.message })
    };
  }
}
