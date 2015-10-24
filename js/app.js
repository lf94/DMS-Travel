var DMSTravelApp = angular.module("DMSTravelApp", [
    "ngRoute",
    "ngAnimate",
    "FacebookServices",
    "MainControllers"
]);

DMSTravelApp.config([
    "$routeProvider",
    function($routeProvider) {

        $routeProvider.
            when('/', {
                templateUrl: "partials/splash.html",
                controller: "SplashController"
            }).
            when('/home', {
                templateUrl: "partials/home.html",
                controller: "MainController"
            }).
            when('/doc', {
                templateUrl: "partials/doc.html",
                controller: "NullController"
            }).
            when('/about', {
                templateUrl: "partials/about.html",
                controller: "NullController"
            }).
            when('/destination/:albumId/photos', {
                templateUrl: "partials/photos.html",
                controller: "PhotosController"
            });
        
    }
]);
