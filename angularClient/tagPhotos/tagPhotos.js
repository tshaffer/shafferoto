angular.module('shafferoto').controller('tagPhotos', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    $scope.photos = [];

    var photoTemplate = "<div class='ui-grid-cell-contents'><img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" ng-src=\"{{grid.getCellValue(row, col).url}}\" width=\"200px\"> </div>";

    $scope.gridOptions = {
        modifierKeysToMultiSelectCells: true,
        rowHeight:200,
        columnDefs: [
            { name: 'Photo', field: 'image', cellTemplate: photoTemplate },
            { name: 'Photo2', field: 'image2', cellTemplate: photoTemplate }
        ],
    };

    $scope.gridOptions.data = $scope.photos;

    var getPhotosPromise = $shafferotoServerService.getPhotos();
    getPhotosPromise.then(function (result) {
        console.log("getPhotos successful");

        var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";

        var firstPhoto = true;

        var imageObj = {};

        var image1;
        var image2;

        result.data.photos.forEach(function(photo){

            var url = baseUrl + photo.url;
            var orientation = photo.orientation;
            var title = photo.title;

            if (firstPhoto) {
                image1 = {};
                image1.url = url;
                image1.orientation = orientation;
                image1.title = title;
            }
            else {
                image2 = {};
                image2.url = url;
                image2.orientation = orientation;
                image2.title = title;

                photo = { "image": image1, "image2": image2 };
                $scope.photos.push(photo);
            }
            firstPhoto = !firstPhoto;
        });

        //$scope.$broadcast("imagesInitialized");
    })

}]);
