import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import {
	Container,
	Col,
	Button,
	Form,
	FormGroup,
	Label,
	Input,
	Row,
} from "reactstrap";
import Header from "../components/Header";
import { ContextState } from "../context";
import authUtils from "../utils/auth";

const Scope = () => {
	const { authState, profileState, isloading } = useContext(ContextState);

	const getCallbackURL = (scope) => {
		const { accountTypeDetail, APPSETTING_CLIENT_ID } = profileState;
		// const ceconyBackURL = `https://www.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?client_id=${APPSETTING_CLIENT_ID}&scope=${scope}`;
		// const oruBackURL = `https://www.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?client_id=${APPSETTING_CLIENT_ID}&scope=${scope}`;
		const ceconyBackURL = `https://wem-cm-t1.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?client_id=${APPSETTING_CLIENT_ID}&scope=${scope}`;
		const oruBackURL = `https://wem-cm-t1.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?client_id=${APPSETTING_CLIENT_ID}&scope=${scope}`;
		return accountTypeDetail === "CECONY" ? ceconyBackURL : oruBackURL;
	};

	const onSigninSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		let scopes = [];

		for (let entry of formData.entries()) {
			scopes.push(entry[1]);
		}

		if (authState) {
			const rediretURL = getCallbackURL(scopes.join("|"));
			window.location.href = rediretURL;
		} else {
			window.location.href = "/";
		}
	};

	if (!authState && !isloading) return <Redirect to="/" />;
	return (
		<div className="page-content">
			<Header title={"Scope Section"} />
			<Container>
				<Row>
					<Col className="mx-auto scrope-select" md="7">
						<h3>Please Select Authorization Scope Below</h3>
						<Form onSubmit={onSigninSubmit}>
							<FormGroup>
								<Label check>
									<Input
										type="checkbox"
										name="checkbox1"
										value="FB=1_3_4_5_7_10_13_14_18_32_33_35_37_38_41_44;IntervalDuration= Monthly_3600_900_300;BlockDuration=Monthly_Daily;HistoryLength=63113904;"
										defaultChecked
									/>{" "}
									Consumption Scope
								</Label>
							</FormGroup>
							<FormGroup>
								<Label check>
									<Input
										type="checkbox"
										name="checkbox2"
										value="FB=1_3_6_10_13_14_15_16_28_32_33_35_37_38_41_44;IntervalDuration= Monthly;BlockDuration=Monthly;HistoryLength=63113904;"
									/>{" "}
									Billing Scope
								</Label>
							</FormGroup>
							<FormGroup>
								<Label check>
									<Input
										type="checkbox"
										name="checkbox3"
										value="FB=1_3_4_5_7_13_14_18_32_33_35_37_38_41_44;IntervalDuration= 900_300;BlockDuration=Daily;HistoryLength=86400;"
									/>{" "}
									Real-Time Scope
								</Label>
							</FormGroup>
							<FormGroup>
								<Label check>
									<Input
										type="checkbox"
										name="checkbox4"
										value="FB=1_3_13_14_46_47;"
									/>{" "}
									Retail Customer Scope
								</Label>
							</FormGroup>
							<FormGroup className="button-group">
								<Button block className="btn-round" color="danger">
									Submit
								</Button>
							</FormGroup>
						</Form>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default Scope;
