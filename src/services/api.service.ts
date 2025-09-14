import axios from "axios";
import config from "../config.json";
import { getChromeLocalStorage, setChromeLocalStorage } from "./localStorage";
export const TOKEN_KEY = "token";

let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}
function getToken() {
  return getChromeLocalStorage(TOKEN_KEY);
}
const commonAxios = axios.create({
  baseURL: config.backend,
  headers: {},
});
commonAxios.get("/healthcheck").then((response) => {});
commonAxios.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

commonAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (logoutCallback) {
        logoutCallback();
      }
    }
    return Promise.reject(error);
  }
);

// const decodeJWT = (token: string) => {
//     try {
//         const base64Url = token.split('.')[1]; // Get the payload part of the token
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Replace URL-safe base64 encoding characters
//         const payload = decodeURIComponent(atob(base64).split('').map(function (c) {
//             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//         }).join(''));

//         const jwtPayload = JSON.parse(payload);
//         return jwtPayload
//     } catch (error) {
//         return null;
//     }
// };
// const isTokenExpired = async () => {
//     const token = await getToken() as string

//     const decoded = decodeJWT(token)
//     if (decoded) {
//         return decoded.exp < Date.now() / 1000
//     }
// }

// const refreshToken = async () => {
//     const response = await axios.get("/api/login/refreshToken") as { access_token: string }
//     const access_token = response.access_token
//     await setChromeLocalStorage({ key: TOKEN_KEY, value: access_token });
// }

// axios.interceptors.response.use(async (response) => {
//     const expired = await isTokenExpired();
//     if (expired) {
//         await refreshToken();
//     }
//     return response;
// });

export default commonAxios;
