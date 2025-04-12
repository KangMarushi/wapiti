import { NextApiRequest, NextApiResponse } from "next";
import { fetchStockPrice } from "../../../lib/tickers/stocks";
import { fetchMutualFundPrice } from "../../../lib/tickers/mutualFunds";
import { fetchCryptoPrice } from "../../../lib/tickers/crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type, ticker } = req.query;

  if (!type || !ticker) {
    return res.status(400).json({ error: "Missing type or ticker" });
  }

  let result;

  if (type === "stock") {
    result = await fetchStockPrice(ticker as string);
  } else if (type === "mutual") {
    result = await fetchMutualFundPrice(ticker as string);
  } else if (type === "crypto") {
    result = await fetchCryptoPrice(ticker as string);
  } else {
    return res.status(400).json({ error: "Unsupported asset type" });
  }

  if (!result) {
    return res.status(404).json({ error: "Price not found" });
  }

  return res.status(200).json({ data: result });
}
