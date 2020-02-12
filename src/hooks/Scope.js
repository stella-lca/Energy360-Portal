import React from "react";
import {
  Container,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row
} from "reactstrap";
import Header from "./Header";

const Scope = props => (
  <div className="page-content">
    <Header title={"Scope Section"} />
    <Container>
      <Row>
        <Col className="mx-auto scrope-select" md="7">
          <h3>Please Select Authorization Scope Below</h3>
          <Form>
            <FormGroup>
              <Label check>
                <Input type="checkbox" id="checkbox1" /> Consumption Scopet
              </Label>
            </FormGroup>
            <FormGroup>
              <Label check>
                <Input type="checkbox" id="checkbox2" /> Billing Scope
              </Label>
            </FormGroup>
            <FormGroup>
              <Label check>
                <Input type="checkbox" id="checkbox3" /> Real-TimeScope
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

export default Scope;
