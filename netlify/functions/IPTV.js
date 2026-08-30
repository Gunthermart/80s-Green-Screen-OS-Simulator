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

  let targetUrl = null;

  if (event.queryStringParameters && event.queryStringParameters.url) {
    targetUrl = event.queryStringParameters.url;
  } else if (event.rawQuery) {
    const raw = event.rawQuery;
    const urlIdx = raw.indexOf('url=');
    if (urlIdx !== -1) {
      targetUrl = decodeURIComponent(raw.substring(urlIdx + 4));
    }
  }

  if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Paramètre 'url' absent ou invalide. L'URL doit commencer par http:// ou https://" })
    };
  }

  try {
    const fetchFn = typeof fetch !== 'undefined' ? fetch : globalThis.fetch;
    const response = await fetchFn(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `Erreur distante HTTP ${response.status}`, targetUrl })
      };
    }

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
