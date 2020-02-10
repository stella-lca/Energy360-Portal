import React from "react";
import { Container, Button, Row, Col, Card, Form, Input, Label, FormGroup, FormText } from "reactstrap";


const Register = props => (
  <Container>
    <Row>
      <Col className="middle-container ml-auto mr-auto" lg="6">
        <Card className="card-signup register ml-auto mr-auto my-auto">
          <div className="title mx-auto">
            <img
              className="d-block mx-auto mb-4"
              src="https://cutone.org/wp-content/themes/wp_lcassociates/img/GC-logo.PNG"
              alt="logo"
              className="d-block"
            />
            <h2 className="mx-auto mb-4">User Registration</h2>
          </div>
          
          <Form className="register-formd">
            <Row md="12">
              <Col md='6'>
                <label>First Name</label>
                <Input placeholder="First Name" type="text" />
              </Col>
              <Col md='6'>
                  <label>Last Name</label>
                  <Input placeholder="Last Name" type="text" />
              </Col>
              <Col md='12'>
                <label>Street Address 1</label>
                <Input placeholder="Street Address 1" type="text" />
              </Col>
              <Col md='12'>
                <label>House or Suite #</label>
                <Input placeholder="House or Suite #" type="text" />
              </Col>
              <Col md='6'>
                <label>City</label>
                <Input placeholder="City" type="text" />
              </Col>
              <Col md='6'>
                <label>Zip Code</label>
                <Input placeholder="Zip Code" type="number" mask={[/\d/, /\d/, /\d/, /\d/, /\d/]} />
                <FormText color="muted">
                  (Format: 00000)
                </FormText>
              </Col>
              <Col md='12'>
                <label>Select State</label>
                <Input type="select" name="select" id="stateSelect">
                  <option>New York</option>
                  <option>Log Angeles</option>
                </Input>
              </Col>
              <Col md='12'>
                <label>Select Country</label>
                <Input type="select" name="select" id="stateCountry">
                  <option>United States</option>
                  <option>United Kingdom</option>
                </Input>
              </Col>
              <Col md='12'>
                <label>Email address</label>
                <Input placeholder="Email address" type="email" />
              </Col>
              <Col md='12'>
                <label>Phone</label>
                <Input placeholder="Phone" type="phone" />
                <FormText color="muted">
                 (Format: 000-000-0000)
                </FormText>
              </Col>
              <Col md='12'>
                <label>Password (Min. 6 characters)</label>
                <Input placeholder="Password" type="password" />
              </Col>
              <Col md='12' className="utility-block">
                <label className="col-form-label">Select Your Utility Company</label>
                <FormGroup check>
                  <Label check>
                    <Input type="radio" name="radio2" /> CECONY
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input type="radio" name="radio2" /> ORU
                  </Label>
                </FormGroup>
              </Col>
              <Col md='6'></Col>
            </Row>
           <FormGroup className="button-group">
              <Button block className="btn-round" color="danger">
                Register
              </Button>
              <Button href="/login" block className="btn-round" color="danger">
                Go to Login
              </Button>
           </FormGroup>
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
    </Row>
  </Container>
);

export default Register;
