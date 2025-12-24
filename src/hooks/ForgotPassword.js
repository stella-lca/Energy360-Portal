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

  const isSuccess = message?.status === true;

  return (
    <Container>
      <Row className="justify-content-center">
        <Col className="middle-container ml-auto mr-auto" lg="6">
          <Card className="card-signup reset-password ml-auto mr-auto my-auto p-4">
            {isloading ? (
              <div className="loading-image text-center py-5">
                <img src={Loading} width="100" height="100" alt="loading" />
              </div>
            ) : (
              <>
                <div className="title mx-auto text-center mb-3">
                  <h2 className="mb-1">Forgot Password</h2>
                  <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                    We’ll email you a link to reset your password.
                  </p>
                </div>

                <Form className="reset-password-form" onSubmit={onSigninSubmit}>
                  {error && <Alert color="danger">{error}</Alert>}
                  {message?.status === false && (
                    <Alert color="danger">{message.msg}</Alert>
                  )}

                  {isSuccess ? (
                    <div className="text-center py-4">
                      {/* success icon */}
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(40, 167, 69, 0.12)",
                          marginBottom: 16
                        }}
                      >
                        <span style={{ fontSize: 34, lineHeight: 1 }}>✅</span>
                      </div>

                      <h4 className="mb-2">Email sent!</h4>
                      <p className="text-muted mb-3" style={{ maxWidth: 380, margin: "0 auto" }}>
                        Check your inbox for the reset link. If you don’t see it in a few minutes,
                        check your spam/promotions folder.
                      </p>

                      <div className="d-flex flex-column flex-sm-row justify-content-center mt-4">
                        <Button
                          color="guidance"
                          outline
                          className="btn-round btn-back-login"
                          onClick={() => (window.location.href = "/")}
                        >
                          Back to Login
                        </Button>

                        <Button
                          color="danger"
                          className="btn-round"
                          onClick={() => {
                            const emailValue = email.trim();
                            if (emailValue) forgotPassword(emailValue);
                          }}
                        >
                          Send Again
                        </Button>
                      </div>

                      <div className="mt-3" style={{ fontSize: 13 }}>
                        <span className="text-muted">Sent to: </span>
                        <span style={{ fontWeight: 600 }}>{email || "your email"}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mb-3">
                        Enter your email address and a password reset link will be sent.
                      </p>

                      <label>Email Address</label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />

                      <FormGroup className="button-group mt-3">
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
