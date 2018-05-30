mainApp.controller('DispatchReportController', function ($scope, $window, $http) {

    $scope.parcelRegistry = ["Tracked Packet", "Express", "Untracked Packet", "Parcel", "Registered"];
    sessionStorage.setItem('location', 'origin');
    sessionStorage.setItem('typeOfData', 'summary');
    $scope.originPost=sessionStorage.getItem('originPost');
    $scope.destinationPost=sessionStorage.getItem('destinationPost');
    $scope.startDate=sessionStorage.getItem('startDate').replace(/-/g,'/');
    $scope.endDate=sessionStorage.getItem('endDate').replace(/-/g,'/');
    $scope.dispatchView = true;
    $scope.dispatches = [];
    $scope.packages = [];
    



$scope.TestAngularMethod=function(val){

  $scope.parcelType=val;
  
  $("#"+sessionStorage.getItem('typeOfData')+"-link").click();
}





    $scope.getAllDispatches = function () {
        let data = JSON.stringify({
            startDate: sessionStorage.getItem('startDate'),
            endDate: sessionStorage.getItem('endDate'),
            originPost: sessionStorage.getItem('originPost'),
            destinationPost: sessionStorage.getItem('destinationPost'),
            dateCreated: sessionStorage.getItem('startDate')
        });

        $http.post('/report', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(
            function (response) {
                console.log(response);
                
                $scope.reconciledDispatches = [];
                $scope.unreconciledDispatches = [];
                $scope.totalReconciledWeight = 0;
                $scope.totalUnreconciledWeight = 0;
                $scope.totalReconciledPackages = 0;
                $scope.totalUnreconciledPackages = 0;
                if(response.data.data.length==0)
                {$scope.parcelType="Express";
                    return;}
                $scope.parcelType = "Express";//response.data.data[0].packageType;
                $('.select-styled').text($scope.parcelType);
                //(response.data.data)
                response.data.data.forEach(dispatch => {
                    $scope.totalReconciledWeight += dispatch.totalReconciledWeight;
                    $scope.totalUnreconciledWeight += dispatch.totalUnreconciledPackages;
                    $scope.totalReconciledPackages += dispatch.totalReconciledPackages;
                    $scope.totalUnreconciledPackages += dispatch.totalUnreconciledPackages;
                    if (dispatch.settlementStatus === "Reconciled" || dispatch.settlementStatus === "Settlement Agreed")
                        $scope.reconciledDispatches.push(dispatch);
                    else
                        $scope.unreconciledDispatches.push(dispatch);

                });


            },
            function (response) {
                console.log(response);
            },
        );
    }
    $scope.getAllDispatches(); // first call ()


    $scope.callback = function (containerType) {
        $scope.dispatchView = true;
        $scope.searchBy = "Dispatch ID";

        if (($('#origin-img').attr('src')).includes("Active"))
            sessionStorage.setItem('location', 'origin');
        else
            sessionStorage.setItem('location', 'destination');

        if (containerType === "summary-link") {
            sessionStorage.setItem('typeOfData', 'summary');
            $('#reconcile-link').removeClass("active");
            $('#unreconcile-link').removeClass("active");
            $('#summary-link').addClass("active");
            $scope.getSummary();

        } else if (containerType === "reconcile-link") {

            sessionStorage.setItem('typeOfData', 'reconcile');
            $('#summary-link').removeClass("active");
            $('#unreconcile-link').removeClass("active");
            $('#reconcile-link').addClass("active");
            $scope.getReconciledDispatches();
        } else {

            sessionStorage.setItem('typeOfData', 'unreconcile');
            $('#summary-link').removeClass("active");
            $('#reconcile-link').removeClass("active");
            $('#unreconcile-link').addClass("active");
            $scope.getUnreconciledDispatches();
        }

    }

    $scope.destinationDispatches = function () {

        $scope.dispatchView = true;
        $scope.searchBy = "Dispatch ID";

        $('#origin-img').attr('src', 'Icon/Unactive.png');
        $('#destination-img').attr('src', 'Icon/Active.png');
        sessionStorage.setItem('location', 'destination');
        if (sessionStorage.getItem("typeOfData") === "reconcile")
            $scope.getReconciledDispatches();
        else if (sessionStorage.getItem("typeOfData") === "unreconcile")
            $scope.getUnreconciledDispatches();

         
    }

    $scope.originDispatches = function () {

        $scope.dispatchView = true;
        $scope.searchBy = "Dispatch ID";

        $('#destination-img').attr('src', 'Icon/Unactive.png');
        $('#origin-img').attr('src', 'Icon/Active.png');
        sessionStorage.setItem('location', 'origin');
        if (sessionStorage.getItem("typeOfData") === "reconcile")
            $scope.getReconciledDispatches();
        else if (sessionStorage.getItem("typeOfData") === "unreconcile")
            $scope.getUnreconciledDispatches();

        
    }



    $scope.getSummary = function () {


        $("#table-container").css("display", "none");
        $("#summary-container").css("display", "block");
     
    }

    $scope.getReconciledDispatches = function () {

        $scope.dispatches = $scope.reconciledDispatches;
        $("#summary-container").css("display", "none");
        $("#table-container").css("display", "block");
        if (sessionStorage.getItem('location') === "origin") {
            $scope.actionRegistry = ["Settlement Agreed", "Dispute Settlement"];
            $scope.tableColumns = ["DISPATCH ID", "TOTAL RECONCILED WEIGHT", "TOTAL RECONCILED PACKAGES", "SETTLEMENT STATUS"];
            $scope.displayAction = true;
        } else {
            $scope.tableColumns = ["DISPATCH ID", "TOTAL RECONCILED WEIGHT", "TOTAL RECONCILED PACKAGES", "SETTLEMENT STATUS"];
            $scope.displayAction = false;
        }
    }

    $scope.getUnreconciledDispatches = function () {

        $scope.dispatches = $scope.unreconciledDispatches;
        $("#summary-container").css("display", "none");
        $("#table-container").css("display", "block");
        if (sessionStorage.getItem('location') === "origin") {
            $scope.actionRegistry = ["Settlement Agreed", "Dispute Settlement"];
            $scope.tableColumns = ["DISPATCH ID", "TOTAL UNRECONCILED WEIGHT", "TOTAL UNRECONCILED PACKAGES", "SETTLEMENT STATUS"];
            $scope.displayAction = true;
        } else {
            $scope.actionRegistry = ["Dispute Confirmed", "Settlement Requested"];
            $scope.tableColumns = ["DISPATCH ID", "TOTAL UNRECONCILED WEIGHT", "TOTAL UNRECONCILED PACKAGES", "SETTLEMENT STATUS"];
            $scope.displayAction = true;
        }


    }


    $scope.moveToPackageScreen = function (dispatchId) {

        $http.get('/package-report?dispatchId=' + dispatchId, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(
            function (response) {
                console.log(response);
                $scope.searchBy = "Package ID";
                $scope.dispatchId = dispatchId;
               
                
                $scope.reconciledPackages = [];
                $scope.unreconciledPackages = [];
                //(response.data.data)
                response.data.data.forEach(package => {
                    if (package.settlementStatus === "Reconciled") {
                        package.displayPackageActionDropdown = false;
                        package.packageUpdateAction = "Dispute Package";
                        package.actionRegistry = ["NA", "NA"];
                        $scope.reconciledPackages.push(package);


                    } else if (package.settlementStatus === "Settlement Agreed") {
                        package.displayPackageActionDropdown = false;
                        package.packageUpdateAction = "NA";
                        package.actionRegistry = ["NA", "NA"];
                        $scope.reconciledPackages.push(package);

                    } else if (package.settlementStatus === "Unreconciled") {
                        package.displayPackageActionDropdown = false;
                        if (sessionStorage.getItem('location') === 'origin')
                            package.packageUpdateAction = "Request Settlement";
                        else
                            package.packageUpdateAction = "NA";
                        package.actionRegistry = ["Confirm Dispute", "Request Settlement"];
                        $scope.unreconciledPackages.push(package);

                    } else if (package.settlementStatus === "Settlement Disputed") {

                        package.packageUpdateAction = "NA";
                        if (sessionStorage.getItem('location') === 'destination') {
                            package.actionRegistry = ["Confirm Dispute", "Request Settlement"];
                            package.displayPackageActionDropdown = true;
                        } else {
                            package.displayPackageActionDropdown = false;
                        }
                        $scope.unreconciledPackages.push(package);

                    } else if (package.settlementStatus === "Settlement Requested") {

                        package.packageUpdateAction = "NA";
                        if (sessionStorage.getItem('location') === 'origin') {
                            package.actionRegistry = ["Settlement Agreed", "Dispute Settlement"];
                            package.displayPackageActionDropdown = true;
                        } else
                            package.displayPackageActionDropdown = false;
                        $scope.unreconciledPackages.push(package);

                    } else if (package.settlementStatus === "Dispute Confirmed") {
                        package.displayPackageActionDropdown = false;
                        package.packageUpdateAction = "NA";
                        $scope.unreconciledPackages.push(package);
                    }
                });
              
                if (sessionStorage.getItem('location') === "destination" && sessionStorage.getItem('typeOfData') === 'reconcile') {
                    $scope.tableColumns = ["PACKAGE ID", "RECONCILED WEIGHT FOR PACKAGE", "SHIPMENT STATUS", "SETTLEMENT STATUS"];
                    $scope.packages = $scope.reconciledPackages;

                } else {
                    $scope.tableColumns = ["PACKAGE ID", "RECONCILED WEIGHT FOR PACKAGE", "SHIPMENT STATUS", "SETTLEMENT STATUS", "ACTION"];
                    $scope.dispatchView = false;
                    if (sessionStorage.getItem('typeOfData') === 'reconcile')
                        $scope.packages = $scope.reconciledPackages;
                    else
                        $scope.packages = $scope.unreconciledPackages;

                }

            },
            function (response) {
                console.log(response);
            }
        );



    }

    $scope.updateAction=function(action,packageId){
        if(action!=null)
        {
            let data={

                'type':'package',
                'id':packageId,
                'newStatus':action,
                'post':sessionStorage.getItem('location'),
                'country':sessionStorage.getItem('countryName')

            }
            $http.post('/update-package-settlement', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(
                function (response) {

                    $scope.getAllDispatches();
                    $scope.moveToPackageScreen($scope.dispatchId);
                    
                },
                function(response){

                }
            );

           
        }
    }

$scope.moveToPackageTimeLineScreen=function(package){
    sessionStorage.setItem('packageId',package.packageId);
    sessionStorage.setItem('packageWeight',package.weight);
    //sessionStorage.getItem('')
    $window.location.href='/packageTimeline.html';

}
  $scope.backToAllDispatch=function(){
      $scope.callback(sessionStorage.getItem('typeOfData')+"-link");
    
  }  


});
