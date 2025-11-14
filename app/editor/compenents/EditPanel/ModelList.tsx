"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Folder } from "./types";
import FileList from "./File/ui/FileList";



export default function ModelList() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    // const folderData: Folder = {
    //   name: "新建文件夹",
    //   parentId: null, // 根目录，没有父文件夹
    //   path: `/新建文件夹`, // 根路径
    //   createdAt: new Date().toISOString(), // 创建时间
    // };

    // // 写入数据库
    // const newId = await db.add("folders", folderData);
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
      <FileList/>
    </div>
  );
}
