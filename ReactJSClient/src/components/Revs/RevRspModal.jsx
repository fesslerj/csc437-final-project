import React, { Component } from 'react';
import {
   Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';

export default class RevRspModal extends Component {
   constructor(props) {
      super(props);
      this.state = {
         revRspContent: (this.props.revRsp && this.props.revRsp.content) || "",
      }
   }

   close = (result) => {
      this.props.onDismiss && this.props.onDismiss({
         status: result,
         ownerResponse: this.state.revRspContent
      });
   }

   getValidationState = () => {
      if (this.state.revRspContent) {
         return null
      }
      return "warning";
   }

   handleBodyChange = (e) => {
      this.setState({ revRspContent: e.target.value });
   }

   componentWillReceiveProps = (nextProps) => {
      if (nextProps.showRspModal) {
         this.setState({
            revRspContent: (nextProps.revRsp && nextProps.revRsp.content) || "",
         })
      }
   }

   render() {
      return (
         <Modal show={this.props.showModal}
          onHide={() => this.close("Cancel")}
         >
            <Modal.Header closeButton>
               <Modal.Title>New Owner Response</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               <form onSubmit={(e) =>
                  e.preventDefault() || true ?
                   this.close("Ok") : this.close("Cancel")}>
                  <FormGroup controlId="formBasicText"
                   validationState={this.getValidationState()}
                  >
                     <ControlLabel>Response Body*</ControlLabel>
                     <FormControl
                        style={{height: "20em"}}
                        componentClass="textarea"
                        value={this.state.revRspContent}
                        placeholder="Enter text"
                        onChange={this.handleBodyChange}
                     />
                     <FormControl.Feedback />
                     {!this.getValidationState() ? "": <HelpBlock style={{marginTop: "15px"}}>Response body is required.</HelpBlock>}
                  </FormGroup>
               </form>
            </Modal.Body>
            <Modal.Footer>
               <Button onClick={() => this.close("Ok")}>Ok</Button>
               <Button onClick={() => this.close("Cancel")}>Cancel</Button>
            </Modal.Footer>
         </Modal>)
   }
}