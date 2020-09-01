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
	const { message, isloading } = useContext(ContextState);
	const [errors, setError] = useState(false);
	const { forgotPassword } = authUtils();

	const onSigninSubmit = e => {
		e.preventDefault();
		let emailValue = e.target.elements.email.value;
		if (!emailValue) {
			setError("Please enter your email!");
		} else {
			forgotPassword(emailValue);
		}
	};
	console.log(message, isloading);
	return (
		<Container>
			<Row>
				<Col className="middle-container ml-auto mr-auto" lg="6">
					<Card className="card-signup reset-password ml-auto mr-auto my-auto">
						{isloading ? (
							<div className="loading-image">
								<img src={`/${Loading}`} width="100" height="100" />
							</div>
						) : (
							<>
								<div className="title mx-auto">
									<h2>Forgot Password</h2>
								</div>
								<Form className="reset-password-form" onSubmit={onSigninSubmit}>
									{!message.status && message.status !== undefined ? (
										<Alert color="danger">{message.msg}</Alert>
									) : null}
									{message.status ? (
										<h4>
											We already sent the forgot password Email. <br />
											Please check your email!
										</h4>
									) : (
										<>
											<p>
												Enter your email address and your password will be reset
												and emailed to you.
											</p>
											<label>Email Address</label>
											<Input
												placeholder="Enter email"
												type="email"
												name="email"
											/>
											<FormGroup className="button-group">
												<Button block className="btn-round" color="danger">
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
