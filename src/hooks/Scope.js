import React from "react";
// import { Container, Form, FormGroup, Input, Label, Button } from "reactstrap";
import {
  Container,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  Row
} from "reactstrap";

const Scope = props => (
  <div className="page-content">
    <div className="content-header">
      <h1>
        <span>Scope Section</span>
      </h1>
    </div>
    <Container>
      <Row>
        <Col className="mx-auto" md="6">
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
            <Button block className="btn-round" color="danger">
              Button
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  </div>
);

export default Scope;
