import api from "../api/api";

export const getPortfolio = async () => {
  const response = await api.get("/portfolio");
  return response.data;
};

export const deletePortfolio = async (asset_id) => {
  const response = await api.delete(`/portfolio/${asset_id}`);
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};
