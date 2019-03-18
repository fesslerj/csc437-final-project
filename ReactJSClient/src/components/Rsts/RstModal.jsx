import React, { Component } from 'react';
import {
   Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';

export default class RstModal extends Component {
   constructor(props) {
      super(props);
      this.state = {
         rstTitle: (this.props.rst && this.props.rst.title) || "",
         rstURL: (this.props.rst && this.props.rst.url) || "",
         rstDescription: (this.props.rst && this.props.rst.description) || ""
      }
   }

   close = (result) => {
      this.props.onDismiss && this.props.onDismiss({
         status: result,
         title: this.state.rstTitle,
         url: this.state.rstURL,
         description: this.state.rstDescription
      });
   }

   getValidationState = () => {
      if (this.state.rstTitle && this.state.rstURL) {
         return null
      }
      return "warning";
   }

   handleTitleChange = (e) => {
      this.setState({ rstTitle: e.target.value });
   }

   handleURLChange = (e) => {
      this.setState({ rstURL: e.target.value });
   }

   handleDescriptionChange = (e) => {
      this.setState({ rstDescription: e.target.value });
   }

   componentWillReceiveProps = (nextProps) => {
      if (nextProps.showModal) {
         this.setState({
            rstTitle: (this.props.rst && this.props.rst.title) || "",
            rstURL: (this.props.rst && this.props.rst.url) || "",
            rstDescription: (this.props.rst && this.props.rst.description) || ""
         });
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
                     <ControlLabel>Restaurant Title*</ControlLabel>
                     <FormControl
                        type="text"
                        value={this.state.rstTitle}
                        placeholder="Pat's Phenomenal Pastries"
                        onChange={this.handleTitleChange}
                     />
                     <ControlLabel>Restaurant URL*</ControlLabel>
                     <FormControl
                        type="text"
                        value={this.state.rstURL}
                        placeholder="https://patspastries.com"
                        onChange={this.handleURLChange}
                     />
                     <ControlLabel>Restaurant Description</ControlLabel>
                     <FormControl
                        componentClass="textarea"
                        value={this.state.rstDescription}
                        placeholder="Pat loves to make pastries of all kinds..."
                        onChange={this.handleDescriptionChange}
                     />
                     <FormControl.Feedback />
                     <HelpBlock>Title and URL can not be empty.</HelpBlock>
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