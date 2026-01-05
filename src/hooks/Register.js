import React, { useContext, useState, useEffect } from "react";
import { Redirect, Link } from "react-router-dom";
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
  const { authState, errorState, clearError } = useContext(ContextState);

  // Form-level validation errors
  const [errors, setError] = useState({});

  // Context needed ONLY for password validation rules
  const [pwContext, setPwContext] = useState({
    firstName: "",
    password: "",
    confirmpassword: ""
  });

  // Clear stale errors (e.g. from Login) when page loads
  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errorMsg = (type) => {
    const msg = errors[type];
    if (!msg) return;

    if (type === "password") {
      return { invalid: true, errorType: msg.type };
    }

    return { invalid: true, feedback: msg };
  };

  const formValidate = (values) => {
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
        errorFields.password = {
          msg: "Password rules not met",
          type: passwordType
        };
      }
    }

    if (values.password !== values.confirmpassword) {
      errorFields.confirmpassword = "Passwords must match";
    }

    if (!values.email) errorFields.email = "Required";
    else if (!emailRegex.test(values.email))
      errorFields.email = "Invalid email address";

    ["firstName", "lastName", "streetAddress1", "city"].forEach((f) => {
      if (!values[f]) errorFields[f] = "Required";
    });

    if (!values.zipCode || values.zipCode.replace(/_/g, "").length < 5)
      errorFields.zipCode = "Invalid Zip Code";

    if (!values.phone || values.phone.replace(/\D/g, "").length < 11)
      errorFields.phone = "Invalid phone number";

    return errorFields;
  };

  // 🔐 Password-only live validation
  const validatePW = (nextValues) => {
    const v = formValidate(nextValues);

    setError((prev) => ({
      ...prev,
      password: v.password,
      confirmpassword: v.confirmpassword
    }));
  };

  const onSignupSubmit = (e) => {
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

  // Cache password error state for rule indicators
  const pw = errorMsg("password");
  const pwTypes = pw?.errorType || [];


  return (
    <Container>
      <Row>
        <Col className="middle-container ml-auto mr-auto" lg="6">
          <Card className="card-signup register ml-auto mr-auto my-auto">

            <div className="title mx-auto">
              <h2>User Registration</h2>
            </div>

            <Form className="register-form" onSubmit={onSignupSubmit} >
              {errorState && <Alert color="danger">{errorState}</Alert>}

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
											<option>United States</option>
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
										<br />
										<Form.Input
											name="confirmpassword"
											type="password"
											placeholder="Confirm Password..."
											{...errorMsg("confirmpassword")}
										/>
										<FormText color="muted">
											<CheckIcon
												invalid={
													errorMsg("password") &&
													errorMsg("password")["errorType"].includes("length")
												}
											/>
											MUST contains at least 6 characters
										</FormText>
										<FormText color="muted">
											<CheckIcon
												invalid={
													errorMsg("password") &&
													errorMsg("password")["errorType"].includes(
														"uppercase"
													)
												}
											/>
											MUST contains at least one uppercase letter
										</FormText>
										<FormText color="muted">
											<CheckIcon
												invalid={
													errorMsg("password") &&
													errorMsg("password")["errorType"].includes(
														"lowercase"
													)
												}
											/>
											MUST contains at least one lowercase letter
										</FormText>
										<FormText color="muted">
											<CheckIcon
												invalid={
													errorMsg("password") &&
													errorMsg("password")["errorType"].includes("number")
												}
											/>
											MUST contains at least one number
										</FormText>
										<FormText color="muted">
											<CheckIcon
												invalid={
													errorMsg("password") &&
													errorMsg("password")["errorType"].includes("name")
												}
											/>
											MAY NOT contains first name
										</FormText>
									</Form.Group>
								</Col>
								<Col md="12" className="utility-block">
									<label>Utility company</label>
									<FormGroup check>
										<Label check>
											<Input
												type="radio"
												name="accountTypeDetail"
												value="CECONY"
												defaultChecked
											/>
											CECONY
										</Label>
									</FormGroup>
									<FormGroup check>
										<Label check>
											<Input
												type="radio"
												name="accountTypeDetail"
												value="ORU"
											/>
											ORU
										</Label>
									</FormGroup>
								</Col>
								<Col md="6"></Col>
							</Row>

              <Form.Group className="button-group">
                <Button
                  type="submit"
                  block
                  className="btn-round"
                  color="info"
                >
                  Register
                </Button>
                <Button tag= {Link} to ="/" block className="btn-round" color="info">
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
