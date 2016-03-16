var photosDir = '/Users/tedshaffer/Documents/Projects/shafferoto/server/public';

var express = require('express');
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

app.get('/updateDB', function(req, res) {

  console.log("updateDB invoked");
  res.set('Access-Control-Allow-Origin', '*');

  // retrieve photos that exist in db; get them in a hash table
  var hashAllPhotosPromise = mongoController.hashAllPhotos();
  hashAllPhotosPromise.then(function(photosInDB) {

    console.log('Look for photos in ' + photosDir);
    var photosOnDrive = [];
    photosOnDrive = findPhotos(photosDir, photosOnDrive);

    if (photosOnDrive.length > 0) {

      // look for photosOnDrive that aren't in photosInDB
      var photosToAdd = [];
      photosOnDrive.forEach(function (photoOnDrive) {
        if ( !photosInDB.hasOwnProperty( photoOnDrive.url ) ) {
          photosToAdd.push(photoOnDrive);
        }
      });

      if (photosToAdd.length > 0) {
        var getExifDataPromise = getAllExifData(photosToAdd);
        getExifDataPromise.then(function(photos) {
          console.log("getExifDataPromised resolved");
          mongoController.savePhotosToDB(photos);
        });
      }
    }

    res.send("ok");
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

// http://www.html5rocks.com/en/tutorials/es6/promises/#toc-chaining
function getAllExifData(photos) {

  console.log("num photos is " + photos.length);
  var photoCount = photos.length;

  var photosWithExifData = [];

  return new Promise(function(resolve, reject) {

    var sequence = Promise.resolve();

// Loop through our chapter urls
    photos.forEach(function(photo) {
      // Add these actions to the end of the sequence
      sequence = sequence.then(function() {
        return getExifData(photo);
      }).then(function(photo) {
        photosWithExifData.push(photo);
        photoCount--;
        console.log("photoCount=" + photoCount);
        if (photoCount == 0) {
          resolve(photosWithExifData);
        }
      });
    });
  });
}


var getExifData = function getExifData(photo) {

  return new Promise(function(resolve, reject) {

    var filePath = photo.filePath;

    try {
      console.log("invoke exifImage for the file at: " + filePath);
      new ExifImage({ image : filePath }, function (error, exifData) {
        if (error) {
          //TODO need to continue on when this happens - this will definitely happen as I have photos with no exif data
          console.log("error returned from ExifImage");
          console.log('Error: '+ error.message);
          resolve(null);
        }
        else {
          var dateTaken;
          if (typeof exifData.exif.DateTimeOriginal == 'undefined') {
            dateTaken = Date.now();
          }
          else
          {
            dateTaken = parseDate(exifData.exif.DateTimeOriginal);
          }
          photo.dateTaken = dateTaken;

          var orientation;
          if (typeof exifData.image.Orientation == 'undefined') {
            orientation = 1;
          }
          else {
            orientation = exifData.image.Orientation;
          }
          photo.orientation = orientation;

          resolve(photo);
        }
      });
    } catch (error) {
      console.log('Error: ' + error.message);
      reject();
    }
  });
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

