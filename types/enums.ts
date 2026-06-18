export enum MasterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  EWALLET = 'EWALLET',
  MARKETPLACE = 'MARKETPLACE',
  OTHER = 'OTHER',
}

export enum CategoryType {
  IN = 'IN',
  OUT = 'OUT',
  BOTH = 'BOTH',
}

export enum ProductType {
  PHYSICAL_PRODUCT = 'PHYSICAL_PRODUCT',
  SERVICE = 'SERVICE',
  RAW_MATERIAL = 'RAW_MATERIAL',
  OTHER = 'OTHER',
}

export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum TransactionStatus {
  POSTED = 'POSTED',
  VOID = 'VOID',
}
