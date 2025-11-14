import { FolderTree, FileNode } from "./types";

export default class FileTree {
  private Tree: FolderTree;
  constructor() {
    this.Tree = {
      nodes: new Map<string, FileNode>(),
      roots: [],
    };
  }

  /**
   * 创建节点
   * @param node
   */
  createFileNode(node: FileNode) {
    // 添加节点
    this.Tree.nodes.set(node.id, node);
    if (!node.parentId) {
      this.Tree.roots.push(node.id);
    } else {
      const parentNode = this.Tree.nodes.get(node.parentId);
      if (parentNode) {
        parentNode.childrenIds.push(node.id);
      }
    }
  }

  /**
   * 获取文件节点
   * @param id 节点id
   * @returns 文件节点
   */
  getFileNode(id: string): FileNode | null {
    const node = this.Tree.nodes.get(id);
    if (node) {
      return node as FileNode;
    }
    return null;
  }

  /**
   * 获取文件列表（已排序：文件夹 > 文件 > 字母序）
   * @param parentId 父级id
   * @returns 排序后的文件节点列表
   */
  getFileList(parentId: string): FileNode[] {
    const node = this.Tree.nodes.get(parentId);
    if (!node) {
      return [];
    }

    const children = node.childrenIds
      .map((id) => this.Tree.nodes.get(id))
      .filter((child): child is FileNode => child !== undefined);

    return children.sort((a, b) => {
      // 先按类型排序：folder 在前
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      // 同类型按名称字母序排序（支持中英文、自然数字排序、忽略大小写）
      return a.name.localeCompare(b.name, "zh-CN", {
        sensitivity: "base", // 忽略大小写
        numeric: true, // 自然排序：file1, file2, file10
      });
    });
  }

  /**
   * 移动文件节点到新的父节点下
   * @param nodeId 节点id
   * @param newParentId 新父节点id（null 表示移动到根目录）
   * @returns 是否移动成功
   */
  moveFileNode(nodeId: string, newParentId: string | null): boolean {
    const node = this.Tree.nodes.get(nodeId) as FileNode | undefined;
    if (!node) {
      return false;
    }

    // 不能移动到自己的子节点下（防止循环引用）
    if (newParentId && this.isDescendant(nodeId, newParentId)) {
      return false;
    }

    // 从旧父节点移除
    if (node.parentId) {
      const oldParent = this.Tree.nodes.get(node.parentId) as
        | FileNode
        | undefined;
      if (oldParent) {
        oldParent.childrenIds = oldParent.childrenIds.filter(
          (id) => id !== nodeId
        );
      }
    } else {
      // 从根节点列表移除
      this.Tree.roots = this.Tree.roots.filter((id) => id !== nodeId);
    }

    // 更新节点的父节点
    node.parentId = newParentId;

    // 添加到新父节点
    if (newParentId) {
      const newParent = this.Tree.nodes.get(newParentId) as
        | FileNode
        | undefined;
      if (newParent) {
        newParent.childrenIds.push(nodeId);
      } else {
        return false;
      }
    } else {
      // 添加到根节点列表
      this.Tree.roots.push(nodeId);
    }

    // 更新修改时间
    node.updatedAt = new Date().toISOString();

    return true;
  }

  /**
   * 检查目标节点是否是源节点的后代（防止循环引用）
   * @param ancestorId 祖先节点id
   * @param descendantId 后代节点id
   * @returns 是否是后代
   */
  private isDescendant(ancestorId: string, descendantId: string): boolean {
    let current = this.Tree.nodes.get(descendantId) as FileNode | undefined;
    while (current) {
      if (current.id === ancestorId) {
        return true;
      }
      if (!current.parentId) {
        break;
      }
      current = this.Tree.nodes.get(current.parentId) as FileNode | undefined;
    }
    return false;
  }

  /**
   * 检查节点是否有子节点
   * @param id 节点id
   * @returns 是否有子节点
   */
  hasChildren(id: string): boolean {
    const node = this.Tree.nodes.get(id);
    return node ? node.childrenIds.length > 0 : false;
  }

  /**
   * 删除文件节点（递归删除所有子节点）
   * @param id 节点id
   */
  deleteFileNode(id: string) {
    const node = this.Tree.nodes.get(id);
    if (!node) {
      return;
    }

    // 递归删除所有子节点
    this.deleteChildrenRecursive(id);

    // 删除节点本身
    this.Tree.nodes.delete(id);

    // 从父节点的子节点列表中移除
    if (node.parentId) {
      const parentNode = this.Tree.nodes.get(node.parentId);
      if (parentNode) {
        parentNode.childrenIds = parentNode.childrenIds.filter(
          (childId) => childId !== id
        );
      }
    } else {
      // 如果是根节点，从 roots 列表中移除
      this.Tree.roots = this.Tree.roots.filter((rootId) => rootId !== id);
    }
  }

  /**
   * 递归删除所有子节点（私有方法）
   * @param id 节点id
   */
  private deleteChildrenRecursive(id: string) {
    const node = this.Tree.nodes.get(id);
    if (!node || node.childrenIds.length === 0) {
      return;
    }

    // 使用栈实现深度优先遍历（避免递归调用栈溢出）
    const stack = [...node.childrenIds];

    while (stack.length > 0) {
      const childId = stack.pop()!;
      const childNode = this.Tree.nodes.get(childId);

      if (childNode) {
        // 将当前节点的子节点加入栈中
        if (childNode.childrenIds.length > 0) {
          stack.push(...childNode.childrenIds);
        }
        // 删除当前节点
        this.Tree.nodes.delete(childId);
      }
    }
  }

  /**
   * 更新文件信息
   * @param id 节点id
   * @param info 文件信息（可更新：name, path, type, fileType 等）
   * @returns 是否更新成功
   */
  updateFileInfo(id: string, info: Partial<FileNode>): boolean {
    const node = this.Tree.nodes.get(id) as FileNode | undefined;
    if (!node) {
      return false;
    }

    // 不允许更新的字段（保护树结构完整性）
    const protectedFields: (keyof FileNode)[] = [
      "id",
      "parentId",
      "childrenIds",
    ];

    // 应用更新
    let hasUpdates = false;
    for (const key in info) {
      if (protectedFields.includes(key as keyof FileNode)) {
        continue; // 跳过受保护的字段
      }

      const value = info[key as keyof FileNode];
      if (value !== undefined) {
        (node as unknown as Record<string, unknown>)[key] = value;
        hasUpdates = true;
      }
    }

    // 自动更新修改时间
    if (hasUpdates) {
      node.updatedAt = new Date().toISOString();
    }

    return true;
  }

  /**
   * 获取根文件列表（已排序：文件夹 > 文件 > 字母序）
   * @returns 排序后的根节点列表
   */
  getRootFileList(): FileNode[] {
    // 获取所有根节点
    const rootNodes = this.Tree.roots
      .map((id) => this.Tree.nodes.get(id))
      .filter((node): node is FileNode => node !== undefined);

    // 排序：文件夹 > 文件 > 字母序
    return rootNodes.sort((a, b) => {
      // 先按类型排序：folder 在前
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      // 同类型按名称字母序排序（支持中英文、自然数字排序、忽略大小写）
      return a.name.localeCompare(b.name, "zh-CN", {
        sensitivity: "base", // 忽略大小写
        numeric: true, // 自然排序：file1, file2, file10
      });
    });
  }
}
