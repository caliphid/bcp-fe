import api from '../../lib/axios';
import { BusinessProfileResponse } from '../../types/business-profile';

export const businessProfileApi = {
  getProfile: async () => {
    const res = await api.get<BusinessProfileResponse>('/business-profile');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.patch<BusinessProfileResponse>('/business-profile', data);
    return res.data;
  },
};
