import React, { useContext, useEffect } from "react";
import { Router, Route, Switch, Redirect } from "react-router";
import history from "./utils/history";
import Context from "./utils/context";
import AuthCheck from "./utils/authcheck";
import importedComponent from "react-imported-component";
import Loading from "./hooks/Loading";
import Header from "./hooks/Header";

import HooksContainer1 from "./hooks/hook1";
import Callback from "./hooks/callback";
import HooksForm from "./hooks/hooks_form1";
import PrivateComponent from "./hooks/privatecomponent";
import Profile from "./hooks/profile";

import "./assets/css/bootstrap.min.css";
import "./assets/scss/paper-kit.scss";
import "./assets/css/demo.css";

const Home = importedComponent(() => import("./hooks/Home"), {
  LoadingComponent: Loading
});

const Login = importedComponent(() => import("./hooks/Login"), {
  LoadingComponent: Loading
});

const Register = importedComponent(() => import("./hooks/Register"), {
  LoadingComponent: Loading
});
const Policy = importedComponent(() => import("./hooks/Policy"), {
  LoadingComponent: Loading
});
const Terms = importedComponent(() => import("./hooks/Terms"), {
  LoadingComponent: Loading
});
const Scope = importedComponent(() => import("./hooks/Scope"), {
  LoadingComponent: Loading
});
const PasswordReset = importedComponent(() => import("./hooks/PasswordReset"), {
  LoadingComponent: Loading
});
           

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
  const context = useContext(Context);
  return (
    <div>
      <Router history={history}>
        <Switch>
          {routes.map((route, i) => (
            <AppRoute key={i} {...route} authenticate={context.authState} />
          ))}
        </Switch>
      </Router>
    </div>
  );
};

export default Routes;
