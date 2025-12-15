import clsx from "clsx";
import { File } from "../../types";

type FileItemProps = {
  file: File;
  onUpdate: (file: File) => void;
  activeId?: number | string | null;
};

const typeColor: Record<string, string> = {
  glb: "bg-amber-500/80",
  json: "bg-emerald-500/80",
  md: "bg-sky-500/80",
  jpg: "bg-rose-500/80",
  png: "bg-cyan-500/80",
};

function formatSize(size?: number) {
  if (!size) return "未知大小";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function formatDate(date?: string) {
  if (!date) return "未知时间";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "未知时间";
  return d.toLocaleDateString();
}

export default function FileItem({ file, onUpdate, activeId }: FileItemProps) {
  const ext = file.fileType?.replace(".", "").toLowerCase() || "file";
  const iconColor = typeColor[ext] || "bg-slate-600/80";
  const typeBadge = ext.slice(0, 3).toUpperCase();
  const isActive = activeId !== undefined && activeId !== null && `${activeId}` === `${file.id ?? ""}`;

  return (
    <div
      onClick={() => onUpdate(file)}
      onDoubleClick={() => onUpdate(file)}
      title={`${file.name} (${formatSize(file.fileSize)})`}
      className={clsx(
        "group flex items-center justify-between gap-1.5 pl-8 pr-2 py-1 rounded-md cursor-pointer border border-transparent transition-colors text-[13px]",
        "hover:bg-slate-700/40 hover:border-slate-700/70",
        { "bg-slate-700/40 border-slate-600": isActive }
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <div
          className={clsx(
            "w-8 h-8 flex items-center justify-center rounded-md text-[10px] font-semibold text-slate-100 select-none leading-none",
            iconColor
          )}
        >
          {typeBadge}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <div className="text-[12px] text-white truncate">{file.name}</div>
            <span className="text-[9px] text-slate-400 uppercase">{file.fileType}</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate group-hover:text-slate-300">
            {formatSize(file.fileSize)} · {formatDate(file.createdAt)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-[10px] text-slate-300 px-1.5 py-0.5 rounded bg-slate-800/70 border border-slate-700">
          打开
        </div>
      </div>
    </div>
  );
}