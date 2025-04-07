const axios = require("axios");

// Cache to store crypto prices
let priceCache = {};
let lastFetchTime = {};
const CACHE_DURATION = 60 * 1000; // 1 minute cache

async function fetchCryptoPrice(coinId) {
  try {
    const now = Date.now();
    
    // Check cache first
    if (priceCache[coinId] && lastFetchTime[coinId] && (now - lastFetchTime[coinId] < CACHE_DURATION)) {
      console.log(`Using cached price for ${coinId}`);
      return priceCache[coinId];
    }

    console.log(`Fetching fresh price for ${coinId} from CoinGecko`);
    const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: "inr",
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      timeout: 10000
    });

    // Check if we got valid data
    if (!res.data || !res.data[coinId] || !res.data[coinId].inr) {
      console.log(`Invalid or empty response for ${coinId}:`, res.data);
      return null;
    }

    const price = {
      price: res.data[coinId].inr,
      lastUpdated: new Date().toISOString()
    };

    // Update cache
    priceCache[coinId] = price;
    lastFetchTime[coinId] = now;

    return price;
  } catch (err) {
    console.error(`Error fetching crypto price for ${coinId}:`, {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });

    // Handle rate limiting
    if (err.response?.status === 429) {
      console.log('Rate limit hit, using cached data if available');
      if (priceCache[coinId]) {
        return priceCache[coinId];
      }
    }

    // Handle API errors
    if (err.response?.status === 404) {
      console.log(`Cryptocurrency ${coinId} not found`);
      return null;
    }

    throw new Error(`Failed to fetch crypto price: ${err.message}`);
  }
}

// Export the function and cache for potential management
module.exports = { 
  fetchCryptoPrice,
  clearCache: () => {
    priceCache = {};
    lastFetchTime = {};
  }
}; 