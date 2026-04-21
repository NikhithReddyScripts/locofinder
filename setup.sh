#!/bin/bash

# LocoFinder Integration Setup Script
# This script helps set up the integrated project

set -e

echo "🚀 LocoFinder Integration Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "INTEGRATION_GUIDE.md" ]; then
    echo "❌ Error: Please run this script from the integrated-locofinder directory"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env file..."
    cat > backend/.env << EOF
# Google Maps API Key (Required for mapping features)
GOOGLE_MAPS_API_KEY=

# Census API Key (Optional - works with rate limits without key)
CENSUS_API_KEY=

# Redis (Optional - falls back to DuckDB if not available)
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=backend/data/locations.db
EOF
    echo "✅ Created backend/.env"
    echo "⚠️  Please add your GOOGLE_MAPS_API_KEY to backend/.env"
else
    echo "✅ backend/.env already exists"
fi

# Create geo data directory
echo ""
echo "📁 Creating geo data directory..."
mkdir -p backend/data/geo
echo "✅ Created backend/data/geo"

# Check for GeoJSON files
echo ""
echo "🗺️  Checking for GeoJSON files..."
GEOJSON_FILES=("SDBoundary.geojson" "SDZoning.geojson" "SDBlockgrp.geojson")
MISSING_FILES=()

for file in "${GEOJSON_FILES[@]}"; do
    if [ ! -f "backend/data/geo/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ All GeoJSON files present"
else
    echo "⚠️  Missing GeoJSON files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Please copy these files from the main1 project:"
    echo "   cp path/to/main1/backend/data/*.geojson backend/data/geo/"
fi

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
cd backend
if command -v pip &> /dev/null; then
    pip install -r requirements.txt
    echo "✅ Python dependencies installed"
else
    echo "⚠️  pip not found. Please install Python dependencies manually:"
    echo "   cd backend && pip install -r requirements.txt"
fi
cd ..

# Install Node dependencies
echo ""
echo "📦 Installing Node dependencies..."
cd frontend
if command -v npm &> /dev/null; then
    npm install
    echo "✅ Node dependencies installed"
else
    echo "⚠️  npm not found. Please install Node dependencies manually:"
    echo "   cd frontend && npm install"
fi
cd ..

# Summary
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Add your GOOGLE_MAPS_API_KEY to backend/.env"
echo ""
echo "2. Copy GeoJSON files if not already done:"
echo "   cp path/to/main1/backend/data/*.geojson backend/data/geo/"
echo ""
echo "3. Start the backend (terminal 1):"
echo "   cd backend"
echo "   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001"
echo ""
echo "4. Start the frontend (terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "5. Access the application:"
echo "   - Main Dashboard: http://localhost:3000"
echo "   - Market Research: http://localhost:3000/market-research"
echo "   - API Docs: http://localhost:8001/docs"
echo ""
echo "See INTEGRATION_GUIDE.md for detailed documentation."
