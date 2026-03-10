import type { Coordinate, RouteInstruction, RouteResponse } from "@/types/navigation";

const TOMTOM_BASE_URL = "https://api.tomtom.com/routing/1/calculateRoute";

type TomTomInstruction = {
  routeOffsetInMeters: number;
  message: string;
  street?: string;
  point: {
    latitude: number;
    longitude: number;
  };
  maneuver: string;
};

type TomTomRouteResponse = {
  routes?: Array<{
    summary: {
      lengthInMeters: number;
      travelTimeInSeconds: number;
    };
    legs: Array<{
      summary: {
        lengthInMeters: number;
        travelTimeInSeconds: number;
      };
      points: Array<{ latitude: number; longitude: number }>;
    }>;
    guidance?: {
      instructions?: TomTomInstruction[];
    };
  }>;
  error?: {
    description?: string;
  };
};

const toCoordinate = (point: { latitude: number; longitude: number }): Coordinate => ({
  latitude: point.latitude,
  longitude: point.longitude,
});

const normalizeInstruction = (
  instruction: TomTomInstruction,
  index: number,
): RouteInstruction => ({
  index,
  message: instruction.message,
  maneuverType: instruction.maneuver,
  routeOffsetInMeters: instruction.routeOffsetInMeters,
  street: instruction.street,
  point: toCoordinate(instruction.point),
});

export async function fetchRoute(
  origin: Coordinate,
  destination: Coordinate,
): Promise<RouteResponse> {
  const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_TOMTOM_API_KEY environment variable.");
  }

  const coordinates = `${origin.latitude},${origin.longitude}:${destination.latitude},${destination.longitude}`;
  const url = new URL(`${TOMTOM_BASE_URL}/${coordinates}/json`);

  url.searchParams.set("instructionsType", "text");
  url.searchParams.set("language", "en-US");
  url.searchParams.set("routeType", "fastest");
  url.searchParams.set("travelMode", "car");
  url.searchParams.set("computeBestOrder", "false");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`TomTom request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as TomTomRouteResponse;

  if (!data.routes?.length) {
    throw new Error(data.error?.description ?? "No routes returned by TomTom.");
  }

  const selectedRoute = data.routes[0];
  const polyline = selectedRoute.legs.flatMap((leg) => leg.points.map(toCoordinate));
  const instructions = (selectedRoute.guidance?.instructions ?? []).map(normalizeInstruction);

  return {
    distanceInMeters: selectedRoute.summary.lengthInMeters,
    travelTimeInSeconds: selectedRoute.summary.travelTimeInSeconds,
    polyline,
    legs: selectedRoute.legs.map((leg) => ({
      summary: leg.summary,
      points: leg.points.map(toCoordinate),
    })),
    instructions,
  };
}
