/**
 * Netlify Serverless IPTV Proxy Function
 * Handles CORS bypass, HTTP header spoofing, Range requests, and binary/text streaming
 * for live TV (BFM, ARTE, Canal+), Pluto TV Stitcher v4 streams, and radio feeds.
 */

exports.handler = async function (event, context) {
  // CORS Preflight Request Handler (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Range, Accept, X-Requested-With",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: ""
    };
  }

  // Extract Target URL from Query Parameters
  let targetUrl = event.queryStringParameters ? event.queryStringParameters.url : null;
  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Missing 'url' parameter." })
    };
  }

  try {
    // Protocol Normalization (force HTTPS if missing)
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // AbortController for strict 7.5s timeout (prevents Netlify's 10s function cutoff)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7500);

    // Custom HTTP Request Headers for restricted streams & anti-bot protection
    const customHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
    };

    // Forward Bearer Authorization header if provided (e.g. Pluto TV JWT Token)
    if (event.headers && (event.headers.authorization || event.headers.Authorization)) {
      customHeaders['Authorization'] = event.headers.authorization || event.headers.Authorization;
    }

    // Origin/Referer Header Spoofing for restricted TV and Pluto networks
    if (targetUrl.includes('pluto.tv') || targetUrl.includes('stitcher')) {
      customHeaders['Origin'] = 'https://pluto.tv';
      customHeaders['Referer'] = 'https://pluto.tv/';
    } else if (targetUrl.includes('bfmtv') || targetUrl.includes('bfm')) {
      customHeaders['Origin'] = 'https://www.bfmtv.com';
      customHeaders['Referer'] = 'https://www.bfmtv.com/';
    } else if (targetUrl.includes('arte.tv') || targetUrl.includes('artesimulcast')) {
      customHeaders['Origin'] = 'https://www.arte.tv';
      customHeaders['Referer'] = 'https://www.arte.tv/';
    } else if (targetUrl.includes('canalplus') || targetUrl.includes('cnews')) {
      customHeaders['Origin'] = 'https://www.canalplus.com';
      customHeaders['Referer'] = 'https://www.canalplus.com/';
    } else if (targetUrl.includes('tf1') || targetUrl.includes('lci')) {
      customHeaders['Origin'] = 'https://www.tf1.fr';
      customHeaders['Referer'] = 'https://www.tf1.fr/';
    }

    // Range Request Forwarding for HLS video scrubbing / TS segments
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

    // Detect Content Type
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const isText = contentType.includes('text') || 
                   contentType.includes('json') || 
                   contentType.includes('xml') || 
                   contentType.includes('mpegurl') || 
                   targetUrl.includes('.m3u') || 
                   targetUrl.includes('.m3u8');

    // Convert response stream to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Build Response Headers
    const responseHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Range, Accept",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Content-Type": contentType,
      "Cache-Control": "no-cache, no-store, must-revalidate"
    };

    // Forward Content-Range header for video range requests if present
    if (response.headers.get("content-range")) {
      responseHeaders["Content-Range"] = response.headers.get("content-range");
    }

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: buffer.toString(isText ? 'utf-8' : 'base64'),
      isBase64Encoded: !isText
    };

  } catch (err) {
    return {
      statusCode: 502,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Proxy Fetch Error", details: err.message })
    };
  }
};
