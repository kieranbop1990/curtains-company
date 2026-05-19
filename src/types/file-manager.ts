export type ItemType = 'file' | 'folder';

export interface UploadedItem {
  id?: string;
  path: string;
  extension?: string;
  lastModified?: Date;
  size?: number;
}