import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AssetProvider } from "./context/asset/AssetProvider.jsx";
import { AuthProvider } from "./context/auth/AuthProvider.jsx";
import PortfolioProvider from "./context/portfolio/PortfolioProvider.jsx";
import UserProvider from "./context/user/UserProvider.jsx";
import "./index.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AssetProvider>
          <UserProvider>
            <PortfolioProvider>
              <App />
            </PortfolioProvider>
          </UserProvider>
        </AssetProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
