import { useEffect, useState } from "react";
import { getAllInvestments } from "@/lib/api/portfolio";
import { Investment } from "@/types/types";
import TickerSelector from "@/components/TickerSelector";

export default function DashboardPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      setInvestments(data.investments || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Investment Dashboard</h1>

      {loading ? (
        <p>Loading your investments...</p>
      ) : (
        <>
          <div className="bg-white shadow-md p-4 rounded mb-6">
            <h2 className="text-lg font-semibold mb-2">Total Portfolio Value</h2>
            <p className="text-2xl font-bold text-green-600">₹ {totalValue.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {investments.map((inv) => (
              <div key={inv._id} className="p-4 border rounded shadow-sm bg-white">
                <h3 className="text-lg font-medium">{inv.name}</h3>
                <p className="text-sm text-gray-600">Type: {inv.type}</p>
                <p className="text-sm text-gray-600">Ticker: {inv.ticker || "N/A"}</p>
                <p className="text-md font-semibold mt-2 text-blue-600">₹ {inv.currentValue}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">🔍 Test Ticker Selector</h2>
            <TickerSelector
              assetType="stock"
              onTickerSelected={(ticker) => alert(`Selected Ticker: ${ticker}`)}
            />
          </div>
        </>
      )}
    </div>
  );
}
