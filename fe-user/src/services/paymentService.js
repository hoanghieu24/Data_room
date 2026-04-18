import axiosClient from "./axiosClient";

export const getAllPayments = async () => {
  try {
    const response = await axiosClient.get('/payments');
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPaymentById = async (id) => {
  try {
    const response = await axiosClient.get(`/payments/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createPayment = async (paymentData) => {
  try {
    const response = await axiosClient.post('/payments', paymentData);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updatePayment = async (id, paymentData) => {
  try {
    const response = await axiosClient.put(`/payments/${id}`, paymentData);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deletePayment = async (id) => {
  try {
    const response = await axiosClient.delete(`/payments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const searchPayments = async (keyword) => {
  try {
    const response = await axiosClient.get(`/payments/search/${keyword}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPaymentsByStatus = async (status) => {
  try {
    const response = await axiosClient.get(`/payments/status/${status}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPaymentsByContract = async (contractId) => {
  try {
    const response = await axiosClient.get(`/payments/contract/${contractId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};