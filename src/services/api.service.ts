import axios from "axios";
import config from "../config.json";
import { getChromeLocalStorage } from "./localStorage";
export const TOKEN_KEY = "token";
function getToken() {
    return getChromeLocalStorage(TOKEN_KEY)
}
const commonAxios = axios.create({
    baseURL: config.backend,
});
commonAxios.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
}
);

export default commonAxios;

