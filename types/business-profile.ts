import { BaseResponse } from './common';

export interface BusinessProfile {
  id: string;
  businessName: string;
  legalName: string;
  phone: string;
  email: string;
  address: string;
  logoUrl?: string;
  updatedAt: string;
}

export type BusinessProfileResponse = BaseResponse<BusinessProfile>;
