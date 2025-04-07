const express = require("express");
const router = express.Router();
const yahooFinance = require("yahoo-finance2").default;
const { fetchMutualFundPrice } = require("../lib/tickers/mutualFunds");
const { fetchCryptoPrice } = require("../lib/tickers/crypto");

// GET /api/ticker?symbol=AAPL&type=stock
router.get("/", async (req, res) => {
    try {
        const { symbol, type = "stock" } = req.query;
        
        if (!symbol) {
            return res.status(400).json({ error: "Symbol parameter is required" });
        }

        if (type === "mutual_fund") {
            console.log(`Fetching mutual fund data for scheme: ${symbol}`);
            try {
                const result = await fetchMutualFundPrice(symbol);
                if (!result) {
                    console.log(`Mutual fund not found for scheme: ${symbol}`);
                    return res.status(404).json({ 
                        error: "Mutual fund not found",
                        message: `No data found for scheme code: ${symbol}. Please verify the scheme code is correct.`
                    });
                }
                return res.json({
                    symbol,
                    price: result.price,
                    name: result.name,
                    type: "mutual_fund",
                    lastUpdated: result.lastUpdated
                });
            } catch (mfError) {
                console.error(`Mutual fund fetch error for ${symbol}:`, mfError);
                return res.status(500).json({ 
                    error: "Failed to fetch mutual fund data",
                    message: mfError.message
                });
            }
        }

        if (type === "crypto") {
            console.log(`Fetching crypto data for: ${symbol}`);
            try {
                const result = await fetchCryptoPrice(symbol.toLowerCase());
                if (!result || result.price === null) {
                    console.log(`Cryptocurrency not found: ${symbol}`);
                    return res.status(404).json({ 
                        error: "Cryptocurrency not found",
                        message: `No data found for cryptocurrency: ${symbol}. Please verify the coin ID is correct.`
                    });
                }
                return res.json({
                    symbol,
                    price: result.price,
                    type: "crypto",
                    currency: "inr",
                    lastUpdated: result.lastUpdated
                });
            } catch (cryptoError) {
                // Check if it's a rate limit error
                if (cryptoError.message.includes('429')) {
                    return res.status(429).json({
                        error: "Rate limit exceeded",
                        message: "Too many requests to the crypto API. Please try again in a minute."
                    });
                }
                console.error(`Crypto fetch error for ${symbol}:`, cryptoError);
                return res.status(500).json({ 
                    error: "Failed to fetch cryptocurrency data",
                    message: cryptoError.message
                });
            }
        }

        // Handle stocks using Yahoo Finance
        try {
            const result = await yahooFinance.quoteSummary(symbol, {
                modules: ["price", "summaryDetail"]
            });

            const tickerData = {
                symbol: symbol,
                type: "stock",
                price: result.price.regularMarketPrice,
                change: result.price.regularMarketChange,
                changePercent: result.price.regularMarketChangePercent,
                volume: result.price.regularMarketVolume,
                high: result.summaryDetail.dayHigh,
                low: result.summaryDetail.dayLow,
                open: result.price.regularMarketOpen,
                previousClose: result.price.regularMarketPreviousClose
            };

            res.json(tickerData);
        } catch (stockError) {
            console.error(`Stock fetch error for ${symbol}:`, stockError);
            return res.status(500).json({ 
                error: "Failed to fetch stock data",
                message: stockError.message
            });
        }
    } catch (error) {
        console.error(`General error in ticker route:`, error);
        res.status(500).json({ 
            error: "Failed to fetch ticker data",
            message: error.message
        });
    }
});

module.exports = router; 