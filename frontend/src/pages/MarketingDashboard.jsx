import { useEffect, useState } from 'react';
import { marketing } from '../services/marketingApi';
import {
  Mail, Users, TrendingUp, Target, Megaphone, FileText,
  Play, Pause, Edit, Trash2, Plus, Eye, Send, Handshake
} from 'lucide-react';

export default function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await marketing.getDashboard();
      setDashboardData(response.data.dashboard);
    } catch (error) {
      console.error('Error loading marketing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="text-xl">Loading marketing dashboard...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-blue-600" />
            Marketing Automation Hub
          </h1>
          <p className="text-gray-600 mt-1">Automate campaigns for team, customers, clients, partners & sponsors</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Total Contacts"
            value={dashboardData?.contactsByType?.reduce((sum, c) => sum + c.count, 0) || 0}
            subtitle="Across all audiences"
            color="bg-blue-500"
          />
          <StatCard
            icon={<Target className="w-8 h-8" />}
            title="Active Campaigns"
            value={dashboardData?.activeCampaigns || 0}
            subtitle="Currently running"
            color="bg-green-500"
          />
          <StatCard
            icon={<Mail className="w-8 h-8" />}
            title="Emails Sent"
            value={Number(dashboardData?.campaignStats?.total_sent || 0).toLocaleString()}
            subtitle={`${Number(dashboardData?.campaignStats?.avg_open_rate || 0).toFixed(1)}% open rate`}
            color="bg-purple-500"
          />
          <StatCard
            icon={<Handshake className="w-8 h-8" />}
            title="Partnerships"
            value={dashboardData?.partnerships?.filter(p => p.status === 'active').reduce((sum, p) => sum + p.count, 0) || 0}
            subtitle="Active partnerships"
            color="bg-orange-500"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<TrendingUp className="w-4 h-4" />} label="Overview" />
            <TabButton active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} icon={<Target className="w-4 h-4" />} label="Campaigns" />
            <TabButton active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} icon={<Users className="w-4 h-4" />} label="Contacts" />
            <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<FileText className="w-4 h-4" />} label="Templates" />
            <TabButton active={activeTab === 'partnerships'} onClick={() => setActiveTab('partnerships')} icon={<Handshake className="w-4 h-4" />} label="Partners & Sponsors" />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'overview' && <OverviewTab data={dashboardData} />}
          {activeTab === 'campaigns' && <CampaignsTab />}
          {activeTab === 'contacts' && <ContactsTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'partnerships' && <PartnershipsTab />}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, title, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`${color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
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
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
        active ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// Tab Components
function OverviewTab({ data }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Marketing Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contacts by Type */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Contacts by Audience Type
          </h3>
          <div className="space-y-2">
            {data?.contactsByType?.map((contact, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="capitalize font-medium">{contact.contact_type}</span>
                <span className="text-blue-600 font-bold">{contact.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Campaign Performance
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Total Sent</span>
              <span className="font-bold">{Number(data?.campaignStats?.total_sent || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Total Opened</span>
              <span className="font-bold">{Number(data?.campaignStats?.total_opened || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Total Clicked</span>
              <span className="font-bold">{Number(data?.campaignStats?.total_clicked || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2 bg-green-50 rounded">
              <span className="font-semibold">Open Rate</span>
              <span className="font-bold text-green-600">{Number(data?.campaignStats?.avg_open_rate || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="border rounded-lg p-4 md:col-span-2">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Recent Campaigns
          </h3>
          <div className="space-y-2">
            {data?.recentCampaigns?.map((campaign, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {campaign.campaign_type} • {campaign.target_audience}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${
                  campaign.status === 'running' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignsTab() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await marketing.getCampaigns();
      setCampaigns(response.data.campaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (id) => {
    if (confirm('Launch this campaign now?')) {
      await marketing.launchCampaign(id);
      loadCampaigns();
    }
  };

  const handlePause = async (id) => {
    if (confirm('Pause this campaign?')) {
      await marketing.pauseCampaign(id);
      loadCampaigns();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Campaigns</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading campaigns...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Campaign Name</th>
                <th className="text-left p-3 font-semibold">Type</th>
                <th className="text-left p-3 font-semibold">Audience</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Sent</th>
                <th className="text-left p-3 font-semibold">Opens</th>
                <th className="text-left p-3 font-semibold">Clicks</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{campaign.name}</td>
                  <td className="p-3 capitalize">{campaign.campaign_type}</td>
                  <td className="p-3 capitalize">{campaign.target_audience}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm capitalize ${
                      campaign.status === 'running' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-3">{campaign.total_sent}</td>
                  <td className="p-3">{campaign.total_opened}</td>
                  <td className="p-3">{campaign.total_clicked}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800" title="View"><Eye className="w-4 h-4" /></button>
                      {campaign.status === 'draft' && (
                        <button onClick={() => handleLaunch(campaign.id)} className="text-green-600 hover:text-green-800" title="Launch">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {campaign.status === 'running' && (
                        <button onClick={() => handlePause(campaign.id)} className="text-yellow-600 hover:text-yellow-800" title="Pause">
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-800" title="Edit"><Edit className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ContactsTab() {
  const [contacts, setContacts] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, [filterType]);

  const loadContacts = async () => {
    try {
      const response = await marketing.getContacts(filterType);
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Contacts</h2>
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Types</option>
            <option value="team">Team</option>
            <option value="customer">Customer</option>
            <option value="client">Client</option>
            <option value="partner">Partner</option>
            <option value="sponsor">Sponsor</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading contacts...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-left p-3 font-semibold">Company</th>
                <th className="text-left p-3 font-semibold">Type</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Last Contacted</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{contact.name}</td>
                  <td className="p-3 text-gray-600">{contact.email}</td>
                  <td className="p-3">{contact.company}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize">
                      {contact.contact_type}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm capitalize ${
                      contact.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {contact.last_contacted ? new Date(contact.last_contacted).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800"><Send className="w-4 h-4" /></button>
                      <button className="text-gray-600 hover:text-gray-800"><Edit className="w-4 h-4" /></button>
                      <button className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await marketing.getTemplates();
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Email Templates</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{template.name}</h3>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded capitalize">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Used: {template.usage_count} times</span>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4" /></button>
                  <button className="text-gray-600 hover:text-gray-800"><Edit className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PartnershipsTab() {
  const [partnerships, setPartnerships] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartnerships();
  }, [filterType]);

  const loadPartnerships = async () => {
    try {
      const response = await marketing.getPartnerships(filterType);
      setPartnerships(response.data.partnerships);
    } catch (error) {
      console.error('Error loading partnerships:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Partnerships & Sponsors</h2>
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Types</option>
            <option value="partner">Partners</option>
            <option value="sponsor">Sponsors</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Partnership
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading partnerships...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Company</th>
                <th className="text-left p-3 font-semibold">Contact</th>
                <th className="text-left p-3 font-semibold">Type</th>
                <th className="text-left p-3 font-semibold">Tier</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Contract Value</th>
                <th className="text-left p-3 font-semibold">Contract End</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partnerships.map((partnership) => (
                <tr key={partnership.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{partnership.company_name}</td>
                  <td className="p-3">
                    <div>{partnership.contact_name}</div>
                    <div className="text-sm text-gray-600">{partnership.email}</div>
                  </td>
                  <td className="p-3 capitalize">{partnership.partnership_type}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm capitalize ${
                      partnership.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                      partnership.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                      partnership.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {partnership.tier || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm capitalize ${
                      partnership.status === 'active' ? 'bg-green-100 text-green-800' :
                      partnership.status === 'prospect' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {partnership.status}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-green-600">
                    ${Number(partnership.contract_value || 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-sm">
                    {partnership.contract_end ? new Date(partnership.contract_end).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4" /></button>
                      <button className="text-gray-600 hover:text-gray-800"><Edit className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
