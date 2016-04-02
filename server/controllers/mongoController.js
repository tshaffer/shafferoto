var dbOpened = false;

var mongoose = require('mongoose');
require('datejs');

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
    thumbUrl: String,
    comments: [{ body: String, date: Date }],
});
var Photo = mongoose.model('Photo', photoSchema);

var photosQuerySchema = new Schema({
    title:  String,
    url: String,
    dateTaken: Date,
    orientation: Number,
    imageWidth: Number,
    imageHeight: Number,
    tags: [String],
    thumbUrl: String,
    comments: [{ body: String, date: Date }],
});
var PhotosQuery = mongoose.model('PhotosQuery', photosQuerySchema);

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
    });
}


function fetchAllPhotos() {

    return new Promise(function (resolve, reject) {

        if (dbOpened) {

            Photo.find({}, function (err, photoDocs) {
                if (err) {
                    console.log("error returned from mongoose query");
                    reject();
                }

                photos = [];
                photoDocs.forEach(function (photoDoc) {
                    photos.push({id: photoDoc.id, title: photoDoc.title, url: photoDoc.url, orientation: photoDoc.orientation, width: photoDoc.imageWidth, height: photoDoc.imageHeight, thumbUrl: photoDoc.thumbUrl, tags: photoDoc.tags });
                });

                resolve(photos);
            });
        }
        else {
            reject();
        }
    });
}


function saveQueryToDB(queryStr) {

    return new Promise(function( resolve, reject) {

        if (dbOpened) {

        }
        else {
            reject();
        }
    });
}

function queryPhotos(querySpecStr) {

    return new Promise(function (resolve, reject) {

        if (dbOpened) {

            var querySpec = JSON.parse(querySpecStr);

            if (typeof querySpec.tagsInQuery == "object" && Array.isArray(querySpec.tagsInQuery)) {

                var queryIncludesDateComponent = true;
                var queryIncludesTags = true;

                var dateTakenQueryFragment = {};

                switch (querySpec.dateQueryType) {
                    case "before":
                        dateTakenQueryFragment.$lt = new Date(querySpec.dateValue);
                        break;
                    case "after":
                        dateTakenQueryFragment.$gt = new Date(querySpec.dateValue);
                        break;
                    case "on":
                        var startDate = new Date(querySpec.dateValue);
                        startDate.clearTime();

                        var endDate = new Date(querySpec.dateValue);
                        endDate.clearTime().addDays(1);

                        dateTakenQueryFragment.$gt = startDate;
                        dateTakenQueryFragment.$lt = endDate;
                        break;
                    case "between":
                        dateTakenQueryFragment.$gt = new Date(querySpec.startDateValue);
                        dateTakenQueryFragment.$lt = new Date(querySpec.endDateValue);
                        break;
                    default:
                        queryIncludesDateComponent = false;
                        break;
                }

                var tagsInQueryFragment = {};
                if (querySpec.tagsInQuery.length > 0) {

                    var tagsInQuery = [];
                    querySpec.tagsInQuery.forEach(function (tagInQuery) {
                        tagsInQuery.push(tagInQuery.tag);
                    });

                    if (querySpec.tagQueryOperator == 'or') {
                        tagsInQueryFragment.$in = tagsInQuery;
                    }
                    else {
                        tagsInQueryFragment.$all = tagsInQuery;
                    }
                }
                else {
                    queryIncludesTags = false;
                }

                var photos = [];

                var photoQuery = {};
                if (queryIncludesDateComponent && queryIncludesTags) {
                    var queryFragments = [];

                    var dateTakenQuerySnippet = {};
                    dateTakenQuerySnippet.dateTaken = dateTakenQueryFragment;
                    queryFragments.push(dateTakenQuerySnippet);

                    var tagsQuerySnippet = {};
                    tagsQuerySnippet.tags = tagsInQueryFragment;
                    queryFragments.push(tagsQuerySnippet);

                    photoQuery.$and = queryFragments;
                }
                else if (queryIncludesDateComponent){
                    photoQuery.dateTaken = dateTakenQueryFragment;
                }
                else if (queryIncludesTags) {
                    photoQuery.tags = tagsInQueryFragment;
                }

                Photo.find( photoQuery, function(err, photoDocs) {
                    if (err) {
                        console.log("error returned from mongoose in queryPhotos");
                        reject();
                    }

                    photos = [];
                    photoDocs.forEach(function (photoDoc) {
                        photos.push({id: photoDoc.id, title: photoDoc.title, url: photoDoc.url, orientation: photoDoc.orientation, width: photoDoc.imageWidth, height: photoDoc.imageHeight, thumbUrl: photoDoc.thumbUrl, tags: photoDoc.tags });
                    });

                    resolve(photos);
                });
            }
            else {
                debugger;
            }
        }
        else {
            reject();
        }
    });
}



function hashAllPhotos() {

    return new Promise(function (resolve, reject) {

        if (dbOpened) {

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
            imageHeight: photo.imageHeight,
            thumbUrl: photo.thumbUrl
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


function updateTags(photosUpdateSpec) {

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
    updateTags: updateTags,
    queryPhotos: queryPhotos
}
