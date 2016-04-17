angular.module('shafferoto').controller('tagPhotos', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    // photos
    $scope.photos = [];
    $scope.playlistThumbs = [];
    $scope.selectedPhoto = null;
    var photosById = {};

    // tags
    $scope.tags = [];
    $scope.tagLabel = "";

    // queries
    $scope.tagsInQuery = [];
    $scope.tagQueryOperator = "or";
    $scope.dateQueryType = "none";
    $scope.dateValue = new Date();
    $scope.startDateValue = new Date();
    $scope.endDateValue = new Date();
    $scope.queries = [];
    $scope.queryToLoad = null;

    // limit height of div that contains the grid of photos
    $scope.photoPageContainerHeight = window.innerHeight - 100;

    // retrieve all photos from the db
    var getPhotosPromise = $shafferotoServerService.getPhotos();
    getPhotosPromise.then(function (result) {
        console.log("getPhotos successful");

        $scope.baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";

        var columnIndex = 0;

        result.data.photos.forEach(function(dbPhoto){

            var photo = $scope.getPhotoFromDBPhoto(dbPhoto);

            $scope.photos.push(photo);

            photosById[dbPhoto.id] = photo;
        });

        console.log("all done");

        //$scope.$broadcast("imagesInitialized");
    })

    // retrieve all tags from the db
    var getTagsPromise = $shafferotoServerService.getTags();
    getTagsPromise.then(function (result) {
        console.log("getTags successful");
        result.data.Tags.forEach(function(tag){
            $scope.tags.push(tag.label);
        });
        $scope.selectedTag = $scope.tags[0];
    });

    // retrieve queries from db
    var getQueriesPromise = $shafferotoServerService.getQueries();
    getQueriesPromise.then(function (result) {
        result.data.forEach(function(query){
            $scope.queries.push(query);
        });
        if ($scope.queries.length > 0) {
            $scope.queryToLoad = $scope.queries[0];
        }
        else {
            $scope.queryToLoad = null;
        }
    });

    $scope.isTagMissingFromPhoto = function(indexOfTag) {
        return indexOfTag < 0;
    }

    $scope.addTagToPhoto = function(photoToUpdate, indexOfTag) {
        photoToUpdate.tags.push($scope.selectedTag);
    }

    $scope.getAssignTagPhotoToUpdate = function(photo) {

        var photoToUpdate = $scope.getPhotoToUpdate(photo, $scope.isTagMissingFromPhoto, $scope.addTagToPhoto);
        return photoToUpdate;
    };

    $scope.isTagPresentInPhoto = function(indexOfTag) {
        return indexOfTag >= 0;
    }

    $scope.removeTagFromPhoto = function(photoToUpdate, indexOfTag) {
        photoToUpdate.tags.splice(indexOfTag, 1);
    }

    $scope.getUnassignTagPhotoToUpdate = function(photo) {

        var photoToUpdate = $scope.getPhotoToUpdate(photo, $scope.isTagPresentInPhoto, $scope.removeTagFromPhoto);
        return photoToUpdate;
    };

    $scope.getPhotoToUpdate = function(photo, performActionOnPhoto, executeActionOnPhoto) {

        var indexOfTag = photo.dbPhoto.tags.indexOf($scope.selectedTag);

        var photoToUpdate = null;

        if (performActionOnPhoto(indexOfTag)) {

            photoToUpdate = {};

            photoToUpdate.id = photo.dbPhoto.id;
            photoToUpdate.tags = photo.dbPhoto.tags;

            executeActionOnPhoto(photoToUpdate, indexOfTag);
        }

        return photoToUpdate;
    }

    $scope.getPhotosToUpdate = function(getPhotoToUpdate) {

        var selectedPhotos = $scope.getCurrentSelection();

        var photosUpdateSpec = [];
        selectedPhotos.forEach(function(selectedPhoto) {

            var photoToUpdate = getPhotoToUpdate(selectedPhoto);
            if (photoToUpdate != null) {
                photosUpdateSpec.push(photoToUpdate);
            }
        });

        return photosUpdateSpec;
    };

    $scope.updateTags = function(photosUpdateSpec) {

        var self = this;
        self.photosUpdateSpec = photosUpdateSpec;

        var updateTagsPromise = $shafferotoServerService.updateTags(photosUpdateSpec);

        updateTagsPromise.then(function (result) {

            self.photosUpdateSpec.forEach(function(photoToUpdate) {
                var image = $scope.imagesById[photoToUpdate.id];
                image.tagList = "";
                photoToUpdate.tags.forEach(function(tag) {
                   image.tagList += tag + ", ";
                });
                image.tagList = image.tagList.substring(0, image.tagList.length - 2);
            });
        });
    };

    $scope.untagPhotos = function() {

        var photosUpdateSpec = $scope.getPhotosToUpdate($scope.getUnassignTagPhotoToUpdate);
        $scope.updateTags(photosUpdateSpec);
    };

    $scope.tagPhotos = function() {

        var photosUpdateSpec = $scope.getPhotosToUpdate($scope.getAssignTagPhotoToUpdate);
        $scope.updateTags(photosUpdateSpec);
    };
    
    $scope.selectPhoto = function(event) {
        console.log("selected photo " + event.target.id);

        $scope.selectedPhoto = photosById[event.target.id];
    }

    $scope.addTag = function () {

        // add tag to database
        if ($scope.tagLabel != "") {
            $shafferotoServerService.addTag($scope.tagLabel);

            $scope.tags.push($scope.tagLabel);
            $scope.tagLabel = "";
        }
    };


    $scope.addTagToQuery = function() {
        var tagInQuery = {};
        tagInQuery.tag = $scope.tags[0];
        $scope.tagsInQuery.push(tagInQuery);
    };

    $scope.deleteTagFromQuery = function(index) {
        $scope.tagsInQuery.splice(index, 1);
    }

    $scope.loadQuery = function() {
        console.log("load query");

        var getQueryPromise = $shafferotoServerService.getQuery($scope.queryToLoad.name);
        getQueryPromise.then(function(result) {
            var querySpec = result.data;

            querySpec.tags.forEach(function(tag) {
                var tagInQuery = {};
                tagInQuery.tag = tag;
                $scope.tagsInQuery.push(tagInQuery);
            });

            $scope.tagQueryOperator = querySpec.tagQueryOperator;

            $scope.dateQueryType = querySpec.dateQueryType;
            $scope.dateValue = new Date(querySpec.dateValue);
            $scope.startDateValue = new Date(querySpec.startDateValue);
            $scope.endDateValue = new Date(querySpec.endDateValue);
        });
    };

    $scope.buildQuerySpec = function() {

        var querySpec = {};
        querySpec.tagsInQuery = $scope.tagsInQuery;
        querySpec.tagQueryOperator = $scope.tagQueryOperator;

        querySpec.dateQueryType = $scope.dateQueryType;
        querySpec.dateValue = $scope.dateValue;
        querySpec.startDateValue = $scope.startDateValue;
        querySpec.endDateValue = $scope.endDateValue;

        return querySpec;
    }

    $scope.saveQuery = function() {
        console.log("save query");

        var querySpec = $scope.buildQuerySpec();
        querySpec.name = $scope.savedQueryName;

        var addQueryPromise = $shafferotoServerService.addQuery(querySpec);
        addQueryPromise.then(function() {
            console.log("save query successfully completed");

            $scope.queries.push(querySpec);
            if ($scope.queries.length > 0) {
                $scope.queryToLoad = $scope.queries[0];
            }
            else {
                $scope.queryToLoad = "";
            }
        });
    };

    $scope.search = function() {

        console.log("performSearch");

        var querySpec = $scope.buildQuerySpec();
        querySpec.tagsInQuery = $scope.tagsInQuery;

        var queryPhotosPromise = $shafferotoServerService.queryPhotos(querySpec);
        queryPhotosPromise.then(function (result) {

            console.log("queryPhotos successful");

            $scope.photos = [];
            $scope.baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";

            result.data.photos.forEach(function(dbPhoto){

                var photo = $scope.getPhotoFromDBPhoto(dbPhoto);
                $scope.photos.push(photo);
                photosById[dbPhoto.id] = photo;
            });

            // $scope.$broadcast("imagesInitialized");
        });

    }

    $scope.getPhotoFromDBPhoto = function(dbPhoto) {

        var photo = {};

        photo.dbId = dbPhoto.id;
        photo.url = $scope.baseUrl + dbPhoto.url;
        photo.thumbUrl = $scope.baseUrl + dbPhoto.thumbUrl;
        photo.orientation = dbPhoto.orientation;
        photo.title = dbPhoto.title;

        var width = dbPhoto.width;
        var height = dbPhoto.height;

        var ratio;
        if (photo.orientation == 6) {
            ratio = height / width;
        }
        else {
            ratio = width / height;
        }

        photo.height = 108;
        photo.width = ratio * photo.height;

        var dateTaken = dbPhoto.dateTaken;
        var dt = new Date(dateTaken);
        // photo.dateTaken = dt.toString("M/d/yyyy HH:mm");
        photo.dateTaken = dt.toString("M/d/yyyy hh:mm tt");

        photo.tagList = "";
        dbPhoto.tags.forEach(function(tag) {
            photo.tagList += tag + ", ";
        });
        photo.tagList = photo.tagList.substring(0, photo.tagList.length - 2);

        photo.dbPhoto = dbPhoto;

        return photo;
    }
}]);
