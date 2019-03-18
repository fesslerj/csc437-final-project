export default function Revs(state = {}, action) {
   console.log("Revs reducing action " + action.type);

   // The array of revs from each rst are stored in this
   // array-like object Revs, indexed by rst id.
   switch (action.type) {
      case 'UPDATE_REVS': // Replace previous rsts
         let myRst = {};
         myRst[action.rstId] = action.revs;

         return Object.assign({},
          state,
          myRst);
      case 'ADD_REV':
         let theRst = state[action.rstId] || [];
         theRst = theRst.concat([action.rev]);
         
         let rstProp = {};
         rstProp[action.rstId] = theRst;

         return Object.assign({},
          state,
          rstProp);
      case 'SIGN_OUT':
         return {}; // Clear user state
      default:
         return state;
   }
}
