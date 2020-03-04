import React from "react";
import { Container } from "reactstrap";
import HeaderImg from "../assets/img/header-bg.jpg";

const Header = ({ title }) => (
  <div
    className="content-header"
    style={{ backgroundImage: `url(/${HeaderImg})` }}
  >
    <Container>
      <h1>
        <span>{title}</span>
      </h1>
    </Container>
  </div>
);

export default Header;
