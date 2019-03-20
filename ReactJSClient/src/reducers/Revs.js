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
      case 'UPDATE_REV': // Replace ONLY ONE rev for a rst
         let myRev = state[action.rstId].map((rev, revIdx) => {
            return rev.id !== action.revId ? rev : action.rev;
         });
         
         if (myRev.findIndex((rev,revIdx) => rev.id === action.revId) === -1)
            myRev = myRev.concat([action.rev]);
         
         let curRst = {};
         curRst[action.rstId] = myRev;

         return Object.assign({},
            state,
            curRst);
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
