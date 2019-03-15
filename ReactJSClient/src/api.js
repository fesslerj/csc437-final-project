import { fetchOK, expectArray, expectSingleton,
   translateErrors } from './fetching'

// Orderly interface to the REST server, providing:
// 1. Standard URL base
// 2. Standard headers to manage CORS and content type
// 3. Guarantee that 4xx and 5xx results are returned as
//    rejected promises, with a payload comprising an
//    array of user-readable strings describing the error.
// 4. All successful post operations return promises that
//    resolve to a JS object representing the newly added
//    entity (all fields, not just those in the post body)
// 5. Signin and signout operations that retain relevant
//    cookie data.  Successful signin returns promise 
//    resolving to newly signed in user.

const baseURL = "http://localhost:3001/";
const headers = new Headers();
var cookie;

headers.set('Content-Type', 'application/JSON');

const reqConf = {
   headers: headers,
   credentials: 'include',
   mode: 'cors'
};

/** Helper functions for the comon request types, automatically
 * adding verb, headers, and error management. */
export function post(endpoint, body, ignoreBody = false) {
   return translateErrors(fetchOK(baseURL + endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...reqConf
   }, ignoreBody), errorTranslate);
}

export function put(endpoint, body, ignoreBody = true) {
   return translateErrors(fetchOK(baseURL + endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...reqConf
   }, ignoreBody), errorTranslate);
}

export function get(endpoint, ignoreBody = false) {
   return translateErrors(fetchOK(baseURL + endpoint, {
      method: 'GET',
      ...reqConf
   }, ignoreBody), errorTranslate);
}

export function del(endpoint, ignoreBody = true) {
   return translateErrors(fetchOK(baseURL + endpoint, {
      method: 'DELETE',
      ...reqConf
   }, ignoreBody), errorTranslate);
}

/**
 * @typedef {Object} PrssPostData
 * @property {!string} email REQUIRED
 * @property {?string} [firstName] OPTIONAL
 * @property {!string} lastName REQUIRED
 * @property {?string} [password] OPTIONAL
 * @property {!number} role REQUIRED
 * @property {?boolean} [termsAccepted] OPTIONAL
 */

 /**
 * @typedef {Object} PrsGetData
 * @property {!string} email REQUIRED
 * @property {?string} [firstName] OPTIONAL
 * @property {!string} lastName REQUIRED
 * @property {!number} role REQUIRED
 * @property {?number} [termsAccepted] OPTIONAL
 * @property {?number} [whenRegistered] OPTIONAL
 */

 /**
  * @typedef {Object} CnvGetData
  * @property {!number} id
  * @property {!string} title
  * @property {!number} ownerId
  * @property {?number} [lastMessage]
  */

 /**
  * @typedef {Object} MsgGetDataWithId
  * @property {!number} id
  * @property {!number} whenMade
  * @property {!string} email
  * @property {!content} content
  */

/**
 * @typedef {Object} MsgGetDataNoId
 * @property {!number} whenMade
 * @property {!string} email
 * @property {!content} content
 */

// Functions for performing the api requests

/**
 * Sign a user into the service, returning a promise of the 
 * user data
 * @param {{email: string, password: string}} cred
 * @returns {Promise<PrsGetData>} resolving to the logged-in user
 */
export function signIn(cred) {
   return post("Ssns", cred, true)
    .then(({response}) => {
      let location = response.headers.get("Location").split('/');

      cookie = location[location.length - 1];
      return get("Ssns/" + cookie)
    })
    .then(({jsonBody}) => get('Prss/' + jsonBody.prsId))
    .then(({jsonBody}) => expectSingleton(jsonBody));
}

/**
 * @returns {Promise<{response: Response, jsonBody: null}>} resolves
 * to the result of the sign out request
 */
export function signOut() {
   let oldCookie = cookie;

   cookie = null;

   return (oldCookie !== undefined && oldCookie !== null
    ? del("Ssns/" + oldCookie)
    : Promise.resolve(true))
    .catch(err => {
      if (err.name === 'FetchError' && err.statusCode === 403) {
         return Promise.resolve(true);
      }
      else {
         throw err;
      }
   });
}

/**
 * Register a user without logging them in
 * @param {PrssPostData} user
 * @returns {Promise<{response: Response, jsonBody: null}>} resolves
 * to the result of the post request
 */
export function postPrs(user) {
   return post("Prss", user, true);
}

/**
 * Get all conversations, owned by the specified userId (if provided)
 * @param {(number|string)} userId user ID
 * @returns {Promise<CnvGetData[]>} resolves to a list of conversations
 */
export function getCnvs(userId = undefined) {
   return get("Cnvs" + ((typeof(userId) === 'number'
    || typeof(userId) === 'string') ? `?owner=${userId}` : ""))
    .then(({jsonBody}) => expectArray(jsonBody))
}

/**
 * Update a conversation's title.
 * @param {number} cnvId conversation ID
 * @param {{title: string}} body new conversation info (title)
 * @returns {Promise<CnvGetData>} resolves to the updated conversation
 */
export function putCnv(cnvId, body) {
   return put(`Cnvs/${cnvId}`, body)
    .then(() => get(`Cnvs/${cnvId}`))
    .then(({jsonBody}) => jsonBody);
}

/**
 * Create a new conversation.
 * @param {{title: string}} body new conversation info (title)
 * @returns {Promise<CnvGetData>} resolves to the info of the new
 * conversation
 */
export function postCnv(body) {
   return post('Cnvs', body, true)
    .then(({response}) => {
      let location = response.headers.get("Location").split('/');
      
      return get(`Cnvs/${location[location.length-1]}`);
    })
    .then(({jsonBody}) => jsonBody);
}

/**
 * Deletes a cnv
 * @param {(number|string)} cnvId the cnv ID
 */
export function delCnv(cnvId) {
   return del(`Cnvs/${cnvId}`);
}

/**
 * 
 * @param {(number|string)} cnvId ID of the conversation to fetch
 * messages from 
 * @param {?(Date|number|string)} [dateTime] Inclusive upper bound to
 * return messages from.
 * If included, must be either a nonnegative integer Number (or a
 * String which parses to a
 * nonnegative integer Number), or else a Date.
 * @param {?(number|string)} [num] Maximum number of messages to return.
 * @returns {Promise<MsgGetDataWithId[]>}
 */
export function getMsgs(cnvId, dateTime = undefined, num = undefined) {
   let paramDT = '';
   let paramNum = '';
   let paramString = '';

   if (typeof(dateTime) === 'number' && Number.isFinite(dateTime)) {
      paramDT = `dateTime=${dateTime}`;
   }
   else if (typeof(dateTime) === 'string' && /^\d+$/.test(dateTime)) {
      paramDT = `dateTime=${parseInt(dateTime, 10)}`;
   }
   else if (typeof(dateTime) === 'object'
    && Date.prototype.isPrototypeOf(dateTime)) {
      paramDT = `dateTime=${dateTime.getTime()}`;
   }
   else if (dateTime) {
      return Promise.reject(new TypeError("The parameter dateTime was an " +
       "unexpected type in API call getMsgs."));
   }
   
   if (typeof(num) === 'number' && Number.isFinite(num)) {
      paramNum = `num=${num}`;
   }
   else if (typeof(num) === 'string' && /^\d+/.test(num)) {
      paramNum = `num=${parseInt(num, 10)}`;
   }
   else if (num) {
      return Promise.reject(new TypeError("The parameter num was an " +
       "unexpected type in API call getMsgs."));
   }

   paramString = [paramDT, paramNum].filter(param => param).join('&');
   paramString = paramString && `?${paramString}`;

   return get(`Cnvs/${cnvId}/Msgs${paramString}`, false)
    .then(({jsonBody}) => expectArray(jsonBody));
}

/**
 * Post a new message to a cnv
 * @param {(number|string)} cnvId the cnv ID
 * @param {{content: string}} msg the message data to post
 * @returns {Promise<MsgGetDataWithId>}
 */
export function postMsg(cnvId, msg) {
   let retMsgId = null;

   return post(`Cnvs/${cnvId}/Msgs`, msg, true)
   .then(({response}) => {
      let location = response.headers.get("Location").split('/');

      retMsgId = location[location.length-1];
      return get(`Msgs/${retMsgId}`);
    })
    .then(({jsonBody}) => Object.assign({}, jsonBody, { id: retMsgId }));
}

const errMap = {
    en: {
        missingField: 'Field missing from request: ',
        badValue: 'Field has bad value: ',
        notFound: 'Entity not present in DB',
        badLogin: 'Email/password combination invalid',
        dupEmail: 'Email duplicates an existing email',
        noTerms: 'Acceptance of terms is required',
        forbiddenRole: 'Role specified is not permitted.',
        noOldPwd: 'Change of password requires an old password',
        oldPwdMismatch: 'Old password that was provided is incorrect.',
        dupTitle: 'Conversation title duplicates an existing one',
        dupEnrollment: 'Duplicate enrollment',
        forbiddenField: 'Field in body not allowed.',
        queryFailed: 'Query failed (server problem).'
    },
    es: {
        missingField: '[ES] Field missing from request: ',
        badValue: '[ES] Field has bad value: ',
        notFound: '[ES] Entity not present in DB',
        badLogin: '[ES] Email/password combination invalid',
        dupEmail: '[ES] Email duplicates an existing email',
        noTerms: '[ES] Acceptance of terms is required',
        forbiddenRole: '[ES] Role specified is not permitted.',
        noOldPwd: '[ES] Change of password requires an old password',
        oldPwdMismatch: '[ES] Old password that was provided is incorrect.',
        dupTitle: '[ES] Conversation title duplicates an existing one',
        dupEnrollment: '[ES] Duplicate enrollment',
        forbiddenField: '[ES] Field in body not allowed.',
        queryFailed: '[ES] Query failed (server problem).'
    },
    swe: {
        missingField: 'Ett fält saknas: ',
        badValue: 'Fält har dåligt värde: ',
        notFound: 'Entitet saknas i DB',
        badLogin: 'Email/lösenord kombination ogilltig',
        dupEmail: 'Email duplicerar en existerande email',
        noTerms: 'Villkoren måste accepteras',
        forbiddenRole: 'Angiven roll förjuden',
        noOldPwd: 'Tidiagre lösenord krav för att updatera lösenordet',
        oldPwdMismatch: 'Tidigare lösenord felaktigt',
        dupTitle: 'Konversationstitel duplicerar tidigare existerande titel',
        dupEnrollment: 'Duplicerad inskrivning',
        forbiddenField: 'Förbjudet fält i meddelandekroppen',
        queryFailed: 'Förfrågan misslyckades (server problem).'
    }
}

/**
 * @param {string} errTag
 * @param {string} lang
 */
export function errorTranslate(errTag, lang = 'en') {
    return errMap[lang] ? ((errMap[lang][errTag]
     && typeof(errMap[lang][errTag]) === 'string' ? errMap[lang][errTag]
     : 'Indescribable Error!') || 'Unknown Error!') : 'Unknown Language!';
}
