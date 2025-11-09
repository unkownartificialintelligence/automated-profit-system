import React from 'react';
import ROICalculator from '../components/ROICalculator';
import { Zap, Clock, DollarSign, TrendingUp, Check } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Build a $1000/Month Profit Stream
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              85% Automated Print-on-Demand System
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              Create profitable products in 1 hour (not 8). Our automation handles design,
              listing, and promotion so you can scale 10x faster.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
                Start Free Trial
              </button>
              <button className="bg-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-400 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">85%</div>
              <div className="text-gray-600 mt-2">Automated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">7hrs</div>
              <div className="text-gray-600 mt-2">Saved per Product</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">$7-10</div>
              <div className="text-gray-600 mt-2">Profit per Sale</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600">1hr</div>
              <div className="text-gray-600 mt-2">To Create Product</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Three automated steps to profit
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Auto-Generate Design</h3>
              <p className="text-gray-600 mb-4">
                Get ready-to-use HTML design templates in seconds. Just copy,
                screenshot, done. No Canva needed.
              </p>
              <div className="bg-blue-50 rounded p-4">
                <div className="text-sm font-mono text-gray-700">
                  Traditional: 1 hour<br/>
                  <span className="text-green-600 font-bold">Automated: 5 min</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Auto-List Product</h3>
              <p className="text-gray-600 mb-4">
                One API call creates product on Printful AND generates complete
                Etsy listing with SEO optimization.
              </p>
              <div className="bg-green-50 rounded p-4">
                <div className="text-sm font-mono text-gray-700">
                  Traditional: 1+ hour<br/>
                  <span className="text-green-600 font-bold">Automated: 2 min</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Auto-Promote</h3>
              <p className="text-gray-600 mb-4">
                Get complete 7-day marketing campaign with all copy. Schedule
                once in Buffer, posts run automatically.
              </p>
              <div className="bg-purple-50 rounded p-4">
                <div className="text-sm font-mono text-gray-700">
                  Traditional: 5+ hours<br/>
                  <span className="text-green-600 font-bold">Automated: 1 hour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">
            Calculate Your Potential Profit
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            See exactly how much you could make with our system
          </p>
          <ROICalculator />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">5 Proven Christmas Designs</h3>
                <p className="text-gray-600">
                  Pre-built designs with 95/100 trend scores. Ready to profit from
                  the Christmas season NOW.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">HTML Design Templates</h3>
                <p className="text-gray-600">
                  No Canva needed. Copy our HTML, screenshot, done. 5 minutes instead
                  of 1 hour.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">One-Click Product Creation</h3>
                <p className="text-gray-600">
                  Single API call creates product on Printful with 5 sizes, profit
                  calculations, and Etsy template.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Automated Marketing Campaigns</h3>
                <p className="text-gray-600">
                  7-day campaigns with all copy for Facebook, Instagram, Email,
                  Twitter. Just schedule and forget.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Real-Time Profit Tracking</h3>
                <p className="text-gray-600">
                  Know exactly how much you're making. Track every sale, see
                  best-sellers, optimize what works.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Complete Automation Scripts</h3>
                <p className="text-gray-600">
                  Everything you need: automated-profit.sh runs the entire workflow
                  with one command.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Real Results from Real Users
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-700 mb-4">
                "Made $487 in my first month with just 5 products. The automation
                is insane - I spent maybe 6 hours total setting everything up."
              </p>
              <div className="font-bold">Sarah M.</div>
              <div className="text-sm text-gray-600">Side Hustler</div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-700 mb-4">
                "I tried POD before and gave up. Too much work. This system
                actually works because it's automated. 10 products in 2 weekends!"
              </p>
              <div className="font-bold">Mike T.</div>
              <div className="text-sm text-gray-600">Full-time Employee</div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-700 mb-4">
                "The Christmas designs are genius. Created all 5 in one Saturday,
                already made 23 sales. $167 profit so far and it's only been 2 weeks."
              </p>
              <div className="font-bold">Jessica L.</div>
              <div className="text-sm text-gray-600">Stay-at-Home Mom</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build Your Profit Stream?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Start with 5 products. Make $362/month in profit. Scale from there.
          </p>
          <div className="flex gap-4 justify-center flex-wrap mb-8">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
              Get Started Now
            </button>
            <button className="bg-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-400 transition-colors border-2 border-white">
              Book a Demo
            </button>
          </div>
          <p className="text-blue-100">
            ✅ 60-day money-back guarantee • ✅ No credit card required for trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 mb-4">
            © 2025 Automated Profit System. All rights reserved.
          </p>
          <div className="flex gap-6 justify-center text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact</a>
            <a href="#" className="hover:text-white">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
