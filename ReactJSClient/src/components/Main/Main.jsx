import React, { Component } from 'react';
import { Register, SignIn, CnvOverview, CnvDetail,
   ConfDialog, ErrorDialog } from '../index'
import { Route, Redirect, Switch } from 'react-router-dom';
import { Navbar, Nav, NavItem, ListGroup, 
   ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './Main.css';

var ProtectedRoute = ({component: Cmp, path, ...rest }) => {
   return (<Route path={path} render={(props) => {
      return Object.keys(rest.Prss).length !== 0 ?
      <Cmp {...rest} match={props.match} /> : <Redirect to='/signin'/>;}}/>);
   };
   
class Main extends Component {
   
   signedIn() {
      return Object.keys(this.props.Prss).length !== 0; // Nonempty Prss obj
   }

   // Function component to generate a Route tag with a render method 
   // conditional on login.  Params {conditional: Cmp to render if signed in}

   render() {
      console.log("Redrawing main");
      return (
         <div>
            <div>
               <Navbar>
                  <Navbar.Toggle />
                  {this.signedIn() ?
                     <Navbar.Text key={1}>
                        {`Logged in as: ${this.props.Prss.firstName}
                         ${this.props.Prss.lastName}`}
                     </Navbar.Text>
                     :
                     ''
                  }
                  <Navbar.Collapse>
                     <Nav>
                        {this.signedIn() ?
                           [
                              <LinkContainer key={"all"} to="/allCnvs">
                                 <NavItem>All Conversations</NavItem>
                              </LinkContainer>,
                              <LinkContainer key={"my"} to="/myCnvs">
                                 <NavItem>My Conversations</NavItem>
                              </LinkContainer>
                           ]
                           :
                           [
                              <LinkContainer key={0} to="/signin">
                                 <NavItem>Sign In</NavItem>
                              </LinkContainer>,
                              <LinkContainer key={1} to="/register">
                                 <NavItem>
                                    Register
                               </NavItem>
                              </LinkContainer>,
                           ]
                        }
                     </Nav>
                     {this.signedIn() ?
                        <Nav pullRight>
                           <NavItem eventKey={1}
                              onClick={() => this.props.signOut()}
                           >
                              Sign out
                           </NavItem>
                        </Nav>
                        :
                        ''
                     }
                  </Navbar.Collapse>
               </Navbar>
            </div>

            {/*Alternate pages beneath navbar, based on current route*/}
            <Switch>
               <Route exact path='/'
                  component={() => this.props.Prss ? <Redirect to="/allCnvs" />
                   : <Redirect to="/signin" />} />
               <Route path='/signout' component={() => {
                  this.props.signOut();
                  return (<Redirect to="/" />);
               }}/>
               <Route path='/signin' render={() => 
                  <SignIn {...this.props} />} />
               <Route path='/register'
                  render={() => <Register {...this.props} />} />
               <ProtectedRoute path='/allCnvs' component={CnvOverview}
                  {...this.props}/>
               <ProtectedRoute path='/myCnvs' component={CnvOverview}
                  userOnly="true" {...this.props}/>
               <ProtectedRoute path='/CnvDetail/:id' component={CnvDetail}
                  {...this.props}/>
               
               
             
            </Switch>

            {/*Error popup dialog*/}
            <ErrorDialog show={this.props.Errs.length > 0}
               title={'Error Notice'}
               Errs={this.props.Errs}
               onClose={() => this.props.clearErrs()}
               onResolve={(idx) => this.props.removeErr(idx)}
            />
            
         </div>
      )
   }
}

export default Main
