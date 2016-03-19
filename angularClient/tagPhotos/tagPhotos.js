angular.module('shafferoto').controller('tagPhotos', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    $scope.myData = [];

    $scope.myChildren = [
        {
            "firstName": "Sam",
            "lastName": "Shaffer"
        },
        {
            "firstName": "Joel",
            "lastName": "Shaffer"
        },
        {
            "firstName": "Rachel",
            "lastName": "Shaffer"
        }];

    $scope.gridOptions = {
        enableSorting: true,
        columnDefs: [
            { name: 'First', field: 'firstName' },
            { name: 'Last', field: 'lastName' }
        ],
        //data: 'myData'
    };

    $scope.gridOptions.data = $scope.myChildren;

}]);
