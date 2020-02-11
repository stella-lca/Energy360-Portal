import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  Form,
  Input,
  Label,
  FormGroup,
  FormText
} from "reactstrap";
import { ContextState } from "../context";
import authUtils from "../utils/auth";
const Register = () => {
  const { userSignup } = authUtils();
  const { authState } = useContext(ContextState);

  const onSignupSubmit = e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = {};

    for (let entry of formData.entries()) {
      user[entry[0]] = entry[1];
    }
    userSignup(user);
  };

  if (authState) return <Redirect to="/" />;
  return (
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

            <Form className="register-formd" onSubmit={onSignupSubmit}>
              <Row md="12">
                <Col md="6">
                  <label>First Name</label>
                  <Input
                    placeholder="First Name"
                    name="firstName"
                    type="text"
                  />
                </Col>
                <Col md="6">
                  <label>Last Name</label>
                  <Input placeholder="Last Name" name="lastName" type="text" />
                </Col>
                <Col md="12">
                  <label>Street Address 1</label>
                  <Input
                    placeholder="Street Address 1"
                    name="streetAddress1"
                    type="text"
                  />
                </Col>
                <Col md="12">
                  <label>House or Suite #</label>
                  <Input
                    placeholder="House or Suite #"
                    name="streetAddress2"
                    type="text"
                  />
                </Col>
                <Col md="6">
                  <label>City</label>
                  <Input placeholder="City" name="city" type="text" />
                </Col>
                <Col md="6">
                  <label>Zip Code</label>
                  <Input
                    placeholder="Zip Code"
                    type="number"
                    mask={[/\d/, /\d/, /\d/, /\d/, /\d/]}
                    name="zipCode"
                  />
                  <FormText color="muted">(Format: 00000)</FormText>
                </Col>
                <Col md="12">
                  <label>Select State</label>
                  <Input type="select" name="state" id="stateSelect">
                    <option>New York</option>
                    <option>Log Angeles</option>
                  </Input>
                </Col>
                <Col md="12">
                  <label>Select Country</label>
                  <Input type="select" name="country" id="stateCountry">
                    <option>United States</option>
                    <option>United Kingdom</option>
                  </Input>
                </Col>
                <Col md="12">
                  <label>Email address</label>
                  <Input
                    placeholder="Email address"
                    name="email"
                    type="email"
                  />
                </Col>
                <Col md="12">
                  <label>Phone</label>
                  <Input placeholder="Phone" name="phone" type="phone" />
                  <FormText color="muted">(Format: 000-000-0000)</FormText>
                </Col>
                <Col md="12">
                  <label>Password (Min. 6 characters)</label>
                  <Input
                    placeholder="Password"
                    name="password"
                    type="password"
                  />
                </Col>
                <Col md="12" className="utility-block">
                  <label className="col-form-label">
                    Select Your Utility Company
                  </label>
                  <FormGroup check>
                    <Label check>
                      <Input type="radio" name="accountTypeDetail" /> CECONY
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input type="radio" name="accountTypeDetail" /> ORU
                    </Label>
                  </FormGroup>
                </Col>
                <Col md="6"></Col>
              </Row>
              <FormGroup className="button-group">
                <Button block className="btn-round" color="danger">
                  Register
                </Button>
                <Button
                  href="/login"
                  block
                  className="btn-round"
                  color="danger"
                >
                  Go to Login
                </Button>
              </FormGroup>
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
};

export default Register;
