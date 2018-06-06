mainApp.controller('HomeController', function ($scope, $window, $http, $timeout) {

   var countryNamesList = ["UK", "USA", "China", "Germany", "Canada", "Japan", "France"];
   var countryCodesList = ["GB", "US", "CN", "DE", "CA", "JP", "FR"]

   $scope.userCountry=countryNamesList[countryCodesList.indexOf(sessionStorage.getItem('countryName'))];
  $scope.simulate = function () {
    $scope.originCountry=$scope.originCountry.split("(")[1].slice(0,-1).trim();
    $scope.destinationCountry= $scope.destinationCountry.split("(")[1].slice(0,-1).trim();
    var date1 = new Date($scope.startDate);
    var date2 = new Date($scope.endDate);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  if (diffDays <= 1) {
      alert("Date Range of Simulation should be greater than 15 days!!");
      return;
    }
    else if($scope.originCountry!==sessionStorage.getItem('countryName') && $scope.destinationCountry!==sessionStorage.getItem('countryName'))
    {
      alert("Please select "+$scope.userCountry+" as Origin OR Destination!!");
      return;
    }
    else {
      $('#exampleModalCenter').modal('hide');
      $('#loadModal').modal('show');
      //$window.location.href = '/dispatchReport.html';
      let data = JSON.stringify({
        startDate: $scope.startDate,
        endDate: $scope.endDate,
        originPost: $scope.originCountry,
        destinationPost: $scope.destinationCountry,
        size: $scope.simulationSize
      });
      $http.post('/simulate', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(
        function (response) {
          sessionStorage.setItem('startDate', $scope.startDate);
          sessionStorage.setItem('endDate', $scope.endDate);
          sessionStorage.setItem('originPost', $scope.originCountry.split("(")[1].slice(0,-1).trim());
          sessionStorage.setItem('destinationPost', $scope.destinationCountry.split("(")[1].slice(0,-1).trim());
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth() + 1; //January is 0!

          var yyyy = today.getFullYear();
          if (dd < 10) {
            dd = '0' + dd;
          }
          if (mm < 10) {
            mm = '0' + mm;
          }
          var today = mm + '/' + dd + '/' + yyyy;
          sessionStorage.setItem('dateCreated', today);
          
          if($scope.simulationSize=='large')
          {
	          $timeout(function() {
	             $window.location.href = '/dispatchReport.html';
	           }, 300000); //3000 to 24000 (wait for 5 minuts)
          }else{
        	  $window.location.href = '/dispatchReport.html';
          }
          //$window.location.href = '/dispatchReport.html';
        },
        function (response) {
          console.log(response);
        },
      );



    }


  }
  if (!('countryName' in sessionStorage)) {
  $window.location.href='/';
  return;
  }

  setInterval(function () {
    $scope.originCountry = $('#origin').text();
    $scope.destinationCountry = $('#destination').text();
    if ( $scope.originCountry!=="Origin" && $scope.destinationCountry!=="Destination" && $scope.originCountry !== $scope.destinationCountry && $scope.simulationSize != null && $scope.startDate != "" && $scope.endDate != "" && Date.parse($scope.startDate) <= Date.parse($scope.endDate))
      $("#continue-button").prop('disabled', false);
    else
      $("#continue-button").prop('disabled', true);
  }, 1000)




});
