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
import Logo from "../assets/img/GC-logo.png" 

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
        document.documentElement.scrollTop > 99 ||
        document.body.scrollTop > 99
      ) {
        setNavbarColor("");
      } else if (
        document.documentElement.scrollTop < 100 ||
        document.body.scrollTop < 100
      ) {
        setNavbarColor("navbar-transparent");
      }
    };
    setNavbarCollapse(false)

    window.addEventListener("scroll", updateNavbarColor);

    return function cleanup() {
      window.removeEventListener("scroll", updateNavbarColor);
    };
  });


  return (
    <Navbar className={classnames("fixed-top", navbarColor)} expand="lg">
        <div className="navbar-translate">
          <NavbarBrand
            data-placement="bottom"
            href="/"
            title="Energy360"
          >
            <img
                className="d-block logo"
                src={Logo}
                alt="logo"
            />
          </NavbarBrand>
          <button
            aria-expanded={navbarCollapse}
            className={classnames("navbar-toggler navbar-toggler", {
              toggled: navbarCollapse
            })}
            onClick={toggleNavbarCollapse}
          >
            <span className="navbar-toggler-bar bar1" />
            <span className="navbar-toggler-bar bar2" />
            <span className="navbar-toggler-bar bar3" />
          </button>
        </div>
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
            {/* <NavItem>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
            </NavItem> */}
            <NavItem>
              <Link to="/scope" className="nav-link">
                Scopes
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/policy" className="nav-link">
                Policy
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/terms-of-service" className="nav-link">
                Terms Of Service
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/login" className="nav-link">
                Login/Register
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/logout" className="nav-link">
                Logout
              </Link>
            </NavItem>
          </Nav>
        </Collapse>
    </Navbar>
  );
};

export default Header;
