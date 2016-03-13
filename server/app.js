var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var fs = require("fs");

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

module.exports = app;

// after boilerplate code
var mongoose = require('mongoose');

console.log("launch shafferoto");

mongoose.connect('mongodb://localhost/shafferotoTest');

var app = express();
module.exports = app;

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

  photoFileSuffixes = ['jpg'];

  var photosDir = '/Users/tedshaffer/Documents/Miscellaneous/Personal/testPhotos';

  console.log('Look for photos in ' + photosDir);
  var photos = [];
  photos = findPhotos(photosDir, photos);

  var dateNow = Date.now();

  photos.forEach(function(photo) {

    var photoForDB = new Photo({
      title: photo.title,
      url: photo.url,
      tags: [],
      dateTaken: photo.dateTaken
    });

    photoForDB.save(function (err) {
      if (err) return handleError(err);
    })
  });

  console.log("all photos saved");

  return;
});

// List all files in a directory in Node.js recursively in a synchronous fashion
var readInProgress = false;
var ExifImage = require('exif').ExifImage;

function findPhotos(dir, photoFiles) {
  var fs = fs || require('fs');
  var files = fs.readdirSync(dir);
  photoFiles = photoFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      photoFiles = findPhotos(dir + '/' + file, photoFiles);
    }
    else {
      // save it if it's a photo file
      photoFileSuffixes.forEach(function(suffix) {
        if (file.toLowerCase().endsWith(suffix)) {

          var photo = {};
          photo.title = file;

          var filePath = path.format({
            root : "/",
            dir : dir,
            base : file,
            ext : "." + suffix,
            name : "file"
          });
          photo.url = filePath;
          photo.dateTaken = Date.now();

          console.log("almost invoke exifImage");

          if (!readInProgress) {
            readInProgress = true;
            try {
              console.log("invoke exifImage");
              new ExifImage({ image : filePath }, function (error, exifData) {
                if (error) {
                  console.log("error returned from ExifImage");
                  console.log('Error: '+ error.message);
                }
                else {
                  console.log(exifData.exif.DateTimeOriginal);
                  var dto = exifData.exif.DateTimeOriginal;
                  var dateTaken = new Date();
                  // date format looks like: 2014:03:23 14:47:32
                  dateTaken.setFullYear(Number(dto.substring(0,4)));
                  dateTaken.setMonth(Number(dto.substring(5, 7)) - 1);
                  dateTaken.setDate(Number(dto.substring(8, 10)));
                  dateTaken.setHours(Number(dto.substring(11, 13)));
                  dateTaken.setMinutes(Number(dto.substring(14, 16)));
                  dateTaken.setSeconds(Number(dto.substring(17, 19)));
                  console.log(dateTaken.toString());

                  photo.dateTaken = dateTaken;
                }
              });
            } catch (error) {
              console.log('Error: ' + error.message);
            }
          }

          photoFiles.push(photo);
        }
      });
    }
  });
  return photoFiles;
};

function handleError(err) {
  console.log("handleError invoked");
  return;
}




