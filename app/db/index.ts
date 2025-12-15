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

// 配置数据库
const dbConfig: DBConfig = {
  name: "ModelListDB",
  version: 1,
  stores: {
    // 文件夹表：存储文件夹层级结构
    // 字段：id(自增), name(名称), parentId(父文件夹ID), path(路径), createdAt(创建时间)
    folders: "++id, name, parentId, path, createdAt",

    // 模型表：存储三维模型二进制数据
    // 字段：id(自增), name(文件名), folderId(所属文件夹), data(二进制数据),
    //      fileType(文件类型), fileSize(大小), thumbnail(缩略图), createdAt(创建时间)
    models: "++id, name, folderId, fileType, createdAt, fileSize",
  },
};
export const ModelListIndexDB = IndexDB.getInstance(dbConfig);
