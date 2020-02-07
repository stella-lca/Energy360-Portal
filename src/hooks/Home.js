import React from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import BkImg from "../assets/img/antoine-barres.jpg";
import CloudImg from "../assets/img/clouds.png";


const Home = props => (
  <div className="page-header section-dark home-layout" style={{backgroundImage: `url(${BkImg})`}} >
    <div className="filter" />
    <div className="content-center">
      <Container>
        <div className="title-brand">
          <h1 className="presentation-title">Welcome to GreenConnect API</h1>
          <div className="home-control-pan">
            <Link to="/utility/callback" className="btn btn-outline-neutral">
              Go to My Utility Provider
            </Link>
            <Link to="/hookscontainer" className="btn btn-outline-neutral">
              Go to Scope Selection
            </Link>
          </div>
        </div>
      </Container>
    </div>
    <div className="moving-clouds" style={{backgroundImage: `url(${CloudImg})`}} />
  </div>
);

export default Home;
