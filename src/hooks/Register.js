import React, { useContext, useState } from "react";
import { Redirect } from "react-router-dom";
import { Container, Button, Row, Col, Card, Alert, FormText } from "reactstrap";
import { Form } from "tabler-react";
import { ContextState } from "../context";
import authUtils from "../utils/auth";
import { isEmpty } from "lodash";

const Register = () => {
  const { userSignup } = authUtils();
  const { authState, errorState } = useContext(ContextState);
  const [errors, setError] = useState({});

  const errorMsg = type => {
    const msg = errors[type];
    if (!isEmpty(msg))
      return {
        invalid: true,
        feedback: msg
      };
  };

  const formValidate = values => {
    let errorFields = {};
    const emailRegex = /[^]+@[^]+[.][a-z]/;

    if (!values.password) {
      errorFields.password = "Required";
    } else if (values.password.length < 6) {
      errorFields.password = "Required Min. 6 characters!";
    }
    if (!values.email) {
      errorFields.email = "Required";
    } else if (!emailRegex.test(values.email)) {
      errorFields.email = "Invalid email address!";
    }

    if (!values.firstName) errorFields.firstName = "Required";
    if (!values.lastName) errorFields.lastName = "Required";
    if (!values.streetAddress1) errorFields.streetAddress1 = "Required";
    if (!values.city) errorFields.city = "Required";
    if (!values.zipCode) errorFields.zipCode = "Required";
    if (!values.phone) errorFields.phone = "Required";

    return errorFields;
  };

  const onSignupSubmit = e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = {};

    for (let entry of formData.entries()) {
      user[entry[0]] = entry[1];
    }
    const errorMsgs = formValidate(user);
    if (isEmpty(errorMsgs)) {
      userSignup(user);
    } else {
      setError(errorMsgs);
    }
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
                {errorState ? (
                  <Col md="12">
                    <Alert color="danger">{errorState}</Alert>
                  </Col>
                ) : (
                  ""
                )}
                <Col md="6">
                  <Form.Group label="First Name">
                    <Form.Input
                      name="firstName"
                      type="text"
                      placeholder="First Name"
                      {...errorMsg("firstName")}
                    />
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group label="Last Name">
                    <Form.Input
                      name="lastName"
                      type="text"
                      placeholder="Last Name"
                      {...errorMsg("lastName")}
                    />
                  </Form.Group>
                </Col>
                <Col md="12">
                  <Form.Group label="Street Address 1">
                    <Form.Input
                      name="streetAddress1"
                      type="text"
                      placeholder="Street Address 1"
                      {...errorMsg("streetAddress1")}
                    />
                  </Form.Group>
                </Col>
                <Col md="12">
                  <Form.Group label="House or Suite #">
                    <Form.Input
                      name="streetAddress2"
                      type="text"
                      placeholder="House or Suite #"
                      {...errorMsg("streetAddress2")}
                    />
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group label="City">
                    <Form.Input
                      name="city"
                      type="text"
                      placeholder="City"
                      {...errorMsg("city")}
                    />
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group label="Zip Code">
                    <Form.MaskedInput
                      placeholder="91210"
                      mask={[/\d/, /\d/, /\d/, /\d/, /\d/]}
                      name="zipCode"
                      {...errorMsg("zipCode")}
                    />
                    <FormText color="muted">(Format: 00000)</FormText>
                  </Form.Group>
                </Col>
                <Col md="12">
                  <Form.Group label="Select State">
                    <Form.Select name="state">
                      <option>New York</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md="12">
                  <Form.Group label="Select Country">
                    <Form.Select name="country">
                      <option>United Kingdom</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md="12">
                  <Form.Group label="Email address">
                    <Form.Input
                      name="email"
                      type="text"
                      placeholder="Email address"
                      {...errorMsg("email")}
                    />
                  </Form.Group>
                </Col>
                <Col md="12">
                  <Form.Group label="Phone">
                    <Form.MaskedInput
                      placeholder="+1 (555) 495-3947"
                      name="phone"
                      type="text"
                      mask={[
                        "+",
                        "1",
                        " ",
                        "(",
                        /[1-9]/,
                        /\d/,
                        /\d/,
                        ")",
                        " ",
                        /\d/,
                        /\d/,
                        /\d/,
                        "-",
                        /\d/,
                        /\d/,
                        /\d/,
                        /\d/
                      ]}
                      {...errorMsg("phone")}
                    />
                  </Form.Group>
                </Col>
                <Col md="12">
                  <Form.Group label="Password (Min. 6 characters)">
                    <Form.Input
                      name="password"
                      type="password"
                      placeholder="Password..."
                      {...errorMsg("password")}
                    />
                  </Form.Group>
                </Col>
                <Col md="12" className="utility-block">
                  <Form.Group label="Select Your Utility Company">
                    <Form.Radio
                      label="CECONY"
                      name="accountTypeDetail"
                      value="CECONY"
                    />
                    <Form.Radio
                      label="ORU"
                      name="accountTypeDetail"
                      value="ORU"
                    />
                  </Form.Group>
                </Col>
                <Col md="6"></Col>
              </Row>

              <Form.Group className="button-group">
                <Button block className="btn-round" color="info">
                  Register
                </Button>
                <Button href="/login" block className="btn-round" color="info">
                  Go to Login
                </Button>
              </Form.Group>
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
