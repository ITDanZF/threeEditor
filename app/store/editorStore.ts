import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface EditorState {
  currentFileId: string | null;
  currentFolderId: string | null;
  setCurrentFileId: (fileId: string | number) => void;
  setCurrentFolderId: (folderId: string | number) => void;
}

export const useEditorStore = create<EditorState>()(
  devtools((set, get) => ({
    currentFileId: null,
    currentFolderId: null,
    setCurrentFileId: (fileId: string) => set({ currentFileId: fileId }),
    setCurrentFolderId: (folderId: string) =>
      set({ currentFolderId: folderId }),
  }))
);
