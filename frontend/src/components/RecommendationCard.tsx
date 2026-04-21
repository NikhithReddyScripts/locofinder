import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, AlertTriangle, Lightbulb, Users, DollarSign, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Recommendation {
  location_id: string;
  name: string;
  lat: number;
  lng: number;
  opportunity_score: number;
  population_estimate: number;
  competitor_count: number;
  market_saturation: number;
  zone_category?: string;
  in_commercial_zone: boolean;
  retail_center_distance?: number;
  demographics_score: number;
  foot_traffic_score: number;
  accessibility_score: number;
  competitors: Array<{
    name: string;
    rating?: number;
    reviews?: number;
  }>;
  nearest_retail_centers: Array<{
    name: string;
    type: string;
    distance_meters: number;
  }>;
  competitor_analysis?: {
    overall_strengths: string[];
    overall_weaknesses: string[];
    market_opportunities: string[];
    competitor_summaries: Array<{
      name: string;
      summary: string;
    }>;
  };
  demographics_data?: {
    age_distribution: { [key: string]: number };
    income_distribution: { [key: string]: number };
  };
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  rank: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, rank }) => {
  const [showDemographics, setShowDemographics] = useState(false);
  const [showMarketIntel, setShowMarketIntel] = useState(false);
  const [showLocationFactors, setShowLocationFactors] = useState(false);

  // Process demographics data for charts
  const getAgeChartData = () => {
    if (!recommendation.demographics_data?.age_distribution) return [];
    
    const ageData = recommendation.demographics_data.age_distribution;
    return [
      { age: '0-17', count: (ageData['0-17'] || 0) },
      { age: '18-24', count: (ageData['18-24'] || 0) },
      { age: '25-34', count: (ageData['25-34'] || 0) },
      { age: '35-44', count: (ageData['35-44'] || 0) },
      { age: '45-54', count: (ageData['45-54'] || 0) },
      { age: '55-64', count: (ageData['55-64'] || 0) },
      { age: '65+', count: (ageData['65+'] || 0) },
    ];
  };

  const getIncomeChartData = () => {
    if (!recommendation.demographics_data?.income_distribution) return [];
    
    const incomeData = recommendation.demographics_data.income_distribution;
    return [
      { income: '<$25k', count: (incomeData['<$25k'] || 0) },
      { income: '$25-50k', count: (incomeData['$25k-$50k'] || 0) },
      { income: '$50-75k', count: (incomeData['$50k-$75k'] || 0) },
      { income: '$75-100k', count: (incomeData['$75k-$100k'] || 0) },
      { income: '$100-150k', count: (incomeData['$100k-$150k'] || 0) },
      { income: '$150k+', count: (incomeData['$150k+'] || 0) },
    ];
  };

  const getTopAgeGroups = () => {
    if (!recommendation.demographics_data?.age_distribution) return [];
    
    const ageData = recommendation.demographics_data.age_distribution;
    const total = Object.values(ageData).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return [];
    
    return Object.entries(ageData)
      .map(([age, count]) => ({
        age,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
      .slice(0, 3);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-50';
    if (score >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">#{rank}</span>
              <h3 className="text-xl font-semibold">{recommendation.name}</h3>
            </div>
            <p className="text-sm text-green-50 mt-1">
              {recommendation.lat.toFixed(4)}, {recommendation.lng.toFixed(4)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{recommendation.opportunity_score}</div>
            <div className="text-sm text-green-50">Opportunity Score</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50">
        <div>
          <div className="text-sm text-gray-600">Population</div>
          <div className="text-2xl font-bold">{recommendation.population_estimate.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Competitors</div>
          <div className="text-2xl font-bold">{recommendation.competitor_count}</div>
          <div className="text-xs text-gray-500">{recommendation.market_saturation.toFixed(1)}/10k saturation</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Demographics</div>
          <div className={`text-2xl font-bold ${getScoreColor(recommendation.demographics_score)}`}>
            {recommendation.demographics_score}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Foot Traffic</div>
          <div className={`text-2xl font-bold ${getScoreColor(recommendation.foot_traffic_score)}`}>
            {recommendation.foot_traffic_score}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Location Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Location Details</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Zone:</span> <span className="font-medium">{recommendation.zone_category || 'Other'}</span></p>
              <p><span className="text-gray-600">Accessibility:</span> <span className={`font-medium ${getScoreColor(recommendation.accessibility_score)}`}>{recommendation.accessibility_score}/100</span></p>
              <p><span className="text-gray-600">Nearest Retail:</span> <span className="font-medium">{recommendation.retail_center_distance ? `${(recommendation.retail_center_distance / 1609).toFixed(2)} miles` : 'N/A'}</span></p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Nearby Retail Centers</h4>
            <div className="space-y-1 text-sm">
              {recommendation.nearest_retail_centers.slice(0, 2).map((center, idx) => (
                <p key={idx} className="text-gray-600">
                  • {center.name} ({(center.distance_meters / 1609).toFixed(2)} mi)
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Top Competitors */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Top Competitors in Area</h4>
          <div className="grid grid-cols-2 gap-2">
            {recommendation.competitors.slice(0, 5).map((comp, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm font-medium truncate flex-1">{comp.name}</span>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-500">★</span>
                  <span>{comp.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-gray-400 text-xs">• {comp.reviews || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Demographics Breakdown */}
        {recommendation.demographics_data && (
          <div className="border-t pt-4">
            <button
              onClick={() => setShowDemographics(!showDemographics)}
              className="w-full flex items-center justify-between text-left font-semibold text-gray-700 hover:text-green-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Demographics Breakdown</span>
              </div>
              {showDemographics ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showDemographics && (
              <div className="mt-4 space-y-4">
                {/* Top Age Groups */}
                <div className="bg-blue-50 p-3 rounded">
                  <h5 className="font-medium text-gray-700 mb-2">Top Age Groups</h5>
                  <div className="flex gap-4">
                    {getTopAgeGroups().map((group, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{group.percentage}%</div>
                        <div className="text-sm text-gray-600">{group.age} years</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Age Distribution Chart */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Age Distribution</h5>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getAgeChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Income Distribution Chart */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Income Distribution</h5>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getIncomeChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="income" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: Market Intelligence (AI Analysis) */}
        {recommendation.competitor_analysis && (
          <div className="border-t pt-4">
            <button
              onClick={() => setShowMarketIntel(!showMarketIntel)}
              className="w-full flex items-center justify-between text-left font-semibold text-gray-700 hover:text-green-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                <span>Market Intelligence (AI Analysis)</span>
              </div>
              {showMarketIntel ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showMarketIntel && (
              <div className="mt-4 space-y-4">
                {/* Strengths */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h5 className="font-semibold text-green-900">What Customers Love</h5>
                  </div>
                  <ul className="space-y-1">
                    {recommendation.competitor_analysis.overall_strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-green-800">• {strength}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h5 className="font-semibold text-red-900">Common Complaints</h5>
                  </div>
                  <ul className="space-y-1">
                    {recommendation.competitor_analysis.overall_weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-red-800">• {weakness}</li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <h5 className="font-semibold text-yellow-900">Your Opportunity</h5>
                  </div>
                  <ul className="space-y-1">
                    {recommendation.competitor_analysis.market_opportunities.map((opp, idx) => (
                      <li key={idx} className="text-sm text-yellow-800">• {opp}</li>
                    ))}
                  </ul>
                </div>

                {/* Competitor Summaries */}
                {recommendation.competitor_analysis.competitor_summaries.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Competitor Insights</h5>
                    <div className="space-y-2">
                      {recommendation.competitor_analysis.competitor_summaries.map((comp, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded">
                          <div className="font-medium text-gray-900">{comp.name}</div>
                          <p className="text-sm text-gray-600 mt-1">{comp.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: Location Factors */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowLocationFactors(!showLocationFactors)}
            className="w-full flex items-center justify-between text-left font-semibold text-gray-700 hover:text-green-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Location Factors</span>
            </div>
            {showLocationFactors ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showLocationFactors && (
            <div className="mt-4 space-y-3">
              {/* Zone Analysis */}
              <div className={`p-3 rounded ${recommendation.in_commercial_zone ? 'bg-green-50' : 'bg-gray-50'}`}>
                <h5 className="font-medium text-gray-700 mb-1">Zone Type</h5>
                <p className="text-sm">
                  <span className="font-semibold">{recommendation.zone_category || 'Other'}</span>
                  {recommendation.in_commercial_zone && <span className="text-green-600 ml-2">✓ Commercial Zone</span>}
                </p>
              </div>

              {/* Transit & Accessibility */}
              <div className={`p-3 rounded ${getScoreBg(recommendation.accessibility_score)}`}>
                <h5 className="font-medium text-gray-700 mb-1">Transit Accessibility</h5>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${getScoreColor(recommendation.accessibility_score)}`}>
                    {recommendation.accessibility_score}/100
                  </div>
                  <div className="text-sm text-gray-600">
                    {recommendation.accessibility_score >= 70 ? 'Excellent' : 
                     recommendation.accessibility_score >= 50 ? 'Good' : 'Limited'} public transit access
                  </div>
                </div>
              </div>

              {/* Parking Estimate */}
              <div className="p-3 rounded bg-gray-50">
                <h5 className="font-medium text-gray-700 mb-1">Parking Availability</h5>
                <p className="text-sm text-gray-600">
                  {recommendation.accessibility_score < 50 ? 'Good' : 
                   recommendation.accessibility_score < 70 ? 'Moderate' : 'Limited'} parking expected
                  <span className="text-xs text-gray-500 ml-1">(inverse of transit score)</span>
                </p>
              </div>

              {/* Retail Proximity */}
              <div className="p-3 rounded bg-blue-50">
                <h5 className="font-medium text-gray-700 mb-1">Nearby Retail Centers</h5>
                <div className="space-y-1">
                  {recommendation.nearest_retail_centers.slice(0, 3).map((center, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">{center.name}</span>
                      <span className="text-gray-600"> - {center.type}</span>
                      <span className="text-blue-600 ml-2">{(center.distance_meters / 1609).toFixed(2)} mi</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
