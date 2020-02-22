import React, { useContext, useState, useEffect } from "react";
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
	FormText,
	CardImg,
	CardText,
	CardBody,
	CardTitle,
	CardSubtitle
} from "reactstrap";
import { Form } from "tabler-react";
import Header from "../components/Header";
import { ContextState } from "../context";
import authUtils from "../utils/auth";
import { isEmpty } from "lodash";
import CheckIcon from "../components/CheckIcon";
import ProfileCardImg from "../assets/img/profile-backgorund.jpg";

const Profile = () => {
	const { authState, profileState, isloading } = useContext(ContextState);

	const {
		firstName,
		lastName,
		streetAddress1,
		streetAddress2,
		city,
		zipCode,
		state,
		country,
		phone,
		email,
		accountTypeDetail
	} = profileState || {};

	const camelCase = str => {
		if (!str) return "";
		return str.substring(0, 1).toUpperCase() + str.substring(1);
	};

	if (!authState && !isloading) return <Redirect to="/home" />;
	return (
		<div className="page-content profile-page">
			<Header title={"User Profile"} style={{ height: "20em" }} />
			<Container className="profile-conent">
				<Row>
					<Col xs="4" className="side-bar">
						<Card className="user-card">
							<CardImg
								top
								width="100%"
								src={ProfileCardImg}
								alt="Card image cap"
							/>
							<CardBody>
								<img
									className="card-profile-img"
									alt="Profile"
									src="https://www.pngitem.com/pimgs/m/87-877270_logo-icon-profile-png-transparent-png.png"
								></img>
								<h3 className="title">
									{camelCase(firstName)} {camelCase(lastName)}
								</h3>
							</CardBody>
						</Card>
						<Card className="password-card">
							<Button href="/reset-password" color="danger">
								Reset Password
							</Button>
						</Card>
					</Col>
					<Col xs="8">
						<Card className="profile-detail">
							<CardTitle className="card-title">Profile Detail</CardTitle>
							<Row md="12">
								<Col md="6">
									<Form.Group label="First Name">
										<Form.Input
											name="firstName"
											type="text"
											disabled
											value={camelCase(firstName)}
										/>
									</Form.Group>
								</Col>
								<Col md="6">
									<Form.Group label="Last Name">
										<Form.Input
											name="lastName"
											type="text"
											disabled
											value={camelCase(lastName)}
										/>
									</Form.Group>
								</Col>
								<Col md="12">
									<Form.Group label="Street Address 1">
										<Form.Input
											name="streetAddress1"
											type="text"
											disabled
											value={camelCase(streetAddress1)}
										/>
									</Form.Group>
								</Col>
								<Col md="8">
									<Form.Group label="House or Suite #">
										<Form.Input
											name="streetAddress2"
											type="text"
											disabled
											value={camelCase(streetAddress2)}
										/>
									</Form.Group>
								</Col>
								<Col md="4">
									<Form.Group label="City">
										<Form.Input
											name="city"
											type="text"
											disabled
											value={camelCase(city)}
										/>
									</Form.Group>
								</Col>
								<Col md="4">
									<Form.Group label="Zip Code">
										<Form.MaskedInput
											placeholder="91210"
											mask={[/\d/, /\d/, /\d/, /\d/, /\d/]}
											name="zipCode"
											disabled
											value={zipCode}
										/>
									</Form.Group>
								</Col>
								<Col md="4">
									<Form.Group label="State">
										<Form.Input
											name="state"
											type="text"
											disabled
											value={state}
										/>
									</Form.Group>
								</Col>
								<Col md="4">
									<Form.Group label="Country">
										<Form.Input
											name="country"
											type="text"
											disabled
											value={country}
										/>
									</Form.Group>
								</Col>
								<Col md="6">
									<Form.Group label="Email address">
										<Form.Input
											name="email"
											type="text"
											disabled
											value={email}
										/>
									</Form.Group>
								</Col>
								<Col md="6">
									<Form.Group label="Phone">
										<Form.MaskedInput
											placeholder="+1 (555) 495-3947"
											name="phone"
											type="text"
											value={phone}
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
											disabled
										/>
									</Form.Group>
								</Col>
								<Col md="6">
									<Form.Group label="Company">
										<Form.Input
											name="company"
											type="text"
											disabled
											value={accountTypeDetail}
										/>
									</Form.Group>
								</Col>
							</Row>
						</Card>
					</Col>
				</Row>
				{/* <Row>
						<Col className="middle-container ml-auto mr-auto" lg="6">
							<Card className="ml-auto mr-auto my-auto">
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
															errorMsg("password")["errorType"].includes(
																"length"
															)
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
															errorMsg("password")["errorType"].includes(
																"number"
															)
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
					</Row> */}
			</Container>
		</div>
	);
};

export default Profile;
