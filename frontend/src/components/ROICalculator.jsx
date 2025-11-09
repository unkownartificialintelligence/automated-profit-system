import React, { useState } from 'react';
import { Calculator, TrendingUp, Clock, DollarSign } from 'lucide-react';

const ROICalculator = () => {
  const [products, setProducts] = useState(5);
  const [salesPerProduct, setSalesPerProduct] = useState(10);
  const [retailPrice, setRetailPrice] = useState(24.99);
  const [printfulCost, setPrintfulCost] = useState(15.44);

  // Calculations
  const platformFees = retailPrice * 0.06; // 6% Etsy fees
  const transactionFee = 0.80;
  const profitPerSale = retailPrice - printfulCost - platformFees - transactionFee;
  const totalSales = products * salesPerProduct;
  const monthlyProfit = totalSales * profitPerSale;
  const yearlyProfit = monthlyProfit * 12;

  // Time calculations
  const traditionalTime = products * 8; // 8 hours per product manual
  const automatedTime = products * 1; // 1 hour per product automated
  const timeSaved = traditionalTime - automatedTime;
  const timeSavedPercent = ((timeSaved / traditionalTime) * 100).toFixed(0);

  // Hourly rate
  const hourlyRate = monthlyProfit / automatedTime;

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-800">ROI Calculator</h2>
      </div>

      <p className="text-gray-600 mb-8">
        Calculate your potential profit with our automated Print-on-Demand system
      </p>

      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Products
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={products}
              onChange={(e) => setProducts(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>1</span>
              <span className="font-bold text-blue-600">{products}</span>
              <span>20</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales per Product (Monthly)
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={salesPerProduct}
              onChange={(e) => setSalesPerProduct(Number(e.target.value))}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>1</span>
              <span className="font-bold text-green-600">{salesPerProduct}</span>
              <span>50</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retail Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={retailPrice}
              onChange={(e) => setRetailPrice(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Printful Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={printfulCost}
              onChange={(e) => setPrintfulCost(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Potential</h3>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Profit per Sale</span>
              <span className="text-2xl font-bold text-green-600">
                ${profitPerSale.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ${retailPrice} - ${printfulCost} - ${platformFees.toFixed(2)} fees - ${transactionFee} transaction
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Sales/Month</span>
              <span className="text-2xl font-bold text-blue-600">
                {totalSales}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {products} products × {salesPerProduct} sales
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 shadow-lg text-white">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">Monthly Profit</span>
            </div>
            <div className="text-4xl font-bold">
              ${monthlyProfit.toFixed(2)}
            </div>
            <div className="text-sm opacity-90 mt-1">
              ${yearlyProfit.toFixed(2)}/year
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-gray-600">Effective Hourly Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              ${hourlyRate.toFixed(2)}/hour
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Based on {automatedTime} hours work
            </div>
          </div>
        </div>
      </div>

      {/* Time Savings Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-orange-200">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-800">Time Savings with Automation</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Traditional Method</div>
            <div className="text-3xl font-bold text-red-600">{traditionalTime}h</div>
            <div className="text-xs text-gray-500 mt-1">Manual work</div>
          </div>

          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">With Automation</div>
            <div className="text-3xl font-bold text-green-600">{automatedTime}h</div>
            <div className="text-xs text-gray-500 mt-1">85% automated</div>
          </div>

          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-4 text-center text-white">
            <div className="text-sm mb-1">Time Saved</div>
            <div className="text-3xl font-bold">{timeSaved}h</div>
            <div className="text-xs mt-1">{timeSavedPercent}% reduction</div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Ready to Start?</h3>
        <p className="text-blue-100 mb-4">
          With {products} products, you could be making ${monthlyProfit.toFixed(2)}/month
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Start Now
          </button>
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors">
            View Pricing
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center mt-6">
        * Results may vary. Based on average conversion rates and profit margins.
        Your actual results depend on product quality, marketing efforts, and market conditions.
      </p>
    </div>
  );
};

export default ROICalculator;
