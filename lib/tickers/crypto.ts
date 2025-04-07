import axios from "axios";

export async function fetchCryptoPrice(coinId: string) {
  try {
    const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: "inr",
      },
    });

    return {
      price: res.data[coinId]?.inr || null,
    };
  } catch (err) {
    console.error(`Error fetching crypto price for ${coinId}:`, err);
    return null;
  }
}
