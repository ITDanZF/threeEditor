import * as THREE from "three";
/**
 * ThreeViewer 是三维编辑器的核心类，负责管理三维场景的创建、更新和渲染。
 */
export default class ThreeViewer {
  private el: HTMLElement;

  private renderer: THREE.WebGLRenderer | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private scene: THREE.Scene | null = null;
  private rafId: number | null = null;
  private animateCallback: () => void = () => {};

  constructor(el: HTMLElement) {
    this.el = el;
  }

  /**
   * init 初始化三维场景
   */
  public async init(el: HTMLElement) {
    this.el = el;
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);

    this.el.innerHTML = "";
    this.el.appendChild(this.renderer.domElement);

    // 创建场景
    this.scene = new THREE.Scene();

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    // 首次渲染
    this.Render();
  }

  /**
   * Render 渲染三维场景
   * @returns
   */
  public Render() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * resize 调整三维场景的大小
   */
  public resize(width: number, height: number) {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.Render();
  }

  /**
   * destroyed 销毁三维场景
   */
  public destroyed() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.dispose();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.rafId = null;
    this.animateCallback = () => {};
  }

  /**
   * clear 清空三维场景
   */
  public clear() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.clear();
    this.scene.clear();
    this.camera.clear();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.rafId = null;
    this.animateCallback = () => {};
  }
}
