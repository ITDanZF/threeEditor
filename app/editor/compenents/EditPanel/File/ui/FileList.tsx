import FileFolder from "./FileFolder";
import FileItem from "./FileItem";
import { useEffect, useState } from "react";
import { ModelListIndexDB } from "@/app/db";
import { Folder, File } from "../../types";

// 模拟从 IndexedDB 返回的文件夹测试数据
const folderTest: Folder[] = [
  // 根目录文件夹
  {
    id: 1,
    name: "项目资源",
    parentId: null,
    path: "/项目资源",
    createdAt: "2024-01-15T10:30:00.000Z",
  },
  {
    id: 2,
    name: "模型库",
    parentId: null,
    path: "/模型库",
    createdAt: "2024-01-16T14:20:00.000Z",
  },
  {
    id: 3,
    name: "纹理素材",
    parentId: null,
    path: "/纹理素材",
    createdAt: "2024-01-17T09:15:00.000Z",
  },
  // 子文件夹 - 在"项目资源"下
  {
    id: 4,
    name: "场景模型",
    parentId: 1,
    path: "/项目资源/场景模型",
    createdAt: "2024-01-18T11:00:00.000Z",
  },
  {
    id: 5,
    name: "角色模型",
    parentId: 1,
    path: "/项目资源/角色模型",
    createdAt: "2024-01-19T15:30:00.000Z",
  },
  // 子文件夹 - 在"模型库"下
  {
    id: 6,
    name: "建筑模型",
    parentId: 2,
    path: "/模型库/建筑模型",
    createdAt: "2024-01-20T10:00:00.000Z",
  },
  // 子文件夹 - 在"场景模型"下（三级目录）
  {
    id: 7,
    name: "室内场景",
    parentId: 4,
    path: "/项目资源/场景模型/室内场景",
    createdAt: "2024-01-21T13:45:00.000Z",
  },
  {
    id: 8,
    name: "室外场景",
    parentId: 4,
    path: "/项目资源/场景模型/室外场景",
    createdAt: "2024-01-22T16:20:00.000Z",
  },
];

// 模拟从 IndexedDB 返回的文件测试数据
const filesTest: File[] = [
  // 根目录文件
  {
    id: 1,
    name: "主场景.glb",
    folderId: null,
    fileType: ".glb",
    createdAt: "2024-01-23T10:00:00.000Z",
    fileSize: 2048576, // 2MB
  },
  {
    id: 2,
    name: "配置文件.json",
    folderId: null,
    fileType: ".json",
    createdAt: "2024-01-24T11:30:00.000Z",
    fileSize: 1024, // 1KB
  },
  // 文件 - 在"项目资源"文件夹下
  {
    id: 3,
    name: "项目说明.md",
    folderId: 1,
    fileType: ".md",
    createdAt: "2024-01-25T09:15:00.000Z",
    fileSize: 5120, // 5KB
  },
  // 文件 - 在"场景模型"文件夹下
  {
    id: 4,
    name: "客厅场景.glb",
    folderId: 4,
    fileType: ".glb",
    createdAt: "2024-01-26T14:20:00.000Z",
    fileSize: 5242880, // 5MB
  },
  {
    id: 5,
    name: "卧室场景.glb",
    folderId: 4,
    fileType: ".glb",
    createdAt: "2024-01-27T15:45:00.000Z",
    fileSize: 3145728, // 3MB
  },
  // 文件 - 在"角色模型"文件夹下
  {
    id: 6,
    name: "角色A.glb",
    folderId: 5,
    fileType: ".glb",
    createdAt: "2024-01-28T10:30:00.000Z",
    fileSize: 1048576, // 1MB
  },
  {
    id: 7,
    name: "角色B.glb",
    folderId: 5,
    fileType: ".glb",
    createdAt: "2024-01-29T11:00:00.000Z",
    fileSize: 1572864, // 1.5MB
  },
  // 文件 - 在"建筑模型"文件夹下
  {
    id: 8,
    name: "办公楼.glb",
    folderId: 6,
    fileType: ".glb",
    createdAt: "2024-01-30T13:20:00.000Z",
    fileSize: 10485760, // 10MB
  },
  // 文件 - 在"室内场景"文件夹下（三级目录）
  {
    id: 9,
    name: "现代风格客厅.glb",
    folderId: 7,
    fileType: ".glb",
    createdAt: "2024-02-01T09:00:00.000Z",
    fileSize: 6291456, // 6MB
  },
  {
    id: 10,
    name: "欧式风格客厅.glb",
    folderId: 7,
    fileType: ".glb",
    createdAt: "2024-02-02T10:15:00.000Z",
    fileSize: 7340032, // 7MB
  },
  // 文件 - 在"纹理素材"文件夹下
  {
    id: 11,
    name: "木纹贴图.jpg",
    folderId: 3,
    fileType: ".jpg",
    createdAt: "2024-02-03T14:30:00.000Z",
    fileSize: 524288, // 512KB
  },
  {
    id: 12,
    name: "金属贴图.png",
    folderId: 3,
    fileType: ".png",
    createdAt: "2024-02-04T16:45:00.000Z",
    fileSize: 262144, // 256KB
  },
];

export default function FileList() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
    // 获取文件夹列表
    useEffect(() => {
      const fetchFolders = async () => {
        const folders = await ModelListIndexDB.getAll("folders");
        const files = await ModelListIndexDB.getAll("models");
        console.log(folders, "folders");
        setFolders(folders as Folder[]);
        setFiles(files as File[]);
      };
      fetchFolders();
    }, []); // 只在组件挂载时执行一次
  
    /**
     *  查询子目录文件
     * @param folder 
     */
    function handleGetList(folder: Folder) {
      // 使用db更新
      console.log(folder, "folder");
    }

    function handleGetFileList(file: File) {
      console.log(file, "file");
    }

  return (
    <div className="w-full h-full">
      {folderTest.map((folder) => (
        <FileFolder key={folder.id?.toString()} folder={folder} onUpdate={handleGetList} />
      ))}
      {filesTest.map((file) => (
        <FileItem key={file.id?.toString()} file={file} onUpdate={handleGetFileList} />
      ))}
    </div>
  );
}
