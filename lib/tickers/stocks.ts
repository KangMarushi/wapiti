import yahooFinance from "yahoo-finance2";

export async function fetchStockPrice(ticker: string) {
  try {
    const result = await yahooFinance.quote(ticker);
    return {
      name: result.displayName || result.shortName,
      price: result.regularMarketPrice,
      currency: result.currency,
    };
  } catch (err) {
    console.error(`Error fetching stock ticker ${ticker}:`, err);
    return null;
  }
}
