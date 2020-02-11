import React, { useContext } from "react";
import { Router, Route, Switch, Redirect } from "react-router";
import { createBrowserHistory } from 'history'
import { ContextState } from "./context";
import Header from "./hooks/Header";
import Home from "./hooks/Home";
import Login from "./hooks/Login";
import Register from "./hooks/Register";
import Policy from "./hooks/Policy";
import Terms from "./hooks/Terms";
import Scope from "./hooks/Scope";
import PasswordReset from "./hooks/PasswordReset";

import "./assets/css/bootstrap.min.css";
import "./assets/scss/paper-kit.scss";
import "./assets/css/demo.css";

const MainLayout = props => {
  return (
    <>
      <Header />
      {props.children}
    </>
  );
};

const SingleLayout = props => {
  return <>{props.children}</>;
};

const routes = [
  {
    path: "/",
    component: Home,
    className: "home-component",
    layout: MainLayout,
    exact: true,
    private: false
  },
  {
    path: "/policy",
    component: Policy,
    className: "policy-component",
    layout: MainLayout,
    exact: false,
    private: false
  },
  {
    path: "/terms-of-service",
    component: Terms,
    className: "terms-component",
    layout: MainLayout,
    exact: false,
    private: false
  },
  {
    path: "/scope",
    component: Scope,
    className: "scope-component",
    layout: MainLayout,
    exact: false,
    private: false
  },
  {
    path: "/login",
    component: Login,
    className: "login-component",
    layout: SingleLayout,
    exact: false,
    private: false
  },
  {
    path: "/register",
    component: Register,
    className: "login-component",
    layout: SingleLayout,
    exact: false,
    private: false
  },
  {
    path: "/resetpass",
    component: PasswordReset,
    className: "resetpass-component",
    layout: SingleLayout,
    exact: false,
    private: false
  }
];

const AppRoute = ({
  component: Component,
  layout: Layout,
  authenticate = false,
  private: AuthType,
  ...rest
}) => (
  <Route
    {...rest}
    render={props =>
      AuthType && !authenticate ? (
        <Redirect to={{ pathname: "/" }} />
      ) : (
        <Layout>
          <Component {...props} />
        </Layout>
      )
    }
  />
);

const Routes = () => {
  const { authState } = useContext(ContextState);
  return (
    <div>
      <Router history={createBrowserHistory()}>
        <Switch>
          {routes.map((route, i) => (
            <AppRoute key={i} {...route} authenticate={authState} />
          ))}
        </Switch>
      </Router>
    </div>
  );
};

export default Routes;
