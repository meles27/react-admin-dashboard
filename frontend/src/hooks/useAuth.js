import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { useLocalStorage } from "usehooks-ts";
import config from "../config";
import { analysisApi } from "../services/analysisApi";
import { authApi } from "../services/authApi";
import { productVariantApi } from "../services/productVariantApi";
import { saleApi } from "../services/saleApi";
import { userApi } from "../services/userApi";

const useAuth = () => {
  const [jwtToken, setJwtToken, clearJwtToken] = useLocalStorage(
    config.JWT_KEY_NAME,
    config.JWT_DEFAULT_VALUE
  );
  const dispatch = useDispatch();
  const decodeJwtToken = (token) => {
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("[error] " + error.message);
      }
      return null;
    }
  };

  const logout = async (callback) => {
    clearJwtToken();

    dispatch(analysisApi.util.resetApiState());
    dispatch(authApi.util.resetApiState());
    dispatch(productVariantApi.util.resetApiState());
    dispatch(saleApi.util.resetApiState());
    dispatch(userApi.util.resetApiState());
    if (callback) {
      const result = callback();
      return result instanceof Promise ? await result : result;
    }
    return true;
  };

  const isAccessExpired = () => {
    const decoded = decodeJwtToken(jwtToken.access);
    if (!decoded) return true;
    else {
      const currentTime = Date.now() / 1000; // Current time in seconds
      return (decoded.exp || currentTime) < currentTime; // Check if the token is expired
    }
  };

  const isRefreshExpired = () => {
    const decoded = decodeJwtToken(jwtToken.refresh);
    if (!decoded) return true;
    else {
      const currentTime = Date.now() / 1000; // Current time in seconds
      return (decoded.exp || currentTime) < currentTime; // Check if the token is expired
    }
  };

  const getAccessTimeLeft = () => {
    const decoded = decodeJwtToken(jwtToken.access);
    if (decoded) {
      const currentTime = Date.now() / 1000;
      return (decoded.exp || currentTime) - currentTime;
    } else {
      return 0;
    }
  };

  const getRefreshTimeLeft = () => {
    const decoded = decodeJwtToken(jwtToken.refresh);
    if (decoded) {
      const currentTime = Date.now() / 1000;
      return (decoded.exp || currentTime) - currentTime;
    } else {
      return 0;
    }
  };

  const getUser = () => {
    return decodeJwtToken(jwtToken.access);
  };

  const isAuthenticated = () => {
    return isAccessExpired() ? false : true;
  };

  const isAllowedTo = (role) => {
    const user = decodeJwtToken(jwtToken.access);
    if (user) {
      const currentTime = Date.now() / 1000; // Current time in seconds
      const isExpired = (user.exp || currentTime) < currentTime;
      if (isExpired) {
        return false;
      } else {
        if (role && role instanceof Array) {
          return role.includes(user.role);
        } else {
          return user.role == role;
        }
      }
    } else {
      return false;
    }
  };

  const isMyOwnItem = (owenerId) => {
    const user = decodeJwtToken(jwtToken.access);
    if (user) {
      return user.id == owenerId;
    } else {
      return false;
    }
  };

  return {
    jwtToken,
    setJwtToken,
    clearJwtToken,
    isAccessExpired,
    isRefreshExpired,
    isAuthenticated,
    getAccessTimeLeft,
    getRefreshTimeLeft,
    isAllowedTo,
    getUser,
    logout,
    isMyOwnItem,
  };
};

export default useAuth;
