"use client";

import { useCallback, useState } from "react";
import { MapView } from "@/components/map/MapView";
import { NavigationPanel } from "@/components/navigation/NavigationPanel";
import { PlanningPanel } from "@/components/planning/PlanningPanel";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { fetchRoute } from "@/lib/tomtom";
import type { ActiveNavigation, Coordinate, NavigationState } from "@/types/navigation";

const INITIAL_NAVIGATION_STATE: NavigationState = {
  mode: "planning",
  origin: null,
  destination: null,
  activeNavigation: null,
};

export function AppShell() {
  const [navigationState, setNavigationState] = useState<NavigationState>(INITIAL_NAVIGATION_STATE);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const geolocation = useGeolocation();
  const { speak, stop } = useSpeechSynthesis();

  const handlePlanRoute = useCallback(async (origin: Coordinate, destination: Coordinate) => {
    setIsLoadingRoute(true);
    setRouteError(null);

    try {
      const route = await fetchRoute(origin, destination);
      setNavigationState((prev) => ({
        ...prev,
        origin,
        destination,
        mode: "planning",
        activeNavigation: {
          route,
          currentInstructionIndex: 0,
          remainingDistanceInMeters: route.distanceInMeters,
          isOffRoute: false,
          hasArrived: false,
        },
      }));
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : "Failed to plan route.");
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  const handleStartNavigation = useCallback(() => {
    if (!navigationState.activeNavigation) {
      setRouteError("Plan a route before starting navigation.");
      return;
    }

    setNavigationState((prev) => ({ ...prev, mode: "navigating" }));
  }, [navigationState.activeNavigation]);

  const handleStopNavigation = useCallback(() => {
    stop();
    setNavigationState((prev) => ({ ...prev, mode: "planning" }));
  }, [stop]);

  const handleNavigationUpdate = useCallback((nextActiveNavigation: ActiveNavigation) => {
    setNavigationState((prev) => ({ ...prev, activeNavigation: nextActiveNavigation }));
  }, []);

  useNavigationProgress({
    currentPosition: geolocation.position,
    activeNavigation: navigationState.mode === "navigating" ? navigationState.activeNavigation : null,
    onNavigationUpdate: handleNavigationUpdate,
    onInstructionChanged: (instructionText) => speak(instructionText),
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Riyadh Pulse Navigator</h1>
        <p className="text-sm text-slate-600">Client-side turn-by-turn navigation prototype.</p>
      </header>

      <section className="grid flex-1 gap-4 md:grid-cols-[380px,1fr]">
        <div className="space-y-4">
          <PlanningPanel
            onPlanRoute={handlePlanRoute}
            isLoadingRoute={isLoadingRoute}
            error={routeError}
          />
          <NavigationPanel
            activeNavigation={navigationState.mode === "navigating" ? navigationState.activeNavigation : null}
            onStart={handleStartNavigation}
            onStop={handleStopNavigation}
            isLoadingGps={geolocation.isLoading}
            geolocationError={geolocation.error}
          />
        </div>

        <div className="h-[52vh] min-h-[360px] rounded-2xl bg-slate-100 md:h-full">
          <MapView
            currentPosition={geolocation.position}
            origin={navigationState.origin}
            destination={navigationState.destination}
            routeLine={navigationState.activeNavigation?.route.polyline ?? []}
          />
        </div>
      </section>
    </main>
  );
}
