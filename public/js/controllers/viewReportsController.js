mainApp.controller('ViewReportsController', function ($scope, $window, $http) {
	$scope.userCountry=$rootScope.userCountry;
  if (!('countryName' in sessionStorage)) {
    $window.location.href='/';
    return;
    }
$http.get('/view-reports?country=' + sessionStorage.getItem('countryName'), {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(
    function (response) {
      $scope.tableData = response.data.data;
      // $scope.tableData.forEach(element => {
      //   element.dateCreated=new Date(element.dateCreated);

      // });
    },
    function (response) {
      console.log(response);
    }
  );

$scope.convertToUTC = function(dt) {
    var localDate = new Date(dt);
    var localTime = localDate.getTime();
    var localOffset = localDate.getTimezoneOffset() * 60000;
    return new Date(localTime + localOffset);
}
  $scope.moveToDispatchReportScreen = function (data) {

    sessionStorage.setItem('startDate', data.startDate);
    sessionStorage.setItem('endDate', data.endDate);
    sessionStorage.setItem('originPost', data.originPost);
    sessionStorage.setItem('destinationPost', data.destinationPost);
    sessionStorage.setItem('dateCreated', data.dateCreated);
    $window.location.href = '/dispatchReport.html';
  }


});
