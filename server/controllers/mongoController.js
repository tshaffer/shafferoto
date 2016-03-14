var mongoose = require('mongoose');

var photos = [];

var Schema = mongoose.Schema;
var photoSchema = new Schema({
    title:  String,
    url: String,
    dateTaken: Date,
    orientation: Number,
    tags: [String],
    comments: [{ body: String, date: Date }],
});

var Photo = mongoose.model('Photo', photoSchema);

function initializeMongo() {

    mongoose.connect('mongodb://localhost/shafferotoTest');

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log("connected to shafferotoTest");

        // retrieve photos that are already in the database

        // find all photos
        Photo.find({}, function(err, photoDocs) {
            //Photo.find( { tags: { $in: ["drinks"] } }, function(err, photoDocs) {
            if (err) {
                console.log("error returned from mongoose query");
                return;
            }

            photoDocs.forEach(function(photoDoc) {
                photos.push( { title: photoDoc.title, url: photoDoc.url, orientation: photoDoc.orientation });
            });
        });

        return;

        //console.log('Look for photos in ' + photosDir);
        //photos = findPhotos(photosDir, photos);
        //
        //if (photos.length > 0) {
        //    getExifData(photos, 0);
        //}
    });
}

function savePhotosToDB(photos) {

    photos.forEach(function(photo) {

        var photoForDB = new Photo({
            title: photo.title,
            url: photo.url,
            tags: [],
            dateTaken: photo.dateTaken,
            orientation: photo.orientation
        });

        photoForDB.save(function (err) {
            if (err) return handleError(err);
        });
    });

    console.log("all photos submitted to save engine");
}

function handleError(err) {
    console.log("handleError invoked");
    return;
}

module.exports = {
    initializeMongo: initializeMongo
}
