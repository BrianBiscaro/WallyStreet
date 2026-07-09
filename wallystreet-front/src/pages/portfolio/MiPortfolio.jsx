/**
 * Un usuario logueado podrá ver su portfolio que consiste en su dinero disponible, las acciones compradas con el valor de la transacción, la cantidad y cuanto valen ahora (este valor se mostrará a la baja o al alza dependiendo el valor de compra inicial). 
 * Cada asset del portfolio será una tarjeta y tendrá 3 opciones:
 * ● Comprar: Esto permite comprar más acciones de la misma especie.
 * ○ El usuario podrá seleccionar cuántas comprar (máximo 20 o lo permitido por el dinero disponible) y el sistema calculará cuánto costará esa operación.
 * ○ Si la cantidad de dinero no es suficiente para la operación se mostrará el error correspondiente.
 * ○ Si la operación se realiza de manera exitosa, los valores deberán actualizarse para mantener la coherencia.
 * ● Vender: Esto permite vender las acciones.
 * ○ El usuario podrá indicar la cantidad de unidades a vender (máximo la cantidad de acciones que posee de esa especie) y el sistema mostrará un aproximado de cuánto obtendrá de esa operación al valor actual.
○ Al finalizar, el dinero disponible deberá actualizarse.
● Eliminar: Si la cantidad de acciones de una especie es 0, estará disponible la opción de borrar el asset del portfolio.
Recordar que los valores de las acciones varían en tiempo real.
La forma en que se muestra la información anterior puede modificarse por una más óptima
si así lo considera pero debe permitirle al usuario realizar las acciones descriptas.
En la parte inferior o superior debe haber un botón o link para ir al “Ver panel”. 
Si el usuario no tiene dinero disponible, las opciones de compra estarán deshabilitadas.
*/
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";
import usePortfolioContext from "../../context/portfolio/usePortfolioContext";
import Asset from "./Asset";
import "./MiPortfolio.css";

const MiPortfolio = () => {
  const { user } = useAuth();
  const { error, loading, portfolio, refetch } = usePortfolioContext();

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <div>
          <h2>Mi portfolio</h2>
          <p>Revisa tus activos, su valor actual y realiza operaciones.</p>
        </div>
        <div className="balance-card">
          <span>Saldo disponible</span>
          <strong>${Number(user?.balance || 0).toFixed(2)}</strong>
        </div>
      </div>

      <div className="portfolio-actions">
        <Link to="/panel">Ver Panel</Link>
        <button onClick={() => void refetch()}>Actualizar portfolio</button>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error.message || error}</p>}

      <div className="portfolio-grid">
        <div className="summary-card">
          <span>Valor total del portfolio</span>
          <strong>${Number(portfolio?.total_value || 0).toFixed(2)}</strong>
        </div>

        {portfolio?.holdings?.length ? (
          portfolio.holdings.map((asset) => (
            <Asset asset={asset} key={asset.asset_id} />
          ))
        ) : (
          <div className="empty-state">
            Todavía no tienes activos en tu portfolio.
          </div>
        )}
      </div>
    </div>
  );
};

export default MiPortfolio;
