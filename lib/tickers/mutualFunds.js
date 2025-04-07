const axios = require("axios");

let cache = {};
let lastFetched = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours cache duration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchMutualFundPrice(schemeCode, retryCount = 0) {
  try {
    const now = Date.now();
    
    // Return cached data if available and not expired
    if (cache[schemeCode] && lastFetched && (now - lastFetched < CACHE_DURATION)) {
      console.log(`Using cached NAV for scheme ${schemeCode}`);
      return cache[schemeCode];
    }

    // If cache is expired but we have cached data, use it while fetching new data
    const hasCachedData = cache[schemeCode] !== undefined;
    
    console.log(`Fetching fresh NAV data from AMFI for scheme ${schemeCode}`);
    const res = await axios.get("https://www.amfiindia.com/spages/NAVAll.txt", {
      timeout: 15000,
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      responseType: 'text'
    });

    if (!res.data) {
      console.error("No data received from AMFI");
      if (hasCachedData) {
        console.log("Using cached data due to empty response");
        return cache[schemeCode];
      }
      throw new Error("No data received from AMFI");
    }

    console.log("Processing AMFI NAV data...");
    const lines = res.data.split("\n");
    let foundSchemes = 0;
    let schemeFound = false;

    // Clear the cache if we're fetching fresh data
    cache = {};

    for (const line of lines) {
      const parts = line.split(";");
      if (parts.length >= 5) {
        const code = parts[0].trim();
        const schemeName = parts[3].trim();
        const nav = parseFloat(parts[4]);
        if (!isNaN(nav)) {
          cache[code] = {
            price: nav,
            name: schemeName,
            lastUpdated: new Date().toISOString()
          };
          foundSchemes++;
          if (code === schemeCode) {
            schemeFound = true;
          }
        }
      }
    }

    console.log(`Processed ${foundSchemes} mutual fund schemes`);
    lastFetched = now;

    if (!schemeFound && !cache[schemeCode]) {
      console.log(`Scheme ${schemeCode} not found in AMFI data`);
      if (hasCachedData) {
        console.log("Using cached data as scheme was not found in fresh data");
        return cache[schemeCode];
      }
      return null;
    }

    return cache[schemeCode];
  } catch (error) {
    console.error(`Error fetching mutual fund data:`, {
      message: error.message,
      status: error.response?.status,
      scheme: schemeCode
    });

    // Retry logic for network errors
    if (retryCount < MAX_RETRIES && 
        (error.code === 'ECONNRESET' || 
         error.code === 'ETIMEDOUT' || 
         error.response?.status === 503)) {
      console.log(`Retrying fetch for scheme ${schemeCode} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return fetchMutualFundPrice(schemeCode, retryCount + 1);
    }

    // If we have cached data, use it in case of error
    if (cache[schemeCode]) {
      console.log(`Using cached data for scheme ${schemeCode} due to error`);
      return cache[schemeCode];
    }

    throw new Error(`Failed to fetch mutual fund data: ${error.message}`);
  }
}

// Export the function and cache management utilities
module.exports = {
  fetchMutualFundPrice,
  clearCache: () => {
    cache = {};
    lastFetched = 0;
  },
  getCacheStatus: () => ({
    cacheSize: Object.keys(cache).length,
    lastFetched: lastFetched ? new Date(lastFetched).toISOString() : null
  })
}; 