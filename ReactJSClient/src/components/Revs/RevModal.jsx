import React, { Component } from 'react';
import {
   Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';
import Rating from 'react-rating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons'

export default class RevModal extends Component {
   constructor(props) {
      super(props);
      this.state = {
         revTitle: (this.props.rev && this.props.rev.title) || "",
         revContent: (this.props.rev && this.props.rev.content) || "",
         revRating: ""
      }

      this.handleStarChange = this.handleStarChange.bind(this);
   }

   close = (result) => {
      this.props.onDismiss && this.props.onDismiss({
         status: result,
         title: this.state.revTitle,
         content: this.state.revContent,
         rating: this.state.revRating
      });
   }

   getValidationState = () => {
      if (this.state.revTitle && this.state.revRating && this.state.revContent) {
         return null
      }
      return "warning";
   }

   handleBodyChange = (e) => {
      this.setState({ revContent: e.target.value });
   }

   handleTitleChange = (e) => {
      this.setState({ revTitle: e.target.value });
   }

   handleStarChange = (value) => {
      this.setState({revRating: value.toString()});
   }

   componentWillReceiveProps = (nextProps) => {
      if (nextProps.showModal) {
         this.setState({
            revTitle: (nextProps.rev && nextProps.rev.title) || "",
            revContent: (nextProps.rev && nextProps.rev.content) || "",
            revRating: (nextProps.rev && nextProps.rev.rating) || "",

         })
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
                     <ControlLabel>Review Title*</ControlLabel>
                     <FormControl
                        type="text"
                        value={this.state.revTitle}
                        placeholder="Example: I loved it!!"
                        onChange={this.handleTitleChange}
                     />
                     <ControlLabel style={{marginTop: "15px"}}>Review Body*</ControlLabel>
                     <FormControl
                        style={{height: "20em"}}
                        componentClass="textarea"
                        value={this.state.revContent}
                        placeholder="Enter text"
                        onChange={this.handleBodyChange}
                     />
                     <div style={{marginTop: "15px"}}>
                        <Rating 
                           emptySymbol={<FontAwesomeIcon icon={farStar} size="2x"/>}
                           fullSymbol={<FontAwesomeIcon icon={fasStar} size="2x" color="gold" />}
                           initialRating={this.state.revRating}
                           onChange={this.handleStarChange}
                        />
                     </div>
                     <FormControl.Feedback />
                     {!this.getValidationState() ? "": <HelpBlock style={{marginTop: "15px"}}>All fields, including star-rating, are required.</HelpBlock>}
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