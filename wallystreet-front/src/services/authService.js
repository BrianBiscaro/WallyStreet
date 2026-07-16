import api from "../api/api";

/**
 *
 * @param {{email: string, password: string}} credentials
 * @returns {{
 * token: string,
 * expires_at: string,
 * user{
 * id: number,
 * is_admin: boolean,
 * name: string,
 * balance: number}
 * }}
 */
export const loginService = async (credentials) => {
  const response = await api.post("/login", credentials);
  return response.data;
};

export const registerService = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const logoutService = async (credentials) => {
  const response = await api.post("/logout", credentials);
  return response.data;
};
