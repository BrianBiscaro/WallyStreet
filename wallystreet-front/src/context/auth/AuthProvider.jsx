import { useCallback, useMemo, useState } from "react";
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
      localStorage.removeItem("user_data");
      localStorage.removeItem("token");
      localStorage.removeItem("expires_at");
      return null;
    }

    return storedUser && storedUser !== "null" ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserBalance = useCallback((delta) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const nextBalance = Math.max(0, Number(prevUser.balance || 0) + Number(delta || 0));
      const updatedUser = {
        ...prevUser,
        balance: Number(nextBalance.toFixed(2)),
      };

      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const updateUserProfile = useCallback((updatedFields) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const updatedUser = {
        ...prevUser,
        ...updatedFields,
      };

      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const register = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      await registerService(credentials);
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginService(credentials);
      const loggedUser = data.user;

      localStorage.setItem("token", data.token);
      localStorage.setItem("expires_at", data.expires_at);
      localStorage.setItem("user_data", JSON.stringify(loggedUser));

      setUser(loggedUser);
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const expiresAt = localStorage.getItem("expires_at");
      const isAlive = expiresAt && new Date().getTime() <= new Date(expiresAt).getTime();

      if (isAlive) {
        await logoutService();
      }
      return true;
    } catch (err) {
      console.error("Sesión terminada con error de red/autorización");
      return false;
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("expires_at");
      localStorage.removeItem("user_data");
      setUser(null);
      setLoading(false);
    }
  }, []);

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
    [user, register, login, logout, updateUserBalance, updateUserProfile, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};