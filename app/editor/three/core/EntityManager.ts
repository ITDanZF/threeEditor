// entity-manager.ts
import { entity } from "./Entity"; // 确保路径正确

export const entity_manager = (() => {
  class EntityManager {
    private ids_: number;
    private entitiesMap_: Record<string, entity.Entity>;
    private entities_: entity.Entity[];

    constructor() {
      this.ids_ = 0;
      this.entitiesMap_ = {};
      this.entities_ = [];
    }

    private _GenerateName(): string {
      return "__name__" + this.ids_;
    }

    public Get(name: string): entity.Entity | undefined {
      return this.entitiesMap_[name];
    }

    public Filter(
      predicate: (entity: entity.Entity) => boolean
    ): entity.Entity[] {
      return this.entities_.filter(predicate);
    }

    public Add(entity: entity.Entity, name?: string): void {
      this.ids_ += 1;

      if (!name) {
        name = this._GenerateName();
      }

      this.entitiesMap_[name] = entity;
      this.entities_.push(entity);

      entity.SetParent(this);
      entity.SetName(name);
      entity.SetId(this.ids_);
      entity.InitEntity();
    }

    public SetActive(entity: entity.Entity, active: boolean): void {
      const index = this.entities_.indexOf(entity);

      if (!active) {
        if (index < 0) return;
        this.entities_.splice(index, 1);
      } else {
        if (index >= 0) return;
        this.entities_.push(entity);
      }
    }

    public Update(timeElapsed: number, pass: number): void {
      const dead: entity.Entity[] = [];
      const alive: entity.Entity[] = [];

      for (let i = 0; i < this.entities_.length; ++i) {
        const e = this.entities_[i];
        e.Update(timeElapsed, pass);

        if (e.IsDead) {
          dead.push(e);
        } else {
          alive.push(e);
        }
      }

      // 清理死亡实体
      for (const e of dead) {
        delete this.entitiesMap_[e.Name!]; // Name 不为 null，因为 Add 时已设置
        e.Destroy();
      }

      this.entities_ = alive;
    }
  }

  return {
    EntityManager,
  };
})();

// 实体管理器构造函数类型
type EntityManagerConstructor = (typeof entity_manager)["EntityManager"];

// 实体管理器实例类型导出
export type EntityManagerInstance = InstanceType<EntityManagerConstructor>;
// 实体管理器名称到实体的映射类型
export type EntityManagerMap = Record<string, entity.Entity>;
