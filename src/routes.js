import React, { useContext, useMemo } from "react";
import { Router, Route, Switch, Redirect } from "react-router";
import { createBrowserHistory } from "history";
import { ContextState } from "./context";
import Menu from "./components/Menu";
import Home from "./hooks/Home";
import Login from "./hooks/Login";
import Register from "./hooks/Register";
import Profile from "./hooks/Profile";
import Policy from "./hooks/Policy";
import Terms from "./hooks/Terms";
import Scope from "./hooks/Scope";
import ForgotPassword from "./hooks/ForgotPassword";
import ResetPassword from "./hooks/ResetPassword";
import ContactUS from "./hooks/ContactUS";
import authUtils from "./utils/auth";

import "./assets/css/bootstrap.min.css";
import "./assets/scss/paper-kit.scss";
import "./assets/css/demo.css";

const MainLayout = ({ className, children }) => {
	return (
		<>
			<Menu className={className} />
			{children}
		</>
	);
};

const SingleLayout = props => {
	return <>{props.children}</>;
};

const routes = [
	{
		path: "/home",
		component: Home,
		className: "home-component",
		container: "home-layout",
		layout: MainLayout,
		exact: false
	},
	{
		path: "/policy",
		component: Policy,
		className: "policy-component",
		container: "single-layout",
		layout: MainLayout,
		exact: false
	},
	{
		path: "/terms-of-service",
		component: Terms,
		className: "terms-component",
		container: "single-layout",
		layout: MainLayout,
		exact: false
	},
	{
		path: "/scope-selection",
		component: Scope,
		className: "scope-component",
		container: "single-layout",
		layout: MainLayout,
		exact: false
	},
	{
		path: "/",
		component: Login,
		className: "login-component",
		layout: SingleLayout,
		exact: true
	},
	{
		path: "/register",
		component: Register,
		className: "login-component",
		layout: SingleLayout,
		exact: false
	},
	{
		path: "/profile",
		component: Profile,
		className: "profile-component",
		container: "single-layout",
		layout: MainLayout,
		exact: false
	},
	{
		path: "/forgot-password",
		component: ForgotPassword,
		className: "forgotpassword-component",
		layout: SingleLayout,
		exact: false
	},
	{
		path: "/reset-password",
		component: ResetPassword,
		className: "resetpassword-component",
		layout: SingleLayout,
		exact: false
	},
	{
		path: "/contactus",
		component: ContactUS,
		className: "contactus-component",
		container: "single-layout",
		layout: MainLayout,
		exact: false
	}
];

const AppRoute = ({
	component: Component,
	layout: Layout,
	authenticate,
	private: AuthType,
	container,
	...rest
}) => {
	console.log(rest);
	return (
		<Route
			{...rest}
			render={props =>
				AuthType && !authenticate ? (
					<Redirect to={{ pathname: "/" }} />
				) : (
					<Layout className={container}>
						<Component {...props} />
					</Layout>
				)
			}
		/>
	);
};

const Routes = () => {
	const history = createBrowserHistory();
	const { authState } = useContext(ContextState);
	const { checkAuthState } = authUtils();

	return useMemo(() => {
		checkAuthState();
		return (
			<div>
				<Router history={history}>
					<Switch>
						{routes.map((route, i) => (
							<AppRoute key={i} {...route} authenticate={authState} />
						))}
					</Switch>
				</Router>
			</div>
		);
	}, []);
};

export default Routes;
