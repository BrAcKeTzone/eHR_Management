import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/specializations";

export const specializationApi = {
  getSpecializations: async () => {
    const response = await fetchClient.get(API_BASE);
    return response.data;
  },

  createSpecialization: async (name) => {
    const response = await fetchClient.post(API_BASE, { name });
    return response.data;
  },

  deleteSpecialization: async (id) => {
    const response = await fetchClient.delete(`${API_BASE}/${id}`);
    return response.data;
  },
};
