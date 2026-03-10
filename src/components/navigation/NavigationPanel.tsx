"use client";

import type { ActiveNavigation } from "@/types/navigation";

type NavigationPanelProps = {
  activeNavigation: ActiveNavigation | null;
  onStart: () => void;
  onStop: () => void;
  isLoadingGps: boolean;
  geolocationError: string | null;
};

export function NavigationPanel({
  activeNavigation,
  onStart,
  onStop,
  isLoadingGps,
  geolocationError,
}: NavigationPanelProps) {
  const currentInstruction =
    activeNavigation?.route.instructions[activeNavigation.currentInstructionIndex] ?? null;

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Navigation mode</h2>
        {activeNavigation ? (
          <button className="text-sm font-medium text-red-600" onClick={onStop}>
            Stop
          </button>
        ) : null}
      </div>

      {!activeNavigation ? (
        <button
          className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          onClick={onStart}
          disabled={isLoadingGps}
        >
          {isLoadingGps ? "Waiting for GPS..." : "Start navigation"}
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Next instruction</p>
          <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-900">
            {currentInstruction?.message ?? "Following route..."}
          </p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-slate-500">Remaining</p>
              <p className="font-semibold text-slate-900">
                {(activeNavigation.remainingDistanceInMeters / 1000).toFixed(2)} km
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-slate-500">Status</p>
              <p className="font-semibold text-slate-900">
                {activeNavigation.hasArrived
                  ? "Arrived"
                  : activeNavigation.isOffRoute
                    ? "Off route"
                    : "On route"}
              </p>
            </div>
          </div>
        </div>
      )}

      {geolocationError ? <p className="mt-3 text-sm text-red-600">GPS: {geolocationError}</p> : null}
    </section>
  );
}
