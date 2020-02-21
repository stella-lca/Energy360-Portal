import React, { useReducer } from "react";
import * as ACTIONS from "../store/actions";
import * as AuthReducer from "../store/reducers/authReducer";

const ContextState = React.createContext([{}, () => {}]);

const ContextProvider = props => {
	const [stateAuthReducer, dispatchAuthReducer] = useReducer(
		AuthReducer.AuthReducer,
		AuthReducer.initialState
	);

	const checkAuth = data => {
		dispatchAuthReducer(ACTIONS.check_authState(data));
	};

	const handleLogin = user => {
		dispatchAuthReducer(ACTIONS.login_success(user));
	};

	const handleLogout = () => {
		dispatchAuthReducer(ACTIONS.login_failure());
	};

	const handleSignup = user => {
		dispatchAuthReducer(ACTIONS.signup_success(user));
	};

	const handleError = error => {
		dispatchAuthReducer(ACTIONS.request_error(error));
	};

	const {
		is_authenticated: authState,
		profile: profileState,
		error: errorState
	} = stateAuthReducer;

	return (
		<ContextState.Provider
			value={{
				authState,
				profileState,
				errorState,
				handleUserLogin: user => handleLogin(user),
				handleUserLogout: () => handleLogout(),
				handleUserSignup: user => handleSignup(user),
				handleError: error => handleError(error),
				checkAuth: data => checkAuth(data)
			}}
		>
			{props.children}
		</ContextState.Provider>
	);
};

export { ContextProvider, ContextState };
