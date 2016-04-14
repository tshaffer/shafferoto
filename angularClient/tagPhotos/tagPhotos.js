angular.module('shafferoto').controller('tagPhotos', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    $scope.photos = [];
    // $scope.imagesById = {};

    var photoTemplate = "";
    photoTemplate  = "<div><div class='ui-grid-cell-contents'>";
    //photoTemplate += "<img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" height='{{grid.getCellValue(row, col).height}}' width='{{grid.getCellValue(row, col).width}}' ng-src=\"{{grid.getCellValue(row, col).url}}\">";
    photoTemplate += "<img ng-src=\"{{grid.getCellValue(row, col).thumbUrl}}\">";
    photoTemplate += "</div>";

    photoTemplate += "<div><p class='centerText'>{{grid.getCellValue(row, col).tagList}}</p></div>";
    photoTemplate += "</div>";
    
    // retrieve all photos from the db
    var getPhotosPromise = $shafferotoServerService.getPhotos();
    getPhotosPromise.then(function (result) {
        console.log("getPhotos successful");

        var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";

        var columnIndex = 0;
        var photo = {};

        result.data.photos.forEach(function(dbPhoto){

            photo.url = baseUrl + dbPhoto.url;
            photo.thumbUrl = baseUrl + dbPhoto.thumbUrl;
            photo.orientation = dbPhoto.orientation;
            photo.title = dbPhoto.title;

            var width = dbPhoto.width;
            var height = dbPhoto.height;
            var ratio = height / width;

            //console.log("width/height ratio is: " + (photo.width / photo.height).toString());

            photo.tagList = "";
            dbPhoto.tags.forEach(function(tag) {
               photo.tagList += tag + ", ";
            });
            photo.tagList = photo.tagList.substring(0, photo.tagList.length - 2);

            photo.dbPhoto = dbPhoto;

            $scope.photos.push(photo);
        });

        console.log("all done");

        //$scope.$broadcast("imagesInitialized");
    })

    // retrieve all tags from the db
    $scope.tags = [];
    var getTagsPromise = $shafferotoServerService.getTags();
    getTagsPromise.then(function (result) {
        console.log("getTags successful");
        result.data.Tags.forEach(function(tag){
            $scope.tags.push(tag.label);
        });
        $scope.selectedTag = $scope.tags[0];
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
}]);
