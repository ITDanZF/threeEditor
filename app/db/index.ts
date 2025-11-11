import IndexDB, { DBConfig } from "./indexDB";

// 数据库配置示例
// 使用时需要根据实际业务需求配置
// const dbConfig: DBConfig = {
//   name: "AppDatabase", // 数据库名称
//   version: 1, // 版本号
//   stores: {
//     // 在这里定义你的表结构
//     // 格式: 表名: '索引配置'
//     // 示例:
//     // users: '++id, name, email, createdAt',
//     // products: '++id, name, category, price',
//     // orders: '++id, userId, status, createdAt',
//   },
// };

// 导出配置好的单例实例
// export const db = IndexDB.getInstance(dbConfig);

// 导出类型和配置
export { IndexDB };
export type { DBConfig };
