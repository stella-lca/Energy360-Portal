import React, { useState } from "react";
import { Container, Button, Row, Col, Card, Alert } from "reactstrap";
import { Form } from "tabler-react";
import Header from "../components/Header";
import authUtils from "../utils/auth";
import { isEmpty } from "lodash";

const ContactUS = props => {
	const { sendEmail } = authUtils();
	const [errors, setError] = useState({});

	const errorMsg = type => {
		const msg = errors[type];
		if (!isEmpty(msg))
			return {
				invalid: true,
				feedback: msg
			};
	};

	const formValidate = values => {
		let errorFields = {};
		const emailRegex = /[^]+@[^]+[.][a-z]/;

		if (!values.name) {
			errorFields.name = "Required";
		}
		if (!values.email) {
			errorFields.email = "Required";
		} else if (!emailRegex.test(values.email)) {
			errorFields.email = "Invalid email address!";
		}
		if (!values.content) {
			errorFields.content = "Required";
		}
		return errorFields;
	};

	const onSigninSubmit = e => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = {};

		for (let entry of formData.entries()) {
			data[entry[0]] = entry[1];
		}

		const errorMsgs = formValidate(data);
		setError(errorMsgs);
		if (isEmpty(errorMsgs)) {
			sendEmail(data);
		}
	};

	return (
		<div className="page-content">
			<Header title={"Contact Us"} />
			<div className="content-center">
				<Container>
					<Row className="contact-footer">
						<Col lg="4">
							<h3>
								<i className="fa fa-map-marker" aria-hidden="true"></i>
								<span>Find Us</span>
							</h3>
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.6620305290035!2d-73.98983628423814!3d40.747461679328005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a8c3c7b5d5%3A0x9945b3cefe670ff2!2s38%20W%2032nd%20St%20%23404%2C%20New%20York%2C%20NY%2010001!5e0!3m2!1sen!2sus!4v1582827714576!5m2!1sen!2sus"
								width="auto"
								height="auto"
								frameBorder="0"
								allowFullScreen=""
							/>
						</Col>
						<Col lg="4">
							<h3>
								<i className="fa fa-paper-plane" aria-hidden="true"></i>
								<span>Send Us a Message</span>
							</h3>
							<Form className="login-form" onSubmit={onSigninSubmit}>
								<Form.Group>
									<Form.Input
										name="name"
										type="text"
										placeholder="FULL NAME"
										{...errorMsg("name")}
									/>
								</Form.Group>
								<Form.Group>
									<Form.Input
										name="email"
										type="email"
										placeholder="EMAIL"
										{...errorMsg("email")}
									/>
								</Form.Group>
								<Form.Group>
									<Form.Textarea
										defaultValue=""
										name="content"
										placeholder="Content.."
										rows={7}
										{...errorMsg("content")}
									/>
								</Form.Group>
								<Form.Group className="button-group">
									<Button type="submit" block color="">
										SEND
									</Button>
								</Form.Group>
							</Form>
						</Col>
						<Col lg="4">
							<h3>
								<i className="fa fa-phone" aria-hidden="true"></i>
								<span>Call Us</span>
							</h3>
							<div>
								<p>Tel: 212-579-4236</p>
								<p>Email: info@cutone.org</p>
								<p>Address: 38 W 32nd ST NEW YORK, NY 10001</p>
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		</div>
	);
};

export default ContactUS;
