import { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, Award, BarChart } from 'lucide-react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import api from '../services/api';

export default function TeamProfits() {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamProfits();
  }, []);

  const loadTeamProfits = async () => {
    try {
      const response = await api.get('/team-profits');
      setTeamData(response.data);
    } catch (error) {
      console.error('Error loading team profits:', error);
      // Set mock data for demonstration
      setTeamData({
        totalRevenue: 125430,
        totalProfit: 78920,
        teamMembers: 12,
        averageProfit: 6576,
        members: [
          { name: 'John Smith', sales: 42, revenue: 18500, profit: 12100, commission: 2420 },
          { name: 'Sarah Johnson', sales: 38, revenue: 16200, profit: 10890, commission: 2178 },
          { name: 'Mike Davis', sales: 35, revenue: 14800, profit: 9920, commission: 1984 },
          { name: 'Emily Brown', sales: 32, revenue: 13600, profit: 9112, commission: 1822 },
          { name: 'David Wilson', sales: 28, revenue: 11900, profit: 7973, commission: 1595 },
        ],
        monthlyData: [
          { month: 'Jan', revenue: 45000, profit: 28500 },
          { month: 'Feb', revenue: 52000, profit: 32900 },
          { month: 'Mar', revenue: 48000, profit: 30400 },
          { month: 'Apr', revenue: 61000, profit: 38640 },
          { month: 'May', revenue: 70000, profit: 44350 },
          { month: 'Jun', revenue: 125430, profit: 78920 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading team profits..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Profits</h1>
        <p className="text-gray-600">Track team performance and earnings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${(teamData.totalRevenue || 0).toLocaleString()}`}
          color="bg-green-500"
          change={{ positive: true, value: '+12.5%' }}
        />
        <StatCard
          icon={TrendingUp}
          title="Total Profit"
          value={`$${(teamData.totalProfit || 0).toLocaleString()}`}
          color="bg-blue-500"
          change={{ positive: true, value: '+8.3%' }}
        />
        <StatCard
          icon={Users}
          title="Team Members"
          value={teamData.teamMembers || 0}
          color="bg-purple-500"
        />
        <StatCard
          icon={Award}
          title="Avg Profit/Member"
          value={`$${(teamData.averageProfit || 0).toLocaleString()}`}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue & Profit Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-500" />
            Monthly Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={teamData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            Top Performers
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={teamData.members?.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="profit" fill="#8b5cf6" name="Profit" />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Team Members Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamData.members?.map((member, index) => {
                const margin = ((member.profit / member.revenue) * 100).toFixed(1);
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">Rank #{index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{member.sales}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${member.revenue.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">${member.profit.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${member.commission.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        parseFloat(margin) >= 65 ? 'bg-green-100 text-green-800' :
                        parseFloat(margin) >= 55 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
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
    </div>
  );
}
