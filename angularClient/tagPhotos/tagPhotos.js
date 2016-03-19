angular.module('shafferoto').controller('tagPhotos', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    var numColumns = 2;

    $scope.photos = [];

    var photoTemplate = "<div class='ui-grid-cell-contents'><img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" ng-src=\"{{grid.getCellValue(row, col).url}}\" width=\"200px\"> </div>";
    var photoColumns = [];
    //var photoColumns = [
    //        { name: 'Photo', field: 'image', cellTemplate: photoTemplate },
    //        { name: 'Photo2', field: 'image2', cellTemplate: photoTemplate }
    //    ];

    $scope.gridOptions = {
        modifierKeysToMultiSelectCells: true,
        rowHeight:200,
        columnDefs: photoColumns
    };

    $scope.gridOptions.data = $scope.photos;

    for (i = 0; i < numColumns; i++) {
        photoColumn = {};
        photoColumn.name = 'Photo' + i.toString();
        photoColumn.field = 'image' + i.toString();
        photoColumn.cellTemplate = photoTemplate;

        photoColumns.push(photoColumn);
    }

    var getPhotosPromise = $shafferotoServerService.getPhotos();
    getPhotosPromise.then(function (result) {
        console.log("getPhotos successful");

        var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";

        var index = 0;

        var photo = {};

        result.data.photos.forEach(function(dbPhoto){

            var image = {};
            image.url = baseUrl + dbPhoto.url;
            image.orientation = dbPhoto.orientation;
            image.title = dbPhoto.title;

            var key = "image" + index.toString();

            photo[key] = image;
            index++;

            if ((index % numColumns) == 0) {
                $scope.photos.push(photo);
                photo = {};
                index = 0;
            }

        });

        console.log("all done");

        //$scope.$broadcast("imagesInitialized");
    })

}]);
