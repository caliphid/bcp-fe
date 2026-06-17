import { ProductType, MasterStatus } from './enums';
import { BusinessUnit } from './business-unit';

export interface Product {
  id: string;
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  name: string;
  type: ProductType;
  sku?: string;
  defaultHpp: string;
  defaultPrice: string;
  description?: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}
