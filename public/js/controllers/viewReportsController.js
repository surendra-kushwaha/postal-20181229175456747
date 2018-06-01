mainApp.controller('ViewReportsController', function ($scope, $window, $http) {


$http.get('/view-reports?country=' + sessionStorage.getItem('countryName'), {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(
    function (response) {
      $scope.tableData = response.data.data;
      $scope.tableData.forEach(element => {
        element.dateCreated=new Date(element.dateCreated);

      });
    },
    function (response) {
      console.log(response);
    },
  );


  $scope.moveToDispatchReportScreen = function (data) {

    sessionStorage.setItem('startDate', data.startDate);
    sessionStorage.setItem('endDate', data.endDate);
    sessionStorage.setItem('originPost', data.originPost);
    sessionStorage.setItem('destinationPost', data.destinationPost);
    sessionStorage.setItem('dateCreated', data.dateCreated);
    $window.location.href = '/dispatchReport.html';
  }

});
