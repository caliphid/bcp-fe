import { MasterStatus } from './enums';
import { BusinessUnit } from './business-unit';
import { Category } from './category';

export enum ProductType {
  PHYSICAL_PRODUCT = "PHYSICAL_PRODUCT",
  SERVICE = "SERVICE",
  RAW_MATERIAL = "RAW_MATERIAL",
  OTHER = "OTHER"
}

export interface ProductVariant {
  id: string;
  productId: string;
  product?: Product;
  sku: string;
  color: string;
  size: string;
  unitCost: string;
  barcode?: string;
  sellingPrice: string;
  minimumStock: number;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  articleName?: string;
  type: ProductType;
  sku?: string;
  defaultHpp: string;
  defaultPrice: string;
  description?: string;
  status: MasterStatus;
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  categoryId?: string;
  category?: Category;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  type: ProductType;
  productCode?: string;
  businessUnitId?: string;
  categoryId?: string;
  articleName?: string;
  sku?: string;
  defaultHpp?: string;
  defaultPrice?: string;
  description?: string;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface CreateProductVariantRequest {
  productId: string;
  sku: string;
  color: string;
  size: string;
  unitCost: string;
  barcode?: string;
  sellingPrice?: string;
  minimumStock?: number;
}

export type UpdateProductVariantRequest = Partial<CreateProductVariantRequest>;
