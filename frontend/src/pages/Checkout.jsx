import { useState } from 'react';
import { CreditCard, Check } from 'lucide-react';

export default function Checkout() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);

  const packages = {
    starter: { name: 'Starter', price: 2699, features: ['Authentication', 'Printful Integration', 'Basic Analytics'] },
    professional: { name: 'Professional', price: 4699, features: ['Everything in Starter', '4 Automation Workflows', 'Google Trends', 'AI Research'] },
    enterprise: { name: 'Enterprise', price: 7699, features: ['Everything in Pro', 'Multi-Store', 'AI Descriptions', 'Shopify/Etsy'] },
    enterprisePlus: { name: 'Enterprise Plus', price: 12699, features: ['Everything in Enterprise', 'AI Social Content', 'Customer Service Bot'] }
  };

  const handlePurchase = async (pkg) => {
    setLoading(true);
    setSelectedPackage(pkg);
    alert(`Checkout for ${packages[pkg].name} - $${packages[pkg].price}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Choose Your Jerzii AI Package</h1>
        <p className="text-center text-gray-600 mb-12">First 5 clients save $300!</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(packages).map(([key, pkg]) => (
            <div key={key} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">${pkg.price}</div>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePurchase(key)}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Select Package
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
