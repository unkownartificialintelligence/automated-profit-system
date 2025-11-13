import { useState } from 'react';
import { auth } from '../services/api';
import { LogIn } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('owner@jerzii.ai');
  const [password, setPassword] = useState('Owner@2025');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  const testAccounts = [
    { role: 'Owner/Admin', email: 'owner@jerzii.ai', password: 'Owner@2025' },
    { role: 'System Admin', email: 'admin@jerzii.ai', password: 'Admin@2025' },
    { role: 'Team Member', email: 'team1@jerzii.ai', password: 'Team@2025' },
    { role: 'Client', email: 'client1@example.com', password: 'Client@2025' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await auth.login(email, password);
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setShowCredentials(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <LogIn className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Jerzii AI</h1>
        <p className="text-gray-600 text-center mb-8">Automated Profit System</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowCredentials(!showCredentials)}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showCredentials ? 'Hide' : 'Show'} Test Accounts
          </button>
          {showCredentials && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2">
              {testAccounts.map((account, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => fillCredentials(account)}
                  className="w-full text-left p-2 hover:bg-white rounded border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">{account.role}</div>
                  <div className="text-xs text-gray-600">{account.email}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          Owner account pre-filled. Click "Show Test Accounts" for more options.
        </div>
      </div>
    </div>
  );
}
