import { useEffect, useState, useMemo } from "react";
import TickerSelector from "../components/TickerSelector";
import AlertBell from "../components/AlertBell";
import StatementUpload from "../components/StatementUpload";
import AddInvestmentForm from "../components/AddInvestmentForm";
import { Investment } from "../types/types";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend,
  LineChart, Line, CartesianGrid
} from "recharts";
import { 
  FiTrendingUp, 
  FiPieChart, 
  FiDollarSign, 
  FiPackage,
  FiPlus,
  FiSearch,
  FiRefreshCw
} from "react-icons/fi";
import PortfolioInsights from '../components/PortfolioInsights';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from "@mui/material";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#f97316", "#14b8a6"];
const ASSET_TYPES = ["Stock", "Mutual Fund", "PPF", "NPS", "FD", "Gold", "Crypto"];

export default function DashboardPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "type" | "value" | "profit">("name");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null);

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
  const pieData = getPieData(investments);
  const trendData = mockTrendData(investments);

  // Filter and sort investments
  const filteredInvestments = investments
    .filter((inv) => {
      const matchesTab = inv.type === activeTab;
      const matchesSearch = searchQuery === "" || 
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.ticker?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });

  const sortedInvestments = useMemo(() => {
    return [...filteredInvestments].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'type':
          return sortOrder === 'asc' ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
        case 'value':
          const aValue = a.currentValue || 0;
          const bValue = b.currentValue || 0;
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        case 'profit':
          const aProfit = a.profitLoss || 0;
          const bProfit = b.profitLoss || 0;
          return sortOrder === 'asc' ? aProfit - bProfit : bProfit - aProfit;
        default:
          return 0;
      }
    });
  }, [filteredInvestments, sortBy, sortOrder]);

  function getPieData(investments: Investment[]) {
    const grouped: { [key: string]: number } = {};
    for (const inv of investments) {
      grouped[inv.type] = (grouped[inv.type] || 0) + (inv.currentValue || 0);
    }
    return Object.entries(grouped).map(([type, value]) => ({ type, value }));
  }

  function mockTrendData(investments: Investment[]) {
    const monthly: { [key: string]: number } = {};
    for (const inv of investments) {
      const date = new Date(inv.date || new Date());
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      monthly[key] = (monthly[key] || 0) + (inv.amount || 0);
    }
    return Object.entries(monthly).map(([month, value]) => ({ month, value }));
  }

  // Add update function
  async function handleUpdate(id: string, updates: Partial<Investment>) {
    try {
      const res = await fetch(`/api/investments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) throw new Error('Failed to update investment');

      // Refresh investments
      const updatedInv = await res.json();
      setInvestments(investments.map(inv => 
        inv._id === id ? { ...inv, ...updatedInv } : inv
      ));
      setEditingInvestment(null);
    } catch (error) {
      alert('Failed to update investment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Add new investment handler
  async function handleAddInvestment(investment: Omit<Investment, '_id'>) {
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investment)
      });

      if (!res.ok) throw new Error('Failed to add investment');

      const newInvestment = await res.json();
      setInvestments([...investments, newInvestment]);
    } catch (error) {
      throw error;
    }
  }

  const handleUpdatePrices = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/update-prices", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to update prices");
      const updatedData = await response.json();
      setInvestments(updatedData.investments);
    } catch (error) {
      console.error("Error updating prices:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setIsAddModalOpen(true);
  };

  const handleDeleteInvestment = async (_id: string) => {
    setIsDeleteModalOpen(true);
    setSelectedInvestment(_id);
  };

  const confirmDelete = async () => {
    if (!selectedInvestment) return;
    
    try {
      const response = await fetch(`/api/investments/${selectedInvestment}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setInvestments(investments.filter((inv) => inv._id !== selectedInvestment));
        setIsDeleteModalOpen(false);
        setSelectedInvestment(null);
      } else {
        console.error('Failed to delete investment');
      }
    } catch (error) {
      console.error('Error deleting investment:', error);
    }
  };

  const getProfitLossColor = (value: number): string => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Investment Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search investments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <AlertBell />
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Investment</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Portfolio Value</p>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiDollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalValue.toLocaleString()}</p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              <span className="font-medium">12.5%</span>
              <span className="ml-2 text-gray-500">vs last month</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Investments</p>
              <div className="p-2 bg-green-50 rounded-lg">
                <FiPackage className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{investments.length}</p>
            <p className="mt-2 text-sm text-gray-500">Across {Object.keys(pieData).length} categories</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Overall P&L</p>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FiTrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ₹{investments.reduce((sum, inv) => sum + (inv.profitLoss || 0), 0).toLocaleString()}
            </p>
            <div className="mt-2 flex items-center text-sm">
              {(() => {
                const totalPL = investments.reduce((sum, inv) => sum + (inv.profitLoss || 0), 0);
                const totalCost = investments.reduce((sum, inv) => sum + (inv.totalCost || 0), 0);
                const plPercentage = (totalPL / totalCost) * 100;
                const isPositive = plPercentage > 0;
                return (
                  <span className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? "↑" : "↓"} {Math.abs(plPercentage).toFixed(2)}%
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Best Performing</p>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <FiPieChart className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {(() => {
                const bestInv = [...investments].sort((a, b) => 
                  (b.profitLossPercentage || 0) - (a.profitLossPercentage || 0)
                )[0];
                return bestInv?.name || "N/A";
              })()}
            </p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              <span className="font-medium">
                {(() => {
                  const bestInv = [...investments].sort((a, b) => 
                    (b.profitLossPercentage || 0) - (a.profitLossPercentage || 0)
                  )[0];
                  return bestInv ? `${bestInv.profitLossPercentage?.toFixed(2)}%` : "N/A";
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Portfolio Distribution</h2>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiPieChart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Investment Trend</h2>
              <div className="p-2 bg-green-50 rounded-lg">
                <FiTrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Add PortfolioInsights component after the existing charts */}
        <Grid item xs={12}>
          <PortfolioInsights />
        </Grid>

        {/* Filters and Table Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {ASSET_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === type
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "type" | "value" | "profit")}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700"
              >
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="value">Value</option>
                <option value="profit">Profit/Loss</option>
              </select>
              <button
                onClick={handleUpdatePrices}
                disabled={isUpdating}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isUpdating 
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                <FiRefreshCw className={`w-5 h-5 ${isUpdating ? "animate-spin" : ""}`} />
                <span>{isUpdating ? "Updating..." : "Update Prices"}</span>
              </button>
            </div>
          </div>

          {/* Investment Table */}
          <div className="mt-8 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedInvestments.map((investment) => (
                        <tr key={investment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{investment.name}</div>
                            {investment.ticker && (
                              <div className="text-sm text-gray-500">{investment.ticker}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {investment.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {investment.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${investment.costBasis.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${(investment.currentValue || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${getProfitLossColor(investment.profitLoss || 0)}`}>
                              ${(investment.profitLoss || 0).toFixed(2)}
                            </div>
                            <div className={`text-xs ${getProfitLossColor(investment.profitLossPercentage || 0)}`}>
                              {(investment.profitLossPercentage || 0).toFixed(2)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {investment.lastUpdated ? new Date(investment.lastUpdated).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditInvestment(investment)}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteInvestment(investment._id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-150"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statement Upload */}
        <StatementUpload />

        {/* Add Investment Modal */}
        <AddInvestmentForm
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddInvestment}
        />
      </main>
    </div>
  );
}
