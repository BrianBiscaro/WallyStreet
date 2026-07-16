import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import FooterComponent from "./components/layout/FooterComponent";
import HeaderComponent from "./components/layout/HeaderComponent";
import { useAuth } from "./context/auth/useAuth";
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import RegistroPage from "./pages/auth/RegistroPage";
import MiPortfolio from "./pages/portfolio/MiPortfolio";
import MisOperaciones from "./pages/portfolio/MisOperaciones";
import Panel from "./pages/portfolio/Panel";
import StatPage from "./pages/stat/StatPage";
import EditarUsuario from "./pages/user/EditarUsuario";
import ManejoUsuarios from "./pages/user/ManejoUsuarios";

const App = () => {
  const [sesionExpirada, setSesionExpirada] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Escuchamos el evento que dispara axios
  useEffect(() => {
    const handleSesionExpirada = () => {
      setSesionExpirada(true);
    };

    window.addEventListener("sesion-expirada", handleSesionExpirada);

    return () => {
      window.removeEventListener("sesion-expirada", handleSesionExpirada);
    };
  }, []);

  const handleConfirmar = () => {
    // 1. Ocultamos el modal
    setSesionExpirada(false);

    // 2. Vamos al login para salir de la ruta protegida
    navigate("/login");

    // 3. Ejecutamos un logout limpio
    logout();
  };
  return (
    <div className="app">
      <HeaderComponent />
      <main className="main-content">

        {/* Cartel Modal de sesión expirada */}
        {sesionExpirada && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Sesión expirada</h2>
              <p>Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.</p>
              <button onClick={handleConfirmar}>Confirmar</button>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<StatPage />} />
          <Route path="/statpage" element={<StatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistroPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/panel" element={<Panel />} />
            <Route path="/usuario/editar" element={<EditarUsuario />} />
            <Route path="/manejo-usuarios" element={<ManejoUsuarios />} />
            <Route path="/portfolio" element={<MiPortfolio />} />
            <Route path="/operaciones" element={<MisOperaciones />} />
          </Route>
        </Routes>
      </main>
      <FooterComponent />
    </div>
  );
};

export default App;