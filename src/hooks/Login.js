import React, { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { Container, Button, Row, Col, Card, Alert } from "reactstrap";
import { Form } from "tabler-react";
import { ContextState } from "../context";
import authUtils from "../utils/auth";
import { isEmpty } from "lodash";

const Login = () => {
  const { userLogin } = authUtils();
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
    }
    if (!values.email) {
      errorFields.email = "Required";
    } else if (!emailRegex.test(values.email)) {
      errorFields.email = "Invalid email address!";
    }
    return errorFields;
  };

  const onSigninSubmit = e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = {};

    for (let entry of formData.entries()) {
      user[entry[0]] = entry[1];
    }

    const errorMsgs = formValidate(user);
    if (isEmpty(errorMsgs)) {
      userLogin(user);
    } else {
      setError(errorMsgs);
    }
  };

  if (authState) return <Redirect to="/" />;
  else
    return (
      <Container>
        <Row>
          <Col className="middle-container ml-auto mr-auto" lg="6">
            <Card className="card-signup login ml-auto mr-auto my-auto">
              <div className="title mx-auto">
                <img
                  className="d-block mx-auto mb-4"
                  src="https://cutone.org/wp-content/themes/wp_lcassociates/img/GC-logo.PNG"
                  alt="logo"
                  className="d-block"
                />
              </div>

              <Form className="login-form" onSubmit={onSigninSubmit}>
                {errorState ? <Alert color="danger">{errorState}</Alert> : ""}
                <Form.Group label="Email">
                  <Form.Input
                    name="email"
                    type="text"
                    placeholder="Email address"
                    {...errorMsg("email")}
                  />
                </Form.Group>
                <Form.Group label="Password">
                  <Form.Input
                    name="password"
                    type="password"
                    placeholder="Password..."
                    {...errorMsg("password")}
                  />
                </Form.Group>
                <Form.Group className="button-group">
                  <Button
                    type="submit"
                    block
                    className="btn-round"
                    color="info"
                  >
                    Login
                  </Button>
                  <Button
                    href="/register"
                    block
                    className="btn-round"
                    color="info"
                  >
                    Go to Sign up
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

export default Login;
