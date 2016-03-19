angular.module('shafferoto').controller('tagPhotos', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    $scope.photos = [];

    $scope.gridOptions = {
        modifierKeysToMultiSelectCells: true,
        rowHeight:200,
        columnDefs: [
            { name: 'Photo', field: 'image', cellTemplate:"<div class='ui-grid-cell-contents'><img width=\"200px\" ng-src=\"{{grid.getCellValue(row, col)}}\" lazy-src> </div>"},
            { name: 'Photo2', field: 'image2', cellTemplate:"<div class='ui-grid-cell-contents'><img width=\"200px\" ng-src=\"{{grid.getCellValue(row, col)}}\" lazy-src> </div>"}
        ],
    };

    $scope.gridOptions.data = $scope.photos;

    var getPhotosPromise = $shafferotoServerService.getPhotos();
    getPhotosPromise.then(function (result) {
        console.log("getPhotos successful");

        var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";

        var firstPhoto = true;
        var image1;
        var image2;

        result.data.photos.forEach(function(photo){

            var url = baseUrl + photo.url;

            if (firstPhoto) {
                image1 = url;
            }
            else {
                photo = { "image": image1, "image2": url };
                $scope.photos.push(photo);
            }
            firstPhoto = !firstPhoto;
        });

        //$scope.$broadcast("imagesInitialized");
    })

}]);
