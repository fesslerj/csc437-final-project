var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var Voting = require('./VoteWeighing.js');

// HTTP error code constants
var httpOk = 200;
var errBadReq = 400;
var errUnauthorized = 401;
var errForbidden = 403;
var errNotFound = 404;
var errServer = 500;

var baseTen = 10;

router.baseURL = '/Vots';

router.get('/:rstId/:revId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var query = 'select v.voteValue'
   + ' from Vote v'
   + ' where v.rstId = ? and v.revId = ? and v.prsId = ?';

   var revId = typeof(req.params.revId) === 'number' ?
    req.params.revId
    : (typeof(req.params.revId)==='string' && /^\d+$/.test(req.params.revId) ?
    parseInt(req.params.revId, baseTen)
    : -1);
   var rstId = typeof(req.params.rstId) === 'number' ?
    req.params.rstId
    : (typeof(req.params.rstId)==='string' && /^\d+$/.test(req.params.rstId) ?
    parseInt(req.params.rstId, baseTen)
    : -1);
   
   var revResult = null;

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && cnn.chkQry(query, [rstId, revId, req.session.id], cb);
   },
   function(revs, fields, cb) {
      if (vld.check(revs.length, Tags.notFound, null, cb)) {
         res.json(revs[0]);
         cb();
      }
   }],

   function(err) {
      req.cnn.release();
   });
});

router.post('/:rstId/:revId', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var query = 'select v.id, v.voteValue'
   + ' from Vote v'
   + ' where v.rstId = ? and v.revId = ? and v.prsId = ?';

   var revId = typeof(req.params.revId) === 'number' ?
    req.params.revId
    : (typeof(req.params.revId)==='string' && /^\d+$/.test(req.params.revId) ?
    parseInt(req.params.revId, baseTen)
    : 0-1);
   var rstId = typeof(req.params.rstId) === 'number' ?
    req.params.rstId
    : (typeof(req.params.rstId)==='string' && /^\d+$/.test(req.params.rstId) ?
    parseInt(req.params.rstId, baseTen)
    : 0-1);
   var prsId = req.session && req.session.id;

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && vld.hasFields(body, ["voteValue"], cb)
       && vld.chain(typeof(body.voteValue) === 'number' &&
       (body.voteValue === -1 || body.voteValue === 1),
       Tags.badValue, ['voteValue'])
       .chain(rstId && rstId > 0, Tags.badValue, ['rstId'])
       .check(revId && revId > 0, Tags.badValue, ['revId'], cb)
       && cnn.chkQry(query, [rstId, revId, prsId], cb);
   },
   function(vots, fields, cb) {
      if (vots.length) {
         cnn.chkQry("update Vote set voteValue = ? where id = ?",
          [body.voteValue, vots[0].id], cb);
      } else {
         cnn.chkQry('insert into Vote set ?',
            {
               rstId: rstId,
               revId: revId,
               prsId: req.session.id,
               voteValue: body.voteValue
            },
         cb);
      }
   },
   function(insRes, fields, cb) {
      res.location(`/Vots/${rstId}/${revId}`).end();
      cb();
   }],

   function(err) {
      req.cnn.release();
   });
});

router.delete('/:rstId/:revId', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var query = 'select v.id, v.prsId'
   + ' from Vote v'
   + ' where v.rstId = ? and v.revId = ? and v.prsId = ?';

   var revId = typeof(req.params.revId) === 'number' ?
    req.params.revId
    : (typeof(req.params.revId)==='string' &&
    /^\d+$/.test(req.params.revId) ? parseInt(req.params.revId, baseTen)
    : 0-1);
   var rstId = typeof(req.params.rstId) === 'number' ?
    req.params.rstId
    : (typeof(req.params.rstId)==='string' &&
    /^\d+$/.test(req.params.rstId) ? parseInt(req.params.rstId, baseTen)
    : 0-1);
   var prsId = req.session && req.session.id;

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && vld.chain(rstId && rstId > 0, Tags.badValue, ['rstId'])
       .check(revId && revId > 0, Tags.badValue, ['revId'], cb)
       && cnn.chkQry(query, [rstId, revId, prsId], cb);
   },
   function(vots, fields, cb) {
      vld.check(vots.length, Tags.notFound, null, cb)
       && vld.checkPrsOK(vots[0].prsId, cb)
       && vld.check(vots[0].id, Tags.queryFailed, null, cb)
       && cnn.chkQry('delete from Vote where id = ?', [vots[0].id], cb);
   }],
   function(err) {
      !err && res.status(httpOk).end();
      cnn.release();
   });
});

module.exports = router;
