/**
 * Created by tedshaffer on 3/13/16.
 */
angular.module('shafferoto').service('myServerService', ['$http', function($http) {

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
}]);

