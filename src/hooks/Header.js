import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Context from "../utils/context";
import {
  Button,
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container
} from "reactstrap";
import classnames from "classnames";

const Header = () => {
  const [navbarColor, setNavbarColor] = React.useState("navbar-transparent");
  const [navbarCollapse, setNavbarCollapse] = React.useState(false);

  const toggleNavbarCollapse = () => {
    setNavbarCollapse(!navbarCollapse);
    document.documentElement.classList.toggle("nav-open");
  };

  React.useEffect(() => {
    const updateNavbarColor = () => {
      if (
        document.documentElement.scrollTop > 299 ||
        document.body.scrollTop > 299
      ) {
        setNavbarColor("");
      } else if (
        document.documentElement.scrollTop < 300 ||
        document.body.scrollTop < 300
      ) {
        setNavbarColor("navbar-transparent");
      }
    };

    window.addEventListener("scroll", updateNavbarColor);

    return function cleanup() {
      window.removeEventListener("scroll", updateNavbarColor);
    };
  });

  return (
    <Navbar className={classnames("fixed-top", navbarColor)} expand="lg">
      <Container>
        <NavbarBrand
          data-placement="bottom"
          href="/index"
          target="_blank"
          title="Coded by Creative Tim"
        >
          Paper Kit React
        </NavbarBrand>
        <Collapse
          className="justify-content-end"
          navbar
          isOpen={navbarCollapse}
        >
          <Nav navbar>
            <NavItem>
              <Link to="/" className="nav-link">
                Home
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/hookscontainer" className="nav-link">
                Scopes
              </Link>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
