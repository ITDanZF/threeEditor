import Image from "next/image";
import { useState } from "react";
import type { MouseEvent } from "react";
import clsx from "clsx";
import { File, Folder } from "../../types";
import { useEditorStore } from "@/app/store/editorStore";
import FileItem from "./FileItem";

type FileFolderProps = {
  folder: Folder;
  depth?: number;
  loadChildren: (folderId: number | null) => { folders: Folder[]; files: File[] };
  onSelectFolder?: (folder: Folder) => void;
  onSelectFile?: (file: File) => void;
};

export default function FileFolder({
  folder,
  depth = 0,
  loadChildren,
  onSelectFolder,
  onSelectFile,
}: FileFolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isShowMore, setIsShowMore] = useState(false);
  const [children, setChildren] = useState<{ folders: Folder[]; files: File[] }>({ folders: [], files: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  const setCurrentFolderId = useEditorStore((state) => state.setCurrentFolderId);
  const currentFolderId = useEditorStore((state) => state.currentFolderId);

  const indentClass = (() => {
    const indents = ["pl-2", "pl-4", "pl-6", "pl-8", "pl-10", "pl-12"];
    return indents[Math.min(depth, indents.length - 1)];
  })();

  function handleClick(target: Folder) {
    if (!target.id) return;

    // 选中回调（用于高亮或外部状态）
    onSelectFolder?.(target);
    setCurrentFolderId(`${target.id}`);

    // 首次展开时加载子项
    if (!isLoaded) {
      const payload = loadChildren(target.id ?? null);
      setChildren(payload);
      setIsLoaded(true);
    }

    setIsOpen((prev) => !prev);
  }

  function handleShowMore(e: MouseEvent) {
    e.stopPropagation();
    setIsShowMore((prev) => !prev);
  }

  function handleMouseLeave() {
    setIsShowMore(false);
  }

  function handleRename(e: MouseEvent) {
    e.stopPropagation();
    console.log("重命名");
    setIsShowMore(false);
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    console.log("删除");
    setIsShowMore(false);
  }

  const isOpenFlag = currentFolderId === `${folder?.id}` && isOpen;
  const folderName = folder?.name || "新建文件夹";

  const moreMenu = (
    <div
      onMouseLeave={handleMouseLeave}
      className="absolute z-2 text-white text-center left-80 top-23 w-25 cursor-pointer bg-slate-800 border border-slate-600 shadow-lg rounded-md p-1"
    >
      <div onClick={handleRename} className="px-3 py-1.5 hover:bg-slate-700 rounded cursor-pointer">
        重命名
      </div>
      <div onClick={handleDelete} className="px-3 py-1.5 hover:bg-slate-700 rounded cursor-pointer text-red-500">
        删除
      </div>
    </div>
  );

  const hasChildren = children.folders.length > 0 || children.files.length > 0;

  return (
    <div className="w-full">
      <div
        onClick={() => handleClick(folder)}
        className={clsx(
          "group flex items-center justify-between gap-3 px-2 py-2 rounded-md cursor-pointer border border-transparent transition-colors",
          "hover:bg-slate-700/40 hover:border-slate-700/70",
          indentClass,
          { "bg-slate-700/40 border-slate-600": isOpenFlag }
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Image src={!isOpen ? "/svg/rightArrow.svg" : "/svg/downArrow.svg"} width={12} height={12} alt="right" />
          <Image src={!isOpen ? "/svg/folder.svg" : "/svg/folderOpen.svg"} width={16} height={16} alt="folder" />
          <div className="text-white text-sm truncate">{folderName}</div>
        </div>
        <button
          type="button"
          aria-label="更多操作"
          onClick={handleShowMore}
          className="opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-slate-700/90 rounded-md p-1 transition-opacity"
        >
          <Image src="/svg/more.svg" width={16} height={16} alt="more" />
        </button>
      </div>
      {isShowMore && moreMenu}

      {isOpen && (
        <div className="flex flex-col gap-1">
          {children.folders.map((child) => (
            <FileFolder
              key={child.id?.toString()}
              folder={child}
              depth={depth + 1}
              loadChildren={loadChildren}
              onSelectFolder={onSelectFolder}
              onSelectFile={onSelectFile}
            />
          ))}
          {children.files.map((file) => (
            <FileItem key={file.id?.toString()} file={file} onUpdate={onSelectFile ?? (() => {})} />
          ))}
          {hasChildren ? null : <div className="text-xs text-slate-500 pl-9">空目录</div>}
        </div>
      )}
    </div>
  );
}
