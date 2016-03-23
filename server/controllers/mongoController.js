var dbOpened = false;

var mongoose = require('mongoose');

var photos = [];

var Schema = mongoose.Schema;
var photoSchema = new Schema({
    title:  String,
    url: String,
    dateTaken: Date,
    orientation: Number,
    imageWidth: Number,
    imageHeight: Number,
    tags: [String],
    comments: [{ body: String, date: Date }],
});
var Photo = mongoose.model('Photo', photoSchema);

var tagSchema = new Schema ({
    label: String
});
var Tag = mongoose.model('Tag', tagSchema);

function initialize() {

    mongoose.connect('mongodb://localhost/shafferotoTest');

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log("connected to shafferotoTest");
        dbOpened = true;

        //console.log('Look for photos in ' + photosDir);
        //photos = findPhotos(photosDir, photos);
        //
        //if (photos.length > 0) {
        //    getExifData(photos, 0);
        //}
    });
}


function fetchAllPhotos() {

    return new Promise(function (resolve, reject) {

        if (dbOpened) {

            //Photo.find( { tags: { $in: ["drinks"] } }, function(err, photoDocs) {
            Photo.find({}, function (err, photoDocs) {
                if (err) {
                    console.log("error returned from mongoose query");
                    reject();
                }

                photos = [];
                photoDocs.forEach(function (photoDoc) {
                    photos.push({id: photoDoc.id, title: photoDoc.title, url: photoDoc.url, orientation: photoDoc.orientation, width: photoDoc.imageWidth, height: photoDoc.imageHeight, tags: photoDoc.tags });
                });

                resolve(photos);
            });
        }
        else {
            reject();
        }
    });
}


function hashAllPhotos() {

    return new Promise(function (resolve, reject) {

        if (dbOpened) {

            //Photo.find( { tags: { $in: ["drinks"] } }, function(err, photoDocs) {
            Photo.find({}, function (err, photoDocs) {
                if (err) {
                    console.log("error returned from mongoose query");
                    reject();
                }

                var hashedPhotos = {};
                photoDocs.forEach(function (photoDoc) {
                    hashedPhotos[photoDoc.url] = true;
                });

                resolve(hashedPhotos);
            });
        }
        else {
            reject();
        }
    });
}


function savePhotosToDB(photos) {

    photos.forEach(function(photo) {

        var photoForDB = new Photo({
            title: photo.title,
            url: photo.url,
            tags: [],
            dateTaken: photo.dateTaken,
            orientation: photo.orientation,
            imageWidth: photo.imageWidth,
            imageHeight: photo.imageHeight
        });

        photoForDB.save(function (err) {
            if (err) return handleError(err);
        });
    });

    console.log("all photos submitted to save engine");
}


function fetchAllTags() {

    return new Promise(function (resolve, reject) {

        if (dbOpened) {

            var tags = [];

            Tag.find({}, function (err, dbTags) {
                if (err) {
                    console.log("error returned from mongoose query");
                    reject();
                }

                dbTags.forEach(function (tagDoc) {
                    tags.push({label: tagDoc.label});
                });

                resolve(tags);
            });
        }
        else {
            reject();
        }
    });
};


function addTagToDB(tagLabel) {

    return new Promise(function (resolve, reject) {

        var tagForDB = new Tag({
            label: tagLabel
        });

        tagForDB.save(function (err) {
            if (err) {
                reject(err);
            }
            console.log("tag saved in db");
            resolve();
        });
    });

}


function assignTags(photosUpdateSpec) {

    var photosToUpdate = [];

    if (typeof photosUpdateSpec == "object") {
        photosUpdateSpec.forEach(function (photoUpdateSpec) {
            var photoToUpdate = JSON.parse(photoUpdateSpec);
            photosToUpdate.push(photoToUpdate);
        })
    }
    else {
        var photoUpdateSpec = JSON.parse(photosUpdateSpec);
        photosToUpdate.push(photoUpdateSpec);
    }

    photosToUpdate.forEach(function (photoToUpdate) {

        var id = photoToUpdate.id;
        var tags = photoToUpdate.tags;

        // for now, go ahead and try to do all of these immediately
        Photo.update({_id: id}, {$set: {tags: tags}}, function(err) {
            console.log("update complete, err = " + err);
        });
    });
}


function handleError(err) {
    console.log("handleError invoked");
    return;
}

module.exports = {
    initialize: initialize,
    fetchAllPhotos: fetchAllPhotos,
    hashAllPhotos: hashAllPhotos,
    savePhotosToDB: savePhotosToDB,
    fetchAllTags: fetchAllTags,
    addTagToDB: addTagToDB,
    assignTags: assignTags
}
