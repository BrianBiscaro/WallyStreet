import { useContext } from "react";
import { PortfolioContext } from "./PortfolioContext";

const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error(
      "Portfolio Context debe usarse dentro de un Portfolio Provider",
    );
  }
  return context;
};

export default usePortfolioContext;
