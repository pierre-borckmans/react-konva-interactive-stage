import {
  Bounds,
  Point,
  VisibleRect,
} from "react-konva-interactive-stage/dist/types";

interface StatePanelProps {
  position: Point;
  zoom: number;
  bounds: Bounds;
  visibleRect: VisibleRect;
}

const StatePanel = ({
  position,
  zoom,
  bounds,
  visibleRect,
}: StatePanelProps) => {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg px-4 md:px-6 py-2 h-full w-full">
      <h2 className="text-base font-medium text-gray-900 dark:text-white mb-3">
        Stage State
      </h2>
      <div className="grid lg:grid-cols-2 gap-x-6 gap-y-3">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span className="flex w-20 justify-end">Position:</span>
          <span className="bg-gray-200 dark:bg-gray-600 rounded px-1 w-40 justify-center flex">
            {position.x.toFixed(2)}, {position.y.toFixed(2)}
          </span>
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span className="flex w-24 justify-end">Zoom:</span>
          <span className="bg-gray-200 dark:bg-gray-600 rounded px-1 w-16 justify-center flex">
            {(zoom * 100).toFixed(0)}%
          </span>
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span className="flex w-20 justify-end">Bounds:</span>
          <div className="flex flex-col gap-1.5 border p-1.5 rounded border-gray-200 dark:border-gray-600">
            <span className="bg-gray-200 dark:bg-gray-600 rounded px-1 w-40 justify-center flex">
              {bounds.x.toFixed(0)}, {bounds.y.toFixed(0)}
            </span>
            <span className="bg-gray-200 dark:bg-gray-600 rounded px-1 w-40 justify-center flex">
              {bounds.width.toFixed(0)} × {bounds.height.toFixed(0)}
            </span>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span className="flex w-24 justify-end">Visible Area:</span>
          <div className="flex flex-col gap-1.5 border p-1.5 rounded border-gray-200 dark:border-gray-600">
            <span className="bg-gray-200 dark:bg-gray-600 rounded px-1 w-32 justify-center flex">
              {visibleRect.left.toFixed(0)}, {visibleRect.top.toFixed(0)}
            </span>
            <span className="bg-gray-200 dark:bg-gray-600 rounded px-1 w-32 justify-center flex">
              {visibleRect.right.toFixed(0)}, {visibleRect.bottom.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatePanel;
