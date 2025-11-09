import { useEffect, useState } from 'react';
import { admin } from '../services/adminApi';
import MarketingDashboard from './MarketingDashboard';
import {
  Users, DollarSign, TrendingUp, Activity, Server, Clock,
  Eye, EyeOff, Edit, Trash2, Plus, RefreshCw, Shield, UserCheck, Megaphone
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [clients, setClients] = useState([]);
  const [activities, setActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dash, clientList, activityList, health] = await Promise.all([
        admin.getDashboard(),
        admin.getClients(),
        admin.getActivity(),
        admin.getSystemHealth()
      ]);

      setDashboardData(dash.data.dashboard);
      setClients(clientList.data.clients);
      setActivities(activityList.data.activities);
      setSystemHealth(health.data.health);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-8 h-8 text-purple-600" />
              Admin Monitoring Dashboard
            </h1>
            <p className="text-gray-600 mt-1">System-wide monitoring and management</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Total Clients"
            value={dashboardData?.totalClients || 0}
            subtitle={`${dashboardData?.activeClients || 0} active`}
            color="bg-blue-500"
          />
          <StatCard
            icon={<DollarSign className="w-8 h-8" />}
            title="Monthly Revenue (MRR)"
            value={`$${Number(dashboardData?.totalMRR || 0).toLocaleString()}`}
            subtitle="From all clients"
            color="bg-green-500"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Active Subscriptions"
            value={dashboardData?.activeClients || 0}
            subtitle={`${clients.length - (dashboardData?.activeClients || 0)} inactive`}
            color="bg-purple-500"
          />
          <StatCard
            icon={<Server className="w-8 h-8" />}
            title="System Health"
            value={systemHealth?.server === 'online' ? 'Online' : 'Offline'}
            subtitle={`Uptime: ${Math.floor((systemHealth?.uptime || 0) / 60)}m`}
            color="bg-orange-500"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<Activity className="w-4 h-4" />}
              label="Overview"
            />
            <TabButton
              active={activeTab === 'clients'}
              onClick={() => setActiveTab('clients')}
              icon={<Users className="w-4 h-4" />}
              label="Clients"
            />
            <TabButton
              active={activeTab === 'members'}
              onClick={() => setActiveTab('members')}
              icon={<UserCheck className="w-4 h-4" />}
              label="Team Members"
            />
            <TabButton
              active={activeTab === 'marketing'}
              onClick={() => setActiveTab('marketing')}
              icon={<Megaphone className="w-4 h-4" />}
              label="Marketing"
            />
            <TabButton
              active={activeTab === 'activity'}
              onClick={() => setActiveTab('activity')}
              icon={<Clock className="w-4 h-4" />}
              label="Activity Log"
            />
            <TabButton
              active={activeTab === 'system'}
              onClick={() => setActiveTab('system')}
              icon={<Server className="w-4 h-4" />}
              label="System"
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'marketing' ? (
          <MarketingDashboard />
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'overview' && <OverviewTab dashboardData={dashboardData} />}
            {activeTab === 'clients' && <ClientsTab clients={clients} onRefresh={loadDashboard} />}
            {activeTab === 'members' && <MembersTab />}
            {activeTab === 'activity' && <ActivityTab activities={activities} />}
            {activeTab === 'system' && <SystemTab health={systemHealth} dashboardData={dashboardData} />}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, title, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`${color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-gray-600 text-sm mb-1">{title}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
        active
          ? 'text-purple-600 border-b-2 border-purple-600'
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Tab Components
function OverviewTab({ dashboardData }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">System Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Package Distribution */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Package Distribution
          </h3>
          <div className="space-y-2">
            {dashboardData?.packageDistribution?.map((pkg, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="capitalize font-medium">{pkg.package_tier}</span>
                <span className="text-purple-600 font-bold">{pkg.count} clients</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent System Logs */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Recent System Logs
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dashboardData?.recentLogs?.map((log, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <span className={`font-medium ${
                    log.severity === 'error' ? 'text-red-600' :
                    log.severity === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {log.log_type}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientsTab({ clients, onRefresh }) {
  const [showApiKeys, setShowApiKeys] = useState({});

  const toggleApiKey = (clientId) => {
    setShowApiKeys(prev => ({ ...prev, [clientId]: !prev[clientId] }));
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.inactive;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Clients</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-semibold">Company</th>
              <th className="text-left p-3 font-semibold">Contact</th>
              <th className="text-left p-3 font-semibold">Email</th>
              <th className="text-left p-3 font-semibold">Package</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">MRR</th>
              <th className="text-left p-3 font-semibold">API Key</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{client.company_name}</td>
                <td className="p-3">{client.contact_name}</td>
                <td className="p-3 text-sm text-gray-600">{client.email}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm capitalize">
                    {client.package_tier}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm capitalize ${getStatusBadge(client.subscription_status)}`}>
                    {client.subscription_status}
                  </span>
                </td>
                <td className="p-3 font-semibold text-green-600">
                  ${client.monthly_revenue}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleApiKey(client.id)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showApiKeys[client.id] ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span className="font-mono text-xs">{client.printful_api_key || 'Not set'}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        View
                      </>
                    )}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MembersTab() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      // This endpoint needs to be added to the backend
      const response = await admin.getAdmins();
      setMembers(response.data.admins || []);
    } catch (error) {
      console.error('Error loading members:', error);
      // For now, show placeholder data
      setMembers([
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@jerzii.ai',
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading team members...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Team Members</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-semibold">Name</th>
              <th className="text-left p-3 font-semibold">Email</th>
              <th className="text-left p-3 font-semibold">Role</th>
              <th className="text-left p-3 font-semibold">Joined</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{member.name}</td>
                <td className="p-3 text-gray-600">{member.email}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm capitalize">
                    {member.role}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityTab({ activities }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Team Activity Log</h2>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-purple-600 text-white p-2 rounded-full">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{activity.admin_name}</p>
                  <p className="text-sm text-gray-600">
                    {activity.action.replace(/_/g, ' ')}
                    {activity.company_name && ` - ${activity.company_name}`}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SystemTab({ health, dashboardData }) {
  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">System Health & Metrics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Server className="w-5 h-5 text-green-600" />
            Server Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Status</span>
              <span className="font-semibold text-green-600">{health?.server || 'Unknown'}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Database</span>
              <span className="font-semibold text-green-600">{health?.database || 'Unknown'}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Uptime</span>
              <span className="font-semibold">{formatUptime(health?.uptime || 0)}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Memory Usage
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Heap Used</span>
              <span className="font-semibold">{formatBytes(health?.memory?.heapUsed || 0)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Heap Total</span>
              <span className="font-semibold">{formatBytes(health?.memory?.heapTotal || 0)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>RSS</span>
              <span className="font-semibold">{formatBytes(health?.memory?.rss || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Last Updated:</strong> {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Unknown'}
        </p>
      </div>
    </div>
  );
}
