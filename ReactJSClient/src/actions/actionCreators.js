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
 * Retrieve a list of all restaurants, optionally filtered to those owned by
 * a particular user.
 * @param {?(number|string)} [userId] userId of owner (optional)
 * @param {?Function} [cb] callback function (optional)
 */
export function updateRsts(userId, cb) {
   return (dispatch, prevState) => {
      api.getRsts(userId)
      .then((rsts) => dispatch({ type: 'UPDATE_RSTS', rsts }))
      .then(() => {
         if (typeof(cb) === 'function')
            cb();
      })
      .catch(error => dispatch(prepareError('UPDATE_RSTS_ERR', error)));
   };
}

/**
 * Create a new restaurant
 * @param {{title: string}} newRst The restaurant info (title)
 * @param {?Function} [cb] callback function (optional)
 */
export function addRst(newRst, cb) {
   return (dispatch, prevState) => {
      api.postRst(newRst)
      .then((nRst) => dispatch({type: 'ADD_RST', rst: nRst}))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch(prepareError('ADD_RST_ERR', error)));
   };
}

/**
 * Updates a restaurant's title
 * @param {number} rstId ID of the restaurant to modify
 * @param {string} title new restaurant title
 * @param {?Function} [cb] callback function (optional)
 */
export function modRst(rstId, title, cb) {
   return (dispatch, prevState) => {
      api.putRst(rstId, {title})
      .then((rst) => dispatch({ type: 'UPDATE_RST', rst }))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch(prepareError('UPDATE_RST_ERR', error)));
   };
}

/**
 * Deletes a restaurant
 * @param {(number|string)} rstId the restaurant's ID
 */
export function delRst(rstId) {
   return (dispatch, prevState) => {
      api.delRst(rstId)
      .then(() => dispatch({ type: 'DEL_RST', rstId }))
      .catch(error => dispatch(prepareError('DEL_RST_ERR', error)));
   };
}

/**
 * Get all reviews for a given restaurant
 * @param {(number|string)} rstId the restaurant ID
 * @param {?(string|number|Date)} [dateTime] OPTIONAL: Inclusive upper bound
 * to return reviews from.
 * If included, must be either a nonnegative integer Number (or a
 * String which parses to a
 * nonnegative integer Number), or else a Date.
 * @param {?(number|string)} [num] OPTIONAL: Maximum number of reviews to
 * return.
 * @param {?function} [cb] OPTIONAL callback
 */
export function updateRevs(rstId, dateTime = undefined,
 num = undefined, cb = undefined) {
   return (dispatch, prevState) => {
      api.getRevs(rstId, dateTime, num)
      .then((revs) => dispatch({ type: 'UPDATE_REVS', rstId, revs}))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch(prepareError('UPDATE_REVS_ERR', error)));
   };
}

/**
 * Get one review
 * @param {(number|string)} revId the review id
 * @param {?function} [cb] OPTIONAL callback
 */
export function updateRev(revId, cb = undefined) {
     return (dispatch, prevState) => {
        api.getRev(revId)
        .then((rev) => console.log('DISPATCHANG ', Object.assign({}, rev, { id: revId })) || dispatch({
           type: 'UPDATE_REV',
           rstId: rev.rstId, 
           revId,
           rev: Object.assign({}, rev, { id: revId })
         }))
        .then(() => {if (cb) cb();})
        .catch(error => dispatch(prepareError('UPDATE_REV_ERR', error)));
     };
  }

/**
 * Post a new review to a rst
 * @param {(number|string)} rstId the rst ID
 * @param {{content: string}} newRev the review data (content)
 */
export function addRev(rstId, newRev) {
   return (dispatch, prevState) => {
      api.postRev(rstId, newRev)
      .then((rev) => dispatch({type: 'ADD_REV', rstId, rev}))
      .catch(error => dispatch(prepareError('ADD_REV_ERR', error)));
   };
}

/**
 * Post a new review to a rst
 * @param {(number|string)} revId the rev ID
 * @param {{ownerResponse: string}} revRsp the review response data (ownerResponse)
 */
export function addRevRsp(revId, rstId, revRsp) {
   return (dispatch, prevState) => {
      api.postRevRsp(revId, revRsp)
      .then((rev) => dispatch({type: 'UPDATE_REV', rstId, rev}))
      .catch(error => dispatch(prepareError('ADD_REV_RSP_ERR', error)));
   };
}

/**
 * Get a user's vote on a given review
 * @param {(number|string)} rstId the restaurant ID
 * @param {(number|string)} revId the review ID
 */
export function updateVot(rstId, revId) {
   return (dispatch, prevState) => {
      api.getVot(rstId, revId)
      .then((vote) => dispatch({ type: 'UPDATE_VOT', revId, vote}))
      .catch(error => dispatch(prepareError('UPDATE_VOT_ERR', error)));
   };
}

/**
 * Get a user's vote on a given review
 * @param {(number|string)} rstId the restaurant ID
 * @param {(number|string)} revId the review ID
 * @param {(number|string)} vote vote - MUST BE -1 OR 1
 * @param {?function} [cb] OPTIONAL callback
 */
export function modVot(rstId, revId, vote, cb = undefined) {
   return (dispatch, prevState) => {
      api.postVot(rstId, revId, vote)
      .then(() => api.getVot(rstId, revId))
      .then((vote) => dispatch({ type: 'UPDATE_VOT', revId, vote}))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch(prepareError('UPDATE_VOT_ERR', error)));
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