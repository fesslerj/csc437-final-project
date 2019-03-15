import { FetchError } from './FetchError';

/** Get a Promise to return the response body JSON
 * ONLY IF the response was OK (200-299) or 400.
 * If the response was a different status, then
 * the returned promise resolves to null.
 * If the response was OK and ignoreBody is truthy,
 * the returned promise also resolves to null.
 * @param {Response} response
 * @param {boolean} ignoreBody
 * @returns {Promise<any>} Promise: JSON response body, or NULL (based on
 * input conditions)
 **/
function getBodyPromise(response, ignoreBody = false) {
   return (response.status === 400 || (response.ok && !ignoreBody))
    ? response.json()
    : Promise.resolve(null);
}

/** Helper function to execute a fetch. The returned promise rejects if the
 * underlying call to fetch rejects, OR if the Response is not OK (200-299).
 * THE RETURNED PROMISE MAY REJECT WITH A FetchError.
 * The resolved return value is an object with two parameters, as follows:
 *   'response': the Response from the fetch call;
 *   'jsonBody': the JSON body of the Response, or NULL if ignoreBody is truthy
 * @param {RequestInfo} input
 * @param {RequestInit} init
 * @param {boolean} ignoreBody set to truthy to avoid fetching the body if
 * the response is OK
 * @returns resolves to the Response from the fetch call, and its JSON body
 * (or NULL) 
 **/
export function fetchOK(input, init, ignoreBody = false) {
   let responsePromise = fetch(input, init)
    .catch((err) => {throw new Error('Server connect error');});
   let jsonPromise = responsePromise
    .then((response) => getBodyPromise(response, ignoreBody));
   
   return Promise.all([responsePromise, jsonPromise])
    .then((array) => {
      if (array[0].ok) {
         return { response : array[0], jsonBody : array[1]};
      }
      else {
         throw new FetchError(array[0].status, array[1]);
      }
   });
}

/** Helper function to return the only element of a singleton array.
 * If the provided parameter is not an Array, throws a TypeError.
 * If the provided array is empty, returns null.
 * @param {Array} jsonBody expected to be an Array
 * @throws {TypeError} jsonBody must be an Array
 * @returns the first element of the array jsonBody, or null */
export function expectSingleton(jsonBody) {
   let arr = expectArray(jsonBody);
   
   return arr.length ? arr[0] : null;
}

/**Helper function to simply return the given array.
 * If the provided parameter is not an Array, throws a TypeError.
 * @param {Array} jsonBody expected to be an Array
 * @throws {TypeError} jsonBody must be an array
 * @returns the array jsonBody */
export function expectArray(jsonBody) {
   if (!Array.isArray(jsonBody)) {
      throw new TypeError('Expected response to be an array, '
      + 'but got a/an ' + typeof(jsonBody));
   }
   return jsonBody;
}

/**
 * Re-rejects the given Promise. If the rejection reason (error) is a
 * FetchError, translates the FetchError using the specified
 * translationHandler (and lang, optionally).
 * @param {Promise} promise the promise to translate any errors for
 * @param {import('./FetchError').translationCallback} translationHandler
 * the translation handler to use
 * @param {?string} [lang] (OPTIONAL) the language to translate into 
 * @returns {Promise<{response: Response, jsonBody}>} */
export function translateErrors(promise, translationHandler,
 lang = undefined) {
   return promise.catch((err) => {
      if (err instanceof FetchError
      || err.name === 'FetchError') {
         FetchError.prototype.translate.apply(err,
            [translationHandler, lang]);
      }
      throw err;
   });
}