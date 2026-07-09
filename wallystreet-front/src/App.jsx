import { Route, Routes } from "react-router-dom";

import "./App.css";
import FooterComponent from "./components/layout/FooterComponent";
import HeaderComponent from "./components/layout/HeaderComponent";
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
  return (
    <div className="app">
      <HeaderComponent />
      <main className="main-content">
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
