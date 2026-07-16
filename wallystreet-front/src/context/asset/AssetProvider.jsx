import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAssetHistory, getAssets, putAssets } from "../../services/assetService";
import { REFRESH_RATE_MS } from "../../utils/constants";
import { AssetContext } from "./AssetContext";

export const AssetProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();


  const assetsRef = useRef([]);
  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);


  const getTrend = (currentPrice, prevPrice, prevTrend = "Igual") => {
    if (prevPrice === null || prevPrice === undefined) return prevTrend;
    const current = Number(currentPrice);
    const prev = Number(prevPrice);

    if (current > prev) return "Alta";
    if (current < prev) return "Baja";
    return prevTrend;
  };

  const fetchAssets = useCallback(async () => {
    try {
      const queryParams = {};
      const type = searchParams.get("type");
      const min_price = searchParams.get("min_price");
      const max_price = searchParams.get("max_price");

      if (type) queryParams.type = type;
      if (min_price) queryParams.min_price = min_price;
      if (max_price) queryParams.max_price = max_price;

      const data = await getAssets(queryParams);
      const fetchedAssets = data.assets || data;

      const localAssets = assetsRef.current;
      const activosNuevos = [];

      const actualizados = fetchedAssets.map((currentAsset) => {

        const prevAsset = localAssets.find((asset) => asset.id === currentAsset.id);

        if (prevAsset) {

          return {
            ...currentAsset,
            tendencia: getTrend(currentAsset.current_price, prevAsset.current_price, prevAsset.tendencia),
          };
        } else {

          activosNuevos.push(currentAsset);
          return { ...currentAsset, tendencia: "Igual" };
        }
      });

      setAssets(actualizados);
      setError(null);

      if (activosNuevos.length > 0) {
        activosNuevos.forEach(async (asset) => {
          try {

            const historyData = await getAssetHistory(asset.id, 1);
            const history = Array.isArray(historyData) ? historyData : (historyData?.history || []);
            let tendenciaCalculada = "Igual";

            if (history.length > 0) {

              const sortedHistory = [...history].sort((a, b) => {
                const dateA = new Date(a.transaction_date.replace(' ', 'T') + 'Z').getTime();
                const dateB = new Date(b.transaction_date.replace(' ', 'T') + 'Z').getTime();
                return dateB - dateA;
              });


              const currentPrice = Number(asset.current_price);
              const previousPrice = Number(sortedHistory[0].price_per_unit);

              if (currentPrice > previousPrice) tendenciaCalculada = "Alta";
              else if (currentPrice < previousPrice) tendenciaCalculada = "Baja";
            }


            setAssets((estadoActual) =>
              estadoActual.map((a) =>
                a.id === asset.id ? { ...a, tendencia: tendenciaCalculada } : a
              )
            );
          } catch (e) {
          }
        });
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAssets();
    const intervalo = setInterval(fetchAssets, REFRESH_RATE_MS);
    return () => clearInterval(intervalo);
  }, [fetchAssets]);

  const updateAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await putAssets();
      const updatedPrices = Array.isArray(data) ? data : (data?.updated_assets || []);

      if (updatedPrices.length === 0) {
        return true;
      }

      setAssets((estadoActual) => {
        return estadoActual.map((assetAnterior) => {
          const actualizacion = updatedPrices.find((u) => u.id === assetAnterior.id);

          if (actualizacion) {
            const nuevaTendencia = getTrend(
              actualizacion.current_price,
              assetAnterior.current_price,
              assetAnterior.tendencia
            );

            return {
              ...assetAnterior,
              current_price: actualizacion.current_price,
              tendencia: nuevaTendencia
            };
          }
          return assetAnterior;
        });
      });
      return true;
    } catch (error) {
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetHistorySafe = useCallback(async (assetId, quantity) => {
    try {
      const data = await getAssetHistory(assetId, quantity);
      return Array.isArray(data) ? data : data?.history || [];
    } catch (error) {
      return [];
    }
  }, []);

  const value = {
    assets,
    refetch: fetchAssets,
    updateAssets,
    fetchAssetHistory: fetchAssetHistorySafe,
    loading,
    error
  };

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
};