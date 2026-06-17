import { BaseResponse } from './common';

export interface AppSettings {
  id: string;
  activeYear: number;
  currency: string;
  timezone: string;
  updatedAt: string;
}

export type AppSettingsResponse = BaseResponse<AppSettings>;
