// # prod Version
// const ceconyBackURL = `https://www.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?client_id=${APPSETTING_CLIENT_ID}&scope=${scope}`;
// const oruBackURL = `https://www.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?client_id=${APPSETTING_CLIENT_ID}&scope=${scope}`;
// # TEST Version
// const ceconyBackURL = `https://wem-cm-t1.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?client_id=${APPSETTING_CLIENT_ID}&scope=${scope}`;
// const oruBackURL = `https://wem-cm-t1.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?client_id=${APPSETTING_CLIENT_ID}&scope=${scope}`;
 

import React, { useContext, useMemo } from "react";
import { Redirect } from "react-router-dom";
import { Container, Col, Button, Form, FormGroup, Label, Input, Row } from "reactstrap";
import Header from "../components/Header";
import { ContextState } from "../context";

const SCOPE_OPTIONS = [
  {
    key: "consumption",
    label: "Consumption Scope",
    defaultChecked: true,
    value:
      "FB=1_3_4_5_7_10_13_14_18_32_33_35_37_38_41_44;IntervalDuration=Monthly_3600_900_300;BlockDuration=Monthly_Daily;HistoryLength=63113904;"
  },
  {
    key: "billing",
    label: "Billing Scope",
    value:
      "FB=1_3_6_10_13_14_15_16_28_32_33_35_37_38_41_44;IntervalDuration=Monthly;BlockDuration=Monthly;HistoryLength=63113904;"
  },
  {
    key: "realtime",
    label: "Real-Time Scope",
    value:
      "FB=1_3_4_5_7_13_14_18_32_33_35_37_38_41_44;IntervalDuration=900_300;BlockDuration=Daily;HistoryLength=86400;"
  },
  {
    key: "retailCustomer",
    label: "Retail Customer Scope",
    value: "FB=1_3_13_14_46_47;"
  }
];

const Scope = () => {
  const { authState, profileState, isloading } = useContext(ContextState);

  const baseAuthUrl = useMemo(() => {
    const { accountTypeDetail } = profileState || {};
    const isConEd = accountTypeDetail === "CECONY";
    return isConEd
      ? "https://www.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect"
      : "https://www.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect";
  }, [profileState]);

  const onSubmit = e => {
    e.preventDefault();

    if (!authState) {
      window.location.href = "/";
      return;
    }

    const { APPSETTING_CLIENT_ID } = profileState || {};
    if (!APPSETTING_CLIENT_ID) {
      // Fail fast so you're not redirected with a broken client_id
      alert("Missing APPSETTING_CLIENT_ID. Please check configuration.");
      return;
    }

    const checked = Array.from(e.currentTarget.querySelectorAll('input[type="checkbox"]:checked'));
    const scopes = checked.map(el => el.value);

    if (scopes.length === 0) {
      alert("Please select at least one scope.");
      return;
    }

    const scopeParam = encodeURIComponent(scopes.join("|"));

    const url = new URL(baseAuthUrl);
    url.searchParams.set("client_id", APPSETTING_CLIENT_ID);
    url.searchParams.set("scope", scopeParam);

    window.location.href = url.toString();
  };

  if (!authState && !isloading) return <Redirect to="/" />;

  return (
    <div className="page-content">
      <Header title={"Scope Selection"} />
      <Container>
        <Row>
          <Col className="mx-auto scrope-select" md="7">
            <h3>Please Select Authorization Scope Below</h3>

            <Form onSubmit={onSubmit}>
              {SCOPE_OPTIONS.map(opt => (
                <FormGroup key={opt.key}>
                  <Label check>
                    <Input
                      type="checkbox"
                      name={`scope_${opt.key}`}
                      value={opt.value}
                      defaultChecked={Boolean(opt.defaultChecked)}
                    />
                    {opt.label}
                  </Label>
                </FormGroup>
              ))}

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
