import axios, { TOKEN_KEY } from "./api.service"
import { getChromeLocalStorage, setChromeLocalStorage } from "./localStorage";
import { UserState, User, Unit, Role, Faculty } from "../types";
const USER_KEY = "user";



export async function login(username: string, password: string) {
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

export async function verifyToken(token: string) {
    const response = await axios.get("/api/login/verifyToken") as User;
    console.log(response)
}

export async function getUser() {
    // const currentUser = await getChromeLocalStorage(USER_KEY) as UserState
    // setChromeLocalStorage({ key: TOKEN_KEY, value: currentUser.access_token })
    const token = await getChromeLocalStorage(TOKEN_KEY);

    // const response = await axios.get("/api/login/verifyToken")
    // const user = response.data as User
    const user = await getChromeLocalStorage(USER_KEY) as User

    return { user: user, access_token: token } as UserState
}

export async function getUserUnitHighlights() {
    const response = await axios.get("/api/user/student/highlights")
    const units = response.data as Unit[]
    return units
}

export async function logout() {
    await setChromeLocalStorage({ key: TOKEN_KEY, value: null });
    await setChromeLocalStorage({ key: USER_KEY, value: null });
}

// export async function register(user: User) {
//     const response = await axios.post("api/user/signup", user, { withCredentials: true, headers: { 'Content-Type': 'application/json', "Authorization": 'Bearer ' + localStorage.getItem('token') }, });
//     return response
// }

export async function register(email: string, displayName: string) {
    const nameParts: string[] = displayName.split(" ");

    let firstName: string = "",
      lastName: string = "";

    if (nameParts.length >= 2) {
      firstName = nameParts.slice(0, -1).join(" "); // Join all parts except the last one
      lastName = nameParts[nameParts.length - 1]; // Get the last part as the last name
    } else {
      // If there are not enough parts, assume the entire name is the first name
      firstName = displayName;
      lastName = "";
    }

    const authcate = email.split("@")[0];

    const user: User = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      authcate: authcate,
      monashObjectId: null,
      role: "Student" as Role,
      faculty: "Information Technology" as Faculty,
    };

    if (await checkUserExists(email)) {
      console.log("User already exists");
      setChromeLocalStorage({ key: USER_KEY, value: user });

    } else {
        const response = await axios.post("api/user/create", user, {
            headers: {
              "Content-Type": "application/json",
            },
          });
      
          console.log("Registration successful", response.data);

          setChromeLocalStorage({ key: USER_KEY, value: response.data });
    }    
  }

  export async function checkUserExists(email: string) {
    const response = await axios.get(`api/user/${email}`);
    if (response.data != null) {
      return true;
    } else {
      return false;
    }
  }
