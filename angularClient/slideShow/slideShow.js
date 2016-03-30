angular.module('shafferoto').controller('slideShow', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    $scope.images = [];
    $scope.slideShowVisible = false;
    $scope.slideShowSpecVisible = true;

    $scope.tags = [];
    $scope.tagsInQuery = [];
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

    $scope.saveQuery = function() {
        console.log("save query");
    };

    $scope.launchSlideShow = function() {
        console.log("launchSlideShow");

        var querySpec = {};
        querySpec.tagsInQuery = $scope.tagsInQuery;
        querySpec.dateQueryType = $scope.dateQueryType;
        querySpec.dateValue = $scope.dateValue;
        querySpec.startDateValue = $scope.startDateValue;
        querySpec.endDateValue = $scope.endDateValue;

        var queryPhotosPromise = $shafferotoServerService.queryPhotos(querySpec);
        queryPhotosPromise.then(function (result) {
            result.data.photos.forEach(function(dbPhoto) {
                debugger;
            })
        });

        //var getPhotosPromise = $shafferotoServerService.getPhotos();
        //getPhotosPromise.then(function (result) {
        //    console.log("getPhotos successful");
        //
        //    // get photos for slide show
        //    //' perform query based on tags and date spec, data
        //
        //    var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";
        //
        //    result.data.photos.forEach(function(photo){
        //        var url = baseUrl + photo.url;
        //        $scope.images.push( { src: url, title: photo.title, orientation: photo.orientation, visible: false } );
        //    });
        //
        //    $scope.$broadcast("imagesInitialized");
        //
        //    $scope.slideShowSpecVisible = false;
        //    $scope.slideShowVisible = true;
        //})
    };
}]);
