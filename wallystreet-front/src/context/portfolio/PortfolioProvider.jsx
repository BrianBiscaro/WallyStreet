import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deletePortfolio,
  getPortfolio,
  getTransactions,
} from "../../services/portfolioService";
import { buyService, sellService } from "../../services/tradeService";
import { useAuth } from "../auth/useAuth";
import { PortfolioContext } from "./PortfolioContext";

const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, updateUserBalance } = useAuth();

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPortfolio();
      setPortfolio(data);
      setError(null);
      return data;
    } catch (error) {
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAsset = useCallback(
    async (asset_id) => {
      try {
        setLoading(true);
        await deletePortfolio(asset_id);
        await fetchPortfolio();
        setError(null);
        return true;
      } catch (error) {
        setError(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPortfolio],
  );

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(
        Array.isArray(data?.transactions) ? data.transactions : [],
      );
      setError(null);
      return true;
    } catch (error) {
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (user) {
        await fetchPortfolio();
        fetchTransactions();
      } else {
        setPortfolio({});
        setTransactions([]);
      }
    };

    loadPortfolio();
  }, [user, fetchPortfolio, fetchTransactions]);

  const buyAsset = useCallback(
    async (user_id, asset_id, quantity) => {
      setLoading(true);
      try {
        const data = await buyService(user_id, asset_id, quantity);
        if (data?.total_cost) {
          updateUserBalance(-Number(data.total_cost));
        }
        await fetchPortfolio();
        await fetchTransactions();
        return data;
      } catch (error) {
        setError(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPortfolio, fetchTransactions, updateUserBalance],
  );

  const sellAsset = useCallback(
    async (user_id, asset_id, quantity) => {
      setLoading(true);
      try {
        const data = await sellService(user_id, asset_id, quantity);
        if (data?.total_return) {
          updateUserBalance(Number(data.total_return));
        }
        await fetchPortfolio();
        await fetchTransactions();
        return data;
      } catch (error) {
        setError(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPortfolio, fetchTransactions, updateUserBalance],
  );

  const value = useMemo(
    () => ({
      portfolio,
      transactions,
      loading,
      error,
      refetch: fetchPortfolio,
      deleteAsset,
      fetchTransactions,
      buyAsset,
      sellAsset,
    }),
    [
      portfolio,
      transactions,
      loading,
      error,
      fetchPortfolio,
      deleteAsset,
      fetchTransactions,
      buyAsset,
      sellAsset,
    ],
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioProvider;
