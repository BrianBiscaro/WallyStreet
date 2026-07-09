import api from "../api/api";

export const buyService = async (user_id, asset_id, quantity) => {
  const response = await api.post("/trade/buy", {
    user_id: user_id,
    asset_id: asset_id,
    quantity: quantity,
  });
  return response.data;
};

export const sellService = async (user_id, asset_id, quantity) => {
  const response = await api.post("/trade/sell", {
    user_id: user_id,
    asset_id: asset_id,
    quantity: quantity,
  });
  return response.data;
};
