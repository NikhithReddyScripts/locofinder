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
                <li>• We solve the 5-tab problem</li>
                <li>• Not just AI vibes — real, multi-source data</li>
                <li>• Output tells you why, not just where</li>
                <li>• Decision-oriented, not data-heavy</li>
                <li>• Clean frontend + powerful geospatial backend</li>
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
                <li>• San Diego only — geographic scope is limited</li>
                <li>• Top spots can tie on scores — ranking needs more nuance</li>
                <li>• Foot traffic is estimated, not directly measured</li>
                <li>• Competitor buckets are too broad for some business types</li>
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
                <li>• New city = config change, not a rebuild</li>
                <li>• SWOT output is a natural next feature to build</li>
                <li>• Plug in richer data, evolve into a full platform</li>
                <li>• Exportable reports open up a B2B market</li>
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
                <li>• We rely on 3 external vendors — rate limits are a real risk</li>
                <li>• AI sounds confident even on thin data</li>
                <li>• Unpolished UI can quietly kill credibility</li>
                <li>• Neighborhoods change faster than ACS data refreshes</li>
                <li>• Zoning shown ≠ zoning approved</li>
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
