import React, { useState, useContext } from "react";
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  Form,
  Input,
  FormGroup,
  Alert
} from "reactstrap";
import authUtils from "../utils/auth";
import { ContextState } from "../context";
import Loading from "../assets/img/loading_spinner.gif";

const ForgotPassword = () => {
  const { message = {}, isloading } = useContext(ContextState);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const { forgotPassword } = authUtils();

  const onSigninSubmit = (e) => {
    e.preventDefault();

    const emailValue = email.trim();

    if (!emailValue) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    forgotPassword(emailValue);
  };

  return (
    <Container>
      <Row>
        <Col className="middle-container ml-auto mr-auto" lg="6">
          <Card className="card-signup reset-password ml-auto mr-auto my-auto">
            {isloading ? (
              <div className="loading-image text-center">
                <img src={Loading} width="100" height="100" alt="loading" />
              </div>
            ) : (
              <>
                <div className="title mx-auto">
                  <h2>Forgot Password</h2>
                </div>

                <Form className="reset-password-form" onSubmit={onSigninSubmit}>
                  {error && <Alert color="danger">{error}</Alert>}
                  {message?.status === false && (
                    <Alert color="danger">{message.msg}</Alert>
                  )}

                  {message?.status === true ? (
                    <h4 className="text-center">
                      We already sent the reset email.
                      <br />
                      Please check your inbox.
                    </h4>
                  ) : (
                    <>
                      <p>
                        Enter your email address and a password reset link will be
                        sent.
                      </p>

                      <label>Email Address</label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />

                      <FormGroup className="button-group">
                        <Button
                          type="submit"
                          block
                          className="btn-round"
                          color="danger"
                          disabled={isloading}
                        >
                          Request Password Change
                        </Button>
                      </FormGroup>
                    </>
                  )}
                </Form>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
