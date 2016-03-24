/**
 * Created by tedshaffer on 3/13/16.
 */
angular.module('shafferoto').service('shafferotoServerService', ['$http', function($http) {

    var self = this;

    var baseUrl = document.baseURI.replace("?", "");
    if (baseUrl.indexOf("localhost") >= 0) {
        this.baseUrl = "http://localhost:3000/";
    }
    else
    {
        this.baseUrl = document.baseURI.substr(0, document.baseURI.lastIndexOf(":")) + ":8080/";
    }

    this.getBaseUrl = function() {
        return this.baseUrl;
    };

    this.getPhotos = function() {

        var url = self.baseUrl + "getPhotos";

        var promise = $http.get(url, {});
        return promise;
    };

    this.getTags = function() {

        var url = self.baseUrl + "getTags";

        var promise = $http.get(url, {});
        return promise;
    };

    this.addTag = function(tagLabel) {

        var url = self.baseUrl + "addTag";

        var promise = $http.get(url, {
            params: { tagLabel: tagLabel }
        });
        return promise;
    }

    this.updateTags = function(photosUpdateSpec) {

        var url = self.baseUrl + "updateTags";

        var promise = $http.get(url, {
            params: { photosUpdateSpec: photosUpdateSpec }
        });
        return promise;
    }
}]);

