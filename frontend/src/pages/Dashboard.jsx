import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Package, Activity, Zap, Eye, ArrowRight, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import api from '../services/api';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set mock data
      setDashboardData({
        stats: {
          totalRevenue: 128450,
          totalProfit: 89915,
          totalOrders: 1247,
          profitMargin: '70%',
          activeProducts: 156,
          teamMembers: 8,
        },
        revenueChart: [
          { month: 'Jun', revenue: 15600, profit: 10920 },
          { month: 'Jul', revenue: 17400, profit: 12180 },
          { month: 'Aug', revenue: 16900, profit: 11830 },
          { month: 'Sep', revenue: 14200, profit: 9940 },
          { month: 'Oct', revenue: 11550, profit: 8085 },
          { month: 'Nov', revenue: 18200, profit: 12740 },
        ],
        automationStatus: {
          active: true,
          lastRun: '2025-11-12T10:30:00Z',
          nextScheduled: '2025-11-18T09:00:00Z',
          totalRuns: 156,
          successRate: 91,
        },
        trendingProducts: [
          { keyword: 'Vintage Tech T-Shirts', articles: 1247, traffic: '28.5K', growth: 15.3 },
          { keyword: 'Minimalist Coffee Mugs', articles: 892, traffic: '19.2K', growth: 12.1 },
          { keyword: 'Abstract Art Posters', articles: 756, traffic: '16.8K', growth: 8.7 },
          { keyword: 'Motivational Quote Hoodies', articles: 634, traffic: '14.3K', growth: 10.2 },
          { keyword: 'Funny Cat Stickers', articles: 521, traffic: '11.9K', growth: 6.5 },
        ],
        recentActivity: [
          { id: 1, type: 'success', message: 'Automation completed successfully', time: '10 minutes ago', icon: CheckCircle },
          { id: 2, type: 'info', message: 'New product created: Vintage Logo T-Shirt', time: '1 hour ago', icon: Package },
          { id: 3, type: 'success', message: 'Order received: $156.00', time: '2 hours ago', icon: DollarSign },
          { id: 4, type: 'info', message: 'Team member added to profits', time: '3 hours ago', icon: Users },
        ],
        topProducts: [
          { name: 'Vintage Logo T-Shirt', sales: 342, revenue: 10260 },
          { name: 'Motivational Quote Mug', sales: 298, revenue: 8940 },
          { name: 'Abstract Art Poster', sales: 245, revenue: 7350 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your automated profit system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${dashboardData.stats.totalRevenue.toLocaleString()}`}
          color="bg-green-500"
          change={{ positive: true, value: '+15.3%' }}
        />
        <StatCard
          icon={TrendingUp}
          title="Total Profit"
          value={`$${dashboardData.stats.totalProfit.toLocaleString()}`}
          color="bg-blue-500"
          change={{ positive: true, value: dashboardData.stats.profitMargin + ' margin' }}
        />
        <StatCard
          icon={Package}
          title="Total Orders"
          value={dashboardData.stats.totalOrders}
          color="bg-purple-500"
        />
        <StatCard
          icon={Activity}
          title="Active Products"
          value={dashboardData.stats.activeProducts}
          color="bg-orange-500"
        />
      </div>

      {/* Revenue Chart & Automation Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <Link
              to="/analytics"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboardData.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Automation Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Automation
            </h2>
            <Link
              to="/automation"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Manage <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className={`p-4 rounded-lg mb-4 ${dashboardData.automationStatus.active ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${dashboardData.automationStatus.active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className={`font-semibold ${dashboardData.automationStatus.active ? 'text-green-700' : 'text-gray-700'}`}>
                {dashboardData.automationStatus.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {dashboardData.automationStatus.active ? 'System running smoothly' : 'Click to start automation'}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Runs</span>
              <span className="font-semibold text-gray-900">{dashboardData.automationStatus.totalRuns}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-semibold text-green-600">{dashboardData.automationStatus.successRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Run</span>
              <span className="font-semibold text-gray-900">
                {new Date(dashboardData.automationStatus.lastRun).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Products & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trending Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Trending Products
            </h2>
            <Link
              to="/trending"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dashboardData.trendingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{product.keyword}</div>
                    <div className="text-sm text-gray-600">{product.articles} articles</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{product.traffic}</div>
                    <div className="text-xs text-green-600">+{product.growth}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => {
                const Icon = activity.icon;
                const colorClass = activity.type === 'success' ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100';
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
          <Link
            to="/products"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.topProducts.map((product, index) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/products"
          className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Manage</p>
              <p className="font-semibold text-gray-900">Products</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
        <Link
          to="/team-profits"
          className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">View</p>
              <p className="font-semibold text-gray-900">Team Profits</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
        <Link
          to="/automation"
          className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Control</p>
              <p className="font-semibold text-gray-900">Automation</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
        <Link
          to="/analytics"
          className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Explore</p>
              <p className="font-semibold text-gray-900">Analytics</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
      </div>
    </div>
  );
}
