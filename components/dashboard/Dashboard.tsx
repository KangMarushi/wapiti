import PortfolioBreakdownChart from "../charts/PortfolioBreakdownChart";
import PortfolioGrowthChart from "../charts/PortfolioGrowthChart";
import InsightsCard from "./InsightsCard";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend
} from "recharts";

const COLORS = ["#34d399", "#60a5fa", "#facc15", "#f87171", "#c084fc", "#fdba74"];
  
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

