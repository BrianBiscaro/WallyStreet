import api from "../api/api";

/**
 * Obtiene la información detallada de un usuario y su portafolio.
 *
 * @param {string|number} user_id - El identificador único del usuario.
 * @returns {{
 * id: string|number,
 * name: string,
 * email: string,
 * balance: number,
 * is_admin: boolean,
 * portfolio_total: number,
 * holdings: {
 * total_value: number,
 * holdings: Array<{
 * asset_id: string|number,
 * asset_name: string,
 * quantity: number,
 * current_price: number,
 * value: number
 * }>
 * }
 * }} Los datos del usuario.
 */
export const getUser = async (user_id) => {
  const response = await api.get(`/users/${user_id}`);
  return response.data;
};

/**
 * @typedef {Object} UpdateUserData
 * @property {string} email - El nuevo correo electrónico del usuario.
 * @property {string} password - La nueva contraseña del usuario.
 *
 * Actualiza la información de un usuario (email y contraseña).
 * * @param {string|number} user_id - El identificador del usuario.
 * @param {UpdateUserData} userData - Objeto con los datos a actualizar (viaja en el body).
 * @returns {Promise<Object>} Los datos actualizados devueltos por la API. Actualmente solo devuelve un mensaje de exito
 */
export const updateUser = async (user_id, userData) => {
  const response = await api.put(`/users/${user_id}`, userData);
  return response.data;
};

/**
 *
 * @returns {{
 * id: string|number,
 * name: string,
 * portfolio_total: number,
 * }} Resumen de datos de todos los usuarios
 */

export const listUsers = async () => {
  const response = await api.get("/users");
  return response.data; // data = {id, name, portfolio_total}
};
