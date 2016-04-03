angular.module('shafferoto').controller('slideShow', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    $scope.images = [];
    $scope.slideShowVisible = false;
    $scope.slideShowSpecVisible = true;

    $scope.tags = [];
    $scope.tagsInQuery = [];
    $scope.tagQueryOperator = "or";
    $scope.dateQueryType = "none";

    $scope.dateValue = new Date();
    //$scope.dateValueStr = Date.today().toString("yyyy-MM-dd");
    $scope.startDateValue = new Date();
    $scope.endDateValue = new Date();

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

    $scope.loadQuery = function() {
        console.log("load query");
    };

    $scope.buildQuerySpec = function() {

        var querySpec = {};
        querySpec.tagsInQuery = $scope.tagsInQuery;
        querySpec.tagQueryOperator = $scope.tagQueryOperator;

        querySpec.dateQueryType = $scope.dateQueryType;
        querySpec.dateValue = $scope.dateValue;
        querySpec.startDateValue = $scope.startDateValue;
        querySpec.endDateValue = $scope.endDateValue;

        return querySpec;
    }

    $scope.saveQuery = function() {
        console.log("save query");

        var querySpec = $scope.buildQuerySpec();
        querySpec.name = $scope.savedQueryName;

        var addQueryPromise = $shafferotoServerService.addQuery(querySpec);
        addQueryPromise.then(function() {
           console.log("save query successfully completed");
        });
    };

    $scope.launchSlideShow = function() {
        console.log("launchSlideShow");

        var querySpec = $scope.buildQuerySpec();
        querySpec.tagsInQuery = $scope.tagsInQuery;

        var queryPhotosPromise = $shafferotoServerService.queryPhotos(querySpec);
        queryPhotosPromise.then(function (result) {

            console.log("queryPhotos successful");

            var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";

            result.data.photos.forEach(function(photo) {
                var url = baseUrl + photo.url;
                $scope.images.push( { src: url, title: photo.title, orientation: photo.orientation, visible: false } );
            });

            $scope.$broadcast("imagesInitialized");

            $scope.slideShowSpecVisible = false;
            $scope.slideShowVisible = true;
        });
    };
}]);
