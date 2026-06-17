import { CategoryType, MasterStatus } from './enums';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  description?: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}
