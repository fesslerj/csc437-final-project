import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import './RstCategories.css';

export default class RstCategories extends Component {
   constructor(props) {
      super(props);
      this.state = {
         showModal: false,
         showConfirmation: false,
      }
   }

   render() {
      let categories = [
         'Bakery',
         'Barbeque',
         'Chinese',
         'Deli',
         'Fine Dining',
         'Ice Cream',
         'Seafood',
         'Vegetarian',
         'Breakfast',
         'Burgers',
         'Coffee',
         'Italian',
         'Sandwiches',
         'Pizza'
      ];

      let catgEls = [];

      categories.forEach((ctg,idx) => {
         catgEls.push(<CatgItem 
            key={idx}
            category={ctg}
            />)
      });

      return (
         <section className="container">
            <h1>Radical Restaurants</h1>
            <h2>Restaurant Categories</h2>
            <ListGroup>
               {catgEls}
            </ListGroup>
         </section>
      )
   }
}

// A Category list item
const CatgItem = function (props) {
   return (
      <ListGroupItem>
         <Link to={`/Catg/${props.category}`}>{props.category}</Link>
      </ListGroupItem>
   )
}
