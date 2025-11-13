import { useEffect, useState } from 'react';
import { Globe, TrendingUp, Search, Eye, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
];

export default function GlobalTrending() {
  const [trendingData, setTrendingData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadGlobalTrending();
  }, []);

  const loadGlobalTrending = async () => {
    try {
      const response = await api.get('/global-trending');
      setTrendingData(response.data || {});
    } catch (error) {
      console.error('Error loading global trending:', error);
      // Set mock data for demonstration
      const mockData = {};
      COUNTRIES.forEach(country => {
        mockData[country.code] = [
          { keyword: 'AI Tools', traffic: 125000, growth: '+45%', articles: 1250 },
          { keyword: 'Sustainable Fashion', traffic: 98000, growth: '+32%', articles: 890 },
          { keyword: 'Home Automation', traffic: 87500, growth: '+28%', articles: 756 },
          { keyword: 'Wireless Earbuds', traffic: 76000, growth: '+25%', articles: 645 },
          { keyword: 'Smart Watch', traffic: 65000, growth: '+22%', articles: 589 },
          { keyword: 'Protein Powder', traffic: 54500, growth: '+18%', articles: 478 },
          { keyword: 'Yoga Mat', traffic: 45000, growth: '+15%', articles: 402 },
          { keyword: 'Coffee Maker', traffic: 38000, growth: '+12%', articles: 345 },
          { keyword: 'LED Lights', traffic: 32000, growth: '+10%', articles: 289 },
          { keyword: 'Water Bottle', traffic: 28000, growth: '+8%', articles: 234 },
        ];
      });
      setTrendingData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const currentCountryData = trendingData[selectedCountry] || [];
  const filteredData = currentCountryData.filter(item =>
    item.keyword?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = filteredData.slice(0, 10).map(item => ({
    name: item.keyword,
    traffic: parseInt(item.traffic) || 0,
  }));

  if (loading) {
    return <LoadingSpinner text="Loading global trending data..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Globe className="w-8 h-8 text-blue-500" />
          Global Trending
        </h1>
        <p className="text-gray-600">Discover trending products across 10 countries</p>
      </div>

      {/* Country Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-x-auto">
        <div className="flex gap-2 p-4">
          {COUNTRIES.map(country => (
            <button
              key={country.code}
              onClick={() => setSelectedCountry(country.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedCountry === country.code
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">{country.flag}</span>
              <span>{country.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Keywords</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{currentCountryData.length}</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Total Traffic</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {(currentCountryData.reduce((sum, item) => sum + parseInt(item.traffic || 0), 0) / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Avg Growth</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {currentCountryData.length > 0 ?
                  `+${(currentCountryData.reduce((sum, item) => sum + parseInt(item.growth?.replace('+', '').replace('%', '') || 0), 0) / currentCountryData.length).toFixed(0)}%`
                  : '0%'}
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Trending Keywords</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Bar dataKey="traffic" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trending Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Trending Keywords in {COUNTRIES.find(c => c.code === selectedCountry)?.name}
          </h2>
        </div>
        {filteredData.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No Trending Data"
            description={searchTerm ? 'Try adjusting your search term.' : 'No trending data available for this country.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traffic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => {
                  const traffic = parseInt(item.traffic || 0);
                  const potential = traffic > 100000 ? 'High' : traffic > 50000 ? 'Medium' : 'Low';
                  const potentialColor = traffic > 100000 ? 'bg-green-100 text-green-800' :
                                        traffic > 50000 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800';

                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{item.keyword}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{traffic.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">monthly searches</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {item.growth}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.articles?.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${potentialColor}`}>
                          {potential}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
