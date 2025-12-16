import type ThreeViewer from "./Viewer";
import type { EntityManagerInstance } from "./EntityManager";
import * as THREE from "three";
type functionType = () => void;
export class RenderLoop {
  private threeViewer: ThreeViewer;
  private entityManager: EntityManagerInstance;
  private rafId: number | null = null;
  private clock: THREE.Clock;
  private callbackQueue: Array<functionType> = [];

  constructor(ThreeViewer: ThreeViewer, entityManager: EntityManagerInstance) {
    this.threeViewer = ThreeViewer;
    this.entityManager = entityManager;
    this.clock = new THREE.Clock();
  }

  private animate = (): void => {
    this.rafId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta(); // 单位：秒

    // 更新所有实体（通常 pass=0 表示主逻辑更新）
    this.entityManager.Update(delta, 0);

    // 执行待渲染的操作函数
    while (this.callbackQueue.length > 0) {
      const callback = this.callbackQueue.shift();
      if (callback) {
        try {
          callback();
        } catch (error) {
          console.error("执行待渲染的操作函数时发生错误", error);
        }
      }
    }

    // 渲染场景
    this.threeViewer.Render();
  };

  /**
   * 启动循环渲染
   */
  public start(): void {
    if (this.rafId !== null) return;
    this.clock.start();
    this.animate();
  }

  /**
   * 停止渲染循环
   */
  public stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * 注册待渲染的操作函数
   * @param callback
   */
  RenderProcessing(callback: functionType) {
    if (callback) {
      this.callbackQueue.push(callback);
    }
  }
}
