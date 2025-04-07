const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;

// Fetch stock/mutual fund prices from Yahoo Finance
const getPriceFromYahoo = async (symbol) => {
  try {
    const result = await yahooFinance.quoteSummary(symbol, { modules: ["price"] });
    return result.price.regularMarketPrice;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}: ${error.message}`);
    return null;
  }
};

// Fetch crypto prices from CoinGecko
const getCryptoPrice = async (cryptoId) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=inr`);
    return response.data[cryptoId].inr;
  } catch (error) {
    console.error(`Error fetching crypto data: ${error.message}`);
    return null;
  }
};

// Fetch gold price (using a dummy API for now)
const getGoldPrice = async () => {
  try {
    const response = await axios.get("https://www.goldapi.io/api/XAU/INR", {
      headers: { "x-access-token": process.env.GOLD_API_KEY },
    });
    return response.data.price;
  } catch (error) {
    console.error(`Error fetching gold data: ${error.message}`);
    return null;
  }
};

module.exports = { getPriceFromYahoo, getCryptoPrice, getGoldPrice };
