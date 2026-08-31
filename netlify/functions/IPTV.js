exports.handler = async function (event, context) {
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

  let targetUrl = event.queryStringParameters ? event.queryStringParameters.url : null;
  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Paramètre 'url' manquant" })
    };
  }

  try {
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7500);

    const customHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': '*/*'
    };

    if (targetUrl.includes('pluto.tv') || targetUrl.includes('stitcher')) {
      customHeaders['Origin'] = 'https://pluto.tv';
      customHeaders['Referer'] = 'https://pluto.tv/';
    } else if (targetUrl.includes('bfmtv') || targetUrl.includes('bfm')) {
      customHeaders['Origin'] = 'https://www.bfmtv.com';
      customHeaders['Referer'] = 'https://www.bfmtv.com/';
    } else if (targetUrl.includes('arte.tv')) {
      customHeaders['Origin'] = 'https://www.arte.tv';
      customHeaders['Referer'] = 'https://www.arte.tv/';
    }

    if (event.headers && (event.headers.range || event.headers.Range)) {
      customHeaders['Range'] = event.headers.range || event.headers.Range;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: customHeaders,
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const isText = contentType.includes('text') || 
                   contentType.includes('json') || 
                   contentType.includes('xml') || 
                   contentType.includes('mpegurl') || 
                   targetUrl.includes('.m3u') || 
                   targetUrl.includes('.m3u8');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      statusCode: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Content-Type": contentType,
        "Cache-Control": "no-cache"
      },
      body: buffer.toString(isText ? 'utf-8' : 'base64'),
      isBase64Encoded: !isText
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Proxy Fetch Error", details: err.message })
    };
  }
};
