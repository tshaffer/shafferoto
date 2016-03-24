var photosDir = '/Users/tedshaffer/Documents/Projects/shafferoto/server/public';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require("fs");
var sha1 = require('sha1');

var dbController = require('./controllers/mongoController');
dbController.initialize();

var exifReader = require('./controllers/nodeExif.js');

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

  var fetchAllPhotosPromise = dbController.fetchAllPhotos();
  fetchAllPhotosPromise.then(function(allPhotos) {
    var response = {};
    response.photos = allPhotos;
    res.send(response);
  });

});


app.get('/getTags', function(req, res) {

  console.log("getTags invoked");
  res.set('Access-Control-Allow-Origin', '*');

  var fetchAllTagsPromise = dbController.fetchAllTags();
  fetchAllTagsPromise.then(function(allTags) {
    var response = {};
    response.Tags = allTags;
    res.send(response);
  });

});


app.get('/addTag', function (req, res) {

  res.set('Access-Control-Allow-Origin', '*');

  var tagLabel = req.query.tagLabel;

  console.log("addTag invoked with parameter " + tagLabel);

  var addTagPromise = dbController.addTagToDB(tagLabel);
  addTagPromise.then(function() {
    res.send("tag added");
  });
});


app.get('/updateTags', function (req, res) {

  res.set('Access-Control-Allow-Origin', '*');

  var photosUpdateSpec = req.query.photosUpdateSpec;

  console.log("updateTags invoked");

  dbController.updateTags(photosUpdateSpec);
  res.send("tags updated");
});


app.get('/updateDB', function(req, res) {

console.log("updateDB invoked");
res.set('Access-Control-Allow-Origin', '*');

// retrieve photos that exist in db; get them in a hash table
var hashAllPhotosPromise = dbController.hashAllPhotos();
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
      var getExifDataPromise = exifReader.getAllExifData(photosToAdd);
      getExifDataPromise.then(function(photos) {
        console.log("getExifDataPromised resolved");


        dbController.savePhotosToDB(photos);
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
            root: "/",
            dir: dir,
            base: file,
            ext: "." + suffix,
            name: "file"
          });
          photo.url = path.relative(photosDir, filePath);
          photo.filePath = filePath;
          photo.dateTaken = Date.now();
          photo.orientation = 1;

          photoFiles.push(photo);

          // code that gets sha1
          //fs.readFile(filePath, function (err, data) {
          //  console.log("File read complete");
          //  var sha1 = sha1(data);
          //  console.log(foo);
          //});
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


var port = process.env.PORT || 3000;
app.listen(port);

