import { MasterStatus } from './enums';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  businessUnitId?: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductCategoryRequest {
  name: string;
  description?: string;
  status?: MasterStatus;
  businessUnitId?: string;
}

export type UpdateProductCategoryRequest = Partial<CreateProductCategoryRequest>;
