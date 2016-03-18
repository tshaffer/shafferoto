angular.module('shafferoto').controller('manageTags', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    $scope.submitForm = function () {

        $scope.submitted = true;

        // add tag to database
        if ($scope.tagLabel != "") {
            $shafferotoServerService.addTag($scope.tagLabel);

            $scope.tags.push($scope.tagLabel);
            $scope.tagLabel = "";
        }
    };

    $scope.tagLabel = "";

    $scope.tags = [];
    var getTagsPromise = $shafferotoServerService.getTags();
    getTagsPromise.then(function (result) {
        console.log("getTags successful");
        result.data.Tags.forEach(function(tag){
            $scope.tags.push(tag.label);
        });
    });
}]);
