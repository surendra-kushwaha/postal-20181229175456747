mainApp.controller('ViewReportsController', function($scope,$window, $http) {

 
    $http.get('/view-reports?country='+sessionStorage.getItem('countryName'), { headers: { 'Content-Type': 'application/json' } }).then(
        function (response) {
        $scope.tableData=response.data.data;
        },
        function (response) {
          console.log(response);
         },
      );


      $scope.moveToDispatchReportScreen = function(data){

        sessionStorage.setItem('startDate',data.startDate.slice(0, data.startDate.indexOf("T")));
          sessionStorage.setItem('endDate',data.endDate.slice(0, data.endDate.indexOf("T")));
          sessionStorage.setItem('originPost',data.originPost);
          sessionStorage.setItem('destinationPost',data.destinationPost);
          sessionStorage.setItem('dateCreated',data.dateCreated);
          $window.location.href='/dispatchReport.html';
      }

});