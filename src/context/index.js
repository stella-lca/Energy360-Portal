import React, { useReducer } from "react";
import * as ACTIONS from "../store/actions/actions";
import * as AuthReducer from "../store/reducers/auth_reducer";

const ContextState = React.createContext([{}, () => {}]);

const ContextProvider = props => {
  const [stateAuthReducer, dispatchAuthReducer] = useReducer(
    AuthReducer.AuthReducer,
    AuthReducer.initialState
  );

  const handleLogin = () => {
    dispatchAuthReducer(ACTIONS.login_success());
  };

  const handleLogout = () => {
    dispatchAuthReducer(ACTIONS.login_failure());
  };

  const handleSignup = profile => {
    dispatchAuthReducer(ACTIONS.signup_success(profile));
  };

  return (
    <ContextState.Provider
      value={{
        authState: stateAuthReducer.is_authenticated,
        profileState: stateAuthReducer.profile,
        handleUserLogin: () => handleLogin(),
        handleUserLogout: () => handleLogout(),
        handleSignup: profile => handleSignup(profile)
      }}
    >
      {props.children}
    </ContextState.Provider>
  );
};

export { ContextProvider, ContextState };
