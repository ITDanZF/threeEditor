import { IndexDB, DBConfig } from "@/app/db";
const dbConfig: DBConfig = {
  name: "ModelListDB", // 数据库名称
  version: 1, // 版本号
  stores: {
    // 在这里定义你的表结构
    // 格式: 表名: '索引配置'
    // 示例:
    // users: '++id, name, email, createdAt',
    // products: '++id, name, category, price',
    // orders: '++id, userId, status, createdAt',
  },
};
const db = IndexDB.getInstance(dbConfig);
export default function ModelList() {
  return <div>ModelList</div>;
}
