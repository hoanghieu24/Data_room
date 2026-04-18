// contractService.js
import axiosClient from "./axiosClient";

export const getAllContracts = async () => {
  try {
    const response = await axiosClient.get('/contracts');
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};