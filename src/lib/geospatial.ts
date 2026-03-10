import type { Coordinate, RouteInstruction, RouteResponse } from "@/types/navigation";

const toLngLat = (coordinate: Coordinate): [number, number] => [coordinate.longitude, coordinate.latitude];

function getTurf() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.turf ?? null;
}

export function distanceBetweenInMeters(a: Coordinate, b: Coordinate): number {
  const turf = getTurf();
  if (!turf) {
    return Number.POSITIVE_INFINITY;
  }

  return turf.distance(toLngLat(a), toLngLat(b), { units: "meters" });
}

export function distanceFromRouteInMeters(position: Coordinate, route: RouteResponse): number {
  const turf = getTurf();
  if (!turf || route.polyline.length < 2) {
    return Number.POSITIVE_INFINITY;
  }

  const routeLine = turf.lineString(route.polyline.map(toLngLat));
  const snapped = turf.nearestPointOnLine(routeLine, turf.point(toLngLat(position)), {
    units: "meters",
  });

  return typeof snapped.properties.dist === "number"
    ? snapped.properties.dist
    : Number.POSITIVE_INFINITY;
}

export function getRemainingDistanceInMeters(
  position: Coordinate,
  route: RouteResponse,
  currentInstructionIndex: number,
): number {
  const instruction = route.instructions[currentInstructionIndex];
  if (!instruction) return 0;

  const toInstruction = distanceBetweenInMeters(position, instruction.point);
  const remainingFromInstruction = Math.max(route.distanceInMeters - instruction.routeOffsetInMeters, 0);

  return toInstruction + remainingFromInstruction;
}

export function getNextInstructionIndex(
  position: Coordinate,
  instructions: RouteInstruction[],
  currentInstructionIndex: number,
  triggerDistanceInMeters: number,
): number {
  let nextIndex = currentInstructionIndex;

  while (nextIndex < instructions.length - 1) {
    const distanceToInstruction = distanceBetweenInMeters(position, instructions[nextIndex].point);
    if (distanceToInstruction > triggerDistanceInMeters) break;
    nextIndex += 1;
  }

  return nextIndex;
}
