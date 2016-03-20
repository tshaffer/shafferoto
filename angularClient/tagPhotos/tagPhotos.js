angular.module('shafferoto').controller('tagPhotos', ['$scope', 'shafferotoServerService', function($scope, $shafferotoServerService ) {

    var numColumns = 4;

    $scope.photos = [];

    var photoTemplate = "";
    photoTemplate  = "<div class='ui-grid-cell-contents'>";

    //photoTemplate += "<div><img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" ng-src=\"{{grid.getCellValue(row, col).url}}\" ";
    //photoTemplate += "width={{getImageWidth()}} height=getImageHeight()</div>";
    //photoTemplate += "height=\"250px\" max-height=\"150px\"</div>";
    //photoTemplate += "height=\"{getImageHeight(grid.getCellValue(row, col))}\" max-height=\"150px\"</div>";

    //photoTemplate += "<div><img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" ng-src=\"{{grid.getCellValue(row, col).url}}\" width=\"250px\" height=\"250px\" max-height=\"150px\"</div>";
    //photoTemplate += "<div><img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" ng-src=\"{{grid.getCellValue(row, col).url}}\" width=\"{{grid.getCellValue(row, col).width}}\" height=\"{{grid.getCellValue(row, col).height}}\" max-height=\"150px\"</div>";
    photoTemplate += "<div><img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" ng-src=\"{{grid.getCellValue(row, col).url}}\";";
    photoTemplate += " width=\"{{grid.getCellValue(row, col).width}}\" height=\"{{grid.getCellValue(row, col).height}}\" max-height=\"{{grid.getCellValue(row, col).height}}\"</div>";
    //photoTemplate += "<div style=\"width:\"{{grid.getCellValue(row, col).width}}\"; height:\"{{grid.getCellValue(row, col).height}}\"; max-height:\"{{grid.getCellValue(row, col).height}}\";</div>";
    //<div style="width: 233px; height: 400px"<div/>

    photoTemplate += "<div><p>Pizza is good</p></div>";
    photoTemplate += "</div>";

    photoTemplate  = "<div class='ui-grid-cell-contents'>";
    photoTemplate += "<img ng-src=\"{{grid.getCellValue(row, col).url}}\">";
    photoTemplate += "</div>";

    photoTemplate  = "<div class='ui-grid-cell-contents'>";
    photoTemplate += "<img height='250' width='250' ng-src=\"{{grid.getCellValue(row, col).url}}\">";
    photoTemplate += "</div>";

    //photoTemplate  = "<div class='ui-grid-cell-contents'>";
    photoTemplate  = "<div><div class='ui-grid-cell-contents'>";
    photoTemplate += "<img height='{{grid.getCellValue(row, col).height}}' width='{{grid.getCellValue(row, col).width}}' ng-src=\"{{grid.getCellValue(row, col).url}}\">";
    photoTemplate += "</div>";

    photoTemplate += "<div><p>Pizza is good</p></div>";
    photoTemplate += "</div>";

    //"<div class='ui-grid-cell-contents'><div><img ng-class=\"{ rotate90: grid.getCellValue(row, col).orientation==6, rotate180: grid.getCellValue(row, col).orientation==3 }\" ng-src=\"{{grid.getCellValue(row, col).url}}\"; width=\"{{grid.getCellValue(row, col).width}}\" height=\"{{grid.getCellValue(row, col).height}}\" max-height=\"{{grid.getCellValue(row, col).height}}\"</div><div><p>Pizza is good</p></div></div>"
    var photoColumns = [];
    //var photoColumns = [
    //        { name: 'Photo', field: 'image', cellTemplate: photoTemplate },
    //        { name: 'Photo2', field: 'image2', cellTemplate: photoTemplate }
    //    ];

    //$scope.getImageWidth = function() {
    //    console.log("getImageWidth invoked");
    //    return '\"250px\"';
    //};
    //
    //$scope.getImageHeight = function() {
    //    console.log("getImageHeight invoked");
    //    return '\"250px\" max-height=\"150px\"';
    //};
    //
    //function getImageHeight(foo) {
    //    console.log("getImageHeight invoked");
    //    return '\"250px\" max-height=\"150px\"';
    //};

    $scope.gridOptions = {
        showHeader: false,
        modifierKeysToMultiSelectCells: true,
        rowHeight:300,
        columnDefs: photoColumns
    };

    $scope.gridOptions.data = $scope.photos;

    for (i = 0; i < numColumns; i++) {
        photoColumn = {};
        photoColumn.name = 'Photo' + i.toString();
        photoColumn.field = 'image' + i.toString();
        photoColumn.cellTemplate = photoTemplate;

        photoColumns.push(photoColumn);
    }

    var getPhotosPromise = $shafferotoServerService.getPhotos();
    getPhotosPromise.then(function (result) {
        console.log("getPhotos successful");

        var baseUrl = $shafferotoServerService.getBaseUrl() +  "photos/";

        var columnIndex = 0;
        var photo = {};

        result.data.photos.forEach(function(dbPhoto){

            var image = {};
            image.url = baseUrl + dbPhoto.url;
            image.orientation = dbPhoto.orientation;
            image.title = dbPhoto.title;

            var width = dbPhoto.width;
            var height = dbPhoto.height;
            var ratio = height / width;

            var heightRatio = height / 250;
            var updatedWidth = width/(height/250);
            image.width = updatedWidth;
            image.height = 250;
            image.maxHeight = 250;
            //image.width = 250;
            //image.height = 250;
            console.log("widht/height ratio is: " + (image.width / image.height).toString());

            //console.log("retrieve width and height for " + image.url);
            //img = new Image();
            //img.onload = function () {
            //    console.log(image.url);
            //    console.log(this.width + " " + this.height);
            //};
            //img.src = image.url;

            var key = "image" + columnIndex.toString();

            photo[key] = image;
            columnIndex++;

            if ((columnIndex % numColumns) == 0) {
                $scope.photos.push(photo);
                photo = {};
                columnIndex = 0;
            }

        });

        console.log("all done");

        //$scope.$broadcast("imagesInitialized");
    })

    $scope.tags = [];
    var getTagsPromise = $shafferotoServerService.getTags();
    getTagsPromise.then(function (result) {
        console.log("getTags successful");
        result.data.Tags.forEach(function(tag){
            $scope.tags.push(tag.label);
        });
        $scope.selectedTag = $scope.tags[0];
    });
}]);
