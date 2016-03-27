angular.module('shafferoto').controller('slideShow', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    $scope.tags = [];
    $scope.tagsInQuery = [];

    var getTagsPromise = $shafferotoServerService.getTags();
    getTagsPromise.then(function (result) {
        result.data.Tags.forEach(function(tag){
            $scope.tags.push(tag.label);
        });
    });

    $scope.addTagToQuery = function() {

        var tagInQuery = {};
        tagInQuery.tag = $scope.tags[0];
        $scope.tagsInQuery.push(tagInQuery);
    };

    $scope.deleteTagFromQuery = function(index) {
        $scope.tagsInQuery.splice(index, 1);
    }

    $scope.saveQuery = function() {
        console.log("pizza");
    };

}]);
