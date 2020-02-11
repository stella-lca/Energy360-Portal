import React from "react";
import { render } from "react-dom";
import { ContextProvider } from "./context";
import Routes from "./routes";

const App = () => (
  <ContextProvider>
    <Routes />
  </ContextProvider>
);

App()
render(<App />, document.getElementById("root"));