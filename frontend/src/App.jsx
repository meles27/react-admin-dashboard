import { Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";

import { ToastContainer } from "react-toastify";
import config from "./config";
import { useJwtTokenRefresh } from "./hooks/useJwtTokenRefresh";
import LoginPage from "./pages/LoginPage";
import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import SalesPage from "./pages/SalesPage";
import UsersPage from "./pages/UsersPage";

const App = () => {
  const location = useLocation();
  useJwtTokenRefresh();
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>
      {location.pathname !== "/auth/login" && <Sidebar />}

      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth/login" element={<LoginPage />} />
      </Routes>

      <ToastContainer
        key="something-id"
        position="top-right"
        autoClose={config.TOAST_DEFAULT_TIMEOUT}
        hideProgressBar
        rtl={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="!z-[100000]"
      />
    </div>
  );
};

export default App;
