import Dexie, { Table } from "dexie";

// 数据库配置接口
export interface DBConfig {
  name: string;
  version: number;
  stores: {
    [tableName: string]: string; // 表名和索引配置
  };
}

// 通用的单例 IndexedDB 管理类
// 修改为支持多个实例，每个数据库名称对应一个唯一实例
class IndexDB extends Dexie {
  private static instances: Map<string, IndexDB> = new Map();
  private config: DBConfig; // 改为实例变量

  private constructor(config: DBConfig) {
    super(config.name);
    this.config = config; // 保存配置到实例

    // 定义数据库版本和表结构
    this.version(config.version).stores(config.stores);
  }

  // 初始化并获取实例（根据配置名称确保唯一）
  public static getInstance(config: DBConfig): IndexDB {
    const name = config.name;
    if (!IndexDB.instances.has(name)) {
      const instance = new IndexDB(config);
      IndexDB.instances.set(name, instance);
    }
    return IndexDB.instances.get(name)!;
  }

  // 获取表实例
  public getTable<T = unknown>(tableName: string): Table<T, number> | null {
    try {
      // 检查表是否在配置中定义
      if (!this.config.stores[tableName]) {
        // 修改为使用实例 config
        return null;
      }
      const table = this.table(tableName) as Table<T, number>;
      return table;
    } catch {
      return null;
    }
  }

  // 通用添加方法
  async add<T = unknown>(tableName: string, data: T): Promise<number> {
    const table = this.getTable<T>(tableName);
    if (!table) {
      throw new Error(`表 "${tableName}" 不存在`);
    }
    return await table.add(data);
  }

  // 通用批量添加方法
  async bulkAdd<T = unknown>(tableName: string, data: T[]): Promise<number> {
    const table = this.getTable<T>(tableName);
    if (!table) {
      throw new Error(`表 "${tableName}" 不存在`);
    }
    return await table.bulkAdd(data);
  }

  // 通用获取所有数据
  async getAll<T = unknown>(tableName: string): Promise<T[]> {
    try {
      const table = this.getTable<T>(tableName);
      if (!table) {
        return [];
      }
      return await table.toArray();
    } catch {
      return [];
    }
  }

  // 通用根据ID获取
  async getById<T = unknown>(
    tableName: string,
    id: number
  ): Promise<T | undefined> {
    try {
      const table = this.getTable<T>(tableName);
      if (!table) {
        return undefined;
      }
      return await table.get(id);
    } catch {
      return undefined;
    }
  }

  // 通用条件查询
  async query<T = unknown>(
    tableName: string,
    filter: (item: T) => boolean
  ): Promise<T[]> {
    try {
      const table = this.getTable<T>(tableName);
      if (!table) {
        return [];
      }
      return await table.filter(filter).toArray();
    } catch {
      return [];
    }
  }

  // 通用更新方法（修改部分字段）
  async updateItem<T extends Record<string, unknown>>(
    tableName: string,
    id: number,
    changes: Partial<T>
  ): Promise<number> {
    const table = this.getTable<T>(tableName);
    if (!table) {
      throw new Error(`表 "${tableName}" 不存在`);
    }
    const item = await table.get(id);
    if (!item) {
      throw new Error(`未找到 ID 为 ${id} 的记录`);
    }
    const updated = { ...item, ...changes };
    await table.put(updated);
    return id;
  }

  // 完整替换（使用 put 方法）
  async put<T = unknown>(tableName: string, data: T): Promise<number> {
    const table = this.getTable<T>(tableName);
    if (!table) {
      throw new Error(`表 "${tableName}" 不存在`);
    }
    return await table.put(data);
  }

  // 通用删除方法
  async deleteItem(tableName: string, id: number): Promise<void> {
    const table = this.getTable(tableName);
    if (!table) {
      throw new Error(`表 "${tableName}" 不存在`);
    }
    return await table.delete(id);
  }

  // 通用批量删除
  async bulkDelete(tableName: string, ids: number[]): Promise<void> {
    const table = this.getTable(tableName);
    if (!table) {
      throw new Error(`表 "${tableName}" 不存在`);
    }
    return await table.bulkDelete(ids);
  }

  // 清空指定表
  async clearTable(tableName: string): Promise<void> {
    const table = this.getTable(tableName);
    if (!table) {
      throw new Error(`表 "${tableName}" 不存在`);
    }
    return await table.clear();
  }

  // 清空所有表
  async clearAll(): Promise<void> {
    const tables = this.tables;
    await Promise.all(tables.map((table) => table.clear()));
  }

  // 获取表数据统计
  async count(tableName: string): Promise<number> {
    try {
      const table = this.getTable(tableName);
      if (!table) {
        return 0;
      }
      return await table.count();
    } catch {
      return 0;
    }
  }

  // 删除数据库
  async deleteDatabase(): Promise<void> {
    await super.delete();
    // 从 Map 中移除该实例
    IndexDB.instances.delete(this.name);
  }
}

export default IndexDB;
