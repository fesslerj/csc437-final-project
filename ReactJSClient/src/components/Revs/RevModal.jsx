import React, { Component } from 'react';
import {
   Modal, Button, FormControl, ControlLabel, FormGroup
} from 'react-bootstrap';

export default class RevModal extends Component {
   constructor(props) {
      super(props);
      this.state = {
         revContent: (this.props.rev && this.props.rev.content) || "",
      }
   }

   close = (result) => {
      this.props.onDismiss && this.props.onDismiss({
         status: result,
         content: this.state.revContent
      });
   }

   getValidationState = () => {
      return null;
   }

   handleChange = (e) => {
      this.setState({ revContent: e.target.value });
   }

   componentWillReceiveProps = (nextProps) => {
      if (nextProps.showModal) {
         this.setState({ revContent: (nextProps.rev && nextProps.rev.content)
          || "" })
      }
   }

   render() {
      return (
         <Modal show={this.props.showModal}
          onHide={() => this.close("Cancel")}
         >
            <Modal.Header closeButton>
               <Modal.Title>{this.props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               <form onSubmit={(e) =>
                  e.preventDefault() || true ?
                   this.close("Ok") : this.close("Cancel")}>
                  <FormGroup controlId="formBasicText"
                   validationState={this.getValidationState()}
                  >
                     <ControlLabel>Review Content</ControlLabel>
                     <FormControl
                        componentClass="textarea"
                        value={this.state.revContent}
                        placeholder="Enter text"
                        onChange={this.handleChange}
                     />
                     <FormControl.Feedback />
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