import { ReactNode, useRef, useState } from "react";
import InteractiveStage, {
  InteractiveStageRenderProps,
  InteractiveStageType,
} from "react-konva-interactive-stage";
import { Bounds, VisibleRect } from "react-konva-interactive-stage/dist/types";
import { Header } from "./components/panels/Header.tsx";
import { useDarkMode } from "./hooks/useDarkMode";
import { Circle } from "react-konva";
import { InstructionsPanel } from "./components/panels/InstructionsPanel.tsx";
import OptionsPanel from "./components/panels/OptionsPanel.tsx";
import StatePanel from "./components/panels/StatePanel.tsx";
import { Tab, TabList, TabGroup } from "@headlessui/react";
import { color } from "./utils/color.ts";
import { BasicShapes } from "./components/stages/BasicShapes.tsx";
import { Images } from "./components/stages/Images.tsx";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function App() {
  const [isDark, setIsDark] = useDarkMode(true);
  const tabs = ["Basic Shapes", "Custom Content"];
  const [selectedTab, setSelectedTab] = useState(0);

  const stageRef = useRef<InteractiveStageType>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [bounds, setBounds] = useState<Bounds>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [visibleRect, setVisibleRect] = useState<VisibleRect>({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });

  const [debug, setDebug] = useState(true);
  const [clampPosition, setClampPosition] = useState(true);
  const [minimap, setMinimap] = useState(false);
  const [maxZoom, setMaxZoom] = useState(5);
  const [panSpeed, setPanSpeed] = useState(1.5);
  const [zoomSpeed, setZoomSpeed] = useState(5);
  const [zoomAnimationDuration, setZoomAnimationDuration] = useState(0.3);

  const [extraShapes, setExtraShapes] = useState<ReactNode[]>([]);

  const onAddShape = () => {
    const shape = (
      <Circle
        x={2000 + 100 * extraShapes.length}
        y={Math.random() * 3000}
        radius={50 + Math.random() * 30}
        fill={color(Math.random() * 15, isDark)}
      />
    );
    setExtraShapes((prev) => [...prev, shape]);
  };

  const onRemoveShape = () => {
    setExtraShapes((prev) => prev.slice(0, prev.length - 1));
  };

  return (
    <div className="flex flex-col h-screen min-h-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header isDark={isDark} onToggleDarkMode={() => setIsDark(!isDark)} />
      <div className="flex-1 flex min-h-0 pt-4">
        <div className="flex-1 min-h-0 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
          <div className="flex flex-col h-full min-h-0 gap-3">
            <InstructionsPanel
              onAddShape={onAddShape}
              onRemoveShape={onRemoveShape}
            />
            <div className="flex gap-4 items-center">
              <StatePanel
                position={position}
                zoom={zoom}
                bounds={bounds}
                visibleRect={visibleRect}
              />
              <OptionsPanel
                debug={debug}
                toggleDebug={setDebug}
                clampPosition={clampPosition}
                toggleClampPosition={setClampPosition}
                minimap={minimap}
                toggleMinimap={setMinimap}
                maxZoom={maxZoom}
                setMaxZoom={setMaxZoom}
                panSpeed={panSpeed}
                setPanSpeed={setPanSpeed}
                zoomSpeed={zoomSpeed}
                setZoomSpeed={setZoomSpeed}
                zoomAnimationDuration={zoomAnimationDuration}
                setZoomAnimationDuration={setZoomAnimationDuration}
              />
            </div>

            <div
              className="w-full bg-white dark:bg-gray-800 shadow-sm rounded-lg min-h-0 flex flex-col h-full"
              style={{ overflow: "visible" }}
            >
              <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
                <TabList className="flex space-x-1 rounded-t-lg bg-gray-100 dark:bg-gray-700 p-2">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab}
                      className={({ selected }) =>
                        classNames(
                          "w-full rounded-lg py-1.5 text-sm font-medium leading-5",
                          "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-700 ring-white/60 ring-opacity-60",
                          selected
                            ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow"
                            : "text-gray-500 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white",
                        )
                      }
                    >
                      {tab}
                    </Tab>
                  ))}
                </TabList>
              </TabGroup>

              <div
                className="flex min-h-0 h-full p-4 overflow-visible"
                style={{ overflow: "visible" }}
              >
                <InteractiveStage
                  stageRef={stageRef}
                  onZoomChange={setZoom}
                  onPositionChange={setPosition}
                  onBoundsChange={setBounds}
                  onVisibleRectChange={setVisibleRect}
                  options={{
                    maxZoom,
                    panSpeed,
                    zoomSpeed,
                    debug,
                    clampPosition,
                    zoomAnimationDuration,
                    minimap: {
                      show: minimap,
                      size: 0.2,
                    },
                  }}
                  className="h-full bg-gray-50 dark:bg-gray-900 rounded-md p-3"
                >
                  {({ zoomToElement }: InteractiveStageRenderProps) =>
                    selectedTab === 0 ? (
                      <BasicShapes
                        isDark={isDark}
                        extraShapes={extraShapes}
                        onShapeClick={(e) =>
                          zoomToElement(e.target, {
                            paddingPercent: 0.2,
                          })
                        }
                      />
                    ) : (
                      <Images />
                    )
                  }
                </InteractiveStage>
              </div>
            </div>

            <span className="text-gray-500 dark:text-gray-400 w-full flex justify-end py-2 opacity-50">
              Made with ❤️ by borck
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
