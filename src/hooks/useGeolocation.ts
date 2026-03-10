"use client";

import { useEffect, useRef, useState } from "react";
import { GEOLOCATION_HIGH_ACCURACY_OPTIONS } from "@/lib/constants";
import type { GeolocationState } from "@/types/navigation";

function getInitialState(): GeolocationState {
  if (typeof window === "undefined") {
    return {
      permission: "prompt",
      position: null,
      heading: null,
      speedMetersPerSecond: null,
      accuracyInMeters: null,
      error: null,
      isLoading: true,
    };
  }

  if (!("geolocation" in navigator)) {
    return {
      permission: "unsupported",
      position: null,
      heading: null,
      speedMetersPerSecond: null,
      accuracyInMeters: null,
      error: "Geolocation is not supported in this browser.",
      isLoading: false,
    };
  }

  return {
    permission: "prompt",
    position: null,
    heading: null,
    speedMetersPerSecond: null,
    accuracyInMeters: null,
    error: null,
    isLoading: true,
  };
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(getInitialState);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }


    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          position: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          heading: position.coords.heading,
          speedMetersPerSecond: position.coords.speed,
          accuracyInMeters: position.coords.accuracy,
          isLoading: false,
          error: null,
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
      },
      GEOLOCATION_HIGH_ACCURACY_OPTIONS,
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return state;
}
