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
  sku?: string | null;
  defaultHpp: string;
  defaultPrice: string;
  description?: string;
  status: MasterStatus;
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  categoryId?: string;
  category?: Category;
  variants?: ProductVariant[];
  deletedAt: string | null;
  deletedById: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Variant item for POST /products (nested) and POST /products/:id/variants. */
export interface ProductVariantInput {
  color: string;
  size: string;
  /** Empty = auto-generated as <productCode>-<COLOR>-<SIZE> */
  sku?: string;
  barcode?: string;
  /** Defaults to the product's defaultHpp */
  unitCost?: number;
  /** Defaults to the product's defaultPrice */
  sellingPrice?: number;
  minimumStock?: number;
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
  /** Omitted or empty = backend creates a single DEFAULT/DEFAULT variant */
  variants?: ProductVariantInput[];
}

export type UpdateProductRequest = Partial<Omit<CreateProductRequest, 'variants'>>;

export interface CreateProductVariantsBulkRequest {
  variants: ProductVariantInput[];
}

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
