import { MasterStatus } from './enums';

export interface Crew {
  id: string;
  name: string;
  phone?: string;
  position?: string;
  address?: string;
  joinedAt?: string;
  notes?: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}
