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
    const match = raw.match(/(?:^|&)url=([^&]+)/);
    if (match) {
      targetUrl = decodeURIComponent(match[1]);
    } else if (raw.startsWith('url=')) {
      targetUrl = decodeURIComponent(raw.substring(4));
    }
  }

  if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Paramètre 'url' absent ou invalide", received: targetUrl })
    };
  }

  try {
    const fetchFn = typeof fetch !== 'undefined' ? fetch : globalThis.fetch;

    const reqHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
    };

    try {
      const parsedUrl = new URL(targetUrl);
      if (parsedUrl.hostname.includes('sfr.net') || parsedUrl.hostname.includes('bfm')) {
        reqHeaders['Referer'] = 'https://www.bfmtv.com/';
        reqHeaders['Origin'] = 'https://www.bfmtv.com';
      } else if (parsedUrl.hostname.includes('canalplus')) {
        reqHeaders['Referer'] = 'https://www.canalplus.com/';
        reqHeaders['Origin'] = 'https://www.canalplus.com';
      } else if (parsedUrl.hostname.includes('pluto.tv') || parsedUrl.hostname.includes('pluto')) {
        reqHeaders['Referer'] = 'https://pluto.tv/';
        reqHeaders['Origin'] = 'https://pluto.tv';
      } else if (parsedUrl.hostname.includes('arte.tv')) {
        reqHeaders['Referer'] = 'https://www.arte.tv/';
      } else if (parsedUrl.hostname.includes('france24')) {
        reqHeaders['Referer'] = 'https://www.france24.com/';
      } else {
        reqHeaders['Referer'] = `${parsedUrl.protocol}//${parsedUrl.hostname}/`;
      }
    } catch (e) {}

    const clientRange = event.headers ? (event.headers.range || event.headers.Range) : null;
    if (clientRange) {
      reqHeaders['Range'] = clientRange;
    }

    let response = await fetchFn(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: reqHeaders
    });

    if (!response.ok && (response.status === 403 || response.status === 400)) {
      delete reqHeaders['Referer'];
      delete reqHeaders['Origin'];
      response = await fetchFn(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: reqHeaders
      });
    }

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
          "Access-Control-Allow-Methods": "GET, OPTIONS"
        },
        body: JSON.stringify({ error: `Erreur distante HTTP ${response.status}`, targetUrl })
      };
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isText = (contentType.includes('text') || 
                   contentType.includes('json') || 
                   contentType.includes('xml') || 
                   contentType.includes('mpegurl') || 
                   targetUrl.includes('.m3u8') || 
                   targetUrl.includes('.json')) && 
                   !targetUrl.includes('.ts');

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
