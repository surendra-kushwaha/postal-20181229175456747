mainApp = angular.module('mainApp', ['angularUtils.directives.dirPagination']);
mainApp.
factory('httpq', function ($http, $q) {
  return {
    get: function () {
      var deferred = $q.defer();
      $http.get
        .apply(null, arguments)
        .success(deferred.resolve)
        .error(deferred.resolve);
      return deferred.promise;
    },
  };
})
mainApp.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.timeout = 5000;
}]);