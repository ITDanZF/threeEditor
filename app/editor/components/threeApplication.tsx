"use client";
import { useThreeApp } from "../hooks/useThreeApp";
export const ThreeApplication = () => {
  const mountId = "three-mount";
  const { ready, getViewer } = useThreeApp(mountId);
  // console.log(ready, "ready");

  // if (!ready) return null;

  console.log(getViewer(), "getViewer");

  return (
    <div className="w-full h-full">
      {!ready && <div>Loading…</div>}
      <div id={mountId} className="w-full h-full" />
    </div>
  );
};
