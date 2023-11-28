import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {User, UserState} from "../types";

import UserService from "../services/user.service";

const service = new UserService();

interface UserAction {
  type: "LOGIN" | "LOGOUT";
  payload?: {username: string; password: string};
}
interface InitializeAction {
  type: "INITIALIZE";
  payload: UserState;
}

type actions = UserAction | InitializeAction;
const UserContext = createContext<
  {state: UserState; dispatch: React.Dispatch<UserAction>} | undefined
>(undefined);

function userReducer(state: UserState, action: actions): UserState {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...action.payload,
        login: true,
      };
    case "LOGOUT":
      return {
        ...state,
        login: false,
        user: {} as User,
        access_token: undefined,
      };
    default:
      return state;
  }
}

function UserProvider({children}: {children: ReactNode}) {
  const initialState: UserState = {
    login: false,
    user: undefined,
  };

  const [state, baseDispatch] = useReducer(userReducer, initialState);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await service.getUser();
        if (user) {
          baseDispatch({type: "INITIALIZE", payload: user});
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, []);

  const serviceDispatch = async (action: actions) => {
    switch (action.type) {
      case "LOGIN":
        if (action.payload) {
          console.log("From service dispatch");
          try {
            const res = await service.login(
              action.payload.username,
              action.payload.password
            );
            console.log(res);
            baseDispatch({type: "INITIALIZE", payload: res});
          } catch (err) {
            console.log(err);
          }
        }
        break;
      case "LOGOUT":
        // service.logout();
        baseDispatch(action);
        break;

      default:
        baseDispatch(action);
    }
  };

  return (
    <UserContext.Provider value={{state, dispatch: serviceDispatch}}>
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;

export function useUserState() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context.state;
}
export function useUserDispatch() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context.dispatch;
}
