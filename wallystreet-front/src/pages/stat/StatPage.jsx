import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAssetContext } from "../../context/asset/useAssetContext";
import AssetsGrid from "./AssetsGrid";
import "./StatPage.css";

const StatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [criteria, setCriteria] = useState("price");
  const [order, setOrder] = useState("asc");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [min_price, setMin_price] = useState(
    searchParams.get("min_price") || "",
  );
  const [max_price, setMax_price] = useState(
    searchParams.get("max_price") || "",
  );
  const { assets, error, loading, refetch } = useAssetContext();

  const assetsFiltrados = useMemo(() => {
    if (!assets || assets.length === 0) return [];

    const sortedAssets = [...assets].sort((a, b) => {
      if (criteria === "price") {
        return order === "asc"
          ? a.current_price - b.current_price
          : b.current_price - a.current_price;
      } else {
        return order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });

    return sortedAssets;
  }, [assets, order, criteria]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = {};
    if (type) params.type = type;

    if (min_price) params.min_price = min_price;
    if (max_price) params.max_price = max_price;

    setSearchParams(params);
  };

  return (
    <div className="stat-page">
      <h1>Listado de Assets</h1>

      <div className="filters">
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Busca por nombre"
            className="search-input"
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <input
            placeholder="Busca por precio mínimo"
            className="search-input"
            type="number"
            value={min_price}
            onChange={(e) => setMin_price(e.target.value)}
          />
          <input
            placeholder="Busca por precio máximo"
            className="search-input"
            type="number"
            value={max_price}
            onChange={(e) => setMax_price(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        <button
          className="criteria-button"
          onClick={() => setCriteria(criteria === "price" ? "name" : "price")}
        >
          Ordenar por {criteria === "price" ? "Nombre" : "Precio"}
        </button>

        <button
          className="order-button"
          onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
        >
          {order === "asc" ? "Ordenación Descendente" : "Ordenacion Ascendente"}
        </button>
      </div>

      {loading && <div> Cargando... </div>}
      {error && <div>Error: {error.message}</div>}

      <AssetsGrid assets={assetsFiltrados} />
    </div>
  );
};

export default StatPage;
