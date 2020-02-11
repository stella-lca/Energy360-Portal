import React, { useContext, useEffect } from "react";
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  Form,
  Input,
  FormGroup
} from "reactstrap";
import { ContextState } from "../context";
import authUtils from "../utils/auth";

const Login = () => {
  const {
    authState,
    profileState,
    handleUserLogin,
    handleUserLogout,
    handleSignup
  } = useContext(ContextState);
  const { userLogin } = authUtils();

  // console.log(userLogin)

  const onSigninSubmit = e => {
    const formData = new FormData(e.target);
    const user = {};

    e.preventDefault();
    for (let entry of formData.entries()) {
      user[entry[0]] = entry[1];
    }
    userLogin(user);
  };

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
              <label>Email Address</label>
              <Input placeholder="Email" type="text" name="email" />
              <label>Password</label>
              <Input placeholder="Password" type="password" name="password" />
              <FormGroup className="button-group">
                <Button
                  type="submit"
                  block
                  className="btn-round"
                  color="danger"
                >
                  Login
                </Button>
                <Button
                  href="/register"
                  block
                  className="btn-round"
                  color="danger"
                >
                  Go to Sign up
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

export default Login;
