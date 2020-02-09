import React from "react";
import { Container, Button, Row, Col, Card, Form, Input, FormGroup } from "reactstrap";


const Register = props => (
  <Container>
    <Row>
      <Col className="middle-container ml-auto mr-auto" lg="6">
        <Card className="card-signup register ml-auto mr-auto my-auto">
          <div className="title mx-auto">
            <img
              className="d-block mx-auto mb-4"
              src="https://cutone.org/wp-content/themes/wp_lcassociates/img/GC-logo.PNG"
              alt="logo"
              className="d-block"
            />
            <h2 className="mx-auto mb-4">User Registration</h2>
          </div>
          {/* <div className="social-line text-center">
            <Button
              className="btn-neutral btn-just-icon mr-1"
              color="facebook"
              href="#pablo"
              onClick={e => e.preventDefault()}
            >
              <i className="fa fa-facebook-square" />
            </Button>
            <Button
              className="btn-neutral btn-just-icon mr-1"
              color="google"
              href="#pablo"
              onClick={e => e.preventDefault()}
            >
              <i className="fa fa-google-plus" />
            </Button>
            <Button
              className="btn-neutral btn-just-icon"
              color="twitter"
              href="#pablo"
              onClick={e => e.preventDefault()}
            >
              <i className="fa fa-twitter" />
            </Button>
          </div> */}
          
          <Form className="register-formd">
            <Row md="12">
              <Col md='6'>
                <label>First Name</label>
                <Input placeholder="First Name" type="text" />
              </Col>
              <Col md='6'>
                  <label>Last Name</label>
                  <Input placeholder="First Name" type="text" />
              </Col>
              <Col md='12'>
                <label>Street Address 1</label>
                <Input placeholder="Street Address 1" type="text" />
              </Col>
              <Col md='12'>
                <label>House or Suite #</label>
                <Input placeholder="House or Suite #" type="text" />
              </Col>
              <Col md='6'>
                <label>City</label>
                <Input placeholder="Password" type="text" />
              </Col>
              <Col md='6'>
                <label>Zip Code</label>
                <Input placeholder="Password" type="text" />
              </Col>
              <Col md='12'>
                <label>Select State</label>
                <Input placeholder="Select State" type="text" />
              </Col>
              <Col md='12'>
                <label>Select Country</label>
                <Input placeholder="Select Country" type="text" />
              </Col>
              <Col md='12'>
                <label>Email address</label>
                <Input placeholder="Email address" type="email" />
              </Col>
              <Col md='12'>
                <label>Phone</label>
                <Input placeholder="Phone" type="phone" />
              </Col>
              <Col md='12'>
                <label>Password</label>
                <Input placeholder="Password" type="password" />
              </Col>
              <Col md='12'>
                <label>Select Your Utility Company</label>
                <Input placeholder="Email" type="text" />
              </Col>
              <Col md='6'></Col>
            </Row>
           
            <Button block className="btn-round" color="danger">
              Register
            </Button>
          </Form>
          <div className="forgot">
            <Button
              className="btn-link"
              color="danger"
              href="#pablo"
              onClick={e => e.preventDefault()}
            >
              Forgot password?
            </Button>
          </div>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default Register;
