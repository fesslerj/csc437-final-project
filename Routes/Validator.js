// HTTP error code constants
var httpOk = 200;
var errBadReq = 400;
var errUnauthorized = 401;
var errForbidden = 403;
var errNotFound = 404;
var errServer = 500;

// Create a validator that draws its session from |req|, and reports
// errors on |res|
var Validator = function(req, res) {
   this.errors = [];   // Array of error objects having tag and params
   this.session = req.session;
   this.res = res;
};

// List of errors, and their corresponding resource string tags
// An asterisk (*) at the start of an error's descriptive comment
// indicates that params[0] gives the field name for the error.
Validator.Tags = {
   noLogin: "noLogin",              //   No active session/login
   noPermission: "noPermission",    //   Login lacks permission.
   missingField: "missingField",    // * Field missing from request.
   badValue: "badValue",            // * Field has bad value.
   notFound: "notFound",            //   Entity not present in DB
   badLogin: "badLogin",            //   Email/password combination invalid
   dupEmail: "dupEmail",            //   Email duplicates an existing email
   noTerms: "noTerms",              //   Acceptance of terms is required.
   forbiddenRole: "forbiddenRole",  //   Cannot set to this role
   noOldPwd: "noOldPwd",            //   Change of password requires an
                                    //      old password
   dupTitle: "dupTitle",            //   Title duplicates an existing
                                    //      Conversation title
   queryFailed: "queryFailed",      //   A SQL query failed
   forbiddenField: "forbiddenField",// * A field given in the request body
                                    //      is forbidden
   oldPwdMismatch: "oldPwdMismatch" //   The oldPassword field did not match
                                    //      the password field
};

// Check |test|.  If false, add an error with tag and possibly empty array
// of qualifying parameters, e.g. name of missing field if tag is
// Tags.missingField.
//
// Regardless, check if any errors have accumulated, and if so, close the
// response with a 400 and a list of accumulated errors, and throw
//  this validator as an error to |cb|, if present.  Thus,
// |check| may be used as an "anchor test" after other tests have run w/o
// immediately reacting to accumulated errors (e.g. checkFields and chain)
// and it may be relied upon to close a response with an appropriate error
// list and call an error handler (e.g. a waterfall default function),
// leaving the caller to cover the "good" case only.
Validator.prototype.check = function(test, tag, params, cb) {
   if (!test)
      this.errors.push({tag: tag, params: params});

   if (this.errors.length) {
      if (this.res) {
         if (this.errors.map(anerr => anerr.hasOwnProperty('unauthorized')
          && anerr['unauthorized']).indexOf(true) >= 0)
            this.res.status(errUnauthorized).end();
         else if (this.errors[0].tag === Validator.Tags.noPermission)
            this.res.status(errForbidden).end();
         else
            this.res.status(errBadReq).json(this.errors);
         this.res = null;   // Preclude repeated closings
      }
      if (cb)
         cb(this);
   }
   return !this.errors.length;
};

// Somewhat like |check|, but designed to allow several chained checks
// in a row, finalized by a check call.
Validator.prototype.chain = function(test, tag, params) {
   !test && this.errors.push({tag: tag, params: params});
   return this;
};

Validator.prototype.checkAdmin = function(cb) {
   return this.check(this.session && this.session.isAdmin(),
    Validator.Tags.noPermission, null, cb);
};

// Validate that AU is the specified person or is an admin
Validator.prototype.checkPrsOK = function(prsId, cb) {
   return this.check(this.session &&
    (this.session.isAdmin() || this.session.id === prsId),
    Validator.Tags.noPermission, null, cb);
};

Validator.prototype.checkLoggedIn = function(cb) {
   !this.session && this.errors.push({unauthorized: true});
   return this.check(true, null, null, cb);
};

// Check presence of property in |obj| for all fields in fieldList
Validator.prototype.hasFields = function(obj, fieldList, cb) {
   var self = this;

   fieldList.forEach(function(name) {
      self.chain(obj.hasOwnProperty(name),
       Validator.Tags.missingField, [name]);
   });

   return this.check(true, null, null, cb);
};

// Check presence of truthy OR numerical property in |obj| for all fields
// in fieldList
Validator.prototype.hasNonEmptyFields = function(obj, fieldList, cb) {
   var self = this;

   fieldList.forEach(function(name) {
      var hasProp = obj.hasOwnProperty(name);
      var isNum = hasProp && (typeof(obj[name]) === 'number');
      var isTruthy = hasProp && obj[name];
      var isMissing = hasProp && !isNum && !isTruthy && (obj[name] === null
       || typeof(obj[name]) === 'undefined' || obj[name] === '');
      self.chain(isNum || isTruthy, 
       (hasProp && !isNum && !isTruthy && !isMissing)
       ? Validator.Tags.badValue : Validator.Tags.missingField,
       [name]);
   });

   return this.check(true, null, null, cb);
};

// Ensure the absence in |obj| of all fields in fieldList
Validator.prototype.doesNotHaveFields = function(obj, fieldList, cb) {
   var self = this;

   fieldList.forEach(function(name) {
      self.chain(!obj.hasOwnProperty(name), Validator.Tags.forbiddenField,
       [name]);
   });

   return this.check(true, null, null, cb);
};

// In |obj| for all fields in fieldList, ensure that each field either is
// absent OR exists but is truthy/numerical
Validator.prototype.mayHaveNonEmptyFields = function(obj, fieldList, cb) {
   var self = this;

   fieldList.forEach(function(name) {
      self.chain(!obj.hasOwnProperty(name) || 
       (typeof(obj[name]) === 'number' || (obj[name])),
       Validator.Tags.badValue, [name]);
   });

   return this.check(true, null, null, cb);
};

// Constructs a new object from a given |src| object, restricted to only the
// given keys. If any of the given keys are absent from |src|, assigns the to
// the result but with a Function-typed value. Since the mysql package skips
// all Function-valued properties when escaping values, this ensures that the
// returned object can contain, at most, the given keys - and that whichever
// keys are to be considered 'absent' from it are not actually present after
// escaping.
Validator.prototype.constrict = function(src, keys) {
   var result = {};
   var applier = function(name) {
      result[name] = src.hasOwnProperty(name) ? src[name] : function(){};
   };
   
   keys.map(applier);
   return result;
}

module.exports = Validator;
