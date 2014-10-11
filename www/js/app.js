// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('master', {
                url: '/',
                templateUrl: 'templates/master.html',
                controller: 'MasterCtrl'
            })
            .state('details', {
                url: '/details',
                templateUrl: 'templates/details.html',
                controller: 'DetailsCtrl'
            });
    })

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

    .factory('WeatherService', function ($http, $q) {
        var BASE_URL = 'https://query.yahooapis.com/v1/public/yql';
        var weather = {};

        var getLocation = function () {
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

        var getWoeid = function (latitude, longitude) {
            return $http.get(BASE_URL, {
                params: {
                    q: 'select * from geo.placefinder where text="' +
                        latitude + ', ' + longitude + '" and gflags="R"',
                    format: 'json'
                }
            });
        };

        var getWeather = function (woeid) {
            return $http.get(BASE_URL, {
                params: {
                    q: 'select * from weather.forecast where woeid="' + woeid + '"',
                    format: 'json'
                }
            });
        };

        var refresh = function (callback) {
            getLocation()
                .then(function (position) {
                    var pos = position.coords;
                    return getWoeid(pos.latitude, pos.longitude);
                })
                .then(function (location) {
                    var woeid = location.data.query.results.Result.woeid;
                    return getWeather(woeid);
                })
                .then(function (data) {
                    if (data.status === 200) {
                        var channel = data.data.query.results.channel;
                        weather = channel;
                        callback(weather);
                    } else {
                        console.log('error getting weather information.');
                    }
                });
        };

        return {
            refresh: refresh,
            getStoredWeatherData: function () {
                return weather;
            }
        };
    })

    .controller('MasterCtrl', function ($scope, $http, WeatherService) {
        $scope.refresh = function () {
            WeatherService.refresh(function (data) {
                $scope.weather = data;
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.refresh();
    })
    .controller('DetailsCtrl', function ($scope, $http, WeatherService) {
        $scope.weather = WeatherService.getStoredWeatherData();
    });