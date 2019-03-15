import * as api from '../api';
import { FetchError } from '../FetchError';

/**
 * Prepares for dispatching an error action
 * @param {string} type action type
 * @param {*} error error object - an Error or FetchError
 */
function prepareError(type, error) {
   return {type, errors: FetchError.flatten(
    FetchError.attachReason(error, type))}
}

/**
 * Sign in as a user with the specified login credentials
 * @param {{email: string, password: string}} credentials 
 * @param {?Function} [cb] callback function (optional)
 */
export function signIn(credentials, cb) {
   return (dispatch, prevState) => {
      api.signIn(credentials)
      .then((userInfo) => dispatch({type: "SIGN_IN", user: userInfo}))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch(prepareError('LOGIN_ERR', error)));
   };
}

/**
 * Delete the current session from the server (log out)
 * @param {?Function} [cb] callback function (optional)
 */
export function signOut(cb) {
   return (dispatch, prevState) => {
      api.signOut()
      .then(() => dispatch({ type: 'SIGN_OUT' }))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch(prepareError('LOGOUT_ERR', error)));
   };
}

/**
 * Register a new user with the provided user data
 * @param {api.PrssPostData} data user to register
 * @param {?Function} [cb] callback function (optional)
 */
export function register(data, cb) {
   return (dispatch, prevState) => {
      api.postPrs(data)
      .then(() => {if (cb) cb();})
      .catch(error => dispatch(prepareError('REGISTER_ERR', error)));
   };
}

/**
 * Retrieve a list of all conversations, optionally filtered to those owned by
 * a particular user.
 * @param {?(number|string)} [userId] userId of owner (optional)
 * @param {?Function} [cb] callback function (optional)
 */
export function updateCnvs(userId, cb) {
   return (dispatch, prevState) => {
      api.getCnvs(userId)
      .then((cnvs) => dispatch({ type: 'UPDATE_CNVS', cnvs }))
      .then(() => {
         if (typeof(cb) === 'function')
            cb();
      })
      .catch(error => dispatch(prepareError('UPDATE_CNVS_ERR', error)));
   };
}

/**
 * Create a new conversation
 * @param {{title: string}} newCnv The conversation info (title)
 * @param {?Function} [cb] callback function (optional)
 */
export function addCnv(newCnv, cb) {
   return (dispatch, prevState) => {
      api.postCnv(newCnv)
      .then((nCnv) => dispatch({type: 'ADD_CNV', cnv: nCnv}))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch(prepareError('ADD_CNV_ERR', error)));
   };
}

/**
 * Updates a conversation's title
 * @param {number} cnvId ID of the conversation to modify
 * @param {string} title new conversation title
 * @param {?Function} [cb] callback function (optional)
 */
export function modCnv(cnvId, title, cb) {
   return (dispatch, prevState) => {
      api.putCnv(cnvId, {title})
      .then((cnv) => dispatch({ type: 'UPDATE_CNV', cnv }))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch(prepareError('UPDATE_CNV_ERR', error)));
   };
}

/**
 * Deletes a conversation
 * @param {(number|string)} cnvId the conversation's ID
 */
export function delCnv(cnvId) {
   return (dispatch, prevState) => {
      api.delCnv(cnvId)
      .then(() => dispatch({ type: 'DEL_CNV', cnvId }))
      .catch(error => dispatch(prepareError('DEL_CNV_ERR', error)));
   };
}

/**
 * Get all messages for a given conversation
 * @param {(number|string)} cnvId the conversation ID
 * @param {?(string|number|Date)} [dateTime] OPTIONAL: Inclusive upper bound
 * to return messages from.
 * If included, must be either a nonnegative integer Number (or a
 * String which parses to a
 * nonnegative integer Number), or else a Date.
 * @param {?(number|string)} [num] OPTIONAL: Maximum number of messages to
 * return.
 */
export function updateMsgs(cnvId, dateTime = undefined,
 num = undefined) {
   return (dispatch, prevState) => {
      api.getMsgs(cnvId, dateTime, num)
      .then((msgs) => dispatch({ type: 'UPDATE_MSGS', cnvId, msgs}))
      .catch(error => dispatch(prepareError('UPDATE_MSGS_ERR', error)));
   };
}

/**
 * Post a new message to a cnv
 * @param {(number|string)} cnvId the cnv ID
 * @param {{content: string}} newMsg the message data (content)
 */
export function addMsg(cnvId, newMsg) {
   return (dispatch, prevState) => {
      api.postMsg(cnvId, newMsg)
      .then((msg) => dispatch({type: 'ADD_MSG', cnvId, msg}))
      .catch(error => dispatch(prepareError('ADD_MSG_ERR', error)));
   };
}

/**
 * Clear all errors
 */
export function clearErrs() {
   return (dispatch, prevState) => {
      return Promise.resolve()
       .then(() => dispatch({ type: 'CLEAR_ERRS'}));
   };
}

/**
 * Remove an error at index idx from the Errs array
 * @param {number} idx the error index to remove
 */
export function removeErr(idx) {
   return (dispatch, prevState) => {
      return Promise.resolve()
       .then(() => dispatch({ type: 'RESOLVE_ERR', index: idx}));
   };
}

/**
 * Add a new error to the Errs array
 * @param {any} error the error object - should be an instance
 * of Error or FetchError (or any other class derived from Error)
 */
export function throwErr(error) {
   return (dispatch, prevState) => {
      return Promise.resolve()
       .then(() => dispatch(prepareError('COMPONENT_ERR', error)));
   };
}