import { useEffect, useState } from 'react';
import { ListTodo, CheckCircle, Clock, AlertCircle, TrendingUp, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import api from '../services/api';

export default function PersonalQueue() {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonalQueue();
  }, []);

  const loadPersonalQueue = async () => {
    try {
      const response = await api.get('/personal');
      setQueueData(response.data);
    } catch (error) {
      console.error('Error loading personal queue:', error);
      // Set mock data for demonstration
      setQueueData({
        totalTasks: 24,
        completed: 15,
        pending: 6,
        inProgress: 3,
        totalRevenue: 42500,
        tasks: [
          { id: 1, title: 'Create AI-generated product descriptions', status: 'completed', priority: 'high', dueDate: '2025-11-10', revenue: 8500 },
          { id: 2, title: 'Upload new designs to Printful', status: 'in_progress', priority: 'high', dueDate: '2025-11-13', revenue: 12000 },
          { id: 3, title: 'Research trending keywords for Q4', status: 'in_progress', priority: 'medium', dueDate: '2025-11-14', revenue: 0 },
          { id: 4, title: 'Optimize product listings SEO', status: 'pending', priority: 'medium', dueDate: '2025-11-15', revenue: 0 },
          { id: 5, title: 'Launch social media campaign', status: 'pending', priority: 'low', dueDate: '2025-11-16', revenue: 0 },
          { id: 6, title: 'Analyze customer feedback', status: 'completed', priority: 'medium', dueDate: '2025-11-09', revenue: 5200 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading personal queue..." />;
  }

  const chartData = [
    { name: 'Completed', value: queueData.completed, color: '#10b981' },
    { name: 'In Progress', value: queueData.inProgress, color: '#3b82f6' },
    { name: 'Pending', value: queueData.pending, color: '#f59e0b' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Queue</h1>
        <p className="text-gray-600">Manage your tasks and track your personal revenue</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={ListTodo}
          title="Total Tasks"
          value={queueData.totalTasks}
          color="bg-blue-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Completed"
          value={queueData.completed}
          color="bg-green-500"
          change={{ positive: true, value: `${((queueData.completed / queueData.totalTasks) * 100).toFixed(0)}%` }}
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value={queueData.inProgress}
          color="bg-orange-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Personal Revenue"
          value={`$${queueData.totalRevenue.toLocaleString()}`}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Task Distribution Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Completion Rate</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {((queueData.completed / queueData.totalTasks) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Avg. Revenue/Task</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ${(queueData.totalRevenue / queueData.completed).toFixed(0)}
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">High Priority</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {queueData.tasks.filter(t => t.priority === 'high').length}
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Due This Week</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {queueData.tasks.filter(t => t.status !== 'completed').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Task List</h2>
        </div>
        {queueData.tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No Tasks"
            description="You don't have any tasks in your queue yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queueData.tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusIcon(task.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-xs text-gray-500 capitalize">{task.status.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {task.revenue > 0 ? `$${task.revenue.toLocaleString()}` : '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
