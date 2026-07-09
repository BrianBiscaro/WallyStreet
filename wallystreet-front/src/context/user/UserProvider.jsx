import { useState } from "react";
import { getUser, listUsers, updateUser } from "../../services/userService";
import { UserContext } from "./UserContext";

const UserProvider = ({ children }) => {
  const ram_user = {
    id: 1,
    name: "Brian",
    email: "brian@gmail.com",
    balance: 200,
    is_admin: true,
    portfolio_total: 60,
    holdings: {
      total_value: 90,
      holdings: [
        {
          asset_id: 1,
          asset_name: "Pepsi",
          quantity: 3,
          current_price: 20,
          value: 30,
        },
      ],
    },
  };

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await getUser(user.id);
      setUser(data);
      return true;
    } catch (error) {
      setError(error);
      setUser(ram_user);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (userData) => {
    setLoading(true);
    try {
      const data = await updateUser(user.id, userData);
      if (data != null) {
        if (await fetchUser(user.id)) {
          return true;
        }
      }
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      return data;
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  /*  const getPortfolio = async () => {
    try {
      const data = await getPortfolio();
      return setUs(data);
    } catch (error) {
      setError(error);
    } finally {
      loading(false);
    }
  };
  const deletePortfolio = async () => {
    try {
      const data = await deletePortfolio();
      return data; // Actualizar el portfolio sin el asset eliminado
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }; */
  const getTransactions = async () => {
    try {
      const data = await getTransactions();
      return data;
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    error,
    loading,
    refetch: fetchUser,
    updateUserData,
    fetchUsers,
    getTransactions,
    /*   getPortfolio,
    deletePortfolio, */
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
