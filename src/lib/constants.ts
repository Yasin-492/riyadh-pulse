export const DEFAULT_MAP_CENTER = {
  latitude: 24.7136,
  longitude: 46.6753,
};

export const DEFAULT_MAP_ZOOM = 13;

export const ROUTE_PROGRESS_PROXIMITY_THRESHOLD_METERS = 30;
export const OFF_ROUTE_THRESHOLD_METERS = 45;
export const ARRIVAL_THRESHOLD_METERS = 20;

export const GEOLOCATION_HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12_000,
  maximumAge: 1_000,
};
