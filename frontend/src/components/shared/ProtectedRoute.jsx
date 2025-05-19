import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../config";
import useAuth from "../../hooks/useAuth";

const ProtectedRoute = ({ children, roles }) => {
  const location = useLocation();
  /**
   * jwt authentication and authorization
   */
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isAllowedTo(roles)) {
      console.log(roles, auth.getUser(), location);
      toast.error("sorry you don't have permission to access the page");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, location]);

  return (
    <>
      {auth.isAuthenticated() ? (
        auth.isAllowedTo(roles) ? (
          children ? (
            children
          ) : (
            <Outlet key="protected-route-key" />
          )
        ) : (
          <Navigate to={"/"} />
        )
      ) : (
        // save the location and redirect to login page and pass the location as state to redirect
        <Navigate
          // the query part is just for the to be show in the url space
          to={`${config.FRONTEND_PATHS.LOGOUT_REDIRECT}?from=${
            location.pathname + location.search + location.hash || ""
          }`}
          replace
          state={{
            from: location.pathname + location.search + location.hash || "",
          }}
        />
      )}
    </>
  );
};

export default ProtectedRoute;
