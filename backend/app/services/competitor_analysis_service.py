"""
Competitor Review Analysis Service

Uses Groq API (free, fast cloud LLM) to analyze competitor reviews.
Get free API key at: https://console.groq.com
"""

import os
import requests
import logging
import json
from typing import Dict, Any, List

logger = logging.getLogger("locofinder")


class CompetitorAnalysisService:
    """Analyze competitor reviews using Groq API."""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            logger.warning("GROQ_API_KEY not set. Competitor analysis will use fallback.")
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.1-8b-instant"  # Fast, free model
    
    def analyze_competitors(
        self,
        competitors_with_reviews: List[Dict[str, Any]],
        business_type: str
    ) -> Dict[str, Any]:
        """
        Analyze competitor reviews to extract insights.
        
        Args:
            competitors_with_reviews: List of competitors with their reviews
            business_type: Type of business (e.g., 'cafe', 'gym')
        
        Returns:
            Analysis with strengths, weaknesses, and opportunities
        """
        
        if not competitors_with_reviews:
            return self._get_fallback_analysis()
        
        if not self.api_key:
            logger.warning("Groq API key not set, using fallback analysis")
            return self._get_fallback_analysis()
        
        # Build prompt with all competitor reviews
        prompt = self._build_analysis_prompt(competitors_with_reviews, business_type)
        
        try:
            # Call Groq API
            response = requests.post(
                self.api_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a business analyst expert at analyzing competitor reviews. Always respond with valid JSON only."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1500,
                },
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            response_text = result["choices"][0]["message"]["content"]
            
            # Parse response
            analysis = self._parse_analysis(response_text)
            
            logger.info(f"Successfully analyzed {len(competitors_with_reviews)} competitors using Groq")
            return analysis
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Groq API: {e}")
            return self._get_fallback_analysis()
        except Exception as e:
            logger.error(f"Error analyzing competitors: {e}")
            return self._get_fallback_analysis()
    
    def _build_analysis_prompt(
        self,
        competitors: List[Dict[str, Any]],
        business_type: str
    ) -> str:
        """Build prompt for LLM analysis."""
        
        prompt = f"""Analyze competitor reviews for a {business_type} business location analysis.

{len(competitors)} competitors with their customer reviews are provided below.

Extract:
1. 3 common STRENGTHS across competitors (what customers praise)
2. 3 common WEAKNESSES across competitors (what customers complain about)
3. 2 MARKET OPPORTUNITIES (unmet needs, gaps a new business could fill)
4. Brief summary for each competitor (2-3 sentences)

Respond ONLY with valid JSON (no markdown, no extra text):
{{
  "overall_strengths": ["strength 1", "strength 2", "strength 3"],
  "overall_weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "market_opportunities": ["opportunity 1", "opportunity 2"],
  "competitor_summaries": [
    {{"name": "Name", "summary": "Brief summary"}}
  ]
}}

COMPETITORS AND REVIEWS:

"""
        
        for idx, comp in enumerate(competitors, 1):
            prompt += f"\n{idx}. {comp['name']} - {comp['rating']}/5 ({comp['user_rating_count']} reviews)\n"
            
            for review in comp.get('reviews', [])[:3]:  # Top 3 reviews per competitor
                review_text = review['text'][:250].replace('\n', ' ')
                prompt += f"   [{review['rating']}/5]: {review_text}\n"
            prompt += "\n"
        
        prompt += "JSON response:"
        
        return prompt
    
    def _parse_analysis(self, response_text: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        
        try:
            # Extract JSON from response
            if "```json" in response_text:
                start = response_text.find("```json") + 7
                end = response_text.find("```", start)
                json_text = response_text[start:end].strip()
            elif "```" in response_text:
                start = response_text.find("```") + 3
                end = response_text.find("```", start)
                json_text = response_text[start:end].strip()
            else:
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                if start >= 0 and end > start:
                    json_text = response_text[start:end]
                else:
                    json_text = response_text.strip()
            
            parsed = json.loads(json_text)
            
            # Validate and fill missing keys
            default_structure = self._get_fallback_analysis()
            for key in default_structure:
                if key not in parsed:
                    parsed[key] = default_structure[key]
            
            return parsed
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.error(f"Response: {response_text[:300]}")
            return self._get_fallback_analysis()
    
    def _get_fallback_analysis(self) -> Dict[str, Any]:
        """Return generic analysis when LLM unavailable."""
        return {
            "overall_strengths": [
                "Quality products and services",
                "Convenient location",
                "Friendly customer service"
            ],
            "overall_weaknesses": [
                "Pricing competitiveness",
                "Operating hours limitations",
                "Parking availability"
            ],
            "market_opportunities": [
                "Extended operating hours",
                "Competitive pricing strategy"
            ],
            "competitor_summaries": []
        }
