export default function InsightsCard({ insights }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-green-100 p-4 rounded-xl shadow">
        <p className="text-sm">Avg. Monthly Investment</p>
        <h2 className="text-xl font-bold">₹{insights.avgMonthly}</h2>
      </div>
      <div className="bg-blue-100 p-4 rounded-xl shadow">
        <p className="text-sm">Portfolio Change (Today)</p>
        <h2 className="text-xl font-bold">{insights.changeToday}%</h2>
      </div>
      <div className="bg-yellow-100 p-4 rounded-xl shadow">
        <p className="text-sm">Top Gainer</p>
        <h2 className="text-md">{insights.topGainer}</h2>
      </div>
      <div className="bg-red-100 p-4 rounded-xl shadow">
        <p className="text-sm">Top Loser</p>
        <h2 className="text-md">{insights.topLoser}</h2>
      </div>
    </div>
  );
}
