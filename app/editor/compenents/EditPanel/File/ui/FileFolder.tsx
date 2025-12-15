import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";
import { Folder } from "../../types";
import { useEditorStore } from "@/app/store/editorStore";

type FileItemProps = {
  key: string;
  folder: Folder;
  onUpdate: (folder: Folder) => void;
};

export default function FileItem({ folder, onUpdate }: FileItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isShowMore, setIsShowMore] = useState(false);
  const setCurrentFolderId = useEditorStore(
    (state) => state.setCurrentFolderId
  );
  const currentFolderId = useEditorStore((state) => state.currentFolderId);
  
  function handleClick(folder: Folder) {
    console.log(folder, "folder");
    
    if (!folder.id) {
      return;
    }

    if (isOpen) {
      onUpdate(folder)
    }

    setCurrentFolderId(`${folder.id}`);
    setIsOpen(!isOpen);
  }

  function handleShowMore() {
    setIsShowMore(!isShowMore);
  }

  function handleMouseLeave() {
    setIsShowMore(false);
  }

  function handleRename() {
    console.log("重命名");
    setIsShowMore(false);
  }

  function handleDelete() {
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
      <div
        onClick={handleRename}
        className="px-3 py-1.5 hover:bg-slate-700 rounded cursor-pointer"
      >
        重命名
      </div>
      <div
        onClick={handleDelete}
        className="px-3 py-1.5 hover:bg-slate-700 rounded cursor-pointer text-red-500"
      >
        删除
      </div>
    </div>
  );
  return (
    <>
      <div
        onClick={() => handleClick(folder)}
        className={clsx(
          "group flex items-center justify-between gap-3 px-2 py-2 rounded-md cursor-pointer border border-transparent transition-colors",
          "hover:bg-slate-700/40 hover:border-slate-700/70",
          { "bg-slate-700/40 border-slate-600": isOpenFlag }
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src={!isOpenFlag ? "/svg/rightArrow.svg" : "/svg/downArrow.svg"}
            width={12}
            height={12}
            alt="right"
          />
          <Image
            src={!isOpenFlag ? "/svg/folder.svg" : "/svg/folderOpen.svg"}
            width={16}
            height={16}
            alt="folder"
          />
          <div className="text-white text-sm truncate">{folderName}</div>
        </div>
        <div
          onClick={handleShowMore}
          className="opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-slate-700/90 rounded-md p-1 transition-opacity"
        >
          <Image src="/svg/more.svg" width={16} height={16} alt="more" />
        </div>
      </div>
      {isShowMore && moreMenu}
    </>
  );
}
