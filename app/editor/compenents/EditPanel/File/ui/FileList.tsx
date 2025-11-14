import FileItem from "./FileItem";
import { useEffect, useState } from "react";
import { ModelListIndexDB } from "@/app/db";
import { Folder } from "../../types";

export default function FileList() {
  const [folders, setFolders] = useState<Folder[]>([]);
    // 获取文件夹列表
    useEffect(() => {
      const fetchFolders = async () => {
        const folders = await ModelListIndexDB.getAll("folders");
        // const files = await ModelListIndexDB.getAll("models");
        console.log(folders, "folders");
        setFolders(folders as Folder[]);
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

  return (
    <div className="w-full h-full">
      {folders.map((folder) => (
        <FileItem key={folder.id?.toString() || ""} folder={folder} onUpdate={handleGetList} />
      ))}
    </div>
  );
}
