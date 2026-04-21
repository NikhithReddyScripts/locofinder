'use client';

import { useState } from 'react';

export default function SWOTPage() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SWOT Analysis
          </h1>
          <p className="text-xl text-gray-600">
            Analyze Strengths, Weaknesses, Opportunities, and Threats for your business location
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-2xl font-semibold text-blue-900 mb-2">🚧 Coming Soon</h2>
          <p className="text-blue-700">
            SWOT Analysis feature is currently under development. Check back soon for detailed 
            location-specific analysis!
          </p>
        </div>

        {/* SWOT Template Preview */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            What to Expect
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">S</span>
                </div>
                <h3 className="text-xl font-semibold text-green-900">Strengths</h3>
              </div>
              <ul className="space-y-2 text-green-800">
                <li>• High population density</li>
                <li>• Strong demographic match</li>
                <li>• Excellent accessibility</li>
                <li>• Low competition</li>
                <li>• High foot traffic</li>
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">W</span>
                </div>
                <h3 className="text-xl font-semibold text-red-900">Weaknesses</h3>
              </div>
              <ul className="space-y-2 text-red-800">
                <li>• Limited parking availability</li>
                <li>• Higher rental costs</li>
                <li>• Zoning restrictions</li>
                <li>• Distance from suppliers</li>
                <li>• Seasonal fluctuations</li>
              </ul>
            </div>

            {/* Opportunities */}
            <div className="border-2 border-yellow-200 rounded-lg p-6 bg-yellow-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">O</span>
                </div>
                <h3 className="text-xl font-semibold text-yellow-900">Opportunities</h3>
              </div>
              <ul className="space-y-2 text-yellow-800">
                <li>• Underserved market segment</li>
                <li>• Growing neighborhood</li>
                <li>• New developments nearby</li>
                <li>• Gaps in competitor offerings</li>
                <li>• Strategic partnerships</li>
              </ul>
            </div>

            {/* Threats */}
            <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">T</span>
                </div>
                <h3 className="text-xl font-semibold text-purple-900">Threats</h3>
              </div>
              <ul className="space-y-2 text-purple-800">
                <li>• Market saturation risk</li>
                <li>• Economic downturn</li>
                <li>• Changing demographics</li>
                <li>• New competitors entering</li>
                <li>• Regulatory changes</li>
              </ul>
            </div>
          </div>

          {/* Future Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Planned Features:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">📊</span>
                <div>
                  <p className="font-medium text-gray-900">Location-Specific Analysis</p>
                  <p className="text-sm text-gray-600">
                    Generate custom SWOT for your selected recommendations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">🤖</span>
                <div>
                  <p className="font-medium text-gray-900">AI-Powered Insights</p>
                  <p className="text-sm text-gray-600">
                    Automated analysis based on market data and trends
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">📈</span>
                <div>
                  <p className="font-medium text-gray-900">Competitive Comparison</p>
                  <p className="text-sm text-gray-600">
                    Compare multiple locations side-by-side
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">💾</span>
                <div>
                  <p className="font-medium text-gray-900">Export Reports</p>
                  <p className="text-sm text-gray-600">
                    Download SWOT analysis as PDF or PowerPoint
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
