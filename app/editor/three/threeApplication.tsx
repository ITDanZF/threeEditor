"use client";
import { useThreeApp } from "./hooks/useThreeApp";
import {
  Grid,
  MouseEvent,
  WorldCoordinate,
  entity_manager,
  RenderLoop,
} from "./core";
import { useEffect, useRef } from "react";
export const ThreeApplication = () => {
  const mountId = "three-mount";
  const { ready, getViewer } = useThreeApp(mountId);
  // 用 useRef 保存单例实例，避免重复创建
  const entityManagerRef = useRef<InstanceType<
    typeof entity_manager.EntityManager
  > | null>(null);
  const renderLoopRef = useRef<RenderLoop | null>(null);

  useEffect(() => {
    if (!ready) return;
    const Viewer = getViewer();
    if (!Viewer) return;

    // 初始化鼠标事件
    MouseEvent(Viewer);
    // 初始化世界坐标系
    WorldCoordinate(Viewer);
    // 初始化网格
    Grid(Viewer);

    if (!entityManagerRef.current) {
      entityManagerRef.current = new entity_manager.EntityManager();
    }
    if (!renderLoopRef.current) {
      renderLoopRef.current = new RenderLoop(Viewer, entityManagerRef.current);
      renderLoopRef.current.start();
    }

    // 挂载实体管理器
    Viewer.mountEntityManager(entityManagerRef.current);
    // 挂载渲染循环
    Viewer.mountRenderLoop(renderLoopRef.current);

    return () => {
      if (renderLoopRef.current) {
        renderLoopRef.current.stop();
        renderLoopRef.current = null;
      }
      if (entityManagerRef.current) {
        // TODO：调用 entityManager 的清理逻辑
        entityManagerRef.current = null;
      }
    };
  }, [ready, getViewer]);

  return (
    <div className="w-full h-full">
      {!ready && <div>Loading…</div>}
      <div id={mountId} className="w-full h-full" />
    </div>
  );
};
