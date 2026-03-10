"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  ARRIVAL_THRESHOLD_METERS,
  OFF_ROUTE_THRESHOLD_METERS,
  ROUTE_PROGRESS_PROXIMITY_THRESHOLD_METERS,
} from "@/lib/constants";
import {
  distanceBetweenInMeters,
  distanceFromRouteInMeters,
  getNextInstructionIndex,
  getRemainingDistanceInMeters,
} from "@/lib/geospatial";
import type { ActiveNavigation, Coordinate } from "@/types/navigation";

type UseNavigationProgressArgs = {
  currentPosition: Coordinate | null;
  activeNavigation: ActiveNavigation | null;
  onNavigationUpdate: (next: ActiveNavigation) => void;
  onInstructionChanged?: (instructionText: string) => void;
};

export function useNavigationProgress({
  currentPosition,
  activeNavigation,
  onNavigationUpdate,
  onInstructionChanged,
}: UseNavigationProgressArgs) {
  const lastInstructionRef = useRef<number | null>(null);

  const nextState = useMemo(() => {
    if (!currentPosition || !activeNavigation) {
      return null;
    }

    const { route, currentInstructionIndex } = activeNavigation;
    const nextInstructionIndex = getNextInstructionIndex(
      currentPosition,
      route.instructions,
      currentInstructionIndex,
      ROUTE_PROGRESS_PROXIMITY_THRESHOLD_METERS,
    );

    const distanceToDestination = route.polyline.length
      ? distanceBetweenInMeters(currentPosition, route.polyline[route.polyline.length - 1])
      : Number.POSITIVE_INFINITY;

    const hasArrived = distanceToDestination <= ARRIVAL_THRESHOLD_METERS;
    const isOffRoute = distanceFromRouteInMeters(currentPosition, route) > OFF_ROUTE_THRESHOLD_METERS;
    const remainingDistanceInMeters = getRemainingDistanceInMeters(
      currentPosition,
      route,
      nextInstructionIndex,
    );

    return {
      ...activeNavigation,
      currentInstructionIndex: nextInstructionIndex,
      remainingDistanceInMeters,
      isOffRoute,
      hasArrived,
    };
  }, [activeNavigation, currentPosition]);

  useEffect(() => {
    if (!nextState) {
      return;
    }

    onNavigationUpdate(nextState);

    if (
      onInstructionChanged &&
      lastInstructionRef.current !== nextState.currentInstructionIndex
    ) {
      lastInstructionRef.current = nextState.currentInstructionIndex;
      const currentInstruction = nextState.route.instructions[nextState.currentInstructionIndex];
      if (currentInstruction?.message) {
        onInstructionChanged(currentInstruction.message);
      }
    }
  }, [nextState, onInstructionChanged, onNavigationUpdate]);
}
