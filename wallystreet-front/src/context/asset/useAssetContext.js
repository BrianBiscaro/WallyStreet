import { useContext } from "react";
import { AssetContext } from "./AssetContext";

export const useAssetContext = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error("useAsset debe usarse dentro de un AssetProvider");
  }
  return context;
};
