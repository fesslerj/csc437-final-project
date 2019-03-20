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

var rstTitleMaxLength = 80;
var rstDescriptionMaxLength = 300;
var rstURLMaxLength = 80;
var rstCategoryMaxLength = 80;
var revContentMaxLength = 5000;
var revTitleMaxLength = 80;
var baseTen = 10;


router.baseURL = '/Rsts';

router.get('/', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (req.query.owner && vld.checkLoggedIn(cb)) {
         req.cnn.chkQry('select id, title, ownerId, category, url, description, lastReview from '
            + 'Restaurant where ownerId = ?', [req.query.owner], cb);
      }
      else {
         req.cnn.chkQry('select id, title, ownerId, category, url, description, lastReview from '
          + 'Restaurant', cb);
      }
   },
   function(rsts, fields, cb) {
      res.json(rsts.map(arst => Object.assign({}, arst, 
       {lastReview: arst.lastReview ? arst.lastReview.getTime() : null})));
      cb();
   }],

   function(err) {
      req.cnn.release();
   });
});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && vld.hasFields(body, ["title", "url", "category"], cb)
       && vld.check(typeof(body.title) === 'string'
       && body.title.length <= rstTitleMaxLength,
       Tags.badValue, ["title"], cb)
       && vld.check(typeof(body.url) === 'string'
       && body.url.length <= rstURLMaxLength,
       Tags.badValue, ["url"], cb)
       && vld.check(typeof(body.category) === 'string'
       && body.category.length <= rstCategoryMaxLength,
       Tags.badValue, ["category"], cb)
       && !body.description || (vld.check(typeof(body.description) === 'string'
       && body.description.length <= rstDescriptionMaxLength,
       Tags.badValue, ["description"], cb))
       && cnn.chkQry('select * from Restaurant where title = ?', 
       body.title, cb);
   },
   function(existingRst, fields, cb) {
      vld.check(!existingRst.length, Tags.dupTitle, null, cb)
       && cnn.chkQry("insert into Restaurant set ?",
       {title: body.title, url: body.url, category: body.category, 
         description: body.description || "", ownerId: req.session.id}, cb);
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });
});

router.get('/:rstId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
       vld.check(/^\d+$/.test(req.params.rstId), Tags.notFound, null, cb)
       && req.cnn.chkQry('select id, title, ownerId, category, url, description, lastReview from '
       + 'Restaurant where id = ?', [req.params.rstId], cb);
   },
   function(rsts, fields, cb) {
      if (vld.chain(rsts.length <= 1, Tags.queryFailed)
       .check(rsts.length, Tags.notFound, null, cb)) {
         res.json(rsts.map(arst => Object.assign({}, arst,
          {lastReview: arst.lastReview ? arst.lastReview.getTime() : 0}))
          [0]);
         cb();
      }
   }],

   function(err) {
      cnn.release();
   });
});

router.put('/:rstId', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var rstId = req.params.rstId;

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && vld.hasFields(body, ["title"], cb)
       && vld.check(typeof(body.title) === 'string'
       && body.title.length <= rstTitleMaxLength,
       Tags.badValue, ["title"], cb)
       && cnn.chkQry('select * from Restaurant where id = ?', [rstId], cb);
   },
   function(rsts, fields, cb) {
      vld.check(rsts.length, Tags.notFound, null, cb)
       && vld.checkPrsOK(rsts[0].ownerId, cb)
       && cnn.chkQry('select * from Restaurant where id <> ?'
       + ' and title = ?', [rstId, body.title], cb);
   },
   function(sameTtl, fields, cb) {
      vld.check(!sameTtl.length, Tags.dupTitle, null, cb)
       && cnn.chkQry("update Restaurant set title = ? where id = ?",
       [body.title, rstId], cb);
   }],
   function(err) {
      !err && res.status(httpOk).end();
      req.cnn.release();
   });
});

router.delete('/:rstId', function(req, res) {
   var vld = req.validator;
   var rstId = req.params.rstId;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && cnn.chkQry('select * from Restaurant where id = ?', [rstId], cb);
   },
   function(rsts, fields, cb) {
      vld.check(rsts.length, Tags.notFound, null, cb)
       && vld.checkPrsOK(rsts[0].ownerId, cb)
       && cnn.chkQry('delete from Restaurant where id = ?', [rstId], cb);
   }],
   function(err) {
      !err && res.status(httpOk).end();
      cnn.release();
   });
});

router.get('/:rstId/Revs', function(req, res) {
   var vld = req.validator;
   var rstId = req.params.rstId;
   var cnn = req.cnn;
   /*var myQueryA = 'select r.id, p.firstName, p.lastName, r.whenMade, p.email,'
    + ' r.content, r.title, r.rating, r.ownerResponseWhenMade,'
    + ' r.ownerResponseContent from'
    + ' Review r join Person p on'
    + ' r.prsId = p.id where r.rstId = ?';
   var myQueryB = ' order by r.whenMade asc, r.id asc';*/

   var myQueryA = 'SELECT hyrev.id, hyrev.firstName, hyrev.lastName, hyrev.whenMade, hyrev.email,'
   + ' hyrev.content, hyrev.title, hyrev.rating, hyrev.ownerResponseWhenMade,'
   + ' hyrev.ownerResponseContent, supcol.prsId AS supcolPrsId, supcol.voteValue, supcol.count, supcol.sum'
   + ' FROM (SELECT rrr.id, ppp.firstName, ppp.lastName, rrr.whenMade, ppp.email,'
   + ' rrr.content, rrr.title, rrr.rating, rrr.ownerResponseWhenMade,'
   + ' rrr.ownerResponseContent FROM Review rrr join Person ppp on'
   + ' rrr.prsId = ppp.id where rrr.rstId = ?';

   var myQueryB = ' ORDER BY rrr.whenMade ASC, rrr.id ASC) hyrev'
   + ' LEFT JOIN (SELECT outerv.id, outerv.rstId, outerv.revId, outerv.prsId, outerv.voteValue, pcol.count, pcol.sum'
   + ' FROM Vote outerv'
   + ' JOIN (SELECT p.id, SUM(rcol.count) as count, SUM(rcol.sum) as sum'
   + ' FROM Person p'
   + ' LEFT JOIN (SELECT r.id, r.prsId, updown.count, updown.sum'
   + ' FROM Review r'
   + ' JOIN (SELECT v.revId, COUNT(v.id) AS count, SUM(v.voteValue) AS sum'
   + ' FROM Vote v'
   + ' GROUP BY v.revId) updown ON updown.revId = r.id) rcol ON rcol.prsId = p.id'
   + ' GROUP BY p.id) pcol ON pcol.id = outerv.prsId'
   + ' ORDER BY outerv.id, outerv.rstId, outerv.prsId) supcol ON supcol.revId = hyrev.id'
   + ' ORDER BY hyrev.whenMade ASC, hyrev.id ASC';

   var revResult = null;

   // Some console logging for debgging purposes
   console.log("[[[[]]]]    [[[[]]]]   Handling RSTS/REV GET with RST id="
    + req.params.rstId.toString());
   if (req.query && ('dateTime' in req.query)) {
      console.log(' [][]  [] [][]  RSTS/REV GET : query DATETIME = '
       + ((typeof req.query.dateTime === 'undefined'
       || req.query.dateTime === null)
       ? '<null>'
       : req.query.dateTime.toString()));
   }
   if (req.query && ('num' in req.query)) {
      console.log(' [][]  [] [][]  RSTS/REV GET : query NUM = '
       + ((typeof req.query.num === 'undefined' || req.query.num === null)
       ? '<null>'
       : req.query.num.toString()));
   }


   async.waterfall([
   function(cb) {  // Check for existence of restaurant
       cnn.chkQry('select * from Restaurant where id = ?', [rstId], cb);
   },
   function(rsts, fields, cb) { // Get indicated reviews
      console.log(' [][] RSTS/REV GET - callback 2! rsts found = '
       + rsts.length.toString());
      if (vld.check(rsts.length, Tags.notFound, null, cb)) {
         var myParams = [rstId];
         var doQry = true;
         if ('dateTime' in req.query) {
            if (vld.check(/^\d+$/.test(req.query.dateTime), Tags.badValue,
             ['dateTime'], cb)) {
               myQueryA += ' and m.whenMade <= ?';
               myParams.push(new Date(parseInt(req.query.dateTime, baseTen)));
            }
            else {
               doQry = false;
            }
         }
         if ('num' in req.query) {
            if (vld.check(/^\d+$/.test(req.query.num), Tags.badValue,
             ['num'], cb)) {
               myQueryB += ' limit ?';
               myParams.push(parseInt(req.query.num, baseTen));
            }
            else {
               doQry = false;
            }
         }
         doQry && cnn.chkQry(myQueryA + myQueryB, myParams, cb);
     }
   },
   function(revs, fields, cb) { // Return retrieved reviews
      console.log(' [][] RSTS/REV GET - callback 3! revs returning: '
       + revs.length.toString());

      var newRevs = [];
      var newRevExists = function(chkId, chkIndex) {
         return function(rv, idx) {
            return rv.id === chkId && chkIndex !== idx;
         }
      };
      var erred = false;
      for (var j=0; j < revs.length; j++) {
         if (!newRevs.some(newRevExists(revs[j].id, j))) {
            newRevs.push(Object.assign({}, revs[j], {
               votes: [{
                  voteValue: revs[j].voteValue,
                  count: revs[j].count,
                  sum: revs[j].sum
               }]
            }));
         } else {
            /*var k = 0;
            var foundIdx = -1;
            var predicate = newRevExists(revs[j].id, j);
            while (k < newRevs.len) {
               if (predicate.call(undefined, newRevs[k], k, newRevs)) {
                  foundIdx = k;
                  break;
               }
               k++;
            }*/
            var foundIdx = newRevs.findIndex(newRevExists(revs[j].id, j));
            if (foundIdx >= 0) {
               newRevs[foundIdx].votes.push({
                  voteValue: revs[j].voteValue,
                  count: revs[j].count,
                  sum: revs[j].sum
               });
            } else {
               erred = true;
            }
         }
      }

      if (!erred) {
         newRevs = newRevs.map(nr => {
            var weightedVotes = nr.votes.reduce(Voting.WeightedVoteReducer, 0.0);
            var revObj = {
               id: nr.id,
               whenMade: nr.whenMade ? nr.whenMade.getTime() : 0,
               firstName: nr.firstName,
               lastName: nr.lastName,
               email: nr.email,
               title: nr.title,
               content: nr.content,
               rating: nr.rating,
               numUpvotes: Math.floor(weightedVotes),
               ownerResponse: (nr.ownerResponseWhenMade
                && nr.ownerResponseContent)
                ? {
                whenMade: nr.ownerResponseWhenMade,
                content: nr.ownerResponseContent
                }
                : null
            };
            return revObj;
         });
         res.json(newRevs);
         cb();
      } else {
         vld.check(false, Tags.queryFailed, null, cb);
      }

      /*res.json(revs.map(arev => Object.assign({}, arev,
       {whenMade: arev.whenMade ? arev.whenMade.getTime() : 0})));
      cb();*/
   }],
   function(err){
      cnn.release();
   });
});

router.post('/:rstId/Revs', function(req, res){
   var vld = req.validator;
   var cnn = req.cnn;
   var body = req.body || {};
   var rstId = req.params.rstId;
   var now;
   var resourceLoc;

   var opns = Object.getOwnPropertyNames(body);

   // some console logging, for debugging purposes
   console.log(">><<>><<    >><<>><<    Handling REV POST to RST id="
    + req.params.rstId.toString());
   for (var _i=0;_i<opns.length;_i++) {
      console.log('REV POST <> with param ' + opns[_i] + ': ' + 
       ((typeof body[opns[_i]] === 'undefined' || body[opns[_i]] === null)
       ? '<null>' : body[opns[_i]].toString()));
   }

   async.waterfall([
   function(cb) {
      console.log('REV POST :::: Callback #1 -- checking...');
      vld.checkLoggedIn(cb)
         && vld.hasFields(body, ["title", "content", "rating"], cb)
         && vld.check(typeof(body.title) === 'string'
         && body.title.length <= revTitleMaxLength,
         Tags.badValue, ["title"], cb)
         && vld.check(typeof(body.content) === 'string'
         && body.content.length <= revContentMaxLength,
         Tags.badValue, ["content"], cb)
         && vld.check(typeof(body.rating) === 'number',
         Tags.badValue, ["rating"], cb)
         && cnn.chkQry('select * from Restaurant where id = ?', [rstId], cb);
   },
   function(rsts, fields, cb) {
      console.log('REV POST <> callback 2! body.content=`'
       + ((typeof body.content === 'undefined' || body.content === null)
       ? '<null>' : body.content.toString()) + "'");
      console.log('REV POST <> rsts found: ' + rsts.length.toString());

      vld.check(rsts.length, Tags.notFound, null, cb)
       && cnn.chkQry('insert into Review set ?',
         {
            rstId: rstId,
            prsId: req.session.id,
            whenMade: now = new Date(),
            content: body.content,
            rating: body.rating,
            title: body.title
         },
       cb);
   },
   function(insRes, fields, cb) {
      console.log('REV POST <> callback 3!');

      resourceLoc = '/Revs/' + insRes.insertId;
      cnn.chkQry("update Restaurant set lastReview = ? where id = ?",
       [now, rstId], cb);
   },
   function(updRes, fields, cb) {
      console.log('REV POST <> callback FOUR - rows = '
       + updRes.affectedRows.toString());
      if (vld.check(updRes.affectedRows, Tags.queryFailed, null, cb)) {
         res.location(resourceLoc).end();
         cb();
      }
   }],
   function(err) {
      cnn.release();
   });
});

module.exports = router;
