export async function fetchLivePrice(type: string, ticker: string) {
  const base = "http://localhost:3000/api/ticker";
  const url = `${base}?type=${type}&ticker=${ticker}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data;
}
