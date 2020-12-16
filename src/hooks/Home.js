import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Container, Button } from "reactstrap";
import { ContextState } from "../context";
import BkImg from "../assets/img/antoine-barres.jpg";

const Home = () => {
	const { authState, profileState } = useContext(ContextState);
	let redirectURL = "/";
	if (authState) {
		const { accountTypeDetail, APPSETTING_GREENCONNECT_ID } = profileState;
		
		//TEST Environment
		// const CECONY_redir = `https://wem-cm-t1.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization?ThirdPartyId=${APPSETTING_GREENCONNECT_ID}&third_party_notify_uri=https://greenconnect-energy360-test.azurewebsites.net/api/notify`;
		// const ORU_redir = `https://wem-cm-t1.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization?ThirdPartyId=${APPSETTING_GREENCONNECT_ID}&third_party_notify_uri=https://greenconnect-energy360-test.azurewebsites.net/api/notify`;
		
// 		//Production Environment
		const CECONY_redir = `https://www.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization?ThirdPartyId=${APPSETTING_GREENCONNECT_ID}`;
		const ORU_redir = `https://www.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization?ThirdPartyId=${APPSETTING_GREENCONNECT_ID}`;
		
		redirectURL = accountTypeDetail === "CECONY" ? CECONY_redir : ORU_redir;
		
	}

	return (
		<>
			<div
				className="page-header section-dark home-layout"
				style={{ backgroundImage: `url(/${BkImg})` }}
			>
				<div className="filter" />
				<div className="content-center">
					<Container>
						<div className="title-brand">
							<h1 className="presentation-title">
								Welcome to GreenConnect API
							</h1>
							<div className="home-control-pan">
								<Button href={redirectURL} className="btn btn-outline-neutral">
									Go to My Utility Provider
								</Button>
								<Link to="/scope-selection" className="btn btn-outline-neutral">
									Go to Scope Selection
								</Link>
							</div>
						</div>
					</Container>
				</div>
			</div>
		</>
	);
};

export default Home;
