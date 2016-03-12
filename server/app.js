var photosDir = '/Users/tedshaffer/Documents/Miscellaneous/Personal/photos';

var express = require('express');
var mongoose = require('mongoose');

console.log("launch shafferoto");

photoFileSuffixes = ['jpg'];

console.log('Look for photos in ' + photosDir);
var filelist = [];
filelist = findPhotos(photosDir, filelist);

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/shafferotoTest');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected to shafferotoTest");

  var Schema = mongoose.Schema;

  var photoSchema = new Schema({
    title:  String,
    url: String,
    dateTaken: Date,
    tags: [String],
    comments: [{ body: String, date: Date }],
  });

  var Photo = mongoose.model('Photo', photoSchema);

  var dateNow = Date.now();

  var photo = new Photo({
    title: 'First photo',
    url: 'http://www.eatPizza.com/photo.jpg',
    tags: ['Sam', 'Joel'],
    dateTaken: dateNow
  });

  photo.save(function (err) {
    if (err) return handleError(err);
    console.log("photo saved");
  })

});

function handleError(err) {
  console.log("handleError invoked");
  return;
}

return;


var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

console.log("launch shafferoto");

module.exports = app;


// List all files in a directory in Node.js recursively in a synchronous fashion
function findPhotos(dir, filelist) {
  var fs = fs || require('fs');
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      // save it if it's a photo file
      photoFileSuffixes.forEach(function(suffix) {
        if (file.endsWith(suffix)) {
          filelist.push(file);
        }
      });
    }
  });
  return filelist;
};