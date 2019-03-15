import React, { PureComponent } from 'react';
import { Modal, Button, ListGroup, ListGroupItem, Col,
   Row, Glyphicon, Alert } from 'react-bootstrap';

/**
 * Properties expected:
 * show: boolean
 * body: string
 * buttons: Array<string>
 */
export default class ErrorDialog extends PureComponent {
   constructor(props) {
      super(props);
      console.log("Constructing ErrorDialog w/ ", props);
   }
   close = (result) => {
      this.props.onClose(result);
   }

   render() {
      console.log("ErrorDialog rerenders");

      var errList = [];
      this.props.Errs.forEach((err, errIdx) => {
         let tagList = (err.jsonErrorTags || []);
         let paramList = (err.jsonErrorParams || []);

         if (!tagList.length) {
            tagList = [err.reason + ': ' + (err.message || '')];
            paramList = [[]];
         }
         
         errList.push(<ListGroupItem key={errIdx}>
            <Alert bsStyle="danger">
               <Row>
                  <Col sm={12}>
                     {tagList.map((tag, tagIdx) =>
                        <Row key={`${errIdx}:${tagIdx}`}>
                           <Col>{tag} {paramList[tagIdx].join(', ')}</Col>
                        </Row>
                     )}
                     <div className="pull-right">
                        <Button bsSize="small" onClick={() => 
                         this.props.onResolve(errIdx)}>
                           <Glyphicon glyph="trash" />
                        </Button>
                     </div>
                  </Col>
               </Row>
            </Alert>
          </ListGroupItem>);
         
         
      });

      return (
         <Modal show={this.props.show} onHide={() => this.close("Dismissed")}>
            <Modal.Header closeButton>
               <Modal.Title>{this.props.title}</Modal.Title>
            </Modal.Header>
            <ListGroup>
            {
               errList
            }
            </ListGroup>
            <Modal.Footer>
               <Button onClick={() => this.close("Ok")}>Ok</Button>
            </Modal.Footer>
         </Modal>
      )
   }
}
