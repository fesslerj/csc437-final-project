import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Col, Row, Button } from 'react-bootstrap';
import RevModal from '../Revs/RevModal';
import Rating from 'react-rating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons'

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
               rating={rev.rating}
               name={rev.firstName + " " + rev.lastName} />);
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
         <section className="container">
            <Row>
               <Col sm={2}>
                  <Row>
                     <Rating 
                        emptySymbol={<FontAwesomeIcon icon={farStar} size="lg"/>}
                        fullSymbol={<FontAwesomeIcon icon={fasStar} size="lg" color="gold" />}
                        initialRating={props.rating}
                        readonly={true}
                     />
                     <p>{props.name}<br></br><a href={"mailto:" + props.email}>{props.email}</a></p>
                  </Row>
               </Col>
               <Col sm={10}>
                  <Row>
                     <h3 style={{padding: "0px", margin: "0px"}}>
                        {props.title}
                     </h3>
                     <p style={{color: "gray", marginBottom: "0px"}}>{new Intl.DateTimeFormat('us',
                        {
                           year: "numeric", month: "short", day: "numeric"
                        })
                        .format(new Date(props.whenMade))}</p>
                     <p style={{padding: "0px", margin: "0px"}}>
                        {props.content}
                     </p>
                  </Row>
               </Col>
            </Row>
         </section>
      </ListGroupItem>
   )
}