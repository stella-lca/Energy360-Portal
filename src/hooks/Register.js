import React, { useContext, useState } from "react";
import { Redirect } from "react-router-dom";
import {
  Container,
  Input,
  Label,
  Button,
  FormGroup,
  Row,
  Col,
  Card,
  Alert,
  FormText
} from "reactstrap";
import { Form } from "tabler-react";
import { ContextState } from "../context";
import authUtils from "../utils/auth";
import { isEmpty } from "lodash";
import CheckIcon from "../components/CheckIcon";

const Register = () => {
  const { userSignup } = authUtils();
  const { authState, errorState } = useContext(ContextState);
  const [errors, setError] = useState({});

  const errorMsg = type => {
    const msg = errors[type];
    if (!msg) return;
    if (type === "password") {
      return { invalid: true, errorType: msg.type };
    }
    return { invalid: true, feedback: msg };
  };

  const formValidate = values => {
    let errorFields = {};
    const emailRegex = /[^]+@[^]+[.][a-z]/;
    let passwordType = [];

    if (!values.password) {
      errorFields.password = { msg: "Required", type: ["length"] };
    } else {
      if (values.password.length < 6) passwordType.push("length");
      if (!/[A-Z]/.test(values.password)) passwordType.push("uppercase");
      if (!/[a-z]/.test(values.password)) passwordType.push("lowercase");
      if (!/[0-9]/.test(values.password)) passwordType.push("number");
      if (values.firstName && values.password.includes(values.firstName))
        passwordType.push("name");

      if (passwordType.length) {
        errorFields.password = { msg: "Password rules not met", type: passwordType };
      }
    }

    if (values.password !== values.confirmpassword) {
      errorFields.confirmpassword = "Passwords must match";
    }

    if (!values.email) errorFields.email = "Required";
    else if (!emailRegex.test(values.email))
      errorFields.email = "Invalid email address";

    ["firstName", "lastName", "streetAddress1", "city"].forEach(f => {
      if (!values[f]) errorFields[f] = "Required";
    });

    if (!values.zipCode || values.zipCode.replace(/_/g, "").length < 5)
      errorFields.zipCode = "Invalid Zip Code";

    if (!values.phone || values.phone.replace(/\D/g, "").length < 11)
      errorFields.phone = "Invalid phone number";

    return errorFields;
  };

  const onSignupSubmit = e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = {};
    for (let [k, v] of formData.entries()) user[k] = v;

    const errorMsgs = formValidate(user);
    if (isEmpty(errorMsgs)) {
      setError({});
      userSignup(user);
    } else {
      setError(errorMsgs);
    }
  };

  if (authState) return <Redirect to="/home" />;

  return (
    <Container>
      <Row>
        <Col className="middle-container ml-auto mr-auto" lg="6">
          <Card className="card-signup register ml-auto mr-auto my-auto">

            <div className="title mx-auto">
              <h2>User Registration</h2>
            </div>

            <Form className="register-formd" onSubmit={onSignupSubmit}>
              {errorState && <Alert color="danger">{errorState}</Alert>}

              {/* form fields unchanged */}

              <Form.Group className="button-group">
                <Button
                  type="submit"
                  block
                  className="btn-round"
                  color="info"
                >
                  Register
                </Button>
                <Button href="/" block className="btn-round" color="info">
                  Go to Login
                </Button>
              </Form.Group>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
