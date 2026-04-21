"""
Geospatial analysis service for boundary checks, zoning, and population calculations.
Adapted from main1 geo.py
"""
from __future__ import annotations

import math
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional

import geopandas as gpd
from shapely.geometry import shape, Point, mapping
from shapely.ops import unary_union
from shapely import prepared


class GeospatialService:
    def __init__(self, data_dir: str = None):
        """
        Initialize geospatial service with data directory.
        
        Args:
            data_dir: Path to directory containing geojson files
        """
        if data_dir is None:
            data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "geo")
        
        self.data_dir = Path(data_dir)
        
        # Lazy-loaded geodataframes
        self._boundary_gdf: Optional[gpd.GeoDataFrame] = None
        self._zoning_gdf: Optional[gpd.GeoDataFrame] = None
        self._block_groups_gdf: Optional[gpd.GeoDataFrame] = None
        
        # Prepared geometry for fast queries
        self._boundary_prepared = None
        self._commercial_union_prepared = None

    def load_boundary(self) -> gpd.GeoDataFrame:
        """Load city/region boundary GeoJSON."""
        if self._boundary_gdf is None:
            path = self.data_dir / "SDBoundary.geojson"
            if not path.exists():
                raise FileNotFoundError(f"Boundary file not found: {path}")
            
            self._boundary_gdf = gpd.read_file(path).to_crs("EPSG:4326")
            
            # Create prepared geometry for fast contains checks
            union_geom = self._boundary_gdf.geometry.unary_union
            self._boundary_prepared = prepared.prep(union_geom)
        
        return self._boundary_gdf

    def load_zoning(self) -> gpd.GeoDataFrame:
        """
        Load zoning data and categorize zones.
        Creates zone_category: Commercial/Mixed-use/Industrial/Residential/Other
        """
        if self._zoning_gdf is None:
            path = self.data_dir / "SDZoning.geojson"
            if not path.exists():
                raise FileNotFoundError(f"Zoning file not found: {path}")
            
            self._zoning_gdf = gpd.read_file(path).to_crs("EPSG:4326")
            
            if "zone_name" not in self._zoning_gdf.columns:
                raise ValueError("Zoning file must include 'zone_name' column")
            
            # Categorize zones
            self._zoning_gdf["zone_category"] = self._zoning_gdf["zone_name"].apply(
                self._categorize_zone
            )
            
            # Build prepared geometry for commercial/mixed-use
            commercial = self._zoning_gdf[
                self._zoning_gdf["zone_category"].isin(["Commercial", "Mixed-use"])
            ].copy()
            
            if not commercial.empty:
                union_geom = unary_union(commercial.geometry.values)
                self._commercial_union_prepared = prepared.prep(union_geom)
            else:
                # Empty prepared geometry (always returns False)
                from shapely.geometry import Polygon
                self._commercial_union_prepared = prepared.prep(Polygon())
        
        return self._zoning_gdf

    def load_block_groups(self) -> gpd.GeoDataFrame:
        """Load census block groups GeoJSON."""
        if self._block_groups_gdf is None:
            path = self.data_dir / "SDBlockgrp.geojson"
            if not path.exists():
                raise FileNotFoundError(f"Block groups file not found: {path}")
            
            self._block_groups_gdf = gpd.read_file(path).to_crs("EPSG:4326")
            
            # Support both uppercase and lowercase GEOID
            if "GEOID" not in self._block_groups_gdf.columns and "geoid" not in self._block_groups_gdf.columns:
                raise ValueError("Block groups file must include 'GEOID' or 'geoid' column")

            # Standardize to uppercase GEOID
            if "geoid" in self._block_groups_gdf.columns and "GEOID" not in self._block_groups_gdf.columns:
                self._block_groups_gdf["GEOID"] = self._block_groups_gdf["geoid"]
                    
                return self._block_groups_gdf

    @staticmethod
    def _categorize_zone(zone_name: str) -> str:
        """
        Categorize zone name into broad categories.
        Adjust patterns based on your city's zoning codes.
        """
        if not zone_name:
            return "Other"
        
        z = zone_name.upper().strip()
        
        # Industrial
        if z.startswith(("IL", "IH", "IP", "IS", "IND", "M-")):
            return "Industrial"
        
        # Residential
        if z.startswith(("RS", "RT", "RM", "R-", "AR")):
            return "Residential"
        
        # Agricultural / Open space
        if z.startswith(("AG", "OS", "OP", "OT", "P-", "PA", "PR")):
            return "Other"
        
        # Commercial
        if z.startswith(("CN", "CR", "CC", "CO", "COMM", "C-")):
            return "Commercial"
        
        # Mixed-use
        if z.startswith(("MU", "MX", "EMX", "DMU", "DT", "D-")):
            return "Mixed-use"
        
        return "Other"

    def point_in_boundary(self, lng: float, lat: float) -> bool:
        """Check if point is within city/region boundary."""
        self.load_boundary()
        point = Point(lng, lat)
        return bool(self._boundary_prepared.contains(point))

    def point_in_commercial_zone(self, lng: float, lat: float) -> bool:
        """Check if point is in commercial or mixed-use zone."""
        self.load_zoning()
        point = Point(lng, lat)
        return bool(self._commercial_union_prepared.contains(point))

    def get_zone_category(self, lng: float, lat: float) -> Optional[str]:
        """Get zone category for a point."""
        zoning = self.load_zoning()
        point = Point(lng, lat)
        
        for _, row in zoning.iterrows():
            if row.geometry.contains(point):
                return row["zone_category"]
        
        return None

    @staticmethod
    def meters_to_degrees(meters: float, lat: float) -> Tuple[float, float]:
        """
        Convert meters to degrees (approximate).
        Returns (dlon, dlat) in degrees.
        """
        # 1 degree latitude ≈ 111,320 meters
        dlat = meters / 111_320.0
        
        # 1 degree longitude varies by latitude
        dlon = meters / (111_320.0 * max(0.1, math.cos(math.radians(lat))))
        
        return dlon, dlat

    def create_circle_polygon(self, lng: float, lat: float, radius_m: float, steps: int = 64):
        """
        Create a circular polygon approximation.
        
        Args:
            lng: Longitude of center
            lat: Latitude of center
            radius_m: Radius in meters
            steps: Number of points in circle
            
        Returns:
            Shapely Polygon
        """
        dlon, dlat = self.meters_to_degrees(radius_m, lat)
        
        points = []
        for i in range(steps):
            angle = 2 * math.pi * (i / steps)
            x = lng + dlon * math.cos(angle)
            y = lat + dlat * math.sin(angle)
            points.append((x, y))
        
        return shape({"type": "Polygon", "coordinates": [points]})

    def calculate_area_weighted_sum(
        self,
        polygons_gdf: gpd.GeoDataFrame,
        value_col: str,
        clip_geom,
    ) -> float:
        """
        Calculate area-weighted sum of a value within a clipping geometry.
        Useful for population calculations within a radius.
        
        Args:
            polygons_gdf: GeoDataFrame with polygons (e.g., block groups)
            value_col: Column name with values to sum (e.g., "population")
            clip_geom: Clipping geometry (e.g., circle)
            
        Returns:
            Sum weighted by intersection area
        """
        if polygons_gdf.empty:
            return 0.0
        
        # Project to equal-area CRS for accurate area calculations
        # EPSG:3310 = California Albers
        gdf = polygons_gdf.to_crs("EPSG:3310")
        clip = gpd.GeoSeries([clip_geom], crs="EPSG:4326").to_crs("EPSG:3310").iloc[0]
        
        total = 0.0
        for _, row in gdf.iterrows():
            poly = row.geometry
            
            if not poly.intersects(clip):
                continue
            
            intersection = poly.intersection(clip)
            if intersection.is_empty or poly.area <= 0:
                continue
            
            # Area-weighted proportion
            ratio = float(intersection.area / poly.area)
            total += float(row[value_col]) * ratio
        
        return total

    def get_boundary_geojson(self) -> Dict:
        """Get boundary as GeoJSON dict."""
        boundary = self.load_boundary()
        return boundary.__geo_interface__

    def get_zoning_geojson(self) -> Dict:
        """Get zoning as GeoJSON dict."""
        zoning = self.load_zoning()
        return zoning.__geo_interface__

    def get_block_groups_geojson(self, population_data: Optional[Dict[str, int]] = None) -> Dict:
        """
        Get block groups as GeoJSON dict, optionally with population data.
        
        Args:
            population_data: Dict mapping GEOID to population
            
        Returns:
            GeoJSON dict
        """
        block_groups = self.load_block_groups().copy()
        
        if population_data:
            block_groups["population"] = block_groups["GEOID"].map(population_data).fillna(0).astype(int)
        
        return block_groups.__geo_interface__
