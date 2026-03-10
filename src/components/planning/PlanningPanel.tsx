"use client";

import { useMemo, useState } from "react";
import type { Coordinate } from "@/types/navigation";

type PlanningPanelProps = {
  onPlanRoute: (origin: Coordinate, destination: Coordinate) => Promise<void>;
  isLoadingRoute: boolean;
  error: string | null;
};

function parseCoordinateInput(value: string): Coordinate | null {
  const [latitudeRaw, longitudeRaw] = value.split(",").map((segment) => segment.trim());
  const latitude = Number(latitudeRaw);
  const longitude = Number(longitudeRaw);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

export function PlanningPanel({ onPlanRoute, isLoadingRoute, error }: PlanningPanelProps) {
  const [originText, setOriginText] = useState("24.7136, 46.6753");
  const [destinationText, setDestinationText] = useState("24.7743, 46.7386");

  const isDisabled = useMemo(() => {
    return !parseCoordinateInput(originText) || !parseCoordinateInput(destinationText) || isLoadingRoute;
  }, [destinationText, isLoadingRoute, originText]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const origin = parseCoordinateInput(originText);
    const destination = parseCoordinateInput(destinationText);

    if (!origin || !destination) {
      return;
    }

    await onPlanRoute(origin, destination);
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">Planning mode</h2>
      <p className="mt-1 text-sm text-slate-600">Enter coordinates as `latitude, longitude`.</p>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Origin</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={originText}
            onChange={(event) => setOriginText(event.target.value)}
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-700">Destination</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={destinationText}
            onChange={(event) => setDestinationText(event.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoadingRoute ? "Planning route..." : "Plan route"}
        </button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </section>
  );
}
