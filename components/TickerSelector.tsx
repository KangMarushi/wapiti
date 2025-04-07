import { useState } from "react";

type Props = {
  onTickerSelected: (ticker: string) => void;
  assetType: "stock" | "mutual" | "crypto";
};

export default function TickerSelector({ onTickerSelected, assetType }: Props) {
  const [ticker, setTicker] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onTickerSelected(ticker.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder={`Enter ${assetType} ticker`}
        className="border p-2 rounded w-full"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Set Ticker
      </button>
    </form>
  );
}
