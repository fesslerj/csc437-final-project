var Express = require('express');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var async = require('async');
var router = Express.Router({caseSensitive: true});

// HTTP error code constants
var httpOk = 200;
var errBadReq = 400;
var errUnauthorized = 401;
var errForbidden = 403;
var errNotFound = 404;
var errServer = 500;

router.baseURL = '/Ssns';

router.get('/', function(req, res) {
   var body = [], ssn;

   async.waterfall([
   function(cb) {
      if (req.validator.checkAdmin(cb)) {
         for (var cookie in ssnUtil.sessions) {
            ssn = ssnUtil.sessions[cookie];
            body.push(
             {
               cookie: cookie,
               prsId: ssn.id,
               loginTime: ssn.loginTime
             });
         }
         res.status(httpOk).json(body);
         cb();
      }
   }],
   function(err) {
      req.cnn.release();
   });
});

router.post('/', function(req, res) {
   var cookie;
   var cnn = req.cnn;

   cnn.query('select * from Person where email = ?', [req.body.email],
   function(err, result) {
      if (req.validator.check(result.length && result[0].password ===
       req.body.password, Tags.badLogin)) {
         cookie = ssnUtil.makeSession(result[0], res);
         res.location(router.baseURL + '/' + cookie)
          .status(httpOk).end();
      }
      cnn.release();
   });
});

// DELETE ..../SSns/ff73647f737f7
router.delete('/:cookie', function(req, res) {
   var admin = req.session && (req.session.isAdmin() || false);
   if (req.validator.check(admin
    || req.params.cookie === req.cookies[ssnUtil.cookieName],
    Tags.noPermission)) {
      ssnUtil.deleteSession(req.params.cookie);
      res.status(httpOk).end();
   }
   req.cnn.release();
});

router.get('/:cookie', function(req, res) {
   var cookie = req.params.cookie;
   var vld = req.validator;

   vld.checkPrsOK(ssnUtil.sessions[cookie].id)
    && res.json(
      {
         prsId: req.session.id,
         cookie: cookie,
         loginTime: req.session.loginTime
      });
   req.cnn.release();
});

module.exports = router;
