import React from "react";
import { Container, Button, Row, Col, Card, Form, Input } from "reactstrap";

const PasswordReset = props => (
  <Container>
    <Row>
      <Col className="middle-container ml-auto mr-auto" lg="6">
        <Card className="card-signup login ml-auto mr-auto my-auto">
          <div className="title mx-auto">
            <h2>Forgot Password</h2>
          </div>

          <Form className="register-form">
            <p>
              Enter your email address and your password will be reset and emailed to you.
            </p>

            <label>Email Address</label>
            <Input placeholder="Email" type="text" />

            <Button block className="btn-round" color="danger">
              Request Password Changes
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default PasswordReset;
