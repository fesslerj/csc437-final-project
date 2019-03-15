function getTag(err) {
   return err.tag
    && typeof(err.tag) === 'string'
    && err.hasOwnProperty('tag')
    && err.propertyIsEnumerable('tag')
    ? err.tag
    : '';
}

function getParams(err) {
   return err.params
    && Array.isArray(err.params)
    ? err.params.filter(param => typeof(param || '') === 'string')
    : [];
}

/**
 * Custom error class which is thrown when a fetch call succeeds, but
 * returns a Response with a non-200 status code.
 * If the Response has a 400 status code, FetchError also holds the
 * tags and params returned by the response body JSON, if any.
 */
export class FetchError extends Error {
   constructor(statusCode = 500,
    jsonErrorObjs = null,
    ...params) {
      // Pass remaining arguments (including vendor specific ones) to
      // parent constructor
      super(...params);

      // Maintains proper stack trace for where our error was thrown
      // (only available on V8)
      if (Error.captureStackTrace) {
         Error.captureStackTrace(this, FetchError);
      }

      // Custom debugging information
      this.name = 'FetchError';

      // invalid (placeholder) status code = HTTP 418 I'm a teapot
      // (https://tools.ietf.org/html/rfc2324)
      // (https://tools.ietf.org/html/rfc7168)
      this.statusCode = typeof(statusCode) === 'number' ? statusCode : 418;
      this.jsonErrors =
       (Array.isArray(jsonErrorObjs) ? jsonErrorObjs : []) || [];

      this.jsonErrorTags = this.jsonErrors.map((je) => getTag(je));
      this.jsonErrorParams = this.jsonErrors.map((je) => getParams(je));
   }

    

   /**
    * Translates every tag in the error, if any, using the specified
    * translation callback function.
    * @param {translationCallback} translationHandler
    */
   translate(translationHandler, lang) {
      let getNewTag = (oldTag) => {
         if (typeof(lang) === 'string' && lang)
               return translationHandler(oldTag, lang);
         else
               return translationHandler(oldTag);
      };

      this.jsonErrors = this.jsonErrors.map((err) => {
         let tag = getTag(err);

         if (tag)
               err.tag = getNewTag(tag);
         return err;
      });

      this.jsonErrorTags = this.jsonErrorTags.map(getNewTag);
      this.translate = function(){};

      return this;
   }

   /**
    * Flattens one error into an array of one or more errors.
    * If the oneOrMany param is a FetchError, returns an array
    * of multiple similar FetchErrors which each contain one of
    * the tag-param pairs contained in oneOrMany.
    * If oneOrMany is an array, returns the resulting array of
    * calling flatten for each element of oneOrMany.
    * @param {(Error|Error[])} oneOrMany 
    */
   static flatten(oneOrMany) {
      if (Array.isArray(oneOrMany) && typeof(oneOrMany.map) === 'function')
         return oneOrMany.map(one => FetchError.flatten(one));
      
      if (!oneOrMany) {
         return [null];
      }
      else if (oneOrMany instanceof Error && oneOrMany.name === 'FetchError') {
         return oneOrMany.jsonErrors.length <= 1
          ? [oneOrMany]
          : (oneOrMany.jsonErrors
            .map(err => Object.assign({},
               oneOrMany,
               {
                  jsonErrors: [err],
                  jsonErrorTags: [getTag(err)],
                  jsonErrorParams: [getParams(err)]
               }
            )));
      }
      else {
         return [oneOrMany];
      }
   }

   /**
    * Attaches a 'reason' property to the given error object.
    * The 'reason' indicates the redux action that encountered
    * this error.
    * @param {*} err error object
    * @param {*} reason error reason
    */
   static attachReason(err, reason) {
      if (err && ((err instanceof FetchError) || (err instanceof Error)))
         err.reason = reason;
      return err;
   }
}

/**
 * Callback function to perform translation.
 * @callback translationCallback
 * @param {string} errTag the error tag to translate
 * @param {string} lang (OPTIONAL) the language to translate into
 * @returns {string} the translated tag
 */