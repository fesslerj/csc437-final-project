import React, { Component } from 'react';
import { Register, SignIn, RstOverview, RstDetail,
   ErrorDialog, RstCategories } from '../index'
import { Route, Redirect, Switch } from 'react-router-dom';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './Main.css';

var ProtectedRoute = ({component: Cmp, path, ...rest }) => {
   return (<Route path={path} render={(props) => {
      return Object.keys(rest.Prss).length !== 0 ?
      <Cmp {...rest} match={props.match} /> : <Redirect to='/signin'/>;}}/>);
   };

var OpenRoute = ({component: Cmp, path, ...rest }) => {
   return (<Route path={path} render={(props) => {
      return <Cmp {...rest} match={props.match} />}}/>);
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
                  <Navbar.Collapse>
                  
                     <Nav>
                        <a className="navbar-left" style={{marginRight: "10px"}} href="/allRsts">
                           <img alt="Logo" style={{marginTop: "7px", maxHeight: "30px"}} src="/r3logo.png"></img>
                        </a>
                        {this.signedIn() ?
                           [
                              <LinkContainer key={"all"} to="/allRsts">
                                 <NavItem>All Restaurants</NavItem>
                              </LinkContainer>,
                              <LinkContainer key={"catg"} to="/allCatgs">
                                 <NavItem>Categories</NavItem>
                              </LinkContainer>,
                              <LinkContainer key={"my"} to="/myRsts">
                                 <NavItem>My Restaurants</NavItem>
                              </LinkContainer>
                           ]
                           :
                           [
                              <LinkContainer key={"all"} to="/allRsts">
                                 <NavItem>All Restaurants</NavItem>
                              </LinkContainer>,
                              <LinkContainer key={"catg"} to="/allCatgs">
                                 <NavItem>Categories</NavItem>
                              </LinkContainer>
                           ]
                        }
                     </Nav>
                     <Nav pullRight>
                        {this.signedIn() ?
                           [
                              <Navbar.Text key={1}>
                                 {`Logged in as: ${this.props.Prss.firstName}
                                 ${this.props.Prss.lastName}`}
                              </Navbar.Text>,
                              <LinkContainer key={0} to="/signout">
                                 <NavItem>Sign Out</NavItem>
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
                              </LinkContainer>
                           ]
                        }
                     </Nav>
                     
                  </Navbar.Collapse>
               </Navbar>
            </div>

            {/*Alternate pages beneath navbar, based on current route*/}
            <Switch>
               <Route exact path='/'
                  component={() => <Redirect to="/allRsts" />} />
               <Route path='/signout' component={() => {
                  this.props.signOut();
                  return (<Redirect to="/allRsts" />);
               }}/>
               <Route path='/signin' render={() => 
                  <SignIn {...this.props} />} />
               <Route path='/register'
                  render={() => <Register {...this.props} />} />
               <OpenRoute path='/allRsts' component={RstOverview}
                  {...this.props}/>
               <OpenRoute path='/allCatgs' component={RstCategories}
                  {...this.props}/>
               <OpenRoute path='/Catg/:catg' component={RstOverview}
                  byCatg={true} {...this.props}/>
               <ProtectedRoute path='/myRsts' component={RstOverview}
                  userOnly="true" {...this.props}/>
               <OpenRoute path='/RstDetail/:id' component={RstDetail}
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
