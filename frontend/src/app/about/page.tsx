'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About LocoFinder
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Business Location Intelligence Platform
          </p>
        </div>

        {/* Demo Video */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
            Project Demo
          </h2>
          <div className="aspect-video w-full max-w-4xl mx-auto">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/PpmYUbW4LSI"
              title="LocoFinder Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* 1. The Problem */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">❗</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  The Problem
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Starting a new business or expanding to a new location is one of the most critical decisions entrepreneurs face. 
                    However, the process of finding the perfect location is overwhelming and time-consuming:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span><strong>Scattered Information:</strong> Demographic data, competitor reviews, zoning regulations, and foot traffic 
                      estimates are spread across multiple platforms and government databases.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span><strong>Manual Analysis:</strong> Entrepreneurs must manually collect data from Census Bureau, Google Maps, 
                      OpenStreetMap, and local zoning offices, then analyze it themselves.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span><strong>Competitor Research:</strong> Reading hundreds of competitor reviews to identify market gaps 
                      and customer pain points is tedious and error-prone.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span><strong>Lack of Integrated Insights:</strong> Even after collecting all the data, there&apos;s no easy way 
                      to synthesize it into actionable recommendations.</span>
                    </li>
                  </ul>
                  <p className="font-semibold text-lg text-gray-900 mt-6">
                    We made that simple. LocoFinder brings everything into one platform with AI-powered analysis.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Our Solution */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Our Solution: What is LocoFinder?
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    LocoFinder is an end-to-end business location intelligence platform that automates the entire 
                    location research process. In just a few clicks, you can:
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-4">
                    <p className="font-semibold text-blue-900">
                      Select your business type → Draw your search area on the map → Get 3 ranked location recommendations 
                      with AI-generated market insights in under 60 seconds
                    </p>
                  </div>
                  <p>
                    Each recommendation includes:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Opportunity score (0-100)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Population and demographics breakdown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Top 5 competitors with ratings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>AI analysis of competitor strengths/weaknesses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Market opportunities and gaps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Foot traffic and accessibility scores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Nearby retail centers and distances</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Zoning and transit information</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Key Features */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-blue-600">📊</span>
                  Real-Time Demographics Analysis
                </h3>
                <p className="text-gray-700 text-sm">
                  Access live Census data showing age distribution (18 age brackets) and household income levels 
                  (9 income brackets) for precise target market alignment.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-purple-600">🤖</span>
                  AI-Powered Competitor Intelligence
                </h3>
                <p className="text-gray-700 text-sm">
                  Groq LLM analyzes up to 25 competitor reviews (5 per business) to automatically identify 
                  what customers love, common complaints, and untapped market opportunities.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-green-600">🎯</span>
                  Customizable Business Profiles
                </h3>
                <p className="text-gray-700 text-sm">
                  Adjust target age range, minimum income, competition tolerance, and 7 different scoring weights 
                  (population, demographics, competition, foot traffic, transit, parking, retail proximity) to match your strategy.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-yellow-600">🗺️</span>
                  Interactive Map Selection
                </h3>
                <p className="text-gray-700 text-sm">
                  Click anywhere in San Diego to set your search center, adjust radius (0.5-5 miles), 
                  and see ranked recommendations with numbered markers on the map.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-red-600">🚶</span>
                  Foot Traffic Scoring
                </h3>
                <p className="text-gray-700 text-sm">
                  Estimates based on transit accessibility, parking availability, and proximity to retail centers 
                  to gauge potential customer flow.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-indigo-600">💾</span>
                  Cached Search Results
                </h3>
                <p className="text-gray-700 text-sm">
                  Save your searches in browser cache for instant demo/presentation mode - load previous results 
                  in under 1 second without re-running API calls.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Data Sources & Datasets */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Data Sources & Datasets
            </h2>
            <div className="space-y-6">
              
              {/* US Census Bureau */}
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  📊 US Census Bureau API
                </h3>
                <p className="text-gray-700 mb-3">
                  Real-time demographic data from the American Community Survey (ACS) 5-Year Estimates:
                </p>
                <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                  <p><strong>Age Distribution (Table B01001):</strong></p>
                  <ul className="ml-6 space-y-1 text-gray-700">
                    <li>• B01001_001E: Total population</li>
                    <li>• B01001_003E to B01001_025E: Male population by age brackets (0-5, 5-9, 10-14, ... 80-84, 85+)</li>
                    <li>• B01001_027E to B01001_049E: Female population by age brackets</li>
                    <li>• Aggregated into: 0-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+</li>
                  </ul>
                  <p className="mt-3"><strong>Income Distribution (Table B19001):</strong></p>
                  <ul className="ml-6 space-y-1 text-gray-700">
                    <li>• B19001_001E: Total households</li>
                    <li>• B19001_002E: Households with income &lt;$10k</li>
                    <li>• B19001_003E to B19001_017E: Income brackets up to $200k+</li>
                    <li>• Grouped into: &lt;$25k, $25k-$50k, $50k-$75k, $75k-$100k, $100k-$150k, $150k+</li>
                  </ul>
                  <p className="mt-3 text-gray-600">
                    <strong>API Endpoint:</strong> <code className="bg-white px-2 py-1 rounded">https://api.census.gov/data/2021/acs/acs5</code>
                  </p>
                  <p className="text-gray-600">
                    <strong>Geographic Level:</strong> Block Group (finest-grained Census geography)
                  </p>
                </div>
              </div>

              {/* Google Places API */}
              <div className="border-l-4 border-red-600 pl-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  📍 Google Places API
                </h3>
                <p className="text-gray-700 mb-3">
                  Live business data including locations, ratings, and customer reviews:
                </p>
                <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                  <p><strong>Nearby Search API:</strong> Finds competitors within search radius</p>
                  <ul className="ml-6 space-y-1 text-gray-700">
                    <li>• Supports 60+ business types (cafe, gym, restaurant, spa, etc.)</li>
                    <li>• Returns: name, location, rating, total reviews, place_id</li>
                    <li>• Limited to top 60 results per query</li>
                  </ul>
                  <p className="mt-3"><strong>Place Details API:</strong> Fetches detailed business information</p>
                  <ul className="ml-6 space-y-1 text-gray-700">
                    <li>• Reviews: Up to 5 most helpful reviews per business</li>
                    <li>• Includes: author name, rating (1-5), review text, timestamp</li>
                    <li>• Used for AI competitor analysis</li>
                  </ul>
                  <p className="mt-3 text-gray-600">
                    <strong>Cost per search:</strong> $0.105 (15 API calls: 3 Nearby + 3×5 Details requests)
                  </p>
                </div>
              </div>

              {/* Local GeoJSON Files */}
              <div className="border-l-4 border-green-600 pl-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🗺️ Local Geospatial Files
                </h3>
                <p className="text-gray-700 mb-3">
                  Pre-processed geographic datasets stored on the backend (100MB total):
                </p>
                <div className="bg-gray-50 rounded p-4 space-y-3 text-sm">
                  <div>
                    <p className="font-semibold">san_diego_boundary.geojson (3KB)</p>
                    <p className="text-gray-700 ml-4">City boundary polygon for validating search areas are within San Diego</p>
                  </div>
                  <div>
                    <p className="font-semibold">san_diego_block_groups.geojson (15MB)</p>
                    <p className="text-gray-700 ml-4">467 Census block group polygons with GEOID for Census API queries</p>
                  </div>
                  <div>
                    <p className="font-semibold">san_diego_zoning.geojson (32MB)</p>
                    <p className="text-gray-700 ml-4">Zoning classifications (Commercial, Residential, Mixed-Use, Industrial, Other) 
                    for assessing location suitability</p>
                  </div>
                  <div>
                    <p className="font-semibold">US_RetailCentres.gpkg (53MB)</p>
                    <p className="text-gray-700 ml-4">GeoPackage of 15,000+ retail centers nationwide (malls, shopping districts, plazas) 
                    with name, type, coordinates - used to calculate proximity for foot traffic estimates</p>
                  </div>
                  <p className="mt-3 text-gray-600">
                    <strong>Processing:</strong> GeoPandas for spatial joins, Shapely for geometric operations
                  </p>
                </div>
              </div>

              {/* Groq LLM */}
              <div className="border-l-4 border-purple-600 pl-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🤖 Groq API (LLM)
                </h3>
                <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                  <p><strong>Model:</strong> llama-3.1-8b-instant</p>
                  <p><strong>Purpose:</strong> Analyze competitor reviews and extract market insights</p>
                  <p><strong>Input:</strong> Up to 25 reviews (5 reviews × 5 competitors) with business names, ratings, and review text</p>
                  <p><strong>Output:</strong> JSON with:</p>
                  <ul className="ml-6 space-y-1 text-gray-700">
                    <li>• Overall strengths (what customers love across all competitors)</li>
                    <li>• Overall weaknesses (common complaints)</li>
                    <li>• Market opportunities (gaps your business could fill)</li>
                    <li>• Individual competitor summaries</li>
                  </ul>
                  <p className="text-gray-600 mt-2">
                    <strong>Rate limit:</strong> 30 requests/min (FREE tier), with 2-second delays between calls to avoid 429 errors
                  </p>
                </div>
              </div>

              {/* OpenStreetMap */}
              <div className="border-l-4 border-orange-600 pl-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🛣️ OpenStreetMap (OSM)
                </h3>
                <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                  <p className="text-gray-700">
                    Source for zoning GeoJSON and geographic boundaries. OSM data is preprocessed offline 
                    and stored locally to avoid runtime API calls.
                  </p>
                  <p className="text-gray-600">
                    <strong>Usage:</strong> Base layer for spatial analysis, no direct API calls during search
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* 5. Technology Stack */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Technology Stack
            </h2>
            
            <div className="space-y-6">
              {/* Frontend */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">💻</span>
                  Frontend
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Next.js 14</p>
                    <p className="text-xs text-gray-600">App Router</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">React 18</p>
                    <p className="text-xs text-gray-600">Client Components</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">TypeScript</p>
                    <p className="text-xs text-gray-600">Type Safety</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Tailwind CSS</p>
                    <p className="text-xs text-gray-600">Styling</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Leaflet.js</p>
                    <p className="text-xs text-gray-600">Interactive Maps</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Recharts</p>
                    <p className="text-xs text-gray-600">Data Visualization</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">localStorage</p>
                    <p className="text-xs text-gray-600">Search Caching</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Lucide Icons</p>
                    <p className="text-xs text-gray-600">UI Icons</p>
                  </div>
                </div>
              </div>

              {/* Backend */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-green-600">⚙️</span>
                  Backend
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Python 3.11</p>
                    <p className="text-xs text-gray-600">Runtime</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">FastAPI</p>
                    <p className="text-xs text-gray-600">REST API</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Uvicorn</p>
                    <p className="text-xs text-gray-600">ASGI Server</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">GeoPandas</p>
                    <p className="text-xs text-gray-600">Spatial Analysis</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Shapely</p>
                    <p className="text-xs text-gray-600">Geometry Ops</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Pandas</p>
                    <p className="text-xs text-gray-600">Data Processing</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Requests</p>
                    <p className="text-xs text-gray-600">HTTP Client</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Pydantic</p>
                    <p className="text-xs text-gray-600">Data Validation</p>
                  </div>
                </div>
              </div>

              {/* Hosting & Infrastructure */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-purple-600">☁️</span>
                  Hosting & Infrastructure
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Cloudflare Pages</p>
                    <p className="text-xs text-gray-600">Frontend Hosting</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">FREE</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Railway</p>
                    <p className="text-xs text-gray-600">Backend Hosting</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">$0-5/mo</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">GitHub</p>
                    <p className="text-xs text-gray-600">Version Control</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">FREE</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Docker</p>
                    <p className="text-xs text-gray-600">Containerization</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">Nixpacks</p>
                    <p className="text-xs text-gray-600">Build System</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <p className="font-semibold text-gray-900">GitHub Actions</p>
                    <p className="text-xs text-gray-600">CI/CD Pipeline</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. System Architecture & Backend Flow */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              System Architecture & Backend Flow
            </h2>
            <p className="text-gray-600 mb-6">
              High-level overview of how LocoFinder processes a location search request
            </p>

            {/* Architecture Description */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How the Backend Processes Your Search:
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">1.</span>
                  <span><strong>Input Validation:</strong> The system validates your search parameters (business type, radius, center point) and checks if the location is within San Diego boundaries.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">2.</span>
                  <span><strong>Data Collection:</strong> Three parallel API calls fetch data simultaneously - Census API for demographics, Google Places API for competitor locations, and local GeoJSON files for zoning and retail centers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">3.</span>
                  <span><strong>Scoring Engine:</strong> Each candidate location receives 7 different scores (population, demographics match, competition, foot traffic, transit access, parking, retail proximity) which are combined using customizable weights.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">4.</span>
                  <span><strong>Location Ranking:</strong> All candidate locations are ranked by their weighted opportunity score, and the top 3 are selected for detailed analysis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">5.</span>
                  <span><strong>AI Analysis:</strong> For each top location, competitor reviews are fetched from Google Places Details API and sent to Groq&apos;s LLM for intelligent analysis of market strengths, weaknesses, and opportunities.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">6.</span>
                  <span><strong>Response Delivery:</strong> The complete package (scores, demographics charts, competitor data, and AI insights) is returned as JSON and rendered in your browser with interactive visualizations.</span>
                </li>
              </ul>
            </div>

            {/* Flowchart Image */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Backend Processing Flowchart
              </h3>
              <div className="flex justify-center">
                <img
                  src="/backend-flow.png"
                  alt="Backend Architecture Flowchart"
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                Visual representation of the complete backend processing pipeline
              </p>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-700">~45 sec</p>
                <p className="text-sm text-gray-600">Average Search Time</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">15+ APIs</p>
                <p className="text-sm text-gray-600">External Calls per Search</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">100MB</p>
                <p className="text-sm text-gray-600">Local Geospatial Data</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
