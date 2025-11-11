"use client";
import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";
const IconList = [
  {
    path: "/svg/icon.svg",
    name: "三维编辑器",
    isActive: false,
  },
  {
    path: "/svg/plus.svg",
    name: "导入模型",
    isActive: false,
  },
  {
    path: "/svg/rotate.svg",
    name: "旋转物体",
    isActive: false,
  },
  {
    path: "/svg/translate.svg",
    name: "平移物体",
    isActive: false,
  },
  {
    path: "/svg/zoom.svg",
    name: "缩放物体",
    isActive: false,
  },
];
export default function ModelEdit() {
  const [iconList, setIconList] = useState<typeof IconList>(IconList);
  const handleChoose = (icon: (typeof IconList)[number]) => {
    setIconList((prevList) =>
      prevList.map((item) => ({
        ...item,
        isActive: item.name === icon.name ? !item.isActive : false,
      }))
    );
  };
  return (
    <div className="flex flex-col items-center">
      {iconList.map((icon) => {
        return (
          <div
            key={icon.name}
            className={clsx(
              "group relative w-full h-15",
              "flex justify-center items-center",
              "transition-all duration-300 cursor-pointer mb-2",
              "rounded-lg border",
              {
                "bg-cyan-500/10 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)] hover:shadow-[0_0_16px_rgba(34,211,238,0.5)]":
                  icon.isActive,
                "bg-transparent border-transparent hover:bg-slate-700/30 hover:border-transparent hover:shadow-[0_0_8px_rgba(34,211,238,0.1)]":
                  !icon.isActive,
              }
            )}
            title={icon.name}
            onClick={() => handleChoose(icon)}
          >
            <Image src={icon.path} alt={icon.name} width={24} height={24} />
            <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap text-xs px-2 py-1 rounded bg-slate-900/90 text-amber-100 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-200 z-10 shadow border border-slate-700">
              {icon.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
