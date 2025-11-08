import { useState } from 'react';
import { admin } from '../services/adminApi';
import { Shield, Lock } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('admin@jerzii.ai');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await admin.login(email, password);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      onLogin(response.data.admin);
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-purple-600 p-4 rounded-full">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Admin Portal</h1>
        <p className="text-gray-600 text-center mb-8">Jerzii AI System Control</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="admin@jerzii.ai"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter admin password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Authenticating...' : 'Access Admin Portal'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <Shield className="w-4 h-4 inline mr-1" />
          Secure Admin Access Only
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
          <strong>Default Credentials:</strong><br />
          Email: admin@jerzii.ai<br />
          Password: admin123
        </div>
      </div>
    </div>
  );
}
