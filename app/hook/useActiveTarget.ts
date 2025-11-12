import { useEditorStore } from "@/app/store/editorStore";

export function useActiveTarget(
  folderId?: string | number,
  fileId?: string | number
) {
  if (folderId) {
    const currentFolderId = useEditorStore((state) => state.currentFolderId);
    return currentFolderId === String(folderId);
  }

  if (fileId) {
    const currentFileId = useEditorStore((state) => state.currentFileId);
    return currentFileId === String(fileId);
  }
}
