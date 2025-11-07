"use client";
import { useThreeApp } from "./hooks/useThreeApp";
import { WorldCoordinate } from "./core/WorldCoordinate";
import { MouseEvent } from "./core/MouseEvent";
export const ThreeApplication = () => {
  const mountId = "three-mount";
  const { ready, getViewer } = useThreeApp(mountId);

  const Viewer = getViewer();
  if (Viewer && ready) {
    // 初始化鼠标事件
    MouseEvent(Viewer);
    // 初始化世界坐标系
    WorldCoordinate(Viewer);
  }

  return (
    <div className="w-full h-full">
      {!ready && <div>Loading…</div>}
      <div id={mountId} className="w-full h-full" />
    </div>
  );
};
