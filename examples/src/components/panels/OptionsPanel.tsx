export default function OptionsPanel({
  debug,
  toggleDebug,
  clampPosition,
  toggleClampPosition,
  maxZoom,
  setMaxZoom,
  panSpeed,
  setPanSpeed,
  zoomSpeed,
  setZoomSpeed,
  zoomAnimationDuration,
  setZoomAnimationDuration,
  minimap,
  toggleMinimap,
}: {
  debug: boolean;
  toggleDebug: (debug: boolean) => void;
  clampPosition: boolean;
  toggleClampPosition: (clampPosition: boolean) => void;
  maxZoom: number;
  setMaxZoom: (maxZoom: number) => void;
  panSpeed: number;
  setPanSpeed: (panSpeed: number) => void;
  zoomSpeed: number;
  setZoomSpeed: (zoomSpeed: number) => void;
  zoomAnimationDuration: number;
  setZoomAnimationDuration: (zoomAnimationDuration: number) => void;
  minimap: boolean;
  toggleMinimap: (minimap: boolean) => void;
}) {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg px-4 md:px-6 py-2 h-full w-full">
      <h2 className="text-base font-medium text-gray-900 dark:text-white mb-3">
        Options
      </h2>
      <div className="grid lg:grid-cols-6 gap-y-3">
        <div className="flex items-center gap-2 col-span-2">
          <input
            type="checkbox"
            id="debug"
            className="w-4 h-4 text-primary-bright cursor-pointer"
            checked={debug}
            onChange={() => {
              toggleDebug(!debug);
            }}
          />
          <label
            htmlFor="show-bounds"
            className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-200"
          >
            Show Debug Bounds
          </label>
        </div>
        <div className="flex items-center gap-2  col-span-2">
          <input
            type="checkbox"
            id="clamp"
            className="w-4 h-4 text-primary-bright cursor-pointer"
            checked={clampPosition}
            onChange={() => {
              toggleClampPosition(!clampPosition);
            }}
          />
          <label
            htmlFor="clamp"
            className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-200"
          >
            Clamp Position
          </label>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <input
            type="checkbox"
            id="minimap"
            className="w-4 h-4 text-primary-bright cursor-pointer"
            checked={minimap}
            onChange={() => {
              toggleMinimap(!minimap);
            }}
          />
          <label
            htmlFor="minimap"
            className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-200"
          >
            Show Minimap
          </label>
        </div>

        <div className="flex items-center gap-2 col-span-3">
          <input
            type="range"
            id="max-zoom"
            className="xl:w-24 lg:w-16 sm:w-28 w-9"
            min={1}
            max={50}
            step={0.1}
            value={maxZoom}
            onChange={(e) => {
              setMaxZoom(Number(e.target.value));
            }}
          />
          <label
            htmlFor="max-zoom"
            className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-200"
          >
            Max Zoom ({maxZoom})
          </label>
        </div>

        <div className="flex items-center gap-2  col-span-3">
          <input
            type="range"
            id="pan-speed"
            className="xl:w-24 lg:w-16 sm:w-28 w-9"
            min={0.1}
            max={10}
            step={0.1}
            value={panSpeed}
            onChange={(e) => {
              setPanSpeed(Number(e.target.value));
            }}
          />
          <label
            htmlFor="pan-speed"
            className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-200"
          >
            Pan Speed ({panSpeed})
          </label>
        </div>

        <div className="flex items-center gap-2  col-span-3">
          <input
            type="range"
            id="zoom-speed"
            className="xl:w-24 lg:w-16 sm:w-28 w-9"
            min={1}
            max={10}
            step={0.1}
            value={zoomSpeed}
            onChange={(e) => {
              setZoomSpeed(Number(e.target.value));
            }}
          />
          <label
            htmlFor="zoom-speed"
            className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-200"
          >
            Zoom Speed ({zoomSpeed})
          </label>
        </div>

        <div className="flex items-center gap-2  col-span-3">
          <input
            type="range"
            id="zoom-animation-duration"
            className="xl:w-24 lg:w-16 sm:w-28 w-9"
            min={0.05}
            max={3}
            step={0.05}
            value={zoomAnimationDuration}
            onChange={(e) => {
              setZoomAnimationDuration(Number(e.target.value));
            }}
          />
          <label
            htmlFor="zoom-animation-duration"
            className="text-sm font-medium cursor-pointer text-neutral-700 dark:text-neutral-200"
          >
            Zoom Animation ({zoomAnimationDuration}s)
          </label>
        </div>
      </div>
    </div>
  );
}
