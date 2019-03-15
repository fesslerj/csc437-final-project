var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

// HTTP error code constants
var httpOk = 200;
var errBadReq = 400;
var errUnauthorized = 401;
var errForbidden = 403;
var errNotFound = 404;
var errServer = 500;

var cnvTitleMaxLength = 80;
var msgContentMaxLength = 5000;
var baseTen = 10;


router.baseURL = '/Cnvs';

router.get('/', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.checkLoggedIn(cb)) {
         if (req.query.owner) {
            req.cnn.chkQry('select id, title, ownerId, lastMessage from '
             + 'Conversation where ownerId = ?', [req.query.owner], cb);
         }
         else {
            req.cnn.chkQry('select id, title, ownerId, lastMessage from '
             + 'Conversation', cb);
         }
      }
   },
   function(cnvs, fields, cb) {
      res.json(cnvs.map(acnv => Object.assign({}, acnv, 
       {lastMessage: acnv.lastMessage ? acnv.lastMessage.getTime() : null})));
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
       && vld.hasFields(body, ["title"], cb)
       && vld.check(typeof(body.title) === 'string'
       && body.title.length <= cnvTitleMaxLength,
       Tags.badValue, ["title"], cb)
       && cnn.chkQry('select * from Conversation where title = ?', 
       body.title, cb);
   },
   function(existingCnv, fields, cb) {
      vld.check(!existingCnv.length, Tags.dupTitle, null, cb)
       && cnn.chkQry("insert into Conversation set ?",
       {title: body.title, ownerId: req.session.id}, cb);
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });
});

router.get('/:cnvId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && vld.check(/^\d+$/.test(req.params.cnvId), Tags.notFound, null, cb)
       && req.cnn.chkQry('select id, title, ownerId, lastMessage from '
       + 'Conversation where id = ?', [req.params.cnvId], cb);
   },
   function(cnvs, fields, cb) {
      if (vld.chain(cnvs.length <= 1, Tags.queryFailed)
       .check(cnvs.length, Tags.notFound, null, cb)) {
         res.json(cnvs.map(acnv => Object.assign({}, acnv,
          {lastMessage: acnv.lastMessage ? acnv.lastMessage.getTime() : 0}))
          [0]);
         cb();
      }
   }],

   function(err) {
      req.cnn.release();
   });
});

router.put('/:cnvId', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var cnvId = req.params.cnvId;

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && vld.hasFields(body, ["title"], cb)
       && vld.check(typeof(body.title) === 'string'
       && body.title.length <= cnvTitleMaxLength,
       Tags.badValue, ["title"], cb)
       && cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function(cnvs, fields, cb) {
      vld.check(cnvs.length, Tags.notFound, null, cb)
       && vld.checkPrsOK(cnvs[0].ownerId, cb)
       && cnn.chkQry('select * from Conversation where id <> ?'
       + ' and title = ?', [cnvId, body.title], cb);
   },
   function(sameTtl, fields, cb) {
      vld.check(!sameTtl.length, Tags.dupTitle, null, cb)
       && cnn.chkQry("update Conversation set title = ? where id = ?",
       [body.title, cnvId], cb);
   }],
   function(err) {
      !err && res.status(httpOk).end();
      req.cnn.release();
   });
});

router.delete('/:cnvId', function(req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      vld.checkLoggedIn(cb)
       && cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function(cnvs, fields, cb) {
      vld.check(cnvs.length, Tags.notFound, null, cb)
       && vld.checkPrsOK(cnvs[0].ownerId, cb)
       && cnn.chkQry('delete from Conversation where id = ?', [cnvId], cb);
   }],
   function(err) {
      !err && res.status(httpOk).end();
      cnn.release();
   });
});

router.get('/:cnvId/Msgs', function(req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;
   var myQueryA = 'select m.id, m.whenMade, p.email, m.content from'
    + ' Conversation c join Message m on m.cnvId = c.id join Person p on '
    + 'm.prsId = p.id where c.id = ?';
   var myQueryB = ' order by m.whenMade asc, m.id asc';

   // Some console logging for debgging purposes
   console.log("[[[[]]]]    [[[[]]]]   Handling CNVS/MSG GET with CNV id="
    + req.params.cnvId.toString());
   if (req.query && ('dateTime' in req.query)) {
      console.log(' [][]  [] [][]  CNVS/MSG GET : query DATETIME = '
       + ((typeof req.query.dateTime === 'undefined'
       || req.query.dateTime === null)
       ? '<null>'
       : req.query.dateTime.toString()));
   }
   if (req.query && ('num' in req.query)) {
      console.log(' [][]  [] [][]  CNVS/MSG GET : query NUM = '
       + ((typeof req.query.num === 'undefined' || req.query.num === null)
       ? '<null>'
       : req.query.num.toString()));
   }


   async.waterfall([
   function(cb) {  // Check for existence of conversation
      vld.checkLoggedIn(cb)
       && cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function(cnvs, fields, cb) { // Get indicated messages
      console.log(' [][] CNVS/MSG GET - callback 2! cnvs found = '
       + cnvs.length.toString());
      if (vld.check(cnvs.length, Tags.notFound, null, cb)) {
         var myParams = [cnvId];
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
   function(msgs, fields, cb) { // Return retrieved messages
      console.log(' [][] CNVS/MSG GET - callback 3! msgs returning: '
       + msgs.length.toString());
      res.json(msgs.map(amsg => Object.assign({}, amsg,
       {whenMade: amsg.whenMade ? amsg.whenMade.getTime() : 0})));
      cb();
   }],
   function(err){
      cnn.release();
   });
});

router.post('/:cnvId/Msgs', function(req, res){
   var vld = req.validator;
   var cnn = req.cnn;
   var body = req.body || {};
   var cnvId = req.params.cnvId;
   var now;
   var resourceLoc;

   var opns = Object.getOwnPropertyNames(body);

   // some console logging, for debugging purposes
   console.log(">><<>><<    >><<>><<    Handling MSG POST to CNV id="
    + req.params.cnvId.toString());
   for (var _i=0;_i<opns.length;_i++) {
      console.log('MSG POST <> with param ' + opns[_i] + ': ' + 
       ((typeof body[opns[_i]] === 'undefined' || body[opns[_i]] === null)
       ? '<null>' : body[opns[_i]].toString()));
   }

   async.waterfall([
   function(cb) {
      console.log('MSG POST :::: Callback #1 -- checking...');

      vld.checkLoggedIn(cb)
       && vld.chain(!('content' in body)
       || (typeof(body.content) === 'string'
       && body.content.length <= msgContentMaxLength),
       Tags.badValue, ['content'])
       .check(('content' in body) && body.content, Tags.missingField,
       ['content'], cb)
       && cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function(cnvs, fields, cb) {
      console.log('MSG POST <> callback 2! body.content=`'
       + ((typeof body.content === 'undefined' || body.content === null)
       ? '<null>' : body.content.toString()) + "'");
      console.log('MSG POST <> cnvs found: ' + cnvs.length.toString());

      vld.check(cnvs.length, Tags.notFound, null, cb)
       && cnn.chkQry('insert into Message set ?',
         {
            cnvId: cnvId,
            prsId: req.session.id,
            whenMade: now = new Date(),
            /* content not required, but must not be null */
            content: body.content || ""
         },
       cb);
   },
   function(insRes, fields, cb) {
      console.log('MSG POST <> callback 3!');

      resourceLoc = '/Msgs/' + insRes.insertId;
      cnn.chkQry("update Conversation set lastMessage = ? where id = ?",
       [now, cnvId], cb);
   },
   function(updRes, fields, cb) {
      console.log('MSG POST <> callback FOUR - rows = '
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
