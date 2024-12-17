import { ZoomIcon, EyeIcon, DragIcon } from "./icons";
import ResetIcon from "./icons/ResetIcon.tsx";

export const InstructionsPanel = ({
  onAddShape,
  onRemoveShape,
}: {
  onAddShape: () => void;
  onRemoveShape: () => void;
}) => {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg px-4 md:px-6 py-4 gap-2">
      <div className="flex items-center justify-between gap-5">
        <div className="flex flex-col">
          <h2 className="text-base font-medium text-gray-900 dark:text-white">
            Reactive container
          </h2>
          <div className="text-gray-500 dark:text-gray-400">
            Try resizing your browser window to see how the stage resizes
          </div>
        </div>

        <div className="flex flex-col gap-1 items-end">
          <div className="flex items-center gap-4">
            <button
              className="px-2 bg-blue-500 text-white rounded-md"
              onClick={onAddShape}
            >
              <b>+</b> shape
            </button>
            <button
              className="px-2 bg-red-500 text-white rounded-md"
              onClick={onRemoveShape}
            >
              <b>-</b> shape
            </button>
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            Try adding and removing shapes to see how the bounds update
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-1">
        <h2 className="text-base font-medium text-gray-900 dark:text-white">
          Interactive Controls
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
              <ZoomIcon />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Click any shape to zoom to it
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
              <EyeIcon />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Use ⌘+wheel to zoom
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
              <DragIcon />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Wheel or Click and drag to pan
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
              <ResetIcon />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Double-click to reset zoom
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
