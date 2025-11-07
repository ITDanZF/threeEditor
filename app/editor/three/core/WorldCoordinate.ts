import type ThreeViewer from "./index";
import * as THREE from "three";
export const WorldCoordinate = (Viewer: ThreeViewer) => {
  const scene = Viewer.getScene();
  if (!scene) return;

  // 避免重复添加
  type SceneUserData = Record<string, unknown> & { __axesLabeled?: boolean };
  const s = scene as THREE.Scene & { userData: SceneUserData };
  if (s.userData.__axesLabeled) return;
  s.userData.__axesLabeled = true;

  const axisLength = 10;
  const axesHelper = new THREE.AxesHelper(axisLength);
  scene.add(axesHelper);

  // 生成文本贴图的精灵
  const createLabelSprite = (text: string, color: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 4;
      // 背景圆角矩形
      const w = 160;
      const h = 72;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      const r = 12;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 文本
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    // 通过缩放控制在世界中的可视尺寸
    sprite.scale.set(1.6, 0.8, 1);
    return sprite;
  };

  const xLabel = createLabelSprite("X", "#ff5555"); // 红：X
  const yLabel = createLabelSprite("Y", "#55ff55"); // 绿：Y
  const zLabel = createLabelSprite("Z", "#5599ff"); // 蓝：Z

  const offset = 1.2;
  xLabel.position.set(axisLength + offset, 0, 0);
  yLabel.position.set(0, axisLength + offset, 0);
  zLabel.position.set(0, 0, axisLength + offset);

  scene.add(xLabel, yLabel, zLabel);
};
