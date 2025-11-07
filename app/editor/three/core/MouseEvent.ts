import type ThreeViewer from "./index";
import * as THREE from "three";

export const MouseEvent = (Viewer: ThreeViewer) => {
  const renderer = Viewer.getRenderer();
  const camera = Viewer.getCamera();

  if (!renderer || !camera) return;

  const canvas = renderer.domElement as unknown as HTMLElement & {
    __mouseInited?: boolean;
  };

  // 避免重复初始化
  if (canvas.__mouseInited) return;
  canvas.__mouseInited = true;

  // 目标点（围绕其旋转/缩放/平移）
  const target = new THREE.Vector3(0, 0, 0);

  // 若相机在原点，设置一个更合适的初始位置
  if (camera.position.length() === 0) {
    camera.position.set(0, 5, 10);
    camera.lookAt(target);
    Viewer.Render();
  }

  // 使用球坐标便于轨道式旋转
  const spherical = new THREE.Spherical();
  spherical.setFromVector3(camera.position.clone().sub(target));

  // 交互状态
  let isDragging = false as boolean;
  let dragMode: "rotate" | "pan" | null = null;
  let startX = 0;
  let startY = 0;

  // 参数配置
  const rotateSpeed = 0.005; // 旋转速度
  const panSpeed = 0.002; // 平移速度（与距离相关会再缩放）
  const zoomScale = 1.0; // 滚轮缩放基准
  const minDistance = 0.5;
  const maxDistance = 500;

  const updateCameraFromSpherical = () => {
    const newPos = new THREE.Vector3().setFromSpherical(spherical).add(target);
    camera.position.copy(newPos);
    camera.lookAt(target);
    Viewer.Render();
  };

  const pan = (dx: number, dy: number) => {
    // 根据相机到目标的距离自适应平移尺度
    const distance = camera.position.distanceTo(target);
    const scaledX = -dx * panSpeed * distance;
    const scaledY = dy * panSpeed * distance;

    // 计算相机右方向和上方向向量
    const te = camera.matrix.elements;
    const xAxis = new THREE.Vector3(te[0], te[1], te[2]).normalize();
    const yAxis = new THREE.Vector3(te[4], te[5], te[6]).normalize();

    const panOffset = new THREE.Vector3()
      .addScaledVector(xAxis, scaledX)
      .addScaledVector(yAxis, scaledY);

    camera.position.add(panOffset);
    target.add(panOffset);

    // 同步更新球坐标
    spherical.setFromVector3(camera.position.clone().sub(target));
    camera.lookAt(target);
    Viewer.Render();
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button === 0) dragMode = "rotate";
    else if (e.button === 2) dragMode = "pan";
    else dragMode = null;
    if (!dragMode) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {}
    canvas.style.cursor = dragMode === "rotate" ? "grabbing" : "move";
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging || !dragMode) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;

    if (dragMode === "rotate") {
      // 左右：theta，上下：phi
      spherical.theta -= dx * rotateSpeed;
      spherical.phi -= dy * rotateSpeed;
      const EPS = 1e-6;
      spherical.phi = Math.max(EPS, Math.min(Math.PI - EPS, spherical.phi));
      spherical.makeSafe?.();
      // 半径不变
      spherical.radius = THREE.MathUtils.clamp(
        spherical.radius,
        minDistance,
        maxDistance
      );
      updateCameraFromSpherical();
    } else if (dragMode === "pan") {
      pan(dx, dy);
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    isDragging = false;
    dragMode = null;
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
    canvas.style.cursor = "auto";
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    // 统一处理缩放：deltaY 正值代表向下滚，通常为放大或缩小
    const delta = e.deltaY;
    const scale = Math.pow(0.95, zoomScale * (delta > 0 ? -1 : 1));
    spherical.radius = THREE.MathUtils.clamp(
      spherical.radius * scale,
      minDistance,
      maxDistance
    );
    updateCameraFromSpherical();
  };

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("contextmenu", onContextMenu);
};
