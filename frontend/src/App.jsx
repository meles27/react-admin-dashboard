import { Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";

import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/shared/ProtectedRoute";
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
        <Route
          path="/"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <OverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["admin", "staff"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
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
