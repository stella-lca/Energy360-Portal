import React from "react";
import { Container, Button, Row, Col, Card, Form, Input, FormGroup } from "reactstrap";


const Login = props => (
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
          
          <Form className="register-form">
            <label>Email Address</label>
            <Input placeholder="Email" type="text" />
            <label>Password</label>
            <Input placeholder="Password" type="password" />
            <FormGroup className="button-group">
              <Button block className="btn-round" color="danger">
                Login
              </Button>
              <Button href="/register" block className="btn-round" color="danger">
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

export default Login;
