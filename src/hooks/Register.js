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
		if (!isEmpty(msg)) {
			if (type === "password") {
				return {
					invalid: "true",
					feedback: "",
					errorType: msg.type
				};
			}
			return {
				invalid: "true",
				feedback: msg
			};
		}
	};

	const formValidate = values => {
		let errorFields = {};
		const emailRegex = /[^]+@[^]+[.][a-z]/;
		let passwordType = [];

		if (!values.password) {
			errorFields.password = { msg: "Required", type: "length" };
		}
		if (values.password.length < 6) {
			passwordType.push("length");
			errorFields.password = {
				msg: "Required Min. 6 characters!",
				type: passwordType
			};
		}
		if (values.password.replace(/[^A-Z]/g, "").length < 1) {
			passwordType.push("uppercase");
			errorFields.password = {
				msg: "MUST contains at leat one uppercase letter",
				type: passwordType
			};
		}
		if (values.password.replace(/[^a-z]/g, "").length < 1) {
			passwordType.push("lowercase");
			errorFields.password = {
				msg: "MUST contains at leat one lowercase letter",
				type: passwordType
			};
		}
		if (values.password.replace(/[^0-9]/g, "").length < 1) {
			passwordType.push("number");
			errorFields.password = {
				msg: "MUST contains at leat one number",
				type: passwordType
			};
		}
		if (values.password.includes(values.firstName)) {
			passwordType.push("name");
			errorFields.password = {
				msg: "MAY NOT contain first name",
				type: passwordType
			};
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

		if (values.zipCode.length < 1) {
			errorFields.zipCode = "Required";
		} else if (values.zipCode.replace(/_/g, "").length < 5) {
			errorFields.zipCode = "Invalid Zip Code";
		}

		if (!values.phone) {
			errorFields.phone = "Required";
		} else if (values.phone.replace(/[^0-9]/g, "").length < 11) {
			errorFields.phone = "Phone number is invalid";
		}

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
									<label>Radio Buttons</label>
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
								<Button block className="btn-round" color="info">
									Register
								</Button>
								<Button href="/" block className="btn-round" color="info">
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
