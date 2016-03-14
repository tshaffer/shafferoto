var photosDir = '/Users/tedshaffer/Documents/Projects/shafferoto/server/public';

var express = require('express');
//var request = require('request');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require("fs");

var mongoController = require('./controllers/mongoController');
mongoController.initializeMongo();

//https://github.com/gomfunkel/node-exif
var ExifImage = require('exif').ExifImage;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.send('<html><head></head><body><h1>Hello shafferoto!</h1></body></html>');
});

app.use('/photos', express.static(path.join(__dirname,'/public')));

app.get('/getPhotos', function(req, res) {

  console.log("getPhotos invoked");
  res.set('Access-Control-Allow-Origin', '*');

  var fetchAllPhotosPromise = mongoController.fetchAllPhotos();
  fetchAllPhotosPromise.then(function(allPhotos) {
    var response = {};
    response.photos = allPhotos;
    res.send(response);
  });

});

app.get('/getTaggedPhotos', function(req, res) {
  console.log("specified tag is " + req.query.tag);

  var response = '<html><head></head><body><h1>tag is ' + req.query.tag + '</h1></body></html>';
  res.send(response);
});

var photos = [];

console.log("launch shafferoto");

var photoFileSuffixes = ['jpg'];

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
          photo.url = path.relative(photosDir, filePath);
          photo.filePath = filePath;
          photo.dateTaken = Date.now();
          photo.orientation = 1;

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
    var filePath = photo.filePath;

    try {
      console.log("invoke exifImage for the file at: " + filePath);
      new ExifImage({ image : filePath }, function (error, exifData) {
        if (error) {
          console.log("error returned from ExifImage");
          console.log('Error: '+ error.message);
        }
        else {
          //console.log("return from invoke exifImage");

          var dateTaken;
          if (typeof exifData.exif.DateTimeOriginal == 'undefined') {
            //console.log("exif date data undefined for " + filePath);
            dateTaken = Date.now();
          }
          else
          {
            //console.log(exifData.exif.DateTimeOriginal);
            dateTaken = parseDate(exifData.exif.DateTimeOriginal);
          }
          photo.dateTaken = dateTaken;

          //console.log("typeof exifData.image.Orientation=" + (typeof exifData.image.Orientation).toString());

          var orientation;
          if (typeof exifData.image.Orientation == 'undefined') {
            orientation = 1;
          }
          else {
            orientation = exifData.image.Orientation;
          }
          photo.orientation = orientation;

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

