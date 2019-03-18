import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Col, Row, Button } from 'react-bootstrap';
import MsgModal from '../Msgs/MsgModal';

export default class CnvDetail extends Component {
   constructor(props) {
      super(props);

      let matchId = this.props.match.params.id;
      let myCnv = null;

      if (typeof(matchId) === 'string' && /^\d+$/.test(matchId))
         matchId = parseInt(matchId, 10);

      myCnv = this.props.Cnvs.find(cur => cur.id === matchId);

      if (!myCnv) {
         this.props.throwErr(
          new Error('Error in component CnvDetail: Invalid Cnv ID'));
      }
      else {
         this.props.updateMsgs(matchId);
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
         this.newMsg(result);
      }
      this.setState({ showModal: false });
   }
 
   newMsg(result) {
      let matchId = this.props.match.params.id;
      
      if (typeof(matchId) === 'string' && /^\d+$/.test(matchId))
         matchId = parseInt(matchId, 10);

      this.props.addMsg(matchId, { content: result.content });
   }

   openConfirmation = (cnv) => {
      this.setState({ delCnv: cnv, showConfirmation: true })
   }

   closeConfirmation = (res) => {
      this.setState({showConfirmation: false});
   }
 
   render() {
      let matchId = this.props.match.params.id;
      let myCnv = null;

      if (typeof(matchId) === 'string' && /^\d+$/.test(matchId))
         matchId = parseInt(matchId, 10);

      myCnv = this.props.Cnvs.find(cur => cur.id === matchId);


      var msgItems = [];
 
      if (myCnv && this.props.Msgs.hasOwnProperty(myCnv.id)) {
         this.props.Msgs[myCnv.id].forEach(msg => {
            msgItems.push(<MsgItem
               key={msg.id}
               id={msg.id}
               email={msg.email}
               whenMade={msg.whenMade}
               content={msg.content} />);
         });
      }

      return (
         <section className="container">
            <h1>{(myCnv && myCnv.title) || ''}</h1>
            <ListGroup>
               {msgItems}
            </ListGroup>
            <Button bsStyle="primary" onClick={() => this.openModal()}>
               New Message
            </Button>
            {/* Modal for creating and change cnv */}
            <MsgModal
               showModal={this.state.showModal}
               title={"New Message"}
               msg={null}
               onDismiss={this.modalDismiss} />
         </section>
      );
   }
}

// A Message list item
const MsgItem = function (props) {
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