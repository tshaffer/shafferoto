angular.module('shafferoto').controller('tagPhotos', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    var numColumns = 4;

    $scope.photos = [];

    var photoTemplate = "";
    photoTemplate  = "<div><div class='ui-grid-cell-contents'>";
    photoTemplate += "<img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" height='{{grid.getCellValue(row, col).height}}' width='{{grid.getCellValue(row, col).width}}' ng-src=\"{{grid.getCellValue(row, col).url}}\">";
    photoTemplate += "</div>";

    photoTemplate += "<div><p class='centerText'>{{grid.getCellValue(row, col).tagList}}</p></div>";
    photoTemplate += "</div>";

    var photoColumns = [];

    $scope.gridOptions = {
        showHeader: false,
        modifierKeysToMultiSelectCells: true,
        rowHeight:300,
        columnDefs: photoColumns
    };

    $scope.gridOptions.data = $scope.photos;

    for (i = 0; i < numColumns; i++) {
        photoColumn = {};
        //photoColumn.name = 'Photo' + i.toString();
        photoColumn.name = 'image' + i.toString();
        photoColumn.field = photoColumn.name;
        //photoColumn.field = 'image' + i.toString();
        photoColumn.cellTemplate = photoTemplate;

        photoColumns.push(photoColumn);
    }

    // retrieve all photos from the db
    var getPhotosPromise = $shafferotoServerService.getPhotos();
    getPhotosPromise.then(function (result) {
        console.log("getPhotos successful");

        var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";

        var columnIndex = 0;
        var photo = {};

        result.data.photos.forEach(function(dbPhoto){

            var image = {};
            image.url = baseUrl + dbPhoto.url;
            image.orientation = dbPhoto.orientation;
            image.title = dbPhoto.title;

            var width = dbPhoto.width;
            var height = dbPhoto.height;
            var ratio = height / width;

            var heightRatio = height / 250;
            var updatedWidth = width/(height/250);
            image.width = updatedWidth;
            image.height = 250;
            image.maxHeight = 250;
            //console.log("width/height ratio is: " + (image.width / image.height).toString());

            image.tagList = "";
            dbPhoto.tags.forEach(function(tag) {
               image.tagList += tag + ", ";
            });
            image.tagList = image.tagList.substring(0, image.tagList.length - 2);

            // TODO - doing this for expediency - best design?
            image.dbPhoto = dbPhoto;

            var key = "image" + columnIndex.toString();
            photo[key] = image;
            columnIndex++;

            if ((columnIndex % numColumns) == 0) {
                $scope.photos.push(photo);
                photo = {};
                columnIndex = 0;
            }

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

    $scope.gridOptions.onRegisterApi = function(gridApi){
        $scope.gridApi = gridApi;
        gridApi.cellNav.on.navigate($scope,function(newRowCol, oldRowCol){
            console.log('navigation event');
        });
    };

    $scope.getCurrentSelection = function() {
        var selectedPhotos = [];
        var currentSelection = $scope.gridApi.cellNav.getCurrentSelection();
        for (var i = 0; i < currentSelection.length; i++) {
            selectedPhotos.push(currentSelection[i].row.entity[currentSelection[i].col.name]);
        }
        return selectedPhotos;
    };

    $scope.untagPhotos = function() {

        // get the photos that the user has selected
        var selectedPhotos = $scope.getCurrentSelection();

        var photosUpdateSpec = [];
        selectedPhotos.forEach(function(selectedPhoto) {

            var indexOfTag = selectedPhoto.dbPhoto.tags.indexOf($scope.selectedTag);
            if (indexOfTag < 0) {
                console.log(selectedPhoto.title + " doesn't contains the tag " + $scope.selectedTag);
            }
            else {
                // remove tag from tags array
                photoUpdate = {};

                photoUpdate.id = selectedPhoto.dbPhoto.id;
                photoUpdate.tags = selectedPhoto.dbPhoto.tags;

                //// note - this probably causes the local selectedPhoto to get updated as well (CONFIRMED - IT DOES!)
                photoUpdate.tags.splice(indexOfTag, 1);

                photosUpdateSpec.push(photoUpdate);

                var unassignTagsPromise = $shafferotoServerService.updateTags(photosUpdateSpec);
                unassignTagsPromise.then(function (result) {
                    console.log("unassignTags successful");
                });
            }
        });

    };

    $scope.tagPhotos = function() {

        // get the photos that the user has selected
        var selectedPhotos = $scope.getCurrentSelection();

        // apply the specific tag to each photo (that doesn't already have the tag), one at a time
        //console.log("Apply tag " + $scope.selectedTag + " to");


        // package up a request to send to the server
        // package should include all records that need to get updated
        //  n photos
        //      each photo contains an id and a tags array
        var photosUpdateSpec = [];
        selectedPhotos.forEach(function(selectedPhoto) {
            if (selectedPhoto.dbPhoto.tags.indexOf($scope.selectedTag) >= 0)  {
                console.log(selectedPhoto.title + " already contains the tag " + $scope.selectedTag);
            }
            else {

                photoUpdate = {};

                photoUpdate.id = selectedPhoto.dbPhoto.id;
                photoUpdate.tags = selectedPhoto.dbPhoto.tags;
                // note - this probably causes the local selectedPhoto to get updated as well (CONFIRMED - IT DOES!)
                photoUpdate.tags.push($scope.selectedTag);

                photosUpdateSpec.push(photoUpdate);

                var assignTagsPromise = $shafferotoServerService.updateTags(photosUpdateSpec);
                assignTagsPromise.then(function (result) {
                    console.log("assignTags successful");
                });
            }
        });
    };
}]);
