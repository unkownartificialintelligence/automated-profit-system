import { useEffect, useState } from 'react';
import { analytics, automation, trends } from '../services/api';
import { TrendingUp, DollarSign, Package, Activity, Zap, Eye } from 'lucide-react';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [automationStatus, setAutomationStatus] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dash, auto, trendData] = await Promise.all([
        analytics.getDashboard(),
        automation.getStatus(),
        trends.getTrending()
      ]);
      setDashboardData(dash.data.dashboard);
      setAutomationStatus(auto.data.automation);
      setTrendingProducts(trendData.data.trends.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-xl">Loading...</div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Jerzii AI Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<DollarSign className="w-8 h-8" />} title="Total Revenue" value={`$${dashboardData?.totalRevenue || 0}`} color="bg-green-500" />
        <StatCard icon={<TrendingUp className="w-8 h-8" />} title="Total Profit" value={`$${dashboardData?.totalProfit || 0}`} color="bg-blue-500" />
        <StatCard icon={<Package className="w-8 h-8" />} title="Total Orders" value={dashboardData?.totalOrders || 0} color="bg-purple-500" />
        <StatCard icon={<Activity className="w-8 h-8" />} title="Profit Margin" value={dashboardData?.profitMargin || '0%'} color="bg-orange-500" />
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-500" />Automation Status</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${automationStatus?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{automationStatus?.active ? 'Active' : 'Inactive'}</span>
        </div>
        {automationStatus?.active && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {automationStatus.jobs?.map((job, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600 capitalize">{job.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="text-xs text-green-600 mt-1">Running</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Eye className="w-6 h-6 text-blue-500" />Trending Products</h2>
        <div className="space-y-3">
          {trendingProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div><div className="font-semibold">{product.keyword}</div><div className="text-sm text-gray-600">{product.articles} articles</div></div>
              <div className="text-right"><div className="font-bold text-blue-600">{product.traffic}</div><div className="text-xs text-gray-500">Traffic</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`${color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
      <div className="text-gray-600 text-sm mb-1">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
