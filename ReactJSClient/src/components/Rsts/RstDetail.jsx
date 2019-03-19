import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Col, Row, Button } from 'react-bootstrap';
import RevModal from '../Revs/RevModal';

export default class RstDetail extends Component {
   constructor(props) {
      super(props);

      let matchId = this.props.match.params.id;
      let myRst = null;

      if (typeof(matchId) === 'string' && /^\d+$/.test(matchId))
         matchId = parseInt(matchId, 10);

      myRst = this.props.Rsts.find(cur => cur.id === matchId);

      if (!myRst) {
         this.props.throwErr(
          new Error('Error in component RstDetail: Invalid Rst ID'));
      }
      else {
         this.props.updateRevs(matchId);
      }

      this.state = {
         showModal: false,
         showConfirmation: false,
      }
   }
 
    // Open a model
    openModal = () => {
       this.setState({ showModal: true });
    }
 
   modalDismiss = (result) => {
      if (result.status === "Ok") {
         // do something here
         this.newRev(result);
      }
      this.setState({ showModal: false });
   }
 
   newRev(result) {
      let matchId = this.props.match.params.id;
      
      if (typeof(matchId) === 'string' && /^\d+$/.test(matchId))
         matchId = parseInt(matchId, 10);

      this.props.addRev(matchId, { title: result.title, content: result.content, rating: parseInt(result.rating, 10) });
   }

   openConfirmation = (rst) => {
      this.setState({ delRst: rst, showConfirmation: true })
   }

   closeConfirmation = (res) => {
      this.setState({showConfirmation: false});
   }
 
   render() {
      let matchId = this.props.match.params.id;
      let myRst = null;

      if (typeof(matchId) === 'string' && /^\d+$/.test(matchId))
         matchId = parseInt(matchId, 10);

      myRst = this.props.Rsts.find(cur => cur.id === matchId);


      var revItems = [];
 
      if (myRst && this.props.Revs.hasOwnProperty(myRst.id)) {
         this.props.Revs[myRst.id].forEach(rev => {
            revItems.push(<RevItem
               key={rev.id}
               id={rev.id}
               email={rev.email}
               whenMade={rev.whenMade}
               content={rev.content}
               title={rev.title}
               rating={rev.rating} />);
         });
      }

      return (
         <section className="container">
            <h1>{(myRst && myRst.title) || ''} <small class="text-muted">{(myRst && myRst.category) || ''}</small></h1>
            <h4>
               <a href={(myRst && myRst.url) ? 
                (myRst.url.indexOf("http://") === 0 || myRst.url.indexOf("https://") === 0 
                ? myRst.url : 'http://' + myRst.url) : ''} target="_blank"  rel="noopener noreferrer">
                  {(myRst && myRst.url) || ''}
               </a>
            </h4>
            <p>{(myRst && myRst.description) || ''}</p>
            <ListGroup>
               {revItems}
            </ListGroup>
            <Button bsStyle={this.props.Prss.id ? "primary" : "primary hidden"} onClick={() => this.openModal()}>
               New Review
            </Button>
            {/* Modal for creating and change rst */}
            <RevModal
               showModal={this.state.showModal}
               title={"New Review"}
               rev={null}
               onDismiss={this.modalDismiss} />
         </section>
      );
   }
}

// A Review list item
const RevItem = function (props) {
   return (
      <ListGroupItem>
         <details open="true">
            <summary>
               <Row>
                  <Col sm={4}>{props.email}</Col>
                  <Col sm={4}>{new Intl.DateTimeFormat('us',
                     {
                        year: "numeric", month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit", second: "2-digit"
                     })
                     .format(new Date(props.whenMade))}</Col>
               </Row>
            </summary>
            <div>
               {props.content}
            </div>
         </details>
      </ListGroupItem>
   )
}