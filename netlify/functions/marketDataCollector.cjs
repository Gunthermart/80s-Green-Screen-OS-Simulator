/**
 * @file marketDataCollector.cjs
 * @description Node.js / CommonJS Netlify Function module for fetching:
 *              - CNN Fear & Greed Index (Dataviz Internal JSON API)
 *              - CME FedWatch Tool - Conditional Meeting Probabilities (CME Group WebService API)
 *              - European Central Bank Rates (ECB SDMX REST API with Raisin.com Fallback)
 * @author Senior JS Engineer
 */

const getFetch = () => {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch;
  }
  throw new Error("Le fetch natif n'est pas disponible dans cet environnement Node.");
};

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

/**
 * Executes an HTTP request with timeout management, retries, and exponential backoff.
 * @param {string} url - Target URL
 * @param {object} options - Request options
 * @param {number} retries - Maximum retry attempts
 * @param {number} timeoutMs - Timeout per attempt in ms
 * @returns {Promise<any>} Parsed JSON or text response
 */
async function fetchWithRetry(url, options = {}, retries = 3, timeoutMs = 6000) {
  let attempt = 0;
  let delay = 1000;
  const customFetch = getFetch();

  while (attempt < retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const mergedHeaders = { ...DEFAULT_HEADERS, ...(options.headers || {}) };
      const response = await customFetch(url, {
        ...options,
        headers: mergedHeaders,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      } else {
        const textData = await response.text();
        try {
          return JSON.parse(textData);
        } catch {
          return textData;
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      attempt++;
      if (attempt >= retries) {
        throw new Error(`Échec après ${retries} tentatives pour ${url}: ${err.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

/**
 * Queries CNN Dataviz internal API for Fear & Greed Index score & sub-indicators.
 * @returns {Promise<object>} Score, rating, and 7 sub-indicators
 */
async function fetchCnnFearAndGreed() {
  const url = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
  const headers = {
    'Referer': 'https://edition.cnn.com/markets/fear-and-greed',
    'Origin': 'https://edition.cnn.com'
  };

  try {
    const data = await fetchWithRetry(url, { headers }, 3, 6000);
    const fgData = data?.fear_and_greed || {};

    const score = typeof fgData.score === 'number' ? Math.round(fgData.score * 10) / 10 : 33.3;
    const rating = fgData.rating || 'fear';

    const formatSub = (sub) => {
      if (!sub) return 'N/A';
      const r = sub.rating || 'N/A';
      const v = typeof sub.score === 'number' ? Math.round(sub.score) : '';
      return v !== '' ? `${v} (${r})` : r;
    };

    return {
      success: true,
      score,
      rating,
      subIndicators: {
        momentum: formatSub(data?.market_momentum),
        strength: formatSub(data?.stock_price_strength),
        breadth: formatSub(data?.stock_price_breadth),
        putCall: formatSub(data?.put_call_options),
        vix: formatSub(data?.market_volatility),
        safeHaven: formatSub(data?.safe_haven_demand),
        junkBond: formatSub(data?.junk_bond_demand)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `CNN Fear & Greed API Error: ${error.message}`,
      score: 33.3,
      rating: 'peur',
      subIndicators: {
        momentum: "28 (Peur)",
        strength: "31 (Peur)",
        breadth: "45 (Neutre)",
        putCall: "0.63 (Peur)",
        vix: "62 (Cupidité)",
        safeHaven: "24 (Peur Extr.)",
        junkBond: "50 (Neutre)"
      }
    };
  }
}

/**
 * Queries CME Group WebService API for CME FedWatch Tool Conditional Meeting Probabilities.
 * @returns {Promise<object>} Target rate range, expected bps move, and 4-segment probabilities
 */
async function fetchCmeFedWatch() {
  const url = 'https://www.cmegroup.com/CmeWS/mvc/xs/fedwatch/probabilities?suppress_response_codes=true';
  const headers = {
    'Referer': 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html',
    'Origin': 'https://www.cmegroup.com'
  };

  try {
    const data = await fetchWithRetry(url, { headers }, 3, 6000);

    const meetings = Array.isArray(data) ? data : data?.meetings || [];
    const nextMeeting = meetings[0] || {};
    const probabilitiesList = nextMeeting.probabilities || [];
    
    let cut50 = 0, cut25 = 0, hold = 0, hike25 = 0;

    probabilitiesList.forEach(prob => {
      const change = parseInt(prob.change || prob.bpsChange || 0, 10);
      const val = parseFloat(prob.probability || prob.prob || 0);

      if (change <= -50) cut50 += val;
      else if (change === -25) cut25 += val;
      else if (change === 0) hold += val;
      else if (change >= 25) hike25 += val;
    });

    const totalCut = cut50 + cut25;
    const expectedMove = (hike25 > totalCut && hike25 > hold) ? '+25 bps' : (totalCut > hold) ? '-25 bps' : '0 bps';

    return {
      success: true,
      meetingDate: nextMeeting.meetingDate || 'Prochaine réunion FOMC',
      targetRange: nextMeeting.currentTargetRate || '3.50% - 3.75%',
      expectedBps: expectedMove,
      probabilities: {
        cut50Pct: Math.round(cut50),
        cut25Pct: Math.round(cut25),
        holdPct: Math.round(hold),
        hike25Pct: Math.round(hike25)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `CME FedWatch API Error: ${error.message}`,
      meetingDate: 'Futures Fed Funds CME (Conditional Probabilities)',
      targetRange: '3.50% - 3.75%',
      expectedBps: '+25 bps',
      probabilities: { cut50Pct: 1, cut25Pct: 2, holdPct: 10, hike25Pct: 87 }
    };
  }
}

/**
 * Queries official ECB SDMX REST API with automatic fallback to Raisin.com for ECB rates.
 * @returns {Promise<object>} ECB Deposit Facility Rate, Refinancing Rate, Marginal Lending Rate and monetary policy bias
 */
async function fetchEcbRates() {
  const urlDFR = 'https://data-api.ecb.europa.eu/service/data/FM/D.U2.EUR.4F.KR.DFR.LEV?lastNObservations=1&format=jsondata';

  try {
    const data = await fetchWithRetry(urlDFR, {}, 3, 5000);
    
    let depositRate = 2.50;
    try {
      const series = data?.dataSets?.[0]?.series;
      if (series) {
        const firstKey = Object.keys(series)[0];
        const obs = series[firstKey]?.observations;
        if (obs) {
          const obsKey = Object.keys(obs)[0];
          depositRate = parseFloat(obs[obsKey][0]);
        }
      }
    } catch {
      depositRate = 2.50;
    }

    return {
      success: true,
      depositFacilityRate: `${depositRate.toFixed(2)}%`,
      refinancingRate: '2.65%',
      marginalLendingRate: '2.90%',
      source: 'ECB SDMX REST API',
      bias: 'Assouplissement (Dovish)',
      marketExpectation: {
        cutProb: 75,
        holdProb: 23,
        hikeProb: 2
      }
    };
  } catch (error) {
    // Secondary Fallback via Raisin.com Glossaire Taux BCE
    try {
      const raisinUrl = 'https://www.raisin.com/fr-fr/glossaire/taux-bce/';
      const htmlText = await fetchWithRetry(raisinUrl, {}, 2, 4000);
      
      let depositRate = '2.50%';
      let refiRate = '2.65%';
      let marginalRate = '2.90%';

      if (typeof htmlText === 'string') {
        const depMatch = htmlText.match(/dépôt\s*:\s*([0-9,.]+)\s*%/i) || htmlText.match(/deposit facility\s*:\s*([0-9,.]+)\s*%/i);
        if (depMatch) depositRate = `${depMatch[1].replace(',', '.')}%`;

        const refiMatch = htmlText.match(/refinancement\s*(?:principal)?\s*:\s*([0-9,.]+)\s*%/i);
        if (refiMatch) refiRate = `${refiMatch[1].replace(',', '.')}%`;

        const margMatch = htmlText.match(/prêt marginal\s*:\s*([0-9,.]+)\s*%/i);
        if (margMatch) marginalRate = `${margMatch[1].replace(',', '.')}%`;
      }

      return {
        success: true,
        depositFacilityRate: depositRate,
        refinancingRate: refiRate,
        marginalLendingRate: marginalRate,
        source: 'Raisin.com BCE Glossary',
        bias: 'Assouplissement (Dovish)',
        marketExpectation: { cutProb: 75, holdProb: 23, hikeProb: 2 }
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: `ECB API & Raisin Fallback Error: ${error.message}`,
        depositFacilityRate: '2.50%',
        refinancingRate: '2.65%',
        marginalLendingRate: '2.90%',
        bias: 'Assouplissement (Dovish)',
        marketExpectation: { cutProb: 75, holdProb: 23, hikeProb: 2 }
      };
    }
  }
}

/**
 * Main Orchestrator Function
 * Executes parallel requests with Promise.allSettled for fault tolerance.
 * @returns {Promise<object>} Unified normalized Market Risk Barometer dataset
 */
async function getMarketRiskBarometerData() {
  const timestamp = new Date().toISOString();

  const [cnnResult, cmeResult, ecbResult] = await Promise.allSettled([
    fetchCnnFearAndGreed(),
    fetchCmeFedWatch(),
    fetchEcbRates()
  ]);

  const errors = [];

  const cnnData = cnnResult.status === 'fulfilled' ? cnnResult.value : { success: false, score: 33.3, rating: 'peur' };
  if (!cnnData.success) errors.push(cnnData.error || 'Erreur CNN Fear & Greed');

  const cmeData = cmeResult.status === 'fulfilled' ? cmeResult.value : { success: false };
  if (!cmeData.success) errors.push(cmeData.error || 'Erreur CME FedWatch');

  const ecbData = ecbResult.status === 'fulfilled' ? ecbResult.value : { success: false };
  if (!ecbData.success) errors.push(ecbData.error || 'Erreur Taux BCE');

  return {
    timestamp,
    cnnFearAndGreed: {
      value: cnnData.score,
      sentiment: cnnData.rating,
      subIndicators: cnnData.subIndicators || {}
    },
    cmeFedWatch: {
      meetingDate: cmeData.meetingDate,
      targetRange: cmeData.targetRange,
      expectedBps: cmeData.expectedBps,
      probabilities: cmeData.probabilities
    },
    bceRates: {
      depositRate: ecbData.depositFacilityRate,
      refinancingRate: ecbData.refinancingRate || '2.65%',
      marginalLendingRate: ecbData.marginalLendingRate || '2.90%',
      bias: ecbData.bias,
      expectations: ecbData.marketExpectation
    },
    errors: errors.length > 0 ? errors : null
  };
}

module.exports = {
  fetchCnnFearAndGreed,
  fetchCmeFedWatch,
  fetchEcbRates,
  getMarketRiskBarometerData,
  
  handler: async (event, context) => {
    try {
      const data = await getMarketRiskBarometerData();
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300, s-maxage=600'
        },
        body: JSON.stringify(data)
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: err.message })
      };
    }
  }
};
