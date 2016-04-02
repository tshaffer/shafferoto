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
    thumbUrl: String,
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


function queryPhotos(querySpecStr) {

    return new Promise(function (resolve, reject) {

        if (dbOpened) {

            // example query using dates
            //Photo.find( { dateTaken: { $gt: new Date("Dec 30 2013") }}, function(err, photoDocs) {
            //    if (err) {
            //        console.log("error returned from mongoose in queryPhotos");
            //        reject();
            //    }
            //
            //    photos = [];
            //    photoDocs.forEach(function (photoDoc) {
            //        photos.push({id: photoDoc.id, title: photoDoc.title, url: photoDoc.url, orientation: photoDoc.orientation, width: photoDoc.imageWidth, height: photoDoc.imageHeight, thumbUrl: photoDoc.thumbUrl, tags: photoDoc.tags });
            //    });
            //
            //    resolve(photos);
            //})
            //
            //return;

            var querySpec = JSON.parse(querySpecStr);

            if (typeof querySpec.tagsInQuery == "object" && Array.isArray(querySpec.tagsInQuery)) {

                var queryIncludesDateComponent = true;
                var queryIncludesTags = true;

                var dateQuerySnippet = "";
                switch (querySpec.dateQueryType) {
                    case "before":
                        var specDate = new Date(querySpec.dateValue);
                        //dateQuerySnippet = "{ 'dateTaken': { $lt : new Date('" + specDate + "')} }";
                        dateQuerySnippet = "{ dateTaken: { $lt : new Date('" + specDate + "')} }";
                        break;
                    case "after":
                        var specDate = new Date(querySpec.dateValue);
                        dateQuerySnippet = "{ 'dateTaken': { $gt : specDate } }";
                        break;
                    case "on":
                        var specDate = new Date(querySpec.dateValue);
                        dateQuerySnippet = "{ 'dateTaken': { $eq : specDate } }";
                        break;
                    case "between":
                        var startDate = new Date(querySpec.startDateValue);
                        var endDate = new Date(querySpec.endDateValue);
                        dateQuerySnippet = "{ 'dateTaken': { $gt : startDate } }, { 'dateTaken': { $lt : endDate } }";
                        break;
                    default:
                        queryIncludesDateComponent = false;
                        break;
                }

                //if (queryIncludesDateComponent) {
                //    Photo.find( dateQuerySnippet, function(err, photoDocs) {
                //        if (err) {
                //            console.log("error returned from mongoose in queryPhotos");
                //            reject();
                //        }
                //    });
                //}

                var tagQuerySnippet = "";
                if (querySpec.tagsInQuery.length > 0) {

                    var tagsInQuery = [];
                    querySpec.tagsInQuery.forEach(function (tagInQuery) {
                        tagsInQuery.push(tagInQuery.tag);
                    });
                    tagQuerySnippet = "{ tags: { $in: tagsInQuery } }";
                }
                else {
                    queryIncludesTags = false;
                }

                //db.inventory.find( {
                //    $and : [
                //        { $or : [ { price : 0.99 }, { price : 1.99 } ] },
                //        { $or : [ { sale : true }, { qty : { $lt : 20 } } ] }
                //    ]
                //} )

                var photos = [];

                var query = "";
                if (queryIncludesDateComponent && queryIncludesTags) {
                    query = "{ $and : [";
                    query += dateQuerySnippet + ",";
                    query += tagQuerySnippet;
                    query += "] }";
                }
                else if (queryIncludesDateComponent) {
                    query = dateQuerySnippet;
                }
                else if (queryIncludesTags) {
                    query = tagQuerySnippet;
                }
                else {
                    resolve(photos);
                }

                // these don't work
                //query = "{ dateTaken: { $lt: new Date("Dec 30 2013") }}";
                //query = "{ dateTaken: { $lt: new Date('Dec 30 2013') }}";
                //Photo.find( { dateTaken: { $lt: new Date("Dec 30 2013") }}, function(err, photoDocs) {
                //Photo.find( query, function(err, photoDocs) {

                // this works
                //Photo.find( { dateTaken: { $lt: new Date(querySpec.dateValue) }}, function(err, photoDocs) {

                var dateTakenSpec = {};
                dateTakenSpec.$lt = new Date(querySpec.dateValue);

                myQuery = {};
                myQuery.dateTaken = dateTakenSpec;

                Photo.find( myQuery, function(err, photoDocs) {
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

                //Photo.find( { tags: { $in: tagsInQuery } }, function(err, photoDocs) {
                //    if (err) {
                //        console.log("error returned from mongoose in queryPhotos");
                //        reject();
                //    }
                //
                //    photos = [];
                //    photoDocs.forEach(function (photoDoc) {
                //        photos.push({id: photoDoc.id, title: photoDoc.title, url: photoDoc.url, orientation: photoDoc.orientation, width: photoDoc.imageWidth, height: photoDoc.imageHeight, thumbUrl: photoDoc.thumbUrl, tags: photoDoc.tags });
                //    });
                //
                //    resolve(photos);
                //})
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
