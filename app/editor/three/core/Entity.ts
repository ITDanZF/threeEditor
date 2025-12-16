import * as THREE from "three";

// 消息类型定义
interface Message {
  topic: string;
  [key: string]: any; // 允许任意 payload 字段
}

// EntityManager 接口（用于 parent_ 的类型）
interface EntityManager {
  Get(name: string): Entity | null;
  SetActive(entity: Entity, active: boolean): void;
}

// 注意：由于 JS 中 Component 在 Entity 之后定义，
// 在 TS 中我们需要先声明 Component 类型，再定义 Entity
// 但为了保持结构一致，我们使用 declare class 技巧或调整顺序
// 这里我们把 Component 提前定义（逻辑等价，结构微调以满足 TS）

class Component {
  protected parent_: Entity | null = null;
  protected pass_: number = 0;

  public Destroy(): void {}
  public SetParent(p: Entity): void {
    this.parent_ = p;
  }
  public SetPass(p: number): void {
    this.pass_ = p;
  }
  public get Pass(): number {
    return this.pass_;
  }

  public InitComponent(): void {}
  public InitEntity(): void {}

  public GetComponent<T extends Component = Component>(
    n: string
  ): T | undefined {
    return this.parent_?.GetComponent(n) as T | undefined;
  }

  public get Manager(): EntityManager | null {
    return this.parent_?.Manager ?? null;
  }

  public get Parent(): Entity | null {
    return this.parent_;
  }

  public FindEntity(name: string): Entity | null {
    return this.parent_?.FindEntity(name) ?? null;
  }

  public Broadcast(msg: Message): void {
    this.parent_?.Broadcast(msg);
  }

  public Update(_timeElapsed: number): void {}

  public RegisterHandler_(
    topic: string,
    handler: (msg: Message) => void
  ): void {
    this.parent_?.RegisterHandler_(topic, handler);
  }
}

class Entity {
  private name_: string | null = null;
  private id_: string | number | null = null;
  private components_: Record<string, Component> = {};
  private attributes_: Record<string, unknown> = {};

  private _position: THREE.Vector3 = new THREE.Vector3();
  private _rotation: THREE.Quaternion = new THREE.Quaternion();
  private handlers_: Record<string, ((msg: Message) => void)[]> = {};
  private parent_: EntityManager | null = null;
  private dead_ = false;

  constructor() {}

  public Destroy(): void {
    for (const k in this.components_) {
      if (this.components_.hasOwnProperty(k)) {
        this.components_[k].Destroy();
      }
    }
    this.components_ = {} as Record<string, Component>;
    this.parent_ = null;
    this.handlers_ = {};
  }

  public RegisterHandler_(
    topic: string,
    handler: (msg: Message) => void
  ): void {
    if (!this.handlers_[topic]) {
      this.handlers_[topic] = [];
    }
    this.handlers_[topic].push(handler);
  }

  public SetParent(p: EntityManager): void {
    this.parent_ = p;
  }

  public SetName(n: string): void {
    this.name_ = n;
  }

  public SetId(id: string | number): void {
    this.id_ = id;
  }

  public get Name(): string | null {
    return this.name_;
  }

  public get ID(): string | number | null {
    return this.id_;
  }

  public get Manager(): EntityManager | null {
    return this.parent_;
  }

  public get Attributes(): Record<string, unknown> {
    return this.attributes_;
  }

  public get IsDead(): boolean {
    return this.dead_;
  }

  public SetActive(b: boolean): void {
    this.parent_?.SetActive(this, b);
  }

  public SetDead(): void {
    this.dead_ = true;
  }

  public AddComponent(c: Component): void {
    c.SetParent(this);
    this.components_[c.constructor.name] = c;
    c.InitComponent();
  }

  public InitEntity(): void {
    for (const k in this.components_) {
      if (this.components_.hasOwnProperty(k)) {
        this.components_[k].InitEntity();
      }
    }
  }

  public GetComponent<T extends Component = Component>(
    n: string
  ): T | undefined {
    return this.components_[n] as T | undefined;
  }

  public FindEntity(name: string): Entity | null {
    return this.parent_?.Get(name) ?? null;
  }

  public Broadcast(msg: Message): void {
    if (this.IsDead) return;
    const handlers = this.handlers_[msg.topic];
    if (!handlers) return;
    for (const handler of handlers) {
      handler(msg);
    }
  }

  public SetPosition(p: THREE.Vector3): void {
    this._position.copy(p);
    this.Broadcast({
      topic: "update.position",
      value: this._position,
    });
  }

  public SetQuaternion(r: THREE.Quaternion): void {
    this._rotation.copy(r);
    this.Broadcast({
      topic: "update.rotation",
      value: this._rotation,
    });
  }

  public get Position(): THREE.Vector3 {
    return this._position;
  }

  public get Quaternion(): THREE.Quaternion {
    return this._rotation;
  }

  public get Forward(): THREE.Vector3 {
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this._rotation);
    return forward;
  }

  public get Up(): THREE.Vector3 {
    const up = new THREE.Vector3(0, 1, 0); // 修复：原代码误用 forward 变量名
    up.applyQuaternion(this._rotation);
    return up;
  }

  public Update(timeElapsed: number, pass: number): void {
    for (const k in this.components_) {
      if (this.components_.hasOwnProperty(k)) {
        const c = this.components_[k];
        if (c.Pass === pass) {
          c.Update(timeElapsed);
        }
      }
    }
  }
}

// 保持你原有的导出模式不变
export const entity = (() => {
  return {
    Entity,
    Component,
  };
})();
