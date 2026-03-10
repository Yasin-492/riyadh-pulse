export {};

type PointFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    dist?: number;
  };
};

type LineFeature = {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: Record<string, never>;
};

declare global {
  interface Window {
    maplibregl?: {
      Map: new (options: {
        container: HTMLElement;
        style: string;
        center: [number, number];
        zoom: number;
        attributionControl?: boolean;
      }) => unknown;
      NavigationControl: new () => unknown;
      Marker: new (options?: { color?: string }) => {
        addTo: (map: unknown) => void;
        getElement: () => HTMLElement;
        setLngLat: (lngLat: [number, number]) => unknown;
      };
    };
    turf?: {
      distance: (
        from: [number, number],
        to: [number, number],
        options: { units: "meters" },
      ) => number;
      lineString: (coordinates: [number, number][]) => LineFeature;
      point: (coordinates: [number, number]) => PointFeature;
      nearestPointOnLine: (
        line: LineFeature,
        point: PointFeature,
        options: { units: "meters" },
      ) => PointFeature;
    };
  }
}
