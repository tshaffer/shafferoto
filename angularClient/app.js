angular
    //.module('shafferoto', ['ngAnimate', 'ngRoute', 'ui.bootstrap'])
    .module('shafferoto', ['ngAnimate', 'ngRoute', 'ui.grid', 'ui.grid.cellNav'])

    // code that originally displayed a slide show on startup
    //.controller('ShafferotoController', ['$scope', '$http', 'shafferotoServerService', function($scope, $http, $shafferotoServerService) {
    //
    //    $scope.images = [];
    //
    //    var getPhotosPromise = $shafferotoServerService.getPhotos();
    //    getPhotosPromise.then(function (result) {
    //        console.log("getPhotos successful");
    //
    //        var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";
    //
    //        result.data.photos.forEach(function(photo){
    //            var url = baseUrl + photo.url;
    //            $scope.images.push( { src: url, title: photo.title, orientation: photo.orientation } );
    //        });
    //
    //        $scope.$broadcast("imagesInitialized");
    //    })
    //}]);

    .directive('slider', function ($timeout) {
    return {
        restrict: 'AE',
        replace: true,
        scope:{
            images: '='
        },
        link: function (scope, elem, attrs) {

            scope.currentIndex=0;
            scope.imagesInitialized = false;

            scope.next=function(){
                if (scope.imagesInitialized) {
                    scope.currentIndex<scope.images.length-1?scope.currentIndex++:scope.currentIndex=0;
                }
            };

            scope.prev=function(){
                if (scope.imagesInitialized) {
                    scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.images.length - 1;
                }
            };

            scope.setVisiblePhoto = function() {
                if (scope.imagesInitialized) {
                    console.log("setVisiblePhoto entry");
                    if (typeof scope.images[scope.currentIndex] != 'undefined') {
                        console.log("set visible photo to index " + scope.currentIndex);
                        scope.images[scope.currentIndex].visible = true;
                    }
                }
            };

            scope.$watch('currentIndex',function(){
                if (scope.imagesInitialized) {
                    console.log("currentIndex set to " + scope.currentIndex);
                    scope.images.forEach(function (image) {
                        image.visible = false;
                    });
                    scope.setVisiblePhoto();
                }
            });

            scope.$on("imagesInitialized", function (event, args) {
                console.log("ImagesInitialized");
                scope.imagesInitialized = true;
                scope.setVisiblePhoto();

                var displaySlidesTimer = setInterval(displayTimer, 100);
                //var myTimer = setInterval(myTimeoutHandler, 3000);
            });

            function displayTimer() {
                document.getElementById("slider").style.visibility = "visible";
            }

            //function myTimeoutHandler() {
            //    console.log("sliderFunc timeout!!");
            //    scope.next();
            //    //scope.$digest();
            //}

            ///* Start: For Automatic slideshow*/
            //var sliderFunc=function(){
            //    timer=$timeout(function(){
            //        console.log("sliderFunc timeout!!");
            //        scope.next();
            //        timer=$timeout(sliderFunc,2000);
            //    },10000);
            //};

            //sliderFunc();

            scope.$on('$destroy',function(){
                console.log("destroy invoked");
                //$timeout.cancel(timer);
            });

            /* End : For Automatic slideshow*/

        },
        templateUrl:'templates/templateurl.html'
    }
})

    .controller('NavsCtrl', function($scope, $location){

        $scope.navs = [
            { link : '#/slideShow', label : 'Slide Show'},
            { link : '#/manageTags', label : 'Manage Tags'},
            { link : '#/tagPhotos', label : 'Tag Photos'}
        ];

        $scope.selectedNav = $scope.navs[0];
        $scope.setSelectedNav = function(nav) {
            $scope.selectedNav = nav;
        }

        $scope.navClass = function(nav) {
            if ($scope.selectedNav == nav) {
                return "active";
            } else {
                return "";
            }
        }
    })

    .config(['$routeProvider', function ($routeProvider) {

            $routeProvider

                .when('/', {
                    templateUrl: 'slideShow/slideShow.html',
                    controller: 'slideShow'
                })

                .when('/slideShow', {
                    templateUrl: 'slideShow/slideShow.html',
                    controller: 'slideShow'
                })

                .when('/manageTags', {
                    templateUrl: 'manageTags/manageTags.html',
                    controller: 'manageTags'
                })

                .when('/tagPhotos', {
                    templateUrl: 'tagPhotos/tagPhotos.html',
                    controller: 'tagPhotos'
                })
     }]
);

//var shafferoto=angular.module('shafferoto',['ngAnimate']);
//
//shafferoto.controller('ShafferotoController', ['$scope', '$http', 'shafferotoServerService', function($scope, $http, $shafferotoServerService) {
//
//    $scope.images = [];
//
//    var getPhotosPromise = $shafferotoServerService.getPhotos();
//    getPhotosPromise.then(function (result) {
//        console.log("getPhotos successful");
//
//        var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";
//
//        result.data.photos.forEach(function(photo){
//            var url = baseUrl + photo.url;
//            $scope.images.push( { src: url, title: photo.title, orientation: photo.orientation } );
//        });
//
//        $scope.$broadcast("imagesInitialized");
//    })
//}]);
//
//shafferoto.directive('slider', function ($timeout) {
//    return {
//        restrict: 'AE',
//        replace: true,
//        scope:{
//            images: '='
//        },
//        link: function (scope, elem, attrs) {
//
//            scope.currentIndex=0;
//
//            scope.next=function(){
//                scope.currentIndex<scope.images.length-1?scope.currentIndex++:scope.currentIndex=0;
//            };
//
//            scope.prev=function(){
//                scope.currentIndex>0?scope.currentIndex--:scope.currentIndex=scope.images.length-1;
//            };
//
//            scope.setVisiblePhoto = function() {
//                if (typeof scope.images[scope.currentIndex] != 'undefined') {
//                    scope.images[scope.currentIndex].visible = true;
//                }
//            };
//
//            scope.$watch('currentIndex',function(){
//                scope.images.forEach(function(image){
//                    image.visible=false;
//                });
//                scope.setVisiblePhoto();
//            });
//
//            scope.$on("imagesInitialized", function (event, args) {
//                scope.setVisiblePhoto();
//            });
//
//            /* Start: For Automatic slideshow*/
//
//            var timer;
//
//            //var sliderFunc=function(){
//            //    timer=$timeout(function(){
//            //        scope.next();
//            //        timer=$timeout(sliderFunc,15000);
//            //    },15000);
//            //};
//            //
//            //sliderFunc();
//            //
//            //scope.$on('$destroy',function(){
//            //    $timeout.cancel(timer);
//            //});
//
//            /* End : For Automatic slideshow*/
//
//        },
//        templateUrl:'templates/templateurl.html'
//    }
//});