mainApp.controller('HomeController', function ($scope, $window, $http) {

   // $scope.countryList = ["UK(GB)", "USA(US)", "China(CN)", "Germany(DN)", "Canada(CA)", "Japan(JP)", "France(FR)"]

    $scope.simulate = function () {

        var date1 = new Date($scope.startDate);
        var date2 = new Date($scope.endDate);
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (diffDays <= 1) {
            alert("Date Range of Simulation should be greater than 15 days!!");
            return;
        } else {
            $('#exampleModalCenter').modal('hide');
            $('#loadModal').modal('show');
            //$window.location.href = '/dispatchReport.html';
            let data = JSON.stringify({
                startDate: $scope.startDate,
                endDate: $scope.endDate,
                originPost: $scope.originCountry.slice(0, $scope.originCountry.indexOf("(")).trim(),
                destinationPost: $scope.destinationCountry.slice(0, $scope.destinationCountry.indexOf("(")).trim(),
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
                    sessionStorage.setItem('originPost', $scope.originCountry);
                    sessionStorage.setItem('destinationPost', $scope.destinationCountry);
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
                    $window.location.href = '/dispatchReport.html';
                },
                function (response) {
                    console.log(response);
                },
            );



        }


    }

setInterval(function () {
    $scope.originCountry=$('#origin').text();
    $scope.destinationCountry=$('#destination').text();
        if ($scope.originCountry != null && $scope.destinationCountry != null && $scope.originCountry !== $scope.destinationCountry && $scope.simulationSize != null && $scope.startDate != null && $scope.endDate != null)
            $("#continue-button").prop('disabled', false);
        else
            $("#continue-button").prop('disabled', true);
    }, 1000)




});