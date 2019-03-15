var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Msgs';

router.get('/:msgId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var query = 'select m.whenMade, p.email, m.content from Message m'
   + ' join Person p on m.prsId = p.id'
   + ' where m.id = ?';

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && cnn.chkQry(query, [req.params.msgId], cb);
   },
   function(msgs, fields, cb) {
      if (vld.check(msgs.length, Tags.notFound, null, cb)) {
         res.json(msgs.map(amsg => Object.assign({}, amsg,
          {whenMade: amsg.whenMade ? amsg.whenMade.getTime() : 0}))[0]);
         cb();
      }
   }],

   function(err) {
      req.cnn.release();
   });
});

module.exports = router;
