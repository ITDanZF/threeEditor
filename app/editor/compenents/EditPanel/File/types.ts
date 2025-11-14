export type NodeType = "folder" | "file";

/**
 * 通用树形节点
 */
export interface TreeNode {
  id: string;
  name: string;
  parentId?: string | null; // 父级id
  childrenIds: string[]; // 子级id列表
}

/**
 * 文件节点
 */
export interface FileNode extends TreeNode {
  path: string; // 路径
  depth: number; // 深度
  type: NodeType; // 节点类型

  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
  // 文件持有
  fileType?: string; // 文件类型 .glb .tsx
}

/**
 * 树形文件夹结构
 */
export interface FolderTree {
  nodes: Map<string, TreeNode>;
  roots: string[];
}
