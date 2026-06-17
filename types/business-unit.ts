import { MasterStatus } from './enums';

export interface BusinessUnit {
  id: string;
  name: string;
  description?: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}
