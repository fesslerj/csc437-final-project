export default function Rsts(state = [], action) {
   console.log("Rsts reducing action " + action.type);

   switch (action.type) {
      case 'UPDATE_RSTS': // Replace previous rsts
         return action.rsts;
      case 'UPDATE_RST':
         return state.map(val => val.id !== action.rst.id
          ? val
          : Object.assign({}, val, { title: action.rst.title }));
      case 'ADD_RST':
         return state.concat([action.rst]);
      case 'DEL_RST':
         return state.filter(rst => rst.id !== action.rstId);
      case 'SIGN_OUT':
         return []; // Clear user state
      default:
         return state;
   }
}
