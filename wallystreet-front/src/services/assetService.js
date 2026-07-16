import api from "../api/api";

/**
 * Servicio Público para acceder a la información completa sobre los activos
 * @returns {{
 * assets: Array<{
 * id: number,
 * name: string,
 * current_price: number,
 * last_update: date,
 * }>
 * }} Lista de Activos
 */

export const getAssets = async (queryParams) => {
  console.log(queryParams);
  const response = await api.get("/assets", { params: queryParams });
  return response.data;
};

/**
 * Servicio exclusivo del Administrador que permite variar los precios de los activos
 * @returns {{
 * updated_assets: Array<{
 * id: number,
 * current_price: number,
 * }>
 * }} Lista de Activos (ID) y precio actualizado
 */
export const putAssets = async () => {
  const response = await api.put("/assets");
  return response.data;
};

/**
 *
 * @param {string | number} asset_id
 * @param {number} quantity
 * @returns {{
 * : Array<{
 * price_per_unit: number,
 * transaction_date: date,
 * }>
 * }} Lista con el historial de un Activo
 */
export const getAssetHistory = async (asset_id, quantity) => {
  const response = await api.get(`/assets/${asset_id}/history/${quantity}`);
  return response.data?.history || [];
};
