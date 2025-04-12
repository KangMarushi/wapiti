import { useState } from "react";

interface TickerSelectorProps {
  assetType: string;
  onTickerSelected: (ticker: string) => void;
}

export default function TickerSelector({ assetType, onTickerSelected }: TickerSelectorProps) {
  const [ticker, setTicker] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setIsSubmitting(true);
    try {
      // Validate ticker exists by trying to fetch its price
      const response = await fetch(`/api/ticker?symbol=${ticker}&type=${assetType.toLowerCase()}`);
      const data = await response.json();

      if (data.price) {
        onTickerSelected(ticker);
      } else {
        alert('Invalid ticker symbol');
      }
    } catch (error) {
      alert('Failed to validate ticker');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder={`Enter ${assetType} ticker`}
        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        disabled={isSubmitting || !ticker.trim()}
      >
        {isSubmitting ? 'Checking...' : 'Set Ticker'}
      </button>
    </form>
  );
}
