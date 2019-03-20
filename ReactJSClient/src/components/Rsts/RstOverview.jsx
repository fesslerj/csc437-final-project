import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Col, Row, Button,
   Glyphicon } from 'react-bootstrap';
import RstModal from './RstModal';
import { ConfDialog } from '../index';
import './RstOverview.css';

export default class RstOverview extends Component {
   constructor(props) {
      super(props);

      this.props.updateRsts();
      this.state = {
         showModal: false,
         showConfirmation: false,
      }
   }

   // Open a model with a |rst| (optional)
   openModal = (rst) => {
      const newState = { showModal: true };

      if (rst)
         newState.editRst = rst;
      this.setState(newState);
   }

   modalDismiss = (result) => {
      if (result.status === "Ok") {
         if (this.state.editRst)
            this.modRst(result);
         else
            this.newRst(result);
      }
      this.setState({ showModal: false, editRst: null });
   }

   modRst(result) {
      this.props.modRst(this.state.editRst.id, result.title, result.url, 
       result.description, result.category);
   }

   newRst(result) {
      this.props.addRst({ 
         title: result.title || null,
         url: result.url || null,
         category: result.category || null,
         description: result.description || null
      });
   }

   openConfirmation = (rst) => {
      this.setState({ delRst: rst, showConfirmation: true })
   }

   closeConfirmation = (res) => {
      if  (res === 'Yes') {
         this.props.delRst(this.state.delRst.id);
      }
      this.setState({delRst: null, showConfirmation: false});
   }

   render() {
      let matchId = this.props.byCatg ? this.props.match.params.catg : undefined;

      let rstItems = [];

      let allRsts = this.props.Rsts.concat([]).sort((a,b) =>
         b.lastReview - a.lastReview);

      allRsts.forEach(rst => {
         if ((!this.props.userOnly || this.props.Prss.id === rst.ownerId)
          && (!matchId || rst.category === matchId))
            rstItems.push(<RstItem
               key={rst.id}
               id={rst.id}
               title={rst.title}
               category={!matchId ? rst.category : undefined}
               lastReview={rst.lastReview}
               showControls={rst.ownerId === this.props.Prss.id
                || this.props.Prss.role}
               onDelete={() => this.openConfirmation(rst)}
               onEdit={() => this.openModal(rst)} />);
      });

      return (
         <section className="container">
            <h1>{matchId || (this.props.userOnly ? 'My Radical' : 'All Radical')} Restaurants</h1>
            <ListGroup>
               {rstItems}
            </ListGroup>
            <Button bsStyle={this.props.Prss.id ? "primary" : "primary hidden"} onClick={() => this.openModal()}>
               New Restaurant
            </Button>
            {/* Modal for creating and change rst */}
            <RstModal
               showModal={this.state.showModal}
               title={this.state.editRst ? "Edit title" : "New Restaurant"}
               catg={matchId}
               rst={this.state.editRst}
               onDismiss={this.modalDismiss} />
            <ConfDialog
               show={this.state.showConfirmation}
               title={"Delete Restaurant"}
               body={`Are you sure you wish to delete the restaurant `
                + `'${(this.state.delRst && this.state.delRst.title) || ""}'?`}
               buttons={["Yes", "No"]}
               onClose={(res) => { this.closeConfirmation(res); }}
               />
         </section>
      )
   }
}

// A Rst list item
const RstItem = function (props) {
   return (
      <ListGroupItem>
         <Row>
            <Col sm={4}><Link to={"/RstDetail/" + props.id}>{props.title}
               </Link>
            </Col>
            {props.category ? <Col key={`${props.id}/catg`} sm={3}>{props.category||''}</Col> : ''}
            <Col sm={3}>{props.lastReview ? new Intl.DateTimeFormat('us',
               {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit", second: "2-digit"
               })
               .format(new Date(props.lastReview)) : 'N/A'}</Col>
            {props.showControls ?
               <div className="pull-right">
                  <Button bsSize="small" onClick={props.onDelete}>
                     <Glyphicon glyph="trash" />
                  </Button>
                  <Button bsSize="small" onClick={props.onEdit}>
                     <Glyphicon glyph="edit" />
                  </Button>
               </div>
               : ''}
         </Row>
      </ListGroupItem>
   )
}
