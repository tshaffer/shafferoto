var shafferoto=angular.module('shafferoto',['ngAnimate']);

shafferoto.controller('ShafferotoController', ['$scope', '$http', 'shafferotoServerService', function($scope, $http, $shafferotoServerService) {

    $scope.images = [];

    var getPhotosPromise = $shafferotoServerService.getPhotos();
    getPhotosPromise.then(function (result) {
        console.log("getPhotos successful");

        var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";

        result.data.photos.forEach(function(photo){
            var url = baseUrl + photo.url;
            $scope.images.push( { src: url, title: photo.title, orientation: photo.orientation } );
        });
    })
}]);

shafferoto.directive('slider', function ($timeout) {
    return {
        restrict: 'AE',
        replace: true,
        scope:{
            images: '='
        },
        link: function (scope, elem, attrs) {

            scope.currentIndex=0;

            scope.next=function(){
                scope.currentIndex<scope.images.length-1?scope.currentIndex++:scope.currentIndex=0;
            };

            scope.prev=function(){
                scope.currentIndex>0?scope.currentIndex--:scope.currentIndex=scope.images.length-1;
            };

            scope.$watch('currentIndex',function(){
                scope.images.forEach(function(image){
                    image.visible=false;
                });
                if (typeof scope.images[scope.currentIndex] != 'undefined') {
                    scope.images[scope.currentIndex].visible = true;
                }
                else {
                    console.log("images undefined");
                }
            });

            /* Start: For Automatic slideshow*/

            var timer;

            //var sliderFunc=function(){
            //    timer=$timeout(function(){
            //        scope.next();
            //        timer=$timeout(sliderFunc,15000);
            //    },15000);
            //};
            //
            //sliderFunc();
            //
            //scope.$on('$destroy',function(){
            //    $timeout.cancel(timer);
            //});

            /* End : For Automatic slideshow*/

        },
        templateUrl:'templates/templateurl.html'
    }
});