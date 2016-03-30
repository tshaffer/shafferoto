angular
    //.module('shafferoto', ['ngAnimate', 'ngRoute', 'ui.bootstrap'])
    .module('shafferoto', ['ngAnimate', 'ngRoute', 'ui.grid', 'ui.grid.cellNav'])

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

                var displaySlidesTimer = setInterval(displaySlideShowDiv, 100);
                //var myTimer = setInterval(myTimeoutHandler, 3000);
            });

            function displaySlideShowDiv() {
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
