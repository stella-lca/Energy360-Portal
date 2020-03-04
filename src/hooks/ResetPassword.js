import React, { useState, useContext } from "react";
import { Redirect } from "react-router-dom";
import {
	Container,
	Button,
	FormGroup,
	Row,
	Col,
	Card,
	Alert,
	FormText
} from "reactstrap";
import { Form } from "tabler-react";
import queryString from "query-string";
import authUtils from "../utils/auth";
import { isEmpty } from "lodash";
import { ContextState } from "../context";
import CheckIcon from "../components/CheckIcon";

const ResetPassword = props => {
	const { resetPasswordCallback, resetPassword } = authUtils();
	const [errors, setError] = useState({ password: [] });
	const { message, isloading, profileState, authState } = useContext(
		ContextState
	);
	const querys = queryString.parse(props.location.search);

	const validate = (password, confirmPassword) => {
		let errorFields = {};
		errorFields.password = [];
		if (password.length < 6) {
			errorFields.password.push("length");
		}
		if (password.replace(/[^A-Z]/g, "").length < 1) {
			errorFields.password.push("uppercase");
		}
		if (password.replace(/[^a-z]/g, "").length < 1) {
			errorFields.password.push("lowercase");
		}
		if (password.replace(/[^0-9]/g, "").length < 1) {
			errorFields.password.push("number");
		}
		if (!confirmPassword) {
			errorFields.confirmPassword = {
				invalid: "true",
				feedback: "MUST be at least 6 letters"
			};
		} else if (password !== confirmPassword) {
			errorFields.confirmPassword = {
				invalid: "true",
				feedback: "MUST be the same password"
			};
		}

		return errorFields;
	};

	const onSigninSubmit = e => {
		e.preventDefault();
		let password = e.target.elements.password.value;
		let confirmPassword = e.target.elements.confirmPassword.value;
		const errorList = validate(password, confirmPassword);

		setError(errorList);
		if (isEmpty(errorList["password"]) && !errorList["confirmPassword"]) {
			if (querys.token) {
				resetPasswordCallback({ password, token: querys.token });
			} else if (authState) {
				resetPassword({ password, email: profileState.email });
			}
		}
	};

	if (!isloading && !authState && !querys.token) {
		return <Redirect to="/" />;
	}
	return (
		<Container>
			<Row>
				<Col className="middle-container ml-auto mr-auto" lg="6">
					<Card className="card-signup reset-password ml-auto mr-auto my-auto">
						{message.status ? (
							<Redirect to="/" />
						) : (
							<>
								<div className="title mx-auto">
									<h2>Reset Password</h2>
								</div>

								<Form className="reset-password-form" onSubmit={onSigninSubmit}>
									{!message.status && message.status !== undefined ? (
										<Alert color="danger">{message.msg}</Alert>
									) : (
										""
									)}
									<Form.Group label="Password (Min. 6 characters)">
										<Form.Input
											name="password"
											type="password"
											placeholder="Password..."
											invalid={errors["password"].length}
										/>
									</Form.Group>
									<Form.Group label="Confirm Password">
										<Form.Input
											name="confirmPassword"
											type="password"
											placeholder="Confirm Password..."
											{...errors["confirmPassword"]}
										/>
									</Form.Group>
									<Form.Group className="validation-panel">
										<FormText color="muted">
											<CheckIcon
												invalid={errors["password"].includes("length")}
											/>
											MUST contains at least 6 characters
										</FormText>
										<FormText color="muted">
											<CheckIcon
												invalid={errors["password"].includes("uppercase")}
											/>
											MUST contains at least one uppercase letter
										</FormText>
										<FormText color="muted">
											<CheckIcon
												invalid={errors["password"].includes("lowercase")}
											/>
											MUST contains at least one lowercase letter
										</FormText>
										<FormText color="muted">
											<CheckIcon
												invalid={errors["password"].includes("number")}
											/>
											MUST contains at least one number
										</FormText>
									</Form.Group>
									<FormGroup className="button-group">
										<Button block className="btn-round" color="danger">
											Reset Password
										</Button>
									</FormGroup>
								</Form>
							</>
						)}
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default ResetPassword;
