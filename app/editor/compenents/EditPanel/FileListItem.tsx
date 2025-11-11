import { Folder, File } from "./types";
export default function FileListItem({
  folders,
  files,
}: {
  folders: Folder[];
  files: File[];
}) {
  console.log(folders, files, "folders, files");

  return <div>文件名</div>;
}
