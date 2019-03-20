var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var Voting = require('./VoteWeighing.js');

router.baseURL = '/Vots';

router.get('/:rstId/:revId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var query = 'select v.voteValue'
   + ' from Vote v'
   + ' where v.rstId = ? and v.revId = ? and v.prsId = ?';

   var revId = typeof(req.params.revId) === 'number' ? releaseEvents.params.revId
    : (typeof(req.params.revId)==='string' && /^\d+$/.test(req.params.revId) ? parseInt(req.params.revId, 10)
    : -1);
   var rstId = typeof(req.params.rstId) === 'number' ? releaseEvents.params.rstId
    : (typeof(req.params.rstId)==='string' && /^\d+$/.test(req.params.rstId) ? parseInt(req.params.rstId, 10)
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

   var revId = typeof(req.params.revId) === 'number' ? releaseEvents.params.revId
    : (typeof(req.params.revId)==='string' && /^\d+$/.test(req.params.revId) ? parseInt(req.params.revId, 10)
    : -1);
   var rstId = typeof(req.params.rstId) === 'number' ? releaseEvents.params.rstId
    : (typeof(req.params.rstId)==='string' && /^\d+$/.test(req.params.rstId) ? parseInt(req.params.rstId, 10)
    : -1);

   async.waterfall([
   function(cb) {
      vld.checkPrsOK(prsId, cb)
       && vld.hasFields(body, ["voteValue"], cb)
       && vld.chain(typeof(body.voteValue) === 'number' && (body.voteValue === -1 || body.voteValue === 1),
       Tags.badValue, ['voteValue'])
       .chain(revId && revId > 0, Tags.badValue, ['revId'])
       .check(prsId && prsId > 0, Tags.badValue, ['prsId'], cb)
       && cnn.chkQry(query, [rstId, revId, prsId], cb);
   },
   function(revs, fields, cb) {
      if (revs.length) {
         cnn.chkQry("update Vote set voteValue = ? where id = ?",
          [body.voteValue, revs[0].id], cb);
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
      res.status(httpOk).end();
      cb();
   }],

   function(err) {
      req.cnn.release();
   });
});

module.exports = router;
