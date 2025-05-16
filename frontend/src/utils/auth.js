import { jwtDecode } from "jwt-decode";

export function isTokenExpired(token) {
  if (!token) return true; // If no token, consider it expired
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return (decoded.exp || currentTime) < currentTime; // Check if the token is expired
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log("[error] " + error.message);
    }
    return true;
  }
}

export const isAuthenticated = (token) => {
  return isTokenExpired(token) ? false : true;
};

export const getTokenTimeLeft = (token) => {
  if (!token) return 0; // If no token, consider it expired
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return (decoded.exp || currentTime) - currentTime; // Check if the token is expired
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log("[error] " + error.message);
    }
    return 0;
  }
};

export const isAllowed = (token, role) => {
  try {
    const user = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    const isExpired = (user.exp || currentTime) < currentTime;
    if (isExpired) {
      return false;
    } else {
      if (role instanceof Array) {
        console.log("user is authenticated and authorized");
        return role.includes(user.role);
      } else {
        console.log("user is authenticated and authorized");
        return user.role == role;
      }
    }
  } catch {
    return false;
  }
};

export const getUserFromStorage = (token) => {
  if (!token) return null; //consider the user is not authenticated or expired
  try {
    const decoded = jwtDecode(token);
    console.log(decoded);
    return { id: decoded.id };
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const resetGlobalCatche = () => {
  /**
   * reset the server api catche
   */

  console.log("reset api is called");
};
