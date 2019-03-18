import React, { Component } from 'react';
import {
   Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';

export default class RstModal extends Component {
   constructor(props) {
      super(props);
      this.state = {
         rstTitle: (this.props.rst && this.props.rst.title) || ""
      }
   }

   close = (result) => {
      this.props.onDismiss && this.props.onDismiss({
         status: result,
         title: this.state.rstTitle
      });
   }

   getValidationState = () => {
      if (this.state.rstTitle) {
         return null
      }
      return "warning";
   }

   handleChange = (e) => {
      this.setState({ rstTitle: e.target.value });
   }

   componentWillReceiveProps = (nextProps) => {
      if (nextProps.showModal) {
         this.setState({ rstTitle: (nextProps.rst && nextProps.rst.title)
          || "" })
      }
   }

   render() {
      return (
         <Modal show={this.props.showModal} onHide={() =>
          this.close("Cancel")}>
            <Modal.Header closeButton>
               <Modal.Title>{this.props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               <form onSubmit={(e) =>
                  e.preventDefault() || this.state.rstTitle.length ?
                     this.close("Ok") : this.close("Cancel")}>
                  <FormGroup controlId="formBasicText"
                   validationState={this.getValidationState()}
                  >
                     <ControlLabel>Restaurant Title</ControlLabel>
                     <FormControl
                        type="text"
                        value={this.state.rstTitle}
                        placeholder="Enter text"
                        onChange={this.handleChange}
                     />
                     <FormControl.Feedback />
                     <HelpBlock>Title can not be empty.</HelpBlock>
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