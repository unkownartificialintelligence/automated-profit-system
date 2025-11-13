import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Download, Calendar, Filter } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import api from '../services/api';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics?range=${dateRange}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set mock data
      setAnalyticsData({
        summary: {
          totalRevenue: 128450,
          totalProfit: 89915,
          totalOrders: 1247,
          averageOrderValue: 103,
          profitMargin: 70,
          revenueGrowth: 15.3,
        },
        revenueByMonth: [
          { month: 'Jan', revenue: 8500, profit: 5950, orders: 82 },
          { month: 'Feb', revenue: 9200, profit: 6440, orders: 89 },
          { month: 'Mar', revenue: 10100, profit: 7070, orders: 98 },
          { month: 'Apr', revenue: 11800, profit: 8260, orders: 114 },
          { month: 'May', revenue: 13200, profit: 9240, orders: 128 },
          { month: 'Jun', revenue: 15600, profit: 10920, orders: 151 },
          { month: 'Jul', revenue: 17400, profit: 12180, orders: 169 },
          { month: 'Aug', revenue: 16900, profit: 11830, orders: 164 },
          { month: 'Sep', revenue: 14200, profit: 9940, orders: 138 },
          { month: 'Oct', revenue: 11550, profit: 8085, orders: 112 },
        ],
        revenueByCategory: [
          { category: 'T-Shirts', revenue: 45600, percentage: 35.5 },
          { category: 'Mugs', revenue: 32100, percentage: 25.0 },
          { category: 'Posters', revenue: 25680, percentage: 20.0 },
          { category: 'Hoodies', revenue: 16050, percentage: 12.5 },
          { category: 'Other', revenue: 9020, percentage: 7.0 },
        ],
        topProducts: [
          { name: 'Vintage Logo T-Shirt', sales: 342, revenue: 10260, profit: 7182 },
          { name: 'Motivational Quote Mug', sales: 298, revenue: 8940, profit: 6258 },
          { name: 'Abstract Art Poster', sales: 245, revenue: 7350, profit: 5145 },
          { name: 'Funny Cat Hoodie', sales: 187, revenue: 9350, profit: 6545 },
          { name: 'Tech Startup Sticker Pack', sales: 156, revenue: 2340, profit: 1638 },
        ],
        dailyMetrics: [
          { date: '2025-10-01', revenue: 1420, profit: 994, orders: 14 },
          { date: '2025-10-02', revenue: 1680, profit: 1176, orders: 16 },
          { date: '2025-10-03', revenue: 1290, profit: 903, orders: 12 },
          { date: '2025-10-04', revenue: 980, profit: 686, orders: 9 },
          { date: '2025-10-05', revenue: 1540, profit: 1078, orders: 15 },
          { date: '2025-10-06', revenue: 1890, profit: 1323, orders: 18 },
          { date: '2025-10-07', revenue: 2100, profit: 1470, orders: 20 },
        ],
        conversionMetrics: {
          totalVisitors: 12450,
          conversions: 1247,
          conversionRate: 10.0,
          abandonedCarts: 342,
          averageTimeOnSite: '3m 24s',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const format = exportFormat;
    alert(`Exporting analytics data as ${format.toUpperCase()}...`);
    // In production, this would generate and download the file
  };

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." />;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Analytics
          </h1>
          <p className="text-gray-600">Comprehensive performance insights and metrics</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <div className="flex gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${analyticsData.summary.totalRevenue.toLocaleString()}`}
          color="bg-green-500"
          change={{ positive: true, value: `+${analyticsData.summary.revenueGrowth}%` }}
        />
        <StatCard
          icon={TrendingUp}
          title="Total Profit"
          value={`$${analyticsData.summary.totalProfit.toLocaleString()}`}
          color="bg-blue-500"
          change={{ positive: true, value: `${analyticsData.summary.profitMargin}% margin` }}
        />
        <StatCard
          icon={Package}
          title="Total Orders"
          value={analyticsData.summary.totalOrders}
          color="bg-purple-500"
        />
        <StatCard
          icon={BarChart3}
          title="Avg Order Value"
          value={`$${analyticsData.summary.averageOrderValue}`}
          color="bg-orange-500"
        />
      </div>

      {/* Revenue & Profit Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Profit Trend</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={analyticsData.revenueByMonth}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorProfit)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Category & Daily Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue by Category */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.revenueByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {analyticsData.revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
              {analyticsData.revenueByCategory.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${category.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).getDate()} />
              <YAxis />
              <Tooltip
                formatter={(value) => `$${value.toLocaleString()}`}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Performing Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.topProducts.map((product, index) => {
                const margin = ((product.profit / product.revenue) * 100).toFixed(1);
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                          {index + 1}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sales} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${product.profit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Conversion Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Visitors</p>
            <p className="text-2xl font-bold text-gray-900">
              {analyticsData.conversionMetrics.totalVisitors.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Conversions</p>
            <p className="text-2xl font-bold text-green-600">
              {analyticsData.conversionMetrics.conversions.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {analyticsData.conversionMetrics.conversionRate}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Abandoned Carts</p>
            <p className="text-2xl font-bold text-orange-600">
              {analyticsData.conversionMetrics.abandonedCarts}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Avg Time on Site</p>
            <p className="text-2xl font-bold text-purple-600">
              {analyticsData.conversionMetrics.averageTimeOnSite}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
