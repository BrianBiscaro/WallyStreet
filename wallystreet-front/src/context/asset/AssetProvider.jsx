import { useEffect, useState } from "react";
import {
  getAssetHistory,
  getAssets,
  putAssets,
} from "../../services/assetService";
import { REFRESH_RATE_MS } from "../../utils/constants";
import { AssetContext } from "./AssetContext";
/* const assetsPrueba = [
  {
    id: 1,
    name: "Asset 1",
    current_price: 20.0,
    last_update: "someDate",
    tendencia: "",
  },
  {
    id: 2,
    name: "Asset 2",
    current_price: 30.0,
    last_update: "someDate",
    tendencia: "",
  },
  {
    id: 3,
    name: "Asset 3",
    current_price: 40.0,
    last_update: "someDate",
    tendencia: "",
  },
]; */

const getTrend = (currentPrice, previousPrice) => {
  if (previousPrice == null) return "Igual";
  if (Number(currentPrice) > Number(previousPrice)) return "Alta";
  if (Number(currentPrice) < Number(previousPrice)) return "Baja";
  return "Igual";
};

const mergeAssets = (prevAssets, incomingAssets) => {
  const previousAssets = Array.isArray(prevAssets) ? prevAssets : [];
  const incomingList = Array.isArray(incomingAssets) ? incomingAssets : [];

  if (incomingList.length === 0) {
    return previousAssets;
  }

  const mergedAssets = previousAssets.map((asset) => {
    const updatedAsset = incomingList.find((item) => item.id === asset.id);

    if (!updatedAsset) {
      return asset;
    }

    return {
      ...asset,
      ...updatedAsset,
      tendencia: getTrend(updatedAsset.current_price, asset.current_price),
    };
  });

  const newAssets = incomingList
    .filter((item) => !previousAssets.some((asset) => asset.id === item.id))
    .map((asset) => ({
      ...asset,
      tendencia: getTrend(asset.current_price, null),
    }));

  return [...mergedAssets, ...newAssets];
};

export const AssetProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await getAssets();
      const nuevosAssets = Array.isArray(data?.assets) ? data.assets : [];

      setAssets((prevAssets) => mergeAssets(prevAssets, nuevosAssets));
      setError(null);
      return true;
    } catch (error) {
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchAssets();
    };

    loadInitialData();

    const intervalo = setInterval(fetchAssets, REFRESH_RATE_MS);

    return () => clearInterval(intervalo);
  }, []);

  const updateAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await putAssets();
      const updatedAssets = Array.isArray(data?.updated_assets)
        ? data.updated_assets
        : [];

      setAssets((prevAssets) => mergeAssets(prevAssets, updatedAssets));
      return true;
    } catch (error) {
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetHistory = async (assetId, quantity) => {
    try {
      const data = await getAssetHistory(assetId, quantity);
      return Array.isArray(data) ? data : data?.history || [];
    } catch (error) {
      setError(error);
      return [];
    }
  };

  const value = {
    assets,
    refetch: fetchAssets,
    updateAssets,
    fetchAssetHistory,
    loading,
    error,
  };

  return (
    <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
  );
};
