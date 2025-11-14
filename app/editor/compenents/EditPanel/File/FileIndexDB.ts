import { IndexDB, DBConfig } from "@/app/db";
import FileTree from "./FileTree";
import { FileNode } from "./types";

/**
 * FileIndexDB - 文件树与 IndexedDB 的交接层
 * 负责将文件树的操作持久化到 IndexedDB
 */
export default class FileIndexDB {
  private db: IndexDB;
  private fileTree: FileTree;
  private tableName = "fileNodes";

  constructor() {
    // 配置数据库
    const dbConfig: DBConfig = {
      name: "FileTreeDB",
      version: 1,
      stores: {
        // 文件节点表，使用 id 作为主键
        fileNodes: "id, name, parentId, type, path, createdAt, updatedAt",
      },
    };

    // 初始化 IndexDB 实例
    this.db = IndexDB.getInstance(dbConfig);
    // 初始化文件树（内存结构）
    this.fileTree = new FileTree();
  }

  /**
   * 初始化 - 从 IndexedDB 加载数据到内存
   * 应用启动时调用一次
   */
  async init(): Promise<void> {
    try {
      // 从数据库获取所有节点
      const nodes = await this.db.getAll<FileNode>(this.tableName);

      // 按深度排序，确保父节点先于子节点被添加
      const sortedNodes = nodes.sort((a, b) => a.depth - b.depth);

      // 将所有节点加载到内存树中
      for (const node of sortedNodes) {
        this.fileTree.createFileNode(node);
      }

      console.log(`成功加载 ${nodes.length} 个文件节点`);
    } catch (error) {
      console.error("初始化文件树失败:", error);
      throw error;
    }
  }

  /**
   * 创建文件节点（同步到 IndexDB）
   * @param node 文件节点
   */
  async createFileNode(node: FileNode): Promise<void> {
    try {
      // 添加时间戳
      const now = new Date().toISOString();
      const nodeWithTimestamp: FileNode = {
        ...node,
        createdAt: node.createdAt || now,
        updatedAt: node.updatedAt || now,
      };

      // 1. 添加到内存树
      this.fileTree.createFileNode(nodeWithTimestamp);

      // 2. 持久化到数据库
      await this.db.add(this.tableName, nodeWithTimestamp);
    } catch (error) {
      console.error("创建文件节点失败:", error);
      throw error;
    }
  }

  /**
   * 获取文件节点
   * @param id 节点id
   * @returns 文件节点
   */
  getFileNode(id: string): FileNode | null {
    return this.fileTree.getFileNode(id);
  }

  /**
   * 获取文件列表（已排序：文件夹 > 文件 > 字母序）
   * @param parentId 父级id
   * @returns 排序后的文件节点列表
   */
  getFileList(parentId: string): FileNode[] {
    return this.fileTree.getFileList(parentId);
  }

  /**
   * 获取根文件列表（已排序：文件夹 > 文件 > 字母序）
   * @returns 排序后的根节点列表
   */
  getRootFileList(): FileNode[] {
    return this.fileTree.getRootFileList();
  }

  /**
   * 移动文件节点到新的父节点下（同步到 IndexDB）
   * @param nodeId 节点id
   * @param newParentId 新父节点id（null 表示移动到根目录）
   * @returns 是否移动成功
   */
  async moveFileNode(
    nodeId: string,
    newParentId: string | null
  ): Promise<boolean> {
    try {
      // 1. 在内存中移动
      const success = this.fileTree.moveFileNode(nodeId, newParentId);
      if (!success) {
        return false;
      }

      // 2. 同步到数据库
      const node = this.fileTree.getFileNode(nodeId);
      if (node) {
        await this.updateNodeInDB(node);
      }

      return true;
    } catch (error) {
      console.error("移动文件节点失败:", error);
      throw error;
    }
  }

  /**
   * 检查节点是否有子节点
   * @param id 节点id
   * @returns 是否有子节点
   */
  hasChildren(id: string): boolean {
    return this.fileTree.hasChildren(id);
  }

  /**
   * 删除文件节点（递归删除所有子节点，同步到 IndexDB）
   * @param id 节点id
   */
  async deleteFileNode(id: string): Promise<void> {
    try {
      // 1. 获取要删除的节点及其所有子节点的 id
      const idsToDelete = this.getAllChildrenIds(id);
      idsToDelete.push(id); // 包含自身

      // 2. 从内存树中删除
      this.fileTree.deleteFileNode(id);

      // 3. 从数据库中批量删除
      await this.deleteNodesFromDB(idsToDelete);
    } catch (error) {
      console.error("删除文件节点失败:", error);
      throw error;
    }
  }

  /**
   * 更新文件信息（同步到 IndexDB）
   * @param id 节点id
   * @param info 文件信息（可更新：name, path, type, fileType 等）
   * @returns 是否更新成功
   */
  async updateFileInfo(id: string, info: Partial<FileNode>): Promise<boolean> {
    try {
      // 1. 在内存中更新
      const success = this.fileTree.updateFileInfo(id, info);
      if (!success) {
        return false;
      }

      // 2. 同步到数据库
      const node = this.fileTree.getFileNode(id);
      if (node) {
        await this.updateNodeInDB(node);
      }

      return true;
    } catch (error) {
      console.error("更新文件信息失败:", error);
      throw error;
    }
  }

  /**
   * 清空所有文件节点
   */
  async clearAll(): Promise<void> {
    try {
      // 1. 清空内存
      this.fileTree = new FileTree();

      // 2. 清空数据库
      await this.db.clearTable(this.tableName);
    } catch (error) {
      console.error("清空文件节点失败:", error);
      throw error;
    }
  }

  /**
   * 获取所有节点数量
   */
  async count(): Promise<number> {
    return await this.db.count(this.tableName);
  }

  /**
   * 批量创建文件节点（同步到 IndexDB）
   * @param nodes 文件节点数组
   */
  async bulkCreateFileNodes(nodes: FileNode[]): Promise<void> {
    try {
      const now = new Date().toISOString();

      // 添加时间戳并按深度排序
      const nodesWithTimestamp = nodes
        .map((node) => ({
          ...node,
          createdAt: node.createdAt || now,
          updatedAt: node.updatedAt || now,
        }))
        .sort((a, b) => a.depth - b.depth);

      // 1. 添加到内存树
      for (const node of nodesWithTimestamp) {
        this.fileTree.createFileNode(node);
      }

      // 2. 批量持久化到数据库
      await this.db.bulkAdd(this.tableName, nodesWithTimestamp);
    } catch (error) {
      console.error("批量创建文件节点失败:", error);
      throw error;
    }
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 更新节点到数据库（私有方法）
   * @param node 文件节点
   */
  private async updateNodeInDB(node: FileNode): Promise<void> {
    try {
      // 使用 put 方法，如果存在则更新，不存在则创建
      await this.db.put(this.tableName, node);
    } catch (error) {
      console.error("更新节点到数据库失败:", error);
      throw error;
    }
  }

  /**
   * 从数据库删除多个节点（私有方法）
   * @param ids 节点id数组
   */
  private async deleteNodesFromDB(ids: string[]): Promise<void> {
    try {
      // IndexDB 的 bulkDelete 需要数字 ID，但我们使用字符串 ID
      // 因此需要逐个删除或使用条件删除
      const allNodes = await this.db.getAll<FileNode>(this.tableName);
      const nodesToDelete = allNodes.filter((node) => ids.includes(node.id));

      // 逐个删除
      for (const node of nodesToDelete) {
        await this.db.query(this.tableName, (item: FileNode) => {
          return item.id === node.id;
        });
      }

      // 或者直接清空后重新添加剩余的（更高效）
      const remainingNodes = allNodes.filter((node) => !ids.includes(node.id));
      await this.db.clearTable(this.tableName);
      if (remainingNodes.length > 0) {
        await this.db.bulkAdd(this.tableName, remainingNodes);
      }
    } catch (error) {
      console.error("从数据库删除节点失败:", error);
      throw error;
    }
  }

  /**
   * 获取节点的所有子节点 id（递归，私有方法）
   * @param id 节点id
   * @returns 所有子节点的 id 数组
   */
  private getAllChildrenIds(id: string): string[] {
    const node = this.fileTree.getFileNode(id);
    if (!node || node.childrenIds.length === 0) {
      return [];
    }

    const allIds: string[] = [];
    const stack = [...node.childrenIds];

    while (stack.length > 0) {
      const childId = stack.pop()!;
      allIds.push(childId);

      const childNode = this.fileTree.getFileNode(childId);
      if (childNode && childNode.childrenIds.length > 0) {
        stack.push(...childNode.childrenIds);
      }
    }

    return allIds;
  }
}
