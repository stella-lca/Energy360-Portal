import React from "react";
import { render } from "react-dom";
import { ContextProvider } from "./context";
import Routes from "./routes";

const App = () => (
  <ContextProvider>
    <Routes />
  </ContextProvider>
);

render(<App />, document.getElementById("root"));
