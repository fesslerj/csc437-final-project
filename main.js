var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Session = require('./Routes/Session.js');
var Validator = require('./Routes/Validator.js');
var CnnPool = require('./Routes/CnnPool.js');
var async = require('async');

var app = express();

var applicationPort = 3001;

// HTTP error code constants
var httpOk = 200;
var errBadReq = 400;
var errUnauthorized = 401;
var errForbidden = 403;
var errNotFound = 404;
var errServer = 500;

var argvStart = 3;
var baseTen = 10;

for (var _l = argvStart; _l < process.argv.length; ++_l) {
   if (process.argv[_l-1] == '-p' && /^\d+$/.test(process.argv[_l])) {
      applicationPort = parseInt(process.argv[_l], baseTen);
   }
}

//app.use(function(req, res, next) {console.log("Hello"); next();});
// Static paths to be served like index.html and all client side js
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
   console.log("Handling " + req.path + '/' + req.method);
   res.header("Access-Control-Allow-Origin", "http://localhost:"
   + (applicationPort - 1).toString());
   res.header("Access-Control-Allow-Credentials", true);
   res.header("Access-Control-Allow-Headers", "Accept, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Access-Control-Request-Method, Cache-Control, Connection, Content-Length, Content-Type, Pragma, Host, Origin, Referer, User-Agent");
   res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
   res.header("Access-Control-Expose-Headers", "Location")
   next();
});

// No further processing needed for options calls.
app.options("/*", function(req, res) {
   res.status(httpOk).end();
});

// Static path to index.html and all clientside js
// Parse all request bodies using JSON
app.use(bodyParser.json());

// Attach cookies to req as req.cookies.<cookieName>
app.use(cookieParser());

// Set up Session on req if available
app.use(Session.router);

// Check general login.  If OK, add Validator to |req| and continue
// processing,
// otherwise respond immediately with 401 and noLogin error tag.
app.use(function(req, res, next) {
   console.log(req.path);
   if (req.session || (req.method === 'POST' &&
   (req.path === '/Prss' || req.path === '/Ssns') || req.method === 'GET')) {
      req.validator = new Validator(req, res);
      next();
   }
   else {
      res.status(errUnauthorized).end();
   }
});

// Add DB connection, with smart chkQry method, to |req|
app.use(CnnPool.router);

// Load all subroutes
app.use('/Prss', require('./Routes/Account/Prss.js'));
app.use('/Ssns', require('./Routes/Account/Ssns.js'));
app.use('/Rsts', require('./Routes/Restaurant/Rsts.js'));
app.use('/Revs', require('./Routes/Restaurant/Revs.js'));

// Special debugging route for /DB DELETE.  Clears all table contents,
//resets all auto_increment keys to start at 1, and reinserts one admin user.
app.delete('/DB', function(req, res) {
   var admin = req.session && req.session.isAdmin();
   
   if (admin) {  
      // Callbacks to clear tables
      var cbs = ["Restaurant", "Review", "Person"].map(function(tblName) {
         return function(cb) {
            req.cnn.query("delete from " + tblName, cb);
         };
      });
      
      // Callbacks to reset increment bases
      cbs = cbs.concat(["Restaurant", "Review", "Person"].map(
         function(tblName) {
            return function(cb) {
               req.cnn.query("alter table " + tblName + " auto_increment = 1",
               cb);
            };
         }));
         
         // Callback to reinsert admin user
         cbs.push(function(cb) {console.log('Adding admin...');
         req.cnn.query('INSERT INTO Person (firstName, lastName, email,'
         + ' password, whenRegistered, role) VALUES '
         + '("Joe", "Admin", "adm@11.com","password", NOW(), 1);', cb);
      });
      
      // Callback to clear sessions, release connection and return result
      cbs.push(function(callback){
         for (var session in Session.sessions)
         delete Session.sessions[session];
         callback();
      });
      
      async.series(cbs, function(err) {
         req.cnn.release();
         if (err)
         res.status(errBadReq).json(err);
         else
         res.status(httpOk).end();
      });
      
   }
   else {
      req.cnn.release();
      res.status(errForbidden).end();
   }
});

// Handler of last resort.  Print a stacktrace to console and send a
// 500 response.
app.use(function(req, res) {
   res.status(errNotFound).end();
   req.cnn && req.cnn.release();
});

app.use(function(err, req, res, next) {
   res.status(errServer).json(err.stack);
   req.cnn && req.cnn.release();
});

app.listen(applicationPort, function () {
   console.log('App Listening on port ' + applicationPort.toString());
});
