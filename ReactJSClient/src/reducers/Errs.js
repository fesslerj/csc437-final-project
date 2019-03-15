function Errs(state = [], action) {
   console.log("Errs reducing action " + action.type);
   switch(action.type) {
   case 'LOGIN_ERR':
   case 'LOGOUT_ERR':
   case 'REGISTER_ERR':
   case 'UPDATE_CNVS_ERR':
   case 'ADD_CNV_ERR':
   case 'UPDATE_CNV_ERR':
   case 'DEL_CNV_ERR':
   case 'UPDATE_MSGS_ERR':
   case 'ADD_MSG_ERR':
   case 'COMPONENT_ERR':
      return state.concat(action.errors);
   case 'SIGN_OUT':
   case 'CLEAR_ERRS':
      return []; // Clear user state
   case 'RESOLVE_ERR':
      return state.filter((err, idx) => idx !== action.index);
   default:
      return state;
   }
}

export default Errs;
