export type Folder = {
  id?: number;
  name: string;
  parentId?: number | null;
  path: string;
  createdAt?: string;
};

export type File = {
  id?: number;
  name: string;
  folderId?: number | null;
  fileType: string;
  createdAt?: string;
  fileSize?: number;
};
