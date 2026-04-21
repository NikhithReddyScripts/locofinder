'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About LocoFinder
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Business Location Intelligence
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* What is LocoFinder */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What is LocoFinder?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              LocoFinder is an advanced business location recommendation platform that combines 
              demographic data, competitor analysis, and AI-powered insights to help entrepreneurs 
              and businesses find the perfect location for their venture.
            </p>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  1. Select Your Area
                </h3>
                <p className="text-gray-600">
                  Click on the map to choose your preferred search radius and location.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  2. Customize Profile
                </h3>
                <p className="text-gray-600">
                  Set your target demographics, competition tolerance, and business priorities.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  3. AI Analysis
                </h3>
                <p className="text-gray-600">
                  Our AI analyzes competitor reviews, demographics, and market conditions.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  4. Get Recommendations
                </h3>
                <p className="text-gray-600">
                  Receive ranked locations with detailed insights and opportunity scores.
                </p>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Key Features
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <div>
                  <strong className="text-gray-900">Demographics Analysis:</strong>
                  <span className="text-gray-700"> Real-time Census data for age and income distributions</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <div>
                  <strong className="text-gray-900">Competitor Intelligence:</strong>
                  <span className="text-gray-700"> AI-powered review analysis of top competitors</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <div>
                  <strong className="text-gray-900">Market Opportunities:</strong>
                  <span className="text-gray-700"> Identify gaps and weaknesses in the market</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <div>
                  <strong className="text-gray-900">Foot Traffic Estimates:</strong>
                  <span className="text-gray-700"> Assess location accessibility and customer flow</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <div>
                  <strong className="text-gray-900">Customizable Scoring:</strong>
                  <span className="text-gray-700"> Adjust weights based on your business priorities</span>
                </div>
              </li>
            </ul>
          </section>

          {/* Data Sources */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Sources
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>US Census Bureau:</strong> Demographics and population data</li>
                <li>• <strong>Google Places API:</strong> Business locations and reviews</li>
                <li>• <strong>OpenStreetMap:</strong> Geographic and zoning information</li>
                <li>• <strong>AI Analysis:</strong> Powered by Groq LLM for competitor insights</li>
              </ul>
            </div>
          </section>

          {/* Technology */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Technology Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="font-semibold text-gray-900">Frontend</p>
                <p className="text-sm text-gray-600">Next.js + React</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="font-semibold text-gray-900">Backend</p>
                <p className="text-sm text-gray-600">Python + FastAPI</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="font-semibold text-gray-900">Maps</p>
                <p className="text-sm text-gray-600">Leaflet.js</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="font-semibold text-gray-900">AI</p>
                <p className="text-sm text-gray-600">Groq LLM</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
