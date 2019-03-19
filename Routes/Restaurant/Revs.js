var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Revs';

var getBin = function(count, sum) {
   var ramp;
   var rawBin;

   count = count || 0;
   sum = sum || 0;

   ramp = (count < 0 ? 0 : (count > 10 ? 10 : count)) / 10.0;

   if (!count && !sum)
      count = 1;

   rawBin = (1.0*sum)/(1.0*count); // -1.0 <--> 1.0

   rawBin = (2.5 * (rawBin + 1.0)); // 0.0 <--> 5.0

   return (rawBin / 5.0) * ramp; // 0.0 <--> 1.0
}

var weighVote = function(voteObj) {
   voteObj = voteObj || {};
   var rawVote = (voteObj.voteValue || 0);
   var vCnt = voteObj.count;
   var vSum = voteObj.sum;

   var bin = getBin(vCnt, vSum);
   return rawVote * bin;
};

var voteReducer = function(acc, cur) {
   return weighVote(cur) + acc;
}

router.get('/:revId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var query = 'select m.rstId, m.whenMade, p.email, m.content, m.rating,'
   + ' m.ownerResponseWhenMade, m.ownerResponseContent from Review m'
   + ' join Person p on m.prsId = p.id'
   + ' where m.id = ?';

   // http://sqlfiddle.com/#!9/a78bff/48
   var votsFromRevQry = 'SELECT outerv.id, outerv.rstId, outerv.prsId, outerv.voteValue, pcol.count, pcol.sum '
   + 'FROM Vote outerv '
   + 'JOIN (SELECT p.id, SUM(rcol.count) as count, SUM(rcol.sum) as sum '
      + 'FROM Person p '
      + 'LEFT JOIN (SELECT r.id, r.prsId, updown.count, updown.sum '
         + 'FROM Review r '
         + 'JOIN (SELECT v.revId, COUNT(v.id) AS count, SUM(v.voteValue) AS sum '
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
      if (vld.check(vots.length, Tags.notFound, null, cb)) {
         // id     rstId     prsId     voteValue     count     sum
         var weightedVotes = vots.reduce(voteReducer, 1.0);
         var revObj = {
            rstId: revResult.rstId,
            whenMade: revResult.rstId ? revResult.rstId.getTime() : 0,
            email: revResult.email,
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
      }
   }],

   function(err) {
      req.cnn.release();
   });
});

module.exports = router;
