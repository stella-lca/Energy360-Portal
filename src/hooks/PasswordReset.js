import React from "react";
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

const PasswordReset = props => (
  <Container>
    <Row>
      <Col className="middle-container ml-auto mr-auto" lg="6">
        <Card className="card-signup reset-password ml-auto mr-auto my-auto">
          <div className="title mx-auto">
            <h2>Reset Password</h2>
          </div>

          <Form className="reset-password-form">
            <p>Please enter your new password.</p>
            <label>Password</label>
            <Input placeholder="New Password" type="password" />
            <FormGroup className="button-group">
              <Button block className="btn-round" color="danger">
                Reset Password
              </Button>
            </FormGroup>
          </Form>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default PasswordReset;
