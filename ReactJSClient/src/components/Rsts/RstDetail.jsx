import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Col, Row, Button } from 'react-bootstrap';
import RevModal from '../Revs/RevModal';
import Rating from 'react-rating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons'
import { faSortUp as upVote } from '@fortawesome/free-solid-svg-icons' 
import { faSortDown as downVote } from '@fortawesome/free-solid-svg-icons' 
import "./RstDetail.css"

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
         this.props.updateRevs(matchId, undefined, undefined, () => {
            let a_matchId = this.props.match.params.id;
            let a_myRst = null;

            if (typeof(a_matchId) === 'string' && /^\d+$/.test(a_matchId))
            a_matchId = parseInt(a_matchId, 10);

            a_myRst = this.props.Rsts.find(cur => cur.id === a_matchId);

            if (a_myRst && this.props.Revs.hasOwnProperty(a_myRst.id)) {
               this.props.Revs[a_myRst.id].forEach(rev => this.props.updateVot(a_myRst.id, rev.id));
            }
         });
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

   handleUpVoteClick = (reviewId) => {
      // TODO: Integrate upvotes
   }

   handleDownVoteClick = (reviewId) => {
      // TODO: Integrate downvotes
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
            let myVot = this.props.Vots[rev.id] || 0;
            revItems.push(<RevItem
               key={rev.id}
               id={rev.id}
               email={rev.email}
               whenMade={rev.whenMade}
               content={rev.content}
               title={rev.title}
               rating={rev.rating}
               upVotes={rev.numUpvotes || 0}
               auVote={myVot}
               name={rev.firstName + " " + rev.lastName}
               handleUpVote={() => this.handleUpVoteClick(rev.id)}
               handleDownVote={() => this.handleDownVoteClick(rev.id)} />);
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
               <Col sm={1} style={{paddingRight: "0px"}}>
                  <Row>
                        <FontAwesomeIcon 
                           onClick={props.handleUpVote}
                           style={{padding: "0px", marginBottom: "-25px"}} 
                           icon={upVote} 
                           color={props.auVote === 1 ? "green" : ""}
                           size="5x"/>
                  </Row>
                  <Row>
                     <h4 style={
                           {padding: "0px", margin: "0px", marginTop: "-5px", 
                           marginBottom: "-5px", paddingLeft: "16.5px"}}>
                        {props.upVotes}
                     </h4>
                  </Row>
                  <Row>
                     <FontAwesomeIcon 
                     onClick={props.handleDownVote}
                     class="DownVoteButton"
                     className="DownVoteButton"
                     style={{padding: "0px", marginTop: "-25px", marginBottom: "-10px"}} 
                     icon={downVote} 
                     size="5x"/>
                  </Row>
               </Col>
               <Col sm={2} style={{paddingLeft: "0px"}}>
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
               <Col sm={9} style={{paddingLeft: "0px"}}>
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