import { useState } from "react";
import { Link } from "react-router-dom";
import { useAssetContext } from "../../context/asset/useAssetContext";
import { useAuth } from "../../context/auth/useAuth";
import usePortfolioContext from "../../context/portfolio/usePortfolioContext";
import "./Layout.css";

const NavBarComponent = () => {
  const { user, logout } = useAuth();
  const { updateAssets } = useAssetContext();
  const { portfolio } = usePortfolioContext();
  const [refreshingPrices, setRefreshingPrices] = useState(false);

  const handleRefreshPrices = async () => {
    setRefreshingPrices(true);
    try {
      await updateAssets();
    } finally {
      setRefreshingPrices(false);
    }
  };

  function publicNav() {
    return (
      <div className="navbar-links">
        <Link to="/register">Registro</Link>
        <Link to="/login">Inicio de Sesión</Link>
      </div>
    );
  }

  function privateNav() {
    return (
      <>
        <div className="welcome-msg">
          <p>Hola, {user.name}</p>
          <p>Valor Portfolio: ${Number(portfolio?.total_value).toFixed(2)}</p>
        </div>
        <div className="navbar-links">
          <Link to="/portfolio">Mi Porfolio</Link>
          <Link to="/operaciones">Mis Operaciones</Link>
          <Link to="/panel">Ver Panel</Link>
          <Link to="/usuario/editar">Editar Usuario</Link>
          {user.is_admin && <Link to="/manejo-usuarios">Manejo Usuarios</Link>}
          {user.is_admin && (
            <button
              type="button"
              onClick={handleRefreshPrices}
              disabled={refreshingPrices}
              className="secondary"
            >
              {refreshingPrices ? "Actualizando..." : "Actualizar precios"}
            </button>
          )}
          <button onClick={logout} className="danger">
            Logout
          </button>
        </div>
      </>
    );
  }

  return <nav className="navbar">{user ? privateNav() : publicNav()} </nav>;
};

export default NavBarComponent;
