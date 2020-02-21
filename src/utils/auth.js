import { useContext } from "react";
import { ContextState } from "../context";
import axios from "axios";

const authUtils = () => {
	const {
		handleUserLogin,
		handleUserSignup,
		handleUserLogout,
		handleError,
		checkAuth
	} = useContext(ContextState);

	const saveToken = token => {
		localStorage.setItem("token", token);
	};

	const getToken = () => localStorage.getItem("token");

	const headers = () => {
		const token = getToken();
		return { token: token };
	};

	const checkAuthState = () => {
		const token = getToken();
		if (!token) {
			checkAuth({ auth: false, loading: false });
		} else {
			axios({
				method: "post",
				url: "/api/user/token",
				headers: headers()
			})
				.then(response => {
					const { status, data } = response;
					if (status === 200 && data.user) {
						checkAuth({ auth: true, user: data.user, loading: false });
					} else {
						checkAuth({ auth: false, loading: false });
					}
				})
				.catch(error => {
					checkAuth({ auth: false, loading: false });
				});
		}
	};

	const userLogin = user => {
		axios({
			method: "get",
			url: "/api/user",
			params: user
		})
			.then(response => {
				const { status, data } = response;
				if (status === 200) {
					saveToken(data.token);
					handleUserLogin(data.user);
				} else {
					handleError(data.message);
				}
			})
			.catch(error => {
				handleError("Request Error, Please try it later!");
			});
	};

	const userSignup = user => {
		axios({
			method: "post",
			url: "/api/user",
			data: user
		})
			.then(response => {
				const { status, data } = response;
				if (status === 200) {
					saveToken(data.token);
					handleUserSignup(data.user);
				} else {
					handleError(data.message);
				}
			})
			.catch(error => {
				handleError("Request Error, Please try it later!");
			});
	};

	const userLogout = () => {
		localStorage.removeItem("token");
		handleUserLogout();
	};

	return {
		userLogin,
		userSignup,
		checkAuthState,
		userLogout
	};
};

export default authUtils;
