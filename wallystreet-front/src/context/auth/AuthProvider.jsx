import { useMemo, useState } from "react";
import {
  loginService,
  logoutService,
  registerService,
} from "../../services/authService";
import { AuthContext } from "./AuthContext";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user_data");
    const expiresAt = localStorage.getItem("expires_at");

    if (expiresAt && new Date().getTime() > new Date(expiresAt).getTime()) {
      localStorage.clear();
      return null;
    }

    return storedUser && storedUser !== "null" ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const normalizeError = (error, fallbackMessage) => {
  if (error?.response?.data?.message) {
    return {
      status: error.response.status || 500,
      message: error.response.data.message,
    };
  }

  if (error?.message) {
    return {
      status: error.status || 500,
      message: error.message,
    };
  }

  return {
    status: 500,
    message: fallbackMessage,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserBalance = (delta) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const nextBalance = Math.max(
        0,
        Number(prevUser.balance || 0) + Number(delta || 0),
      );
      const updatedUser = {
        ...prevUser,
        balance: Number(nextBalance.toFixed(2)),
      };

      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const updateUserProfile = (updatedFields) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const updatedUser = {
        ...prevUser,
        ...updatedFields,
      };

      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const register = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      await registerService(credentials);
      return true;
    } catch (error) {
      setError(normalizeError(error, "No se pudo completar el registro."));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginService(credentials);
      const loggedUser = data.user || data;

      setUser(loggedUser);
      localStorage.setItem("token", data.token);
      localStorage.setItem("expires_at", data.expires_at);
      localStorage.setItem("user_data", JSON.stringify(loggedUser));

      return true;
    } catch (error) {
      setError(normalizeError(error, "Credenciales inválidas."));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutService();
      return true;
    } catch (error) {
      setError(normalizeError(error, "No se pudo cerrar la sesión."));
      return false;
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("expires_at");
      localStorage.removeItem("user_data");
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      register,
      login,
      logout,
      updateUserBalance,
      updateUserProfile,
      loading,
      error,
    }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
