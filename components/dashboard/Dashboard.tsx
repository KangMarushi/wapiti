import PortfolioBreakdownChart from "../charts/PortfolioBreakdownChart";
import PortfolioGrowthChart from "../charts/PortfolioGrowthChart";
import InsightsCard from "./InsightsCard";

export default function Dashboard({ breakdown, growth, insights }) {
  return (
    <div className="p-6 space-y-6">
      <InsightsCard insights={insights} />
      <div className="grid md:grid-cols-2 gap-6">
        <PortfolioBreakdownChart data={breakdown} />
        <PortfolioGrowthChart history={growth} />
      </div>
    </div>
  );
}
