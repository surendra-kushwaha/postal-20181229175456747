mainApp
  .controller('PackageTimelineController', function($scope,$window, $http,$sce) {

    $scope.shipmentStatusHtml=$sce.trustAsHtml("<td class='shipment-status-entry'><p><span class='EMA mb-2'>"+"element.status"+"</span>"+"element.status"+"</p></td><td class='timestamp pt-0'>"+"element.timeStamp"+"</td>");
    $scope.shipmentStatusHtml1=$sce.trustAsHtml("<td class='timestamp pt-2'>03/23/2018 — 04:15 pm</td><td class='settlment-status-entry'> <p>Unreconciled</p></td>");

    $scope.array=[];
    $scope.array.push($scope.shipmentStatusHtml);
    $scope.array.push($scope.shipmentStatusHtml1);

    $scope.getDateTime=function(date)
    {

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
  minutes = minutes < 10 ? '0'+minutes : minutes;
  //var strTime = hours + ':' + minutes + ' ' + ampm;

                    return (mm + '/' + dd + '/' + yyyy + " - "+ hours + ':' + minutes + ' ' + ampm);
    }
    // $scope.array.push(false);
    // $scope.array.push(true);

  $http.get('/package-history?packageId=' + sessionStorage.getItem('packageId'), {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(
        function (response) {
          console.log(response.data)
            $scope.packageHistory=[];

            response.data.forEach(element => {
              element.date=new Date(element.date);
             if(element.statusType==="shipment")
             var td=$sce.trustAsHtml("<td class='shipment-status-entry'><p><span class='EMA mb-2'>"+element.status+"</span>"+element.statusDescription+"</p></td><td class='timestamp pt-0'>"+$scope.getDateTime(element.date)+"</td>");
             else
             var td=$sce.trustAsHtml("<td class='timestamp pt-2'>"+$scope.getDateTime(element.date)+"</td><td class='settlment-status-entry'> <p>"+element.status+"</p></td>");

             $scope.packageHistory.push(td);
            });




        },function(response){

        });










  });
