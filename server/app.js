var express = require('express');
//var request = require('request');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require("fs");

//https://github.com/gomfunkel/node-exif
var ExifImage = require('exif').ExifImage;

var app = express();

app.use('/assets', express.static(path.join(__dirname,'/public')));
app.use(bodyParser.json());
//app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.send('<html><head></head><body><h1>Hello shafferoto!</h1></body></html>');
});

// after boilerplate code
var mongoose = require('mongoose');

console.log("launch shafferoto");

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

  Photo = mongoose.model('Photo', photoSchema);

  photoFileSuffixes = ['jpg'];

  var photosDir = '/Users/tedshaffer/Documents/Miscellaneous/Personal/testPhotos';

  console.log('Look for photos in ' + photosDir);
  var photos = [];
  photos = findPhotos(photosDir, photos);

  if (photos.length > 0) {
    getExifData(photos, 0);
  }

  return;
});


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

          photoFiles.push(photo);
        }
      });
    }
  });
  return photoFiles;
};


function getExifData(photos, photoIndex) {

  console.log("getExifData invoked with photoIndex = " + photoIndex);

  if (photoIndex < photos.length) {
    var photo = photos[photoIndex];
    var filePath = photo.url;

    try {
      console.log("invoke exifImage");
      new ExifImage({ image : filePath }, function (error, exifData) {
        if (error) {
          console.log("error returned from ExifImage");
          console.log('Error: '+ error.message);
        }
        else {
          console.log("return from invoke exifImage");

          var dateTaken;
          if (typeof exifData.exif.DateTimeOriginal == 'undefined') {
            console.log("exif date data undefined for " + filePath);
            dateTaken = Date.now();
          }
          else
          {
            console.log(exifData.exif.DateTimeOriginal);
            dateTaken = parseDate(exifData.exif.DateTimeOriginal);
          }
          photo.dateTaken = dateTaken;

          photoIndex++;
          getExifData(photos, photoIndex);
        }
      });
    } catch (error) {
      console.log('Error: ' + error.message);
    }
  }
  else {
    console.log("exif retrieved for all photos");
    savePhotosToDB(photos);
  }
}


function savePhotosToDB(photos) {

  return;

  photos.forEach(function(photo) {

    var photoForDB = new Photo({
      title: photo.title,
      url: photo.url,
      tags: [],
      dateTaken: photo.dateTaken
    });

    photoForDB.save(function (err) {
      if (err) return handleError(err);
    });
  });

  console.log("all photos submitted to save engine");
}


function parseDate(dateIn) {

  // date input format looks like:
  //    2014:03:23 14:47:32

  var dateOut = new Date();
  dateOut.setFullYear(Number(dateIn.substring(0,4)));
  dateOut.setMonth(Number(dateIn.substring(5, 7)) - 1);
  dateOut.setDate(Number(dateIn.substring(8, 10)));
  dateOut.setHours(Number(dateIn.substring(11, 13)));
  dateOut.setMinutes(Number(dateIn.substring(14, 16)));
  dateOut.setSeconds(Number(dateIn.substring(17, 19)));
  console.log(dateOut.toString());
  return dateOut;
}


function handleError(err) {
  console.log("handleError invoked");
  return;
}


var port = process.env.PORT || 3000;
app.listen(port);

