var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var Voting = require('./VoteWeighing.js');

router.baseURL = '/Vots';

router.get('/:revId/:prsId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var query = 'select v.voteValue'
   + ' from Vote v'
   + ' where v.rstId = ? and v.revId = ?';

   var revResult = null;

   async.waterfall([
   function(cb) {
      cnn.chkQry(query, [req.params.rstId, req.params.revId], cb);
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

module.exports = router;
