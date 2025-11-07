import { useEffect, useRef, useState } from "react";
import ThreeViewer from "../core";

export const useThreeApp = (mountId: string) => {
  const viewerRef = useRef<ThreeViewer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = document.getElementById(mountId);
    if (!el) return;

    const viewer = new ThreeViewer(el);
    viewerRef.current = viewer;

    // 假设 ThreeViewer 有一个异步初始化方法
    viewer
      .init(el)
      .then(() => {
        setReady(true);
      })
      .catch((e) => {
        console.error("init failed", e);
      });

    const handleResize = () => {
      viewer.resize?.(el.clientWidth, el.clientHeight);
    };

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(handleResize);
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      viewer.destroyed?.(); // 关键：销毁 WebGL 上下文、停动画等
      viewerRef.current = null;
      setReady(false);
    };
  }, [mountId]);

  const getViewer = () => viewerRef.current;
  return { ready, getViewer };
};
