import { AccountType, MasterStatus } from './enums';
import { BusinessUnit } from './business-unit';

export interface Account {
  id: string;
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  name: string;
  type: AccountType;
  initialBalance: string;
  currentBalance: string;
  accountNumber?: string;
  bankName?: string;
  notes?: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}
