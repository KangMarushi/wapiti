import axios from "axios";

let cache: Record<string, number> = {};
let lastFetched: number = 0;

export async function fetchMutualFundPrice(schemeCode: string) {
  const now = Date.now();
  if (!lastFetched || now - lastFetched > 1000 * 60 * 60) {
    const res = await axios.get("https://www.amfiindia.com/spages/NAVAll.txt");
    const lines = res.data.split("\n");

    lines.forEach(line => {
      const parts = line.split(";");
      if (parts.length >= 5) {
        const code = parts[0].trim();
        const nav = parseFloat(parts[4]);
        if (!isNaN(nav)) {
          cache[code] = nav;
        }
      }
    });

    lastFetched = now;
  }

  return cache[schemeCode] || null;
}
