angular.module('shafferoto').controller('tagPhotos', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    $scope.myChildren = [
        {
            "firstName": "Sam",
            "lastName": "Shaffer",
            "image": "img/img1.png",
            "image2": "img/img4.png",
        },
        {
            "firstName": "Joel",
            "lastName": "Shaffer",
            "image": "img/img2.jpg",
            "image2": "img/img5.png",
        },
        {
            "firstName": "Rachel",
            "lastName": "Shaffer",
            "image": "img/img3.jpg",
            "image2": "img/img1.png",
        }];

    $scope.gridOptions = {
        enableSorting: true,
        columnDefs: [
            { name: 'First', field: 'firstName' },
            { name: 'Last', field: 'lastName' },
            { name: 'Photo', field: 'image', cellTemplate:"<img width=\"50px\" ng-src=\"{{grid.getCellValue(row, col)}}\" lazy-src>"},
            { name: 'Photo2', field: 'image2', cellTemplate:"<img width=\"50px\" ng-src=\"{{grid.getCellValue(row, col)}}\" lazy-src>"}
        ],
    };

    $scope.gridOptions.data = $scope.myChildren;

}]);
