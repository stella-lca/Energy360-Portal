import React, { useContext, useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import {
	Container,
	Button,
	Row,
	Col,
	Card,
	CardImg,
	CardBody,
	CardTitle
} from "reactstrap";
import { Form } from "tabler-react";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Toast from "light-toast";
import { ContextState } from "../context";
import authUtils from "../utils/auth";
import { isEmpty } from "lodash";
import ProfileCardImg from "../assets/img/profile-backgorund.jpg";

const Profile = () => {
	const { userUpdate } = authUtils();
	const { authState, profileState, isloading, errorState } = useContext(
		ContextState
	);
	const [disabled, setEditable] = useState(true);
	const [errors, setError] = useState({});
	const [user, setUser] = useState({});

	useEffect(() => {
		setUser(profileState);
		if (!disabled && !errorState) {
			Toast.success("Your profile updated!");
		}
		if (errorState) {
			Toast.fail("Request error!");
		}
		setEditable(true);
	}, [profileState]);

	const camelCase = str => {
		if (!str) return "";
		return str.substring(0, 1).toUpperCase() + str.substring(1);
	};

	const errorMsg = type => {
		const msg = errors[type];
		if (!isEmpty(msg)) {
			return {
				invalid: "true",
				feedback: msg
			};
		}
	};

	const formValidate = values => {
		let errorFields = {};

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

	const onChange = e => {
		const el = e.target;
		setUser({ ...user, [el.name]: el.value });
	};

	const onSignupSubmit = e => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const tem_user = {};

		for (let entry of formData.entries()) {
			tem_user[entry[0]] = entry[1];
		}
		const errorMsgs = formValidate(tem_user);
		if (isEmpty(errorMsgs)) {
			setError({});
			userUpdate(user);
		} else {
			setError(errorMsgs);
		}
	};

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
		email = "",
		accountTypeDetail = ""
	} = user || {};

	// if (isloading) return <Loading />;
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
							<Form className="register-formd" onSubmit={onSignupSubmit}>
								<Row md="12">
									<Col md="6">
										<Form.Group label="First Name">
											<Form.Input
												name="firstName"
												type="text"
												disabled={disabled}
												value={camelCase(firstName)}
												onChange={onChange}
												{...errorMsg("firstName")}
											/>
										</Form.Group>
									</Col>
									<Col md="6">
										<Form.Group label="Last Name">
											<Form.Input
												name="lastName"
												type="text"
												disabled={disabled}
												value={camelCase(lastName)}
												onChange={onChange}
												{...errorMsg("lastName")}
											/>
										</Form.Group>
									</Col>
									<Col md="12">
										<Form.Group label="Street Address 1">
											<Form.Input
												name="streetAddress1"
												type="text"
												disabled={disabled}
												value={camelCase(streetAddress1)}
												onChange={onChange}
												{...errorMsg("streetAddress1")}
											/>
										</Form.Group>
									</Col>
									<Col md="8">
										<Form.Group label="House or Suite #">
											<Form.Input
												name="streetAddress2"
												type="text"
												disabled={disabled}
												value={camelCase(streetAddress2)}
												onChange={onChange}
												{...errorMsg("streetAddress2")}
											/>
										</Form.Group>
									</Col>
									<Col md="4">
										<Form.Group label="City">
											<Form.Input
												name="city"
												type="text"
												disabled={disabled}
												value={camelCase(city)}
												onChange={onChange}
												{...errorMsg("city")}
											/>
										</Form.Group>
									</Col>
									<Col md="4">
										<Form.Group label="Zip Code">
											<Form.MaskedInput
												placeholder="91210"
												mask={[/\d/, /\d/, /\d/, /\d/, /\d/]}
												name="zipCode"
												disabled={disabled}
												value={zipCode}
												onChange={onChange}
												{...errorMsg("zipCode")}
											/>
										</Form.Group>
									</Col>
									<Col md="4">
										<Form.Group label="Select State">
											<Form.Select
												name="state"
												disabled={disabled}
												value={state}
												onChange={onChange}
												{...errorMsg("state")}
											>
												<option>New York</option>
											</Form.Select>
										</Form.Group>
									</Col>
									<Col md="4">
										<Form.Group label="Select Country">
											<Form.Select
												name="country"
												disabled={disabled}
												value={country}
												onChange={onChange}
												{...errorMsg("country")}
											>
												<option>United States</option>
											</Form.Select>
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
												disabled={disabled}
												onChange={onChange}
												{...errorMsg("phone")}
											/>
										</Form.Group>
									</Col>
									<Col md="6">
										<Form.Group label="Utility Company">
											<Form.Input
												name="company"
												type="text"
												disabled
												value={accountTypeDetail}
											/>
										</Form.Group>
									</Col>
								</Row>
								<Row className="profile-action-area">
									<Col>
										{disabled ? (
											<Button
												color="info"
												type="button"
												onClick={e => (e.preventDefault(), setEditable(false))}
											>
												Edit Profile
											</Button>
										) : (
											<Button color="info">Save Profile</Button>
										)}
									</Col>
								</Row>
							</Form>
						</Card>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default Profile;
