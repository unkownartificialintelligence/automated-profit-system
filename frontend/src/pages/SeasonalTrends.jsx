import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SeasonalTrends = () => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [trends, setTrends] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profitReport, setProfitReport] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

  // Load all seasons on mount
  useEffect(() => {
    loadSeasons();
    loadProfitReport();
  }, []);

  const loadSeasons = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seasonal-trends/seasons`);
      setSeasons(response.data.seasons || []);
    } catch (error) {
      console.error('Error loading seasons:', error);
    }
  };

  const loadProfitReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seasonal-trends/profit-report`);
      setProfitReport(response.data);
    } catch (error) {
      console.error('Error loading profit report:', error);
    }
  };

  const loadSeasonDetails = async (seasonId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/seasonal-trends/seasons/${seasonId}`);
      setSelectedSeason(response.data.season);
      setTrends(response.data.trends || []);
      setCollections(response.data.collections || []);
      setActiveTab('season-details');
    } catch (error) {
      console.error('Error loading season details:', error);
    } finally {
      setLoading(false);
    }
  };

  const discoverTrends = async (seasonId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/seasonal-trends/discover-trends`, {
        season_id: seasonId,
      });
      alert(`✅ Discovered ${response.data.total_discovered} trending keywords!`);
      loadSeasonDetails(seasonId);
    } catch (error) {
      console.error('Error discovering trends:', error);
      alert('❌ Error discovering trends');
    } finally {
      setLoading(false);
    }
  };

  const generateCollection = async (seasonId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/seasonal-trends/generate-collection`, {
        season_id: seasonId,
        collection_size: 20,
      });
      alert(`✅ Generated collection with ${response.data.collection.total_products} products!\nEstimated profit: $${response.data.collection.estimated_profit}`);
      loadSeasonDetails(seasonId);
    } catch (error) {
      console.error('Error generating collection:', error);
      alert('❌ Error generating collection. Make sure to discover trends first!');
    } finally {
      setLoading(false);
    }
  };

  const bulkListCollection = async (collectionId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/seasonal-trends/bulk-list-collection`, {
        collection_id: collectionId,
        auto_approve: false,
      });
      alert(`✅ Listed ${response.data.successfully_listed} products!\nTime saved: ${response.data.estimated_time_saved}`);
      loadSeasonDetails(selectedSeason.id);
    } catch (error) {
      console.error('Error bulk listing:', error);
      alert('❌ Error bulk listing collection');
    } finally {
      setLoading(false);
    }
  };

  const getSeasonStatus = (season) => {
    if (season.status === 'active') return '🟢 Active';
    if (season.status === 'upcoming') return '🟡 Upcoming';
    return '⚪ Past';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Automated Seasonal Trends System
          </h1>
          <p className="text-xl text-gray-600">
            Automatically discover, design, and list trending products for every season
          </p>
          <div className="mt-4 flex space-x-4">
            <div className="bg-green-100 px-4 py-2 rounded-lg">
              <span className="text-green-800 font-semibold">95% Automation</span>
            </div>
            <div className="bg-blue-100 px-4 py-2 rounded-lg">
              <span className="text-blue-800 font-semibold">14+ Seasons</span>
            </div>
            <div className="bg-purple-100 px-4 py-2 rounded-lg">
              <span className="text-purple-800 font-semibold">Bulk Listing</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-xl mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('seasons')}
              className={`px-6 py-4 font-semibold ${
                activeTab === 'seasons'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Seasons
            </button>
            {selectedSeason && (
              <button
                onClick={() => setActiveTab('season-details')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'season-details'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎯 {selectedSeason.name}
              </button>
            )}
          </div>

          <div className="p-8">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && profitReport && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">System Overview</h2>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="text-3xl font-bold">{profitReport.totals.collections}</div>
                    <div className="text-blue-100 mt-1">Collections Created</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="text-3xl font-bold">{profitReport.totals.products}</div>
                    <div className="text-green-100 mt-1">Products Designed</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="text-3xl font-bold">{profitReport.totals.listed}</div>
                    <div className="text-purple-100 mt-1">Products Listed</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div className="text-3xl font-bold">${profitReport.totals.profit.toFixed(2)}</div>
                    <div className="text-yellow-100 mt-1">Total Profit</div>
                  </div>
                </div>

                {/* Automation Stats */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                  <h3 className="text-xl font-bold mb-3">⚡ Automation Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{profitReport.automation_stats.automation_level}</div>
                      <div className="text-indigo-100">Automation Level</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{profitReport.automation_stats.time_saved_per_product}</div>
                      <div className="text-indigo-100">Time Saved/Product</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{profitReport.automation_stats.total_time_saved}</div>
                      <div className="text-indigo-100">Total Time Saved</div>
                    </div>
                  </div>
                </div>

                {/* Season Performance Table */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold p-6 border-b">Season Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit Potential</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collections</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {profitReport.report.map((season) => (
                          <tr key={season.season} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{season.season}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{width: '100px'}}>
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${season.profit_potential}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{season.profit_potential}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{season.collections}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{season.total_products}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                              ${season.total_profit.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SEASONS TAB */}
            {activeTab === 'seasons' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">All Seasons</h2>
                  <button
                    onClick={loadSeasons}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    🔄 Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {seasons.map((season) => (
                    <div
                      key={season.id}
                      className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-all cursor-pointer"
                      onClick={() => loadSeasonDetails(season.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{season.name}</h3>
                        <span className="text-sm">{getSeasonStatus(season)}</span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div>📅 {season.start_date} to {season.end_date}</div>
                        <div>💰 Profit Potential: {season.profit_potential}%</div>
                        <div>📦 Products: {season.total_products || 0}</div>
                        <div>🏆 Collections: {season.total_collections || 0}</div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            discoverTrends(season.id);
                          }}
                          disabled={loading}
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                          🔍 Discover Trends
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateCollection(season.id);
                          }}
                          disabled={loading}
                          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                        >
                          🎨 Generate Collection
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEASON DETAILS TAB */}
            {activeTab === 'season-details' && selectedSeason && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedSeason.name}</h2>
                    <p className="text-gray-600">
                      {selectedSeason.start_date} to {selectedSeason.end_date} • Profit Potential: {selectedSeason.profit_potential}%
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('seasons')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ← Back to All Seasons
                  </button>
                </div>

                {/* Trending Keywords */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">🔥 Trending Keywords ({trends.length})</h3>
                  {trends.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No trends discovered yet</p>
                      <button
                        onClick={() => discoverTrends(selectedSeason.id)}
                        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                      >
                        🔍 Discover Trends Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {trends.slice(0, 12).map((trend) => (
                        <div key={trend.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-semibold text-sm">{trend.keyword}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Score: {trend.trend_score}/100
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Collections */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">📦 Collections ({collections.length})</h3>
                  {collections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No collections created yet</p>
                      <button
                        onClick={() => generateCollection(selectedSeason.id)}
                        disabled={trends.length === 0}
                        className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                      >
                        🎨 Generate Collection
                      </button>
                      {trends.length === 0 && (
                        <p className="text-sm text-red-500 mt-2">Discover trends first!</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {collections.map((collection) => (
                        <div key={collection.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg">{collection.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                              <div className="flex space-x-4 mt-2 text-sm">
                                <span>📦 {collection.product_count} products</span>
                                <span>💰 ${collection.estimated_profit?.toFixed(2) || '0.00'} estimated profit</span>
                                <span className={`px-2 py-1 rounded ${
                                  collection.status === 'listed' ? 'bg-green-100 text-green-800' :
                                  collection.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {collection.status}
                                </span>
                              </div>
                            </div>
                            {collection.status !== 'listed' && (
                              <button
                                onClick={() => bulkListCollection(collection.id)}
                                disabled={loading}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
                              >
                                🚀 Bulk List
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalTrends;
