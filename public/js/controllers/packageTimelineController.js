mainApp
  .controller('PackageTimelineController', function($scope,$window, $http,$sce, $rootScope) {
	$scope.userCountry=$rootScope.userCountry;
    if (!('countryName' in sessionStorage)) {
        $window.location.href='/';
        return;
        }
        $scope.getDateTime = function(date) {
            var dd = date.getDate();
            var mm = date.getMonth() + 1; //January is 0!

            var yyyy = date.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }

            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            // var strTime = hours + ':' + minutes + ' ' + ampm;

            return (mm + '/' + dd + '/' + yyyy + " - " + hours + ':' + minutes + ' ' + ampm);

            // var hh=Number(date.substring(8,10))
            // if(hh>11)
            // var ampm="pm"
            // else
            // var ampm="am";
            // if(hh>12)
            // hh=hh-12;



            // return (date.substring(4,6) + '/' + date.substring(6,8) + '/' + date.substring(0,4) + " - "+ hh + ':' + date.substring(10,12) + " "+ampm );
        }


        $http.post('/package-history', { packageId: sessionStorage.getItem('selectedPackageId'), dispatchId: sessionStorage.getItem('selectedPackageDispatchId') }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(
            function(response) {
                // console.log(response.data)
                $scope.packageId = sessionStorage.getItem('selectedPackageId');
                $scope.packageWeight = sessionStorage.getItem('selectedPackageWeight');
                $scope.dispatchId = (sessionStorage.getItem('selectedPackageDispatchId'));
                $scope.receptacleId = sessionStorage.getItem('selectedPackageRecepticleId');
                $scope.finalShipmentStatus = sessionStorage.getItem('selectedPackageshipmentStatus');
                $scope.finalSettlementStatus = sessionStorage.getItem('selectedPackageSettlementStatus');
                $scope.packageHistory = [];

                response.data.forEach(element => {
                    element.date = new Date(element.date);
                    if (element.statusDescription == undefined)
                        element.statusDescription = "";
                    if (element.statusType === "Shipment Status")
                        var td = $sce.trustAsHtml("<td class='shipment-status-entry'><p><span class='EMA mb-2'>" + element.status + "</span>" + element.statusDescription + "</p></td><td class='timestamp pt-0'>" + $scope.getDateTime(element.date) + "</td>");
                    else
                        var td = $sce.trustAsHtml("<td class='timestamp pt-2'>" + $scope.getDateTime(element.date) + "</td><td class='settlment-status-entry'> <p>" + element.status + "</p></td>");

                    $scope.packageHistory.push(td);
                });
            },
            function(response) {

            });

    });