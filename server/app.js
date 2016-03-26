var photosDir = '/Users/tedshaffer/Documents/Projects/shafferoto/server/public';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require("fs");
var sha1 = require('sha1');
var easyImage = require("easyimage");

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

          var buildThumbnailsPromise = buildThumbnails(photos);
          buildThumbnailsPromise.then(function(obj) {
            console.log("thumbnails build complete");
          });

          //photos.forEach(function(photo) {
          //  console.log("create thumb for photo");
          //
          //  //dateTaken:2013-10-19T21:02:52.183Z
          //  //filePath:"/Users/tedshaffer/Documents/Projects/shafferoto/server/public/testPhotos/Tahoe/p... (length: 93)"
          //  //imageHeight:2448
          //  //imageWidth:3264
          //  //orientation:3
          //  //title:"photo (10).JPG"
          //  //url:"testPhotos/Tahoe/photo (10).JPG"
          //
          //  var targetHeight = 250;
          //  var heightRatio = photo.imageHeight / targetHeight;
          //  var targetWidth = photo.imageWidth / (photo.imageHeight / targetHeight);
          //
          //  var createThumbPromise = easyImage.resize({
          //    src: photo.filePath,
          //    dst: "foo.jpg",
          //    width: targetWidth,
          //    height: targetHeight
          //  });
          //  createThumbPromise.then(function (image) {
          //    console.log("created thumbnail");
          //  });
          //});
          //
          ////dbController.savePhotosToDB(photos);
        });
      }
    }

    res.send("ok");
  });
});


function buildThumbnails(photos) {

  var photoCount = photos.length;

  return new Promise(function(resolve, reject) {

    var sequence = Promise.resolve();

    photos.forEach(function(photo) {
      // Add these actions to the end of the sequence
      sequence = sequence.then(function() {
        return buildThumb(photo);
      }).then(function(photo) {
        //photosWithExifData.push(photo);
        photoCount--;
        console.log("photoCount=" + photoCount);
        if (photoCount == 0) {
          resolve(null);
        }
      });
    });
  });
}


function buildThumb(photo) {

  return new Promise(function(resolve, reject) {

    var targetHeight = 250;
    //var heightRatio = photo.imageHeight / targetHeight;
    var targetWidth = photo.imageWidth / (photo.imageHeight / targetHeight);

    var dirName = path.dirname(photo.filePath);
    var fileName = path.basename(photo.filePath);
    var ext = path.extname(photo.filePath);

    var thumbFileName = fileName.substring(0,fileName.length - ext.length)+"_thumb" + ext;
    var thumbPathName = path.join(dirName,thumbFileName);

    var createThumbPromise = easyImage.resize({
      src: photo.filePath,
      dst: thumbPathName,
      width: targetWidth,
      height: targetHeight
    });
    createThumbPromise.then(function (image) {
      console.log("created thumbnail");
      resolve(image);
    });
  });
}

//app.get('/updateDB', function(req, res) {
//
//  console.log("updateDB invoked");
//  res.set('Access-Control-Allow-Origin', '*');
//
//  // retrieve photos that exist in db; get them in a hash table
//  var hashAllPhotosPromise = dbController.hashAllPhotos();
//  hashAllPhotosPromise.then(function(photosInDB) {
//
//    console.log('Look for photos in ' + photosDir);
//    var photosOnDrive = [];
//    photosOnDrive = findPhotos(photosDir, photosOnDrive);
//
//    if (photosOnDrive.length > 0) {
//
//      // look for photosOnDrive that aren't in photosInDB
//      var photosToAdd = [];
//      photosOnDrive.forEach(function (photoOnDrive) {
//        if (!photosInDB.hasOwnProperty(photoOnDrive.url)) {
//          photosToAdd.push(photoOnDrive);
//        }
//      });
//
//      if (photosToAdd.length <= 0) {
//      }
//      else {
//        var photo = photosToAdd[0];
//        var filePath = photo.filePath;
//        var getInfoPromise = easyImage.info(filePath);
//        getInfoPromise.then(function (photoInfo) {
//          console.log("returned from easyImage");
//
//          var height = photoInfo.height;
//          var width = photoInfo.width;
//
//          var ratio = height / width;
//
//          var heightRatio = height / 250;
//
//          var targetWidth = width / (height / 250);
//          var targetHeight = 250;
//
//          var createThumbPromise = easyImage.resize({
//            src: filePath,
//            dst: "foo.jpg",
//            width: targetWidth,
//            height: targetHeight
//          });
//          createThumbPromise.then(function (image) {
//            console.log("created thumbnail");
//          });
//
//          //easyimg.resize({src:srcimg, dst: __dirname + '/output/resize.jpg', width:640, height:400}).then(function (file) {});
//
//          //var getExifDataPromise = exifReader.getAllExifData(photosToAdd);
//          //getExifDataPromise.then(function(photos) {
//          //  console.log("getExifDataPromised resolved");
//          //
//          //
//          //  dbController.savePhotosToDB(photos);
//          //});
//        });
//      }
//
//      res.send("ok");
//    }
//  });
//});

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

