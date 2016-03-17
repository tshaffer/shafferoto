angular.module('shafferoto').controller('manageTags', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    $scope.submitForm = function () {

        $scope.submitted = true;

        // add tag to database
        if ($scope.tagLabel != "") {
            $shafferotoServerService.addTag($scope.tagLabel);
        }
    };

    $scope.tagLabel = "";
}]);
