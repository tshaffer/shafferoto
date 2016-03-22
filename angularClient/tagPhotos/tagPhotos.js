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

    $scope.tagPhotos = function() {
        var selectedPhotos = $scope.getCurrentSelection();

        console.log("Apply tag " + $scope.selectedTag + " to");
        selectedPhotos.forEach(function(selectedPhoto) {
            console.log(" " + selectedPhoto.title);
        });
    };
}]);
