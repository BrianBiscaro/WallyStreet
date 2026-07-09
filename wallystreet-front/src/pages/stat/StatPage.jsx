import { useMemo, useState } from "react";
import { useAssetContext } from "../../context/asset/useAssetContext";
import AssetsGrid from "./AssetsGrid";
import "./StatPage.css";

/**
 * a) Listado de assets
Crear un archivo dentro de la carpeta pages/stat llamado StatPage. Esta página deberá mostrarse como página por defecto. Dicha página debe contener:
● Un listado de todos los assets con su nombre público mostrando su precio actual y un atributo que indiqué su evolución reciente (ascendente o descendente) con respecto a su precio inmediatamente anterior; puede ser color, flecha, etc.
● El listado debe permitir filtrar y ordenar por nombre y precio.
● El listado debe actualizarse cada 3 minutos.
El contenido de este listado no necesita que el usuario esté logueado.
 */

const StatPage = () => {
  const [filtro, setFiltro] = useState("");
  const [criterio, setCriterio] = useState("precio");
  const [orden, setOrden] = useState("asc");
  const { assets, error, loading, refetch } = useAssetContext();

  const assetsFiltrados = useMemo(() => {
    if (!assets || assets.length === 0) return [];

    let resultado = assets.filter((asset) => {
      if (!filtro) return true;

      if (criterio === "precio") {
        return asset.current_price?.toString().includes(filtro);
      } else {
        return asset.name?.toLowerCase().includes(filtro.toLowerCase());
      }
    });

    resultado.sort((a, b) => {
      if (criterio === "precio") {
        return orden === "asc"
          ? a.current_price - b.current_price
          : b.current_price - a.current_price;
      } else {
        return orden === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });

    return resultado;
  }, [assets, filtro, orden, criterio]);

  return (
    <div className="stat-page">
      <h1>Listado de Assets</h1>
      <div className="filtros">
        <input
          className="search-input"
          type={criterio === "precio" ? "number" : "text"}
          placeholder={`Filtrar por ${criterio}...`}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <button
          className="criterio-button"
          onClick={() => setCriterio(criterio === "precio" ? "name" : "precio")}
        >
          Ordenar por {criterio === "precio" ? "Nombre" : "Precio"}
        </button>

        <button
          className="order-button"
          onClick={() => setOrden(orden === "asc" ? "desc" : "asc")}
        >
          {orden === "asc" ? "Ascendente" : "Descendente"}
        </button>
      </div>

      {loading && <div> Cargando... </div>}
      {error && <div>Error: {error.message}</div>}

      <button onClick={refetch}>Refrescar</button>

      <AssetsGrid assets={assetsFiltrados} />
    </div>
  );
};

export default StatPage;
