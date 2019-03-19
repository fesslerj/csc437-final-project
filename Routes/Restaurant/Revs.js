var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Revs';

router.get('/:revId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var query = 'select r.id, p.firstName, p.lastName, r.whenMade, p.email, r.content, r.title, r.rating from Review r'
   + ' join Person p on r.prsId = p.id'
   + ' where r.id = ?';

   async.waterfall([
   function(cb) {
      cnn.chkQry(query, [req.params.revId], cb);
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
