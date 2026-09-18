export interface CategoryGroup {
  id: string;
  label: string;
  icon: string;
}

export interface CategoryTag {
  key: string;
  value: string;
}

export interface VoyageCategory {
  id: string;
  label: string;
  group: string;
  icon: string;
  color: string;
  tags: CategoryTag[];
}

export interface POIItem {
  id: number | string;
  name: string;
  category: string;
  categoryId?: string;
  categoryGroup?: string | null;
  categoryIcon?: string;
  categoryColor?: string;
  subText?: string;
  coordinates: [number, number];
  evaluate: number;
  place: string;
  number?: string;
  phone?: string;
  opening_hours?: string;
}

export interface GetPOIsParams {
  center?: [number, number];
  radiusKm?: number | null;
  bounds?: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  category?: VoyageCategory | null;
  group?: string | null;
}

export interface GeoJSONCircleFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: Record<string, unknown>;
}

export declare const CATEGORY_GROUPS: CategoryGroup[];
export declare const VOYAGE_CATEGORIES: VoyageCategory[];
export declare function getCategoryFromOSMTags(tags?: Record<string, any> | null): VoyageCategory | null;

export declare const mapService: {
  getPOIs(params: GetPOIsParams): Promise<POIItem[]>;
  searchByName(query: string, center?: [number, number]): Promise<POIItem[]>;
  getRoute(startCoords: [number, number], endCoords: [number, number]): Promise<any>;
  createGeoJSONCircle(center: [number, number], radiusInKm: number | null | undefined, points?: number): GeoJSONCircleFeature;
};
