import React, { useReducer } from "react";
import * as ACTIONS from "../store/actions";
import * as AuthReducer from "../store/reducers/authReducer";

const ContextState = React.createContext([{}, () => {}]);

const ContextProvider = props => {
  const [stateAuthReducer, dispatchAuthReducer] = useReducer(
    AuthReducer.AuthReducer,
    AuthReducer.initialState
  );

  const handleLogin = user => {
    dispatchAuthReducer(ACTIONS.login_success(user));
  };

  const handleLogout = () => {
    dispatchAuthReducer(ACTIONS.login_failure());
  };

  const handleSignup = user => {
    dispatchAuthReducer(ACTIONS.signup_success(user));
  };

  return (
    <ContextState.Provider
      value={{
        authState: stateAuthReducer.is_authenticated,
        profileState: stateAuthReducer.profile,
        handleUserLogin: user => handleLogin(user),
        handleUserLogout: () => handleLogout(),
        handleUserSignup: user => handleSignup(user)
      }}
    >
      {props.children}
    </ContextState.Provider>
  );
};

export { ContextProvider, ContextState };
