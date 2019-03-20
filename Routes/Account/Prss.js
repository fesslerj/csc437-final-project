var Express = require('express');
var Tags = require('../Validator.js').Tags;
var async = require('async');
var mysql = require('mysql');

var router = Express.Router({caseSensitive: true});

// HTTP error code constants
var httpOk = 200;
var errBadReq = 400;
var errUnauthorized = 401;
var errForbidden = 403;
var errNotFound = 404;
var errServer = 500;

var baseTen = 10;

router.baseURL = '/Prss';

/* Much nicer versions
*/
router.get('/', function(req, res) {
   console.log('Prss ^^^^^^^^^^^^^^^^^^^^^ ssn = '
    + (req.session ? true : false).toString());

   if (!req.session) {
      req.cnn.release();
      res.status(errUnauthorized).end();
   }
   else {
      var admin = req.session && req.session.isAdmin();
      
      var email = admin && req.query.email ||
       !admin && req.session.email;

      var handler = function(err, prsArr) {
         res.json(prsArr);
         req.cnn.release();
      };

      console.log('PRSS: Handling GET with email=' + req.query.email);
      
      if (!admin) {
         if (req.query.email)
            req.cnn.chkQry("select id, email from Person where email = ? and "
             + "email like ?",
             [email, req.query.email.toString().replace('%','')+ '%'],
             handler);
         else
            req.cnn.chkQry('select id, email from Person where email = ?',
             [email], handler);
      }
      else {
         if (req.query.email)
            req.cnn.chkQry("select id, email from Person where email like ?",
             [req.query.email.toString().replace('%','') + '%'], handler);
         else
            req.cnn.chkQry('select id, email from Person', handler);
      }
   }
});

router.post('/', function(req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

   if (admin && !body.password)
      body.password = "*";                       // Blocking password
   body.whenRegistered = new Date();

   async.waterfall([
   function(cb) { // Check properties and search for Email duplicates
      vld.hasNonEmptyFields(body,
       ["email", "password", "lastName", "role"], cb)
       && vld.chain(body.role === 0 || admin, Tags.noPermission)
       .chain(body.termsAccepted || admin, Tags.noTerms)
       .check(body.role >= 0 && body.role <= 1, Tags.badValue, ["role"], cb)
       && cnn.chkQry('select * from Person where email = ?', body.email, cb);
   },
   function(existingPrss, fields, cb) { // If no duplicates, insert new Person
      if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
         body.termsAccepted = (body.termsAccepted
          && new Date()) || new Date(0);
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },
   function(result, fields, cb) { // Return location of inserted Person
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });

});

router.put('/:id', function(req, res) {
   // Class exercise
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && (req.session.isAdmin() || false);
   var cnn = req.cnn;

   var body = req.body;
   console.log('PRSS PUT <><><><> for id = ' + req.params.id.toString()
    + ' [ssn = ' + (req.session ? true : false).toString()
    + '] / ssnId = ' + (vld.session.id === req.params.id).toString());
   var opns = Object.getOwnPropertyNames(body);
   for (var _i=0;_i<opns.length;_i++) {
      console.log('PRSS PUT <> with param ' + opns[_i] + ': ' + 
       ((typeof body[opns[_i]] === 'undefined' || body[opns[_i]] === null)
       ? '<null>' : body[opns[_i]].toString()));
   }
   
   async.waterfall([
   function(cb) {
      vld.checkPrsOK(parseInt(req.params.id, baseTen), cb)
       && vld.doesNotHaveFields(body, ['termsAccepted', 'whenRegistered',
       'id', 'email'], cb)
       && vld.mayHaveNonEmptyFields(body, ['role', 'password'], cb)
       && vld.check(!('password' in body) || admin || ('oldPassword' in body),
       Tags.noOldPwd, null, cb)
       && cnn.chkQry('select * from Person where id = ?', [req.params.id],
       cb);
   },
   function(foundPrs, fields, cb) {
      var allowedKeys = ['firstName', 'lastName', 'password', 'role'];
      var myKeys;
      var badKeys = [];
      var updDat;
      var skip = true;
      
      if (vld.check(foundPrs.length, Tags.notFound, null, cb)
       && vld.chain(!('role' in body) || ((body.role === foundPrs[0].role
       || admin)
       && (typeof(body.role) === 'number' && body.role >= 0
       && body.role <= 1)), Tags.badValue, ['role'])
       .check(!('password' in body) || admin
       || body.oldPassword === foundPrs[0].password, Tags.oldPwdMismatch,
       null, cb)) {
         if (Object.getOwnPropertyNames(body).length) {
            delete body.oldPassword;
            myKeys = Object.getOwnPropertyNames(body);
            for (var _k = 0; _k < myKeys.length; _k++) {
               if (allowedKeys.indexOf(myKeys[_k]) < 0) {
                  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1');
                  console.log('bad key: ' + myKeys[_k]);
                  badKeys.push(myKeys[_k]);
               }
            }
            
            if (vld.check(!badKeys.length, Tags.forbiddenField, null, cb)) {
               updDat = vld.constrict(body, allowedKeys);
               updDat = Object.assign({}, updDat,
                {lastName: !(body.hasOwnProperty('lastName')
                && !body.lastName) ? updDat.lastName : ''});
               allowedKeys.map(function(ak) { skip = skip
                && (typeof(updDat[ak]) === 'function'); });
               if (!skip) {
                  cnn.chkQry('update Person set ? where id = ?', 
                   // taking advantage of how the mysql package,
                   // when escaping values, ignores any keys whose
                   // values are functions!
                   [updDat, req.params.id],
                   cb);
               }
               else {
                  cb(null, [], []);
               }
            }
         }
         else {
            //res.status(httpOk).end();
            cb(null, [], []);
         }
      }
   },
   function (result, fields, cb) {
      res.status(httpOk).end(); 
      cb();
   }],

   function(err) {
      cnn.release();
   });
});

router.get('/:id', function(req, res) {
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      vld.checkPrsOK(parseInt(req.params.id, baseTen), cb)
       && req.cnn.chkQry('select * from Person where id = ?',
       [req.params.id], cb);
   },
   function(prsArr, fields, cb) {
      if (vld.check(prsArr.length, Tags.notFound, null, cb)) {
         if (prsArr[0].whenRegistered)
            prsArr[0].whenRegistered = prsArr[0].whenRegistered.getTime();
         if (prsArr[0].termsAccepted)
            prsArr[0].termsAccepted = prsArr[0].termsAccepted.getTime();
         delete prsArr[0].password;
         res.json(prsArr);
         cb();
      }
   }],
   function(err) {
      req.cnn.release();
   });
});

router.delete('/:id', function(req, res) {
   var vld = req.validator;

   if (vld.checkAdmin())
      req.cnn.query('DELETE from Person where id = ?', [req.params.id],
      function (err, result) {
         !err && vld.check(result.affectedRows, Tags.notFound)
          && res.status(httpOk).end();
         req.cnn.release();
      });
   else {
      req.cnn.release();
   }
});

module.exports = router;
