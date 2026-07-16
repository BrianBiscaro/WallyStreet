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
