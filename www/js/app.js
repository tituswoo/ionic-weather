// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })

    .controller('weatherCtrl', function ($scope, $http, $q) {
        var BASE_URL = 'https://query.yahooapis.com/v1/public/yql';
        $scope.weather = {};

        $scope.getLocation = function () {
            var deferred = $q.defer();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    deferred.resolve(position);
                });
            } else {
                return deferred.reject();
            }
            return deferred.promise;
        };

        $scope.getWoeid = function (latitude, longitude) {
            return $http.get(BASE_URL, {
                params: {
                    q: 'select * from geo.placefinder where text="' +
                        latitude + ', ' + longitude + '" and gflags="R"',
                    format: 'json'
                }
            });
        };

        $scope.getWeather = function (woeid) {
            return $http.get(BASE_URL, {
                params: {
                    q: 'select * from weather.forecast where woeid="' + woeid + '"',
                    format: 'json'
                }
            });
        };

        $scope.refresh = function () {
            $scope.getLocation()
                .then(function (position) {
                    $scope.position = position;
                    var pos = position.coords;
                    return $scope.getWoeid(pos.latitude, pos.longitude);
                })
                .then(function (data) {
                    var woeid = data.data.query.results.Result.woeid;
                    return $scope.getWeather(woeid);
                })
                .then(function (weather) {
                    if (weather.status === 200) {
                        var channel = weather.data.query.results.channel;
                        $scope.weather = channel;
                    } else {
                        console.log('error getting weather information.');
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                });
        };

        $scope.refresh();
    });