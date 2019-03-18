import React, { Component } from 'react';
import {
   Modal, Button, FormControl, ControlLabel, FormGroup, Glyphicon
} from 'react-bootstrap';
import Rating from 'react-rating';

export default class RevModal extends Component {
   constructor(props) {
      super(props);
      this.state = {
         revContent: (this.props.rev && this.props.rev.content) || "",
         revRating: ""
      }

      this.handleStarChange = this.handleStarChange.bind(this);
   }

   close = (result) => {
      this.props.onDismiss && this.props.onDismiss({
         status: result,
         content: this.state.revContent,
         rating: this.state.revRating
      });
   }

   getValidationState = () => {
      return null;
   }

   handleChange = (e) => {
      this.setState({ revContent: e.target.value });
   }

   handleStarChange = (value) => {
      this.setState({revRating: value.toString()});
   }

   componentWillReceiveProps = (nextProps) => {
      if (nextProps.showModal) {
         this.setState({ revContent: (nextProps.rev && nextProps.rev.content)
          || "" , revRating: ""})
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
                     <div>
                        <Rating 
                           emptySymbol={<Glyphicon bsSize='large' glyph="star-empty"></Glyphicon>}
                           fullSymbol={<Glyphicon bsSize='large' glyph="star"></Glyphicon>}
                           initialRating={this.state.revRating}
                           onChange={this.handleStarChange}
                        />
                     </div>
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