"use client";
import { IndexDB, DBConfig } from "@/app/db";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Folder, File } from "./types";
import FileListItem from "./FileListItem";

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
const db = IndexDB.getInstance(dbConfig);

export default function ModelList() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleAddModel = () => {
    console.log("添加模型");
    // TODO: 实现添加模型逻辑
    setIsOpen(!isOpen);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 获取文件夹列表
  useEffect(() => {
    const fetchFolders = async () => {
      const folders = await db.getAll("folders");
      const files = await db.getAll("models");
      console.log(folders, "folders");
      setFolders(folders as Folder[]);
      setFiles(files as File[]);
    };
    fetchFolders();
  }, []); // 只在组件挂载时执行一次

  /**
   * 下拉菜单内容
   * @returns
   */
  const handleMenus = (
    <div className="absolute right-0 top-12 w-36 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden z-50 animate-dropdown">
      <div className="px-4 py-2.5 text-white text-sm hover:bg-cyan-400/20 cursor-pointer transition-colors duration-150 flex items-center gap-2 border-b border-slate-700/50">
        <Image src="/svg/floder.svg" alt="添加" width={16} height={16} />
        <span onClick={handleCreateFolder}>新建文件夹</span>
      </div>
      <div className="px-4 py-2.5 text-white text-sm hover:bg-cyan-400/20 cursor-pointer transition-colors duration-150 flex items-center gap-2">
        <Image src="/svg/glb.svg" alt="添加" width={16} height={16} />
        <span>新建GLB模型</span>
      </div>
    </div>
  );

  async function handleCreateFolder() {
    setIsOpen(false);

    const folderData: Folder = {
      name: "新建文件夹",
      parentId: null, // 根目录，没有父文件夹
      path: `/新建文件夹`, // 根路径
      createdAt: new Date().toISOString(), // 创建时间
    };

    // 写入数据库
    const newId = await db.add("folders", folderData);
  }

  return (
    <div className="w-full h-full">
      <div
        ref={dropdownRef}
        className="relative flex items-center justify-between px-4 py-4 bg-gradient-to-b from-slate-800 to-slate-900 mb-2"
      >
        <span className="text-base font-medium text-white">资源管理器</span>
        <button
          onClick={handleAddModel}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-cyan-400/20 transition-all duration-200 cursor-pointer"
          title="添加模型"
        >
          <Image src="/svg/plus.svg" alt="添加" width={16} height={16} />
        </button>
        {isOpen && handleMenus}
      </div>
      {/* 文件夹列表 */}
      <FileListItem folders={folders} files={files} />
    </div>
  );
}
