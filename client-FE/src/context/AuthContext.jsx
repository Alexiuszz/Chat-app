import { createContext, useEffect, useReducer } from "react";

//Project auth initial state
//check for user in local storage or assign null
const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isFetching: false,
  error: false,
  setuser: () => {},
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, setState] = useReducer(
    (state, newData) => ({ ...state, ...newData }),
    INITIAL_STATE
  );

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        setUser: (user) => setState(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
