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
class IndexDB extends Dexie {
  private static instance: IndexDB;
  private static config: DBConfig;

  private constructor(config: DBConfig) {
    super(config.name);

    // 定义数据库版本和表结构
    this.version(config.version).stores(config.stores);
  }

  // 初始化并获取单例实例
  public static getInstance(config?: DBConfig): IndexDB {
    if (!IndexDB.instance) {
      if (!config) {
        throw new Error("首次调用 getInstance 必须提供数据库配置");
      }
      IndexDB.config = config;
      IndexDB.instance = new IndexDB(config);
    }
    return IndexDB.instance;
  }

  // 获取表实例
  public getTable<T = unknown>(tableName: string): Table<T, number> {
    return this.table(tableName);
  }

  // 通用添加方法
  async add<T = unknown>(tableName: string, data: T): Promise<number> {
    const table = this.getTable<T>(tableName);
    return await table.add(data);
  }

  // 通用批量添加方法
  async bulkAdd<T = unknown>(tableName: string, data: T[]): Promise<number> {
    const table = this.getTable<T>(tableName);
    return await table.bulkAdd(data);
  }

  // 通用获取所有数据
  async getAll<T = unknown>(tableName: string): Promise<T[]> {
    const table = this.getTable<T>(tableName);
    return await table.toArray();
  }

  // 通用根据ID获取
  async getById<T = unknown>(
    tableName: string,
    id: number
  ): Promise<T | undefined> {
    const table = this.getTable<T>(tableName);
    return await table.get(id);
  }

  // 通用条件查询
  async query<T = unknown>(
    tableName: string,
    filter: (item: T) => boolean
  ): Promise<T[]> {
    const table = this.getTable<T>(tableName);
    return await table.filter(filter).toArray();
  }

  // 通用更新方法（修改部分字段）
  async updateItem<T extends Record<string, unknown>>(
    tableName: string,
    id: number,
    changes: Partial<T>
  ): Promise<number> {
    const table = this.getTable<T>(tableName);
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
    return await table.put(data);
  }

  // 通用删除方法
  async deleteItem(tableName: string, id: number): Promise<void> {
    const table = this.getTable(tableName);
    return await table.delete(id);
  }

  // 通用批量删除
  async bulkDelete(tableName: string, ids: number[]): Promise<void> {
    const table = this.getTable(tableName);
    return await table.bulkDelete(ids);
  }

  // 清空指定表
  async clearTable(tableName: string): Promise<void> {
    const table = this.getTable(tableName);
    return await table.clear();
  }

  // 清空所有表
  async clearAll(): Promise<void> {
    const tables = this.tables;
    await Promise.all(tables.map((table) => table.clear()));
  }

  // 获取表数据统计
  async count(tableName: string): Promise<number> {
    const table = this.getTable(tableName);
    return await table.count();
  }

  // 删除数据库
  async deleteDatabase(): Promise<void> {
    await super.delete();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    IndexDB.instance = null as any;
  }
}

export default IndexDB;
