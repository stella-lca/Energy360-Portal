import React, { useContext, useEffect, useMemo } from "react";
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
import Callback from "./hooks/Callback";
import authUtils from "./utils/auth";

import "./assets/css/bootstrap.min.css";
import "./assets/scss/paper-kit.scss";
import "./assets/css/demo.css";

const history = createBrowserHistory(); 

const MainLayout = ({ className, children }) => (
  <>
    <Menu className={className} />
    {children}
  </>
);

const SingleLayout = (props) => <>{props.children}</>;

const routes = [
  { path: "/home", component: Home, layout: MainLayout },
  { path: "/policy", component: Policy, layout: MainLayout },
  { path: "/terms-of-service", component: Terms, layout: MainLayout },
  { path: "/scope-selection", component: Scope, layout: MainLayout },
  { path: "/register", component: Register, layout: SingleLayout, exact: true },
  // "/" MUST ALWAYS BE LAST
  { path: "/", component: Login, layout: SingleLayout, exact: true },
  { path: "/profile", component: Profile, layout: MainLayout },
  { path: "/forgot-password", component: ForgotPassword, layout: SingleLayout },
  { path: "/reset-password", component: ResetPassword, layout: SingleLayout },
  { path: "/contactus", component: ContactUS, layout: MainLayout },
  { path: "/callback", component: Callback, layout: SingleLayout }
];


const AppRoute = ({
  component: Component,
  layout: Layout,
  authenticate,
  private: isPrivate,
  container,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      isPrivate && !authenticate ? (
        <Redirect to={{ pathname: "/" }} />
      ) : (
        <Layout className={container}>
          <Component {...props} />
        </Layout>
      )
    }
  />
);

const Routes = () => {
  const { authState } = useContext(ContextState);
  const { checkAuthState } = authUtils();

  // ✅ run auth check AFTER render
  useEffect(() => {
    checkAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // optional: memoize the route list rendering
  const routeList = useMemo(
    () =>
      routes.map((route, i) => (
        <AppRoute key={i} {...route} authenticate={authState} />
      )),
    [authState]
  );

  return (
    <Router history={history}>
      <Switch>{routeList}</Switch>
    </Router>
  );
};

export default Routes;
