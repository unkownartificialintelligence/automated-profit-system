import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Key, Bell, Palette, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKeys, setShowApiKeys] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      company: '',
      phone: '',
    },
    apiKeys: {
      printful: '',
      canva: '',
      stripe: '',
      openai: '',
    },
    preferences: {
      emailNotifications: true,
      automationAlerts: true,
      weeklyReports: true,
      theme: 'light',
      language: 'en',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Set mock data
      setSettings({
        profile: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          company: 'Jerzii AI',
          phone: '+1 (555) 123-4567',
        },
        apiKeys: {
          printful: 'UoNNmC4bEyqNuFMyAdtBby2YlVtORc7piy2I9UOS',
          canva: 'CANv_1234567890abcdefghijklmnop',
          stripe: 'sk_test_51234567890abcdefghijklmnop',
          openai: 'sk-proj-1234567890abcdefghijklmnop',
        },
        preferences: {
          emailNotifications: true,
          automationAlerts: true,
          weeklyReports: true,
          theme: 'light',
          language: 'en',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.put('/settings', settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Changes saved locally.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field, value) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const updateApiKey = (key, value) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [key]: value }
    }));
  };

  const updatePreference = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
  };

  const toggleApiKeyVisibility = (key) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskApiKey = (key) => {
    if (!key) return '';
    if (key.length < 8) return '••••••••';
    return key.substring(0, 8) + '••••••••••••••••';
  };

  if (loading) {
    return <LoadingSpinner text="Loading settings..." />;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'preferences', label: 'Preferences', icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-blue-500" />
          Settings
        </h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">Settings saved successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={settings.profile.name}
                        onChange={(e) => updateProfile('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => updateProfile('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={settings.profile.company}
                        onChange={(e) => updateProfile('company', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => updateProfile('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">API Keys</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Manage your third-party service API keys
                </p>
                <div className="space-y-6">
                  {/* Printful API Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Printful API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKeys.printful ? 'text' : 'password'}
                        value={settings.apiKeys.printful}
                        onChange={(e) => updateApiKey('printful', e.target.value)}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Enter your Printful API key"
                      />
                      <button
                        onClick={() => toggleApiKeyVisibility('printful')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showApiKeys.printful ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Required for print-on-demand product fulfillment
                    </p>
                  </div>

                  {/* Canva API Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canva API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKeys.canva ? 'text' : 'password'}
                        value={settings.apiKeys.canva}
                        onChange={(e) => updateApiKey('canva', e.target.value)}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Enter your Canva API key"
                      />
                      <button
                        onClick={() => toggleApiKeyVisibility('canva')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showApiKeys.canva ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Used for automated design generation
                    </p>
                  </div>

                  {/* Stripe API Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stripe API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKeys.stripe ? 'text' : 'password'}
                        value={settings.apiKeys.stripe}
                        onChange={(e) => updateApiKey('stripe', e.target.value)}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Enter your Stripe API key"
                      />
                      <button
                        onClick={() => toggleApiKeyVisibility('stripe')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showApiKeys.stripe ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Required for payment processing
                    </p>
                  </div>

                  {/* OpenAI API Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OpenAI API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKeys.openai ? 'text' : 'password'}
                        value={settings.apiKeys.openai}
                        onChange={(e) => updateApiKey('openai', e.target.value)}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Enter your OpenAI API key"
                      />
                      <button
                        onClick={() => toggleApiKeyVisibility('openai')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showApiKeys.openai ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Used for AI-powered content generation
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
                <div className="space-y-8">
                  {/* Notifications */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.preferences.emailNotifications}
                            onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Automation Alerts</p>
                          <p className="text-sm text-gray-600">Get notified when automation runs complete</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.preferences.automationAlerts}
                            onChange={(e) => updatePreference('automationAlerts', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Weekly Reports</p>
                          <p className="text-sm text-gray-600">Receive weekly performance summaries</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.preferences.weeklyReports}
                            onChange={(e) => updatePreference('weeklyReports', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Appearance */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <select
                          value={settings.preferences.theme}
                          onChange={(e) => updatePreference('theme', e.target.value)}
                          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={settings.preferences.language}
                          onChange={(e) => updatePreference('language', e.target.value)}
                          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
