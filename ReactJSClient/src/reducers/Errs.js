function Errs(state = [], action) {
   console.log("Errs reducing action " + action.type);
   switch(action.type) {
   case 'LOGIN_ERR':
   case 'LOGOUT_ERR':
   case 'REGISTER_ERR':
   case 'UPDATE_RSTS_ERR':
   case 'ADD_RST_ERR':
   case 'UPDATE_RST_ERR':
   case 'DEL_RST_ERR':
   case 'UPDATE_REVS_ERR':
   case 'UPDATE_REV_ERR':
   case 'ADD_REV_ERR':
   case 'UPDATE_VOT_ERR':
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
