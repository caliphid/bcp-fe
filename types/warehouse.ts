import { MasterStatus } from './enums';
import { BusinessUnit } from './business-unit';

export interface Warehouse {
  id: string;
  warehouseCode: string;
  name: string;
  address?: string;
  isDefault: boolean;
  status: MasterStatus;
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseRequest {
  name: string;
  warehouseCode?: string;
  businessUnitId?: string;
  address?: string;
  isDefault?: boolean;
}

export type UpdateWarehouseRequest = Partial<CreateWarehouseRequest>;
