import axios, { TOKEN_KEY } from "./api.service"
import { getChromeLocalStorage, setChromeLocalStorage } from "./localStorage";
import { UserState, User, Unit } from "../types";
const USER_KEY = "user";
class UserService {


    public async login(username: string, password: string) {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);
        const response = await axios.post("api/login/token", formData, {
            withCredentials: true, // Equivalent to 'credentials: "include"'
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const userData = response.data as UserState
        const access_token = userData.access_token;
        await setChromeLocalStorage({ key: TOKEN_KEY, value: access_token });
        await setChromeLocalStorage({ key: USER_KEY, value: userData });

        return userData

    }

    public async verifyToken(token: string) {
        const response = await axios.get("/api/login/verifyToken") as User;
        console.log(response)
    }

    public async getUser() {
        const currentUser = await getChromeLocalStorage(USER_KEY) as UserState
        setChromeLocalStorage({ key: TOKEN_KEY, value: currentUser.access_token })
        const token = await getChromeLocalStorage(TOKEN_KEY);

        const response = await axios.get("/api/login/verifyToken")
        const user = response.data as User

        return { user: user, access_token: token } as UserState
    }

    public async getUserUnitHighlights() {
        const response = await axios.get("/api/user/student/highlights")
        const units = response.data as Unit[]
        return units
    }

    public async logout() {
        await setChromeLocalStorage({ key: TOKEN_KEY, value: null });
        await setChromeLocalStorage({ key: USER_KEY, value: null });
    }
}
export default UserService;