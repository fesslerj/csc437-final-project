export default function Msgs(state = {}, action) {
   console.log("Msgs reducing action " + action.type);

   // The array of msgs from each cnv are stored in this
   // array-like object Msgs, indexed by cnv id.
   switch (action.type) {
      case 'UPDATE_MSGS': // Replace previous cnvs
         let myCnv = {};
         myCnv[action.cnvId] = action.msgs;

         return Object.assign({},
          state,
          myCnv);
      case 'ADD_MSG':
         let theCnv = state[action.cnvId] || [];
         theCnv = theCnv.concat([action.msg]);
         
         let cnvProp = {};
         cnvProp[action.cnvId] = theCnv;

         return Object.assign({},
          state,
          cnvProp);
      case 'SIGN_OUT':
         return {}; // Clear user state
      default:
         return state;
   }
}
