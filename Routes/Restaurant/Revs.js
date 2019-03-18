var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Revs';

router.get('/:revId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var query = 'select m.whenMade, p.email, m.content from Review m'
   + ' join Person p on m.prsId = p.id'
   + ' where m.id = ?';

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && cnn.chkQry(query, [req.params.revId], cb);
   },
   function(revs, fields, cb) {
      if (vld.check(revs.length, Tags.notFound, null, cb)) {
         res.json(revs.map(arev => Object.assign({}, arev,
          {whenMade: arev.whenMade ? arev.whenMade.getTime() : 0}))[0]);
         cb();
      }
   }],

   function(err) {
      req.cnn.release();
   });
});

module.exports = router;
