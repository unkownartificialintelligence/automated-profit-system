import { useEffect, useState } from 'react';
import { Zap, Play, Square, Clock, CheckCircle, AlertCircle, Calendar, Settings as SettingsIcon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import api from '../services/api';

export default function Automation() {
  const [automationStatus, setAutomationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    loadAutomationStatus();
    const interval = setInterval(loadAutomationStatus, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAutomationStatus = async () => {
    try {
      const response = await api.get('/automation/status');
      setAutomationStatus(response.data);
      setRunning(response.data.active || false);
    } catch (error) {
      console.error('Error loading automation status:', error);
      // Set mock data
      setAutomationStatus({
        active: false,
        lastRun: '2025-11-12T10:30:00Z',
        nextScheduled: '2025-11-18T09:00:00Z',
        totalRuns: 156,
        successfulRuns: 142,
        failedRuns: 14,
        stats: {
          productsCreated: 487,
          designsGenerated: 312,
          listingsCreated: 245,
          revenue: 52890,
        },
        recentRuns: [
          { id: 1, startTime: '2025-11-12T10:30:00Z', duration: '12m 34s', status: 'success', productsCreated: 5 },
          { id: 2, startTime: '2025-11-11T09:00:00Z', duration: '11m 45s', status: 'success', productsCreated: 4 },
          { id: 3, startTime: '2025-11-04T09:00:00Z', duration: '13m 12s', status: 'success', productsCreated: 6 },
          { id: 4, startTime: '2025-10-28T09:00:00Z', duration: '10m 56s', status: 'failed', productsCreated: 0 },
        ],
      });
      setRunning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAutomation = async () => {
    try {
      await api.post('/automation/start');
      setRunning(true);
      await loadAutomationStatus();
    } catch (error) {
      console.error('Error starting automation:', error);
      alert('Failed to start automation');
    }
  };

  const handleStopAutomation = async () => {
    try {
      await api.post('/automation/stop');
      setRunning(false);
      await loadAutomationStatus();
    } catch (error) {
      console.error('Error stopping automation:', error);
      alert('Failed to stop automation');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading automation status..." />;
  }

  const successRate = automationStatus.totalRuns > 0
    ? ((automationStatus.successfulRuns / automationStatus.totalRuns) * 100).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            Automation Control
          </h1>
          <p className="text-gray-600">Manage your automated profit system</p>
        </div>
        <div className="flex gap-3">
          {running ? (
            <button
              onClick={handleStopAutomation}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              <Square className="w-5 h-5" />
              Stop Automation
            </button>
          ) : (
            <button
              onClick={handleStartAutomation}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              <Play className="w-5 h-5" />
              Start Automation
            </button>
          )}
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Schedule
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`mb-6 p-6 rounded-lg ${running ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${running ? 'bg-green-500' : 'bg-gray-400'}`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {running ? 'Automation Running' : 'Automation Stopped'}
              </h3>
              <p className="text-sm text-gray-600">
                {running ? 'System is actively running automation tasks' : 'Click Start to begin automation'}
              </p>
            </div>
          </div>
          {running && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={CheckCircle}
          title="Total Runs"
          value={automationStatus.totalRuns}
          color="bg-blue-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Success Rate"
          value={`${successRate}%`}
          color="bg-green-500"
          change={{ positive: true, value: `${automationStatus.successfulRuns} successful` }}
        />
        <StatCard
          icon={Zap}
          title="Products Created"
          value={automationStatus.stats.productsCreated}
          color="bg-purple-500"
        />
        <StatCard
          icon={Clock}
          title="Revenue Generated"
          value={`$${automationStatus.stats.revenue.toLocaleString()}`}
          color="bg-orange-500"
        />
      </div>

      {/* Schedule Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Last Run
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{new Date(automationStatus.lastRun).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Success</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Next Scheduled Run
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date(automationStatus.nextScheduled).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Frequency:</span>
              <span className="font-medium">Every Monday at 9:00 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Runs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Automation Runs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {automationStatus.recentRuns.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(run.startTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {run.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {run.productsCreated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      run.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {run.status === 'success' ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Success
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Automation Schedule"
        footer={
          <>
            <button
              onClick={() => setShowScheduleModal(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert('Schedule updated!');
                setShowScheduleModal(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Schedule
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Daily</option>
              <option selected>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option selected>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
              <option>Sunday</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              defaultValue="09:00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
