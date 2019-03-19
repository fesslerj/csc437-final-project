export default function Rsts(state = {}, action) {
   console.log("Vots reducing action " + action.type);

   switch (action.type) {
      case 'UPDATE_VOT':
         let newObj = {};
         newObj[action.revId] = action.vote;

         return Object.assign({},
            state,
            newObj);
      case 'SIGN_OUT':
         return {}; // Clear user state
      default:
         return state;
   }
}
