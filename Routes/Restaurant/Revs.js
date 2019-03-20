var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var Voting = require('./VoteWeighing.js');

router.baseURL = '/Revs';

router.get('/:revId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var query = 'select r.rstId, p.firstName, p.lastName, r.whenMade, p.email,'
   + ' r.title, r.content,'
   + ' r.rating, r.ownerResponseWhenMade, r.ownerResponseContent from Review r'
   + ' join Person p on r.prsId = p.id'
   + ' where r.id = ?';

   // http://sqlfiddle.com/#!9/a78bff/48
   var votsFromRevQry = 'SELECT outerv.id, outerv.rstId, outerv.prsId, '
   + 'outerv.voteValue, pcol.count, pcol.sum '
   + 'FROM Vote outerv '
   + 'JOIN (SELECT p.id, SUM(rcol.count) as count, SUM(rcol.sum) as sum '
      + 'FROM Person p '
      + 'LEFT JOIN (SELECT r.id, r.prsId, updown.count, updown.sum '
         + 'FROM Review r '
         + 'JOIN (SELECT v.revId, COUNT(v.id) AS count, SUM(v.voteValue) '
            + 'AS sum '
            + 'FROM Vote v '
            + 'GROUP BY v.revId) updown '
         + 'ON updown.revId = r.id) rcol '
      + 'ON rcol.prsId = p.id '
      + 'GROUP BY p.id) pcol '
   + 'ON pcol.id = outerv.prsId '
   + 'WHERE outerv.revId = ? '
   + 'ORDER BY outerv.id';

   var revResult = null;

   async.waterfall([
   function(cb) {
      cnn.chkQry(query, [req.params.revId], cb);
   },
   function(revs, fields, cb) {
      if (vld.check(revs.length, Tags.notFound, null, cb)) {
         revResult = revs[0];
         cnn.chkQry(votsFromRevQry, [req.params.revId], cb);
      }
   },
   function(vots, fields, cb) {
      // id     rstId     prsId     voteValue     count     sum
      var weightedVotes = vots.reduce(Voting.WeightedVoteReducer, 0.0);
      var revObj = {
         rstId: revResult.rstId,
         whenMade: revResult.whenMade ? revResult.whenMade.getTime() : 0,
         firstName: revResult.firstName,
         lastName: revResult.lastName,
         email: revResult.email,
         title: revResult.title,
         content: revResult.content,
         rating: revResult.rating,
         numUpvotes: Math.floor(weightedVotes),
         ownerResponse: (revResult.ownerResponseWhenMade
          && revResult.ownerResponseContent)
          ? {
          whenMade: revResult.ownerResponseWhenMade,
          content: revResult.ownerResponseContent
          }
          : null
      };
      res.json(revObj);
      cb();
   }],

   function(err) {
      req.cnn.release();
   });
});

module.exports = router;
