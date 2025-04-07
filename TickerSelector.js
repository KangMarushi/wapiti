import { useState, useEffect } from "react";

export default function TickerSelector({ onSelect }) {
  const [tickers, setTickers] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch("/data/tickers.json")
      .then((res) => res.json())
      .then((data) => setTickers(data));
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setFiltered([]);
      return;
    }
    const results = tickers.filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(results);
  }, [query, tickers]);

  const handleSelect = (item) => {
    setQuery(item.name);
    setFiltered([]);
    onSelect(item); // send to parent
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stock name"
        className="w-full p-2 border rounded"
      />
      {filtered.length > 0 && (
        <ul className="absolute bg-white shadow border rounded mt-1 w-full z-10">
          {filtered.map((item, idx) => (
            <li
              key={idx}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              {item.name} ({item.symbol})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
