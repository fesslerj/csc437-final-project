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
         rstDescription: (this.props.rst && this.props.rst.description) || "",
         rstCategory: (this.props.rst && this.props.rst.category) || "Bakery",
      }
   }

   close = (result) => {
      this.props.onDismiss && this.props.onDismiss({
         status: result,
         title: this.state.rstTitle,
         url: this.state.rstURL,
         description: this.state.rstDescription,
         category: this.state.rstCategory
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

   handleCategoryChange = (e) => {
      this.setState({rstCategory: e.target.value});
   }

   componentWillReceiveProps = (nextProps) => {
      if (nextProps.showModal) {
         this.setState({
            rstTitle: (nextProps.rst && nextProps.rst.title) || "",
            rstURL: (nextProps.rst && nextProps.rst.url) || "",
            rstCategory: (nextProps.rst && nextProps.rst.category) || "Bakery",
            rstDescription: (nextProps.rst && nextProps.rst.description) || ""
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
                     <ControlLabel style={{marginTop: "15px"}}>Restaurant URL*</ControlLabel>
                     <FormControl
                        type="text"
                        value={this.state.rstURL}
                        placeholder="https://patspastries.com"
                        onChange={this.handleURLChange}
                     />
                     <ControlLabel style={{marginTop: "15px"}}>Restaurant Category*</ControlLabel>
                     <FormControl componentClass="select" 
                        onChange={this.handleCategoryChange} defaultValue={this.state.rstCategory}>
                        <option>Bakery</option>
                        <option>Barbeque</option>
                        <option>Chinese</option>
                        <option>Deli</option>
                        <option>Fine Dining</option>
                        <option>Ice Cream</option>
                        <option>Seafood</option>
                        <option>Vegetarian</option>
                        <option>Breakfast</option>
                        <option>Burgers</option>
                        <option>Coffee</option>
                        <option>Italian</option>
                        <option>Sandwiches</option>
                        <option>Pizza</option>
                     </FormControl>
                     <ControlLabel style={{marginTop: "15px"}}>Restaurant Description</ControlLabel>
                     <FormControl
                        componentClass="textarea"
                        value={this.state.rstDescription}
                        placeholder="Pat loves to make pastries of all kinds..."
                        onChange={this.handleDescriptionChange}
                     />
                     <FormControl.Feedback />
                     {!this.getValidationState() ? "" : <HelpBlock>Title and URL can not be empty.</HelpBlock>}
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