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
mainApp.run(function($rootScope) {
	var countryNamesList = ["UK", "USA", "China", "Germany", "Canada", "Japan", "France"];
	var countryCodesList = ["GB", "US", "CN", "DE", "CA", "JP", "FR"]
	$rootScope.userCountry = countryNamesList[countryCodesList.indexOf(sessionStorage.getItem('countryName'))];
});