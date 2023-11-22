import React, {createContext, useReducer, useContext, ReactNode} from "react";
import {User} from "../types";
import {mockUser} from "../services/user";

interface UserState {
  login: boolean;
  token?: string;
  user?: User;
}

interface UserAction {
  type: "LOGIN" | "LOGOUT";
  payload?: {username: string; password: string};
}

const UserContext = createContext<
  {state: UserState; dispatch: React.Dispatch<UserAction>} | undefined
>(undefined);

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "LOGIN":
      if (state.login === true) {
        return state;
      }
      console.log(state);
      return {
        ...state,
        login: true,
        user: mockUser,
      };
    case "LOGOUT":
      return {
        ...state,
        login: false,
        user: {} as User,
        token: undefined,
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

  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{state, dispatch}}>
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
