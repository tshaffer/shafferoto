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

    //var baseDir = 'http://localhost:3000/assets/';
    //var picture1 = baseDir + "IMG_1624.JPG";
    //var picture2 = baseDir + 'IMG_1625.JPG';
    //$scope.images = [ { src: picture1, title: 'Picture 1'}, { src: picture2, title: 'Picture 2'}];
    //$scope.images=[{src:'img1.png',title:'Pic 1'},{src:'img2.jpg',title:'Pic 2'},{src:'img3.jpg',title:'Pic 3'},{src:'img4.png',title:'Pic 4'},{src:'img5.png',title:'Pic 5'}];
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
                scope.images[scope.currentIndex].visible=true;
            });

            /* Start: For Automatic slideshow*/

            var timer;

            var sliderFunc=function(){
                timer=$timeout(function(){
                    scope.next();
                    timer=$timeout(sliderFunc,15000);
                },15000);
            };

            sliderFunc();

            scope.$on('$destroy',function(){
                $timeout.cancel(timer);
            });

            /* End : For Automatic slideshow*/

        },
        templateUrl:'templates/templateurl.html'
    }
});