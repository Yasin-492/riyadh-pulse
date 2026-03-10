export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RouteLeg = {
  summary: {
    lengthInMeters: number;
    travelTimeInSeconds: number;
  };
  points: Coordinate[];
};

export type ManeuverType =
  | "DEPART"
  | "TURN_LEFT"
  | "TURN_RIGHT"
  | "KEEP_LEFT"
  | "KEEP_RIGHT"
  | "CONTINUE"
  | "ARRIVE"
  | "ROUNDABOUT";

export type RouteInstruction = {
  index: number;
  message: string;
  maneuverType: ManeuverType | string;
  street?: string;
  routeOffsetInMeters: number;
  point: Coordinate;
};

export type RouteResponse = {
  distanceInMeters: number;
  travelTimeInSeconds: number;
  polyline: Coordinate[];
  legs: RouteLeg[];
  instructions: RouteInstruction[];
};

export type NavigationMode = "planning" | "navigating";

export type ActiveNavigation = {
  route: RouteResponse;
  currentInstructionIndex: number;
  remainingDistanceInMeters: number;
  isOffRoute: boolean;
  hasArrived: boolean;
};

export type NavigationState = {
  mode: NavigationMode;
  origin: Coordinate | null;
  destination: Coordinate | null;
  activeNavigation: ActiveNavigation | null;
};

export type GeolocationState = {
  permission: PermissionState | "prompt" | "unsupported";
  position: Coordinate | null;
  heading: number | null;
  speedMetersPerSecond: number | null;
  accuracyInMeters: number | null;
  error: string | null;
  isLoading: boolean;
};
