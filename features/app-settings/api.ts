import api from '../../lib/axios';
import { AppSettingsResponse } from '../../types/app-settings';

export const appSettingsApi = {
  getSettings: async () => {
    const res = await api.get<AppSettingsResponse>('/app-settings');
    return res.data;
  },
  updateSettings: async (data: any) => {
    const res = await api.patch<AppSettingsResponse>('/app-settings', data);
    return res.data;
  },
};
