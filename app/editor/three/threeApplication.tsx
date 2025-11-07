"use client";
import { useThreeApp } from "./hooks/useThreeApp";
import { Grid, MouseEvent, WorldCoordinate } from "./core";
export const ThreeApplication = () => {
  const mountId = "three-mount";
  const { ready, getViewer } = useThreeApp(mountId);

  const Viewer = getViewer();
  if (Viewer && ready) {
    // 初始化鼠标事件
    MouseEvent(Viewer);
    // 初始化世界坐标系
    WorldCoordinate(Viewer);
    // 初始化网格
    Grid(Viewer);
  }

  return (
    <div className="w-full h-full">
      {!ready && <div>Loading…</div>}
      <div id={mountId} className="w-full h-full" />
    </div>
  );
};
