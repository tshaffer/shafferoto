angular.module('shafferoto').controller('tagPhotos', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    var numColumns = 4;

    $scope.photos = [];

    var photoTemplate = "";
    photoTemplate  = "<div class='ui-grid-cell-contents'>";
    //photoTemplate += "<div><img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" ng-src=\"{{grid.getCellValue(row, col).u\rl}}\" width=\"200px\"> </div>";
    photoTemplate += "<div><img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" ng-src=\"{{grid.getCellValue(row, col).url}}\" width=\"250px\" height=\"250px\" max-height=\"150px\"</div>";
    photoTemplate += "<div><p>Pizza is good</p></div>";
    photoTemplate += "</div>";

    var photoColumns = [];
    //var photoColumns = [
    //        { name: 'Photo', field: 'image', cellTemplate: photoTemplate },
    //        { name: 'Photo2', field: 'image2', cellTemplate: photoTemplate }
    //    ];

    $scope.gridOptions = {
        showHeader: false,
        modifierKeysToMultiSelectCells: true,
        rowHeight:300,
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

        var columnIndex = 0;
        var photo = {};

        result.data.photos.forEach(function(dbPhoto){

            var image = {};
            image.url = baseUrl + dbPhoto.url;
            image.orientation = dbPhoto.orientation;
            image.title = dbPhoto.title;

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

    $scope.tags = [];
    var getTagsPromise = $shafferotoServerService.getTags();
    getTagsPromise.then(function (result) {
        console.log("getTags successful");
        result.data.Tags.forEach(function(tag){
            $scope.tags.push(tag.label);
        });
        $scope.selectedTag = $scope.tags[0];
    });
}]);
