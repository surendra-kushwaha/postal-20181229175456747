mainApp.controller('DispatchReportController', function($scope, $window, $http) {
    if (!('countryName' in sessionStorage)) {
        $window.location.href = '/';
        return;
    }
    $scope.parcelRegistry = ["Tracked Packet", "Express", "Untracked Packet", "Parcel", "Registered"];
    if (!('back' in sessionStorage)) {
        sessionStorage.setItem('location', 'origin');
        sessionStorage.setItem('typeOfData', 'summary');
    }
    $scope.convertToUTC = function(dt) {
        var localDate = new Date(dt);
        var localTime = localDate.getTime();
        var localOffset = localDate.getTimezoneOffset() * 60000;
        return new Date(localTime + localOffset);
    }
    $scope.originPost = sessionStorage.getItem('originPost');
    $scope.destinationPost = sessionStorage.getItem('destinationPost');
    $scope.startDate = $scope.convertToUTC(sessionStorage.getItem('startDate'));
    $scope.endDate = $scope.convertToUTC(sessionStorage.getItem('endDate'));
    $scope.dispatchView = true;
    $scope.dispatches = [];
    $scope.packages = [];
    $scope.totalReconciledWeight = 0;
    $scope.totalUnreconciledWeight = 0;
    $scope.totalReconciledPackages = 0;
    $scope.totalUnreconciledPackages = 0;
    $scope.activeMenuHeading = ["Summary View", "Reconciled Packages", "Unreconciled Packages"];

    $scope.updateOutput = function() {

        $scope.query = $('#searchBox').val();

    }
    $scope.updateSummaryData = function() {
        $scope.reconciledDispatches = [];
        $scope.unreconciledDispatches = [];
        $scope.totalReconciledWeight = 0;
        $scope.totalUnreconciledWeight = 0;
        $scope.totalReconciledPackages = 0;
        $scope.totalUnreconciledPackages = 0;
        $scope.allDispatches.forEach(dispatch => {
            if (dispatch.packageType === $scope.parcelType) {
                $scope.totalReconciledWeight += dispatch.totalReconciledWeight;
                $scope.totalUnreconciledWeight += dispatch.totalUnreconciledWeight;
                $scope.totalReconciledPackages += dispatch.totalReconciledPackages;
                $scope.totalUnreconciledPackages += dispatch.totalUnreconciledPackages;
                if (dispatch.dispatchId === "" || dispatch.dispatchId === "none")
                    dispatch.dispatchId = "NONE";
                if (dispatch.totalReconciledPackages > 0)
                    $scope.reconciledDispatches.push(dispatch);
                if (dispatch.totalUnreconciledPackages > 0)
                    $scope.unreconciledDispatches.push(dispatch);
            }


        });
        if ($scope.totalUnreconciledWeight % 1 != 0)
            $scope.totalUnreconciledWeight = $scope.totalUnreconciledWeight.toFixed(2);
        if ($scope.totalReconciledWeight % 1 != 0)
            $scope.totalReconciledWeight = $scope.totalReconciledWeight.toFixed(2);
        $("#" + sessionStorage.getItem('typeOfData') + "-link").click();
        //$scope.callback(sessionStorage.getItem('typeOfData') + "-link");
    }

    $scope.getAllDispatches = function() {
        let data = JSON.stringify({
            startDate: sessionStorage.getItem('startDate'),
            endDate: sessionStorage.getItem('endDate'),
            originPost: sessionStorage.getItem('originPost'),
            destinationPost: sessionStorage.getItem('destinationPost'),
            dateCreated: sessionStorage.getItem('dateCreated')
        });

        $http.post('/report', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(
            function(response) {
                // console.log(response);
                $scope.allDispatches = response.data.data;
                if (response.data.data.length == 0) {
                    $scope.parcelType = "Express";
                    return;
                }
                $scope.parcelType = response.data.data[0].packageType;

                $('.select-styled').text($scope.parcelType);




                //  $('.select-styled').text($scope.parcelType);
                //(response.data.data)

                $scope.updateSummaryData();

            },
            function(response) {
                console.log(response);
            },
        );
    }



    $scope.callback = function(containerType) {
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
            if (!('back' in sessionStorage))
                $scope.getSummary();

        } else if (containerType === "reconcile-link") {

            sessionStorage.setItem('typeOfData', 'reconcile');
            $('#summary-link').removeClass("active");
            $('#unreconcile-link').removeClass("active");
            $('#reconcile-link').addClass("active");
            if (!('back' in sessionStorage))
                $scope.getReconciledDispatches();
        } else {

            sessionStorage.setItem('typeOfData', 'unreconcile');
            $('#summary-link').removeClass("active");
            $('#reconcile-link').removeClass("active");
            $('#unreconcile-link').addClass("active");
            if (!('back' in sessionStorage))
                $scope.getUnreconciledDispatches();
        }

    }

    $scope.destinationDispatches = function() {

        $scope.dispatchView = true;
        $scope.searchBy = "Dispatch ID";

        $('#origin-img').attr('src', 'Icon/Unactive.png');
        $('#destination-img').attr('src', 'Icon/Active.png');
        sessionStorage.setItem('location', 'destination');
        if (!('back' in sessionStorage)) {
            if (sessionStorage.getItem("typeOfData") === "reconcile")
                $scope.getReconciledDispatches();
            else if (sessionStorage.getItem("typeOfData") === "unreconcile")
                $scope.getUnreconciledDispatches();
        }

    }

    $scope.originDispatches = function() {

        $scope.dispatchView = true;
        $scope.searchBy = "Dispatch ID";

        $('#destination-img').attr('src', 'Icon/Unactive.png');
        $('#origin-img').attr('src', 'Icon/Active.png');
        sessionStorage.setItem('location', 'origin');
        if (!('back' in sessionStorage)) {
            if (sessionStorage.getItem("typeOfData") === "reconcile")
                $scope.getReconciledDispatches();
            else if (sessionStorage.getItem("typeOfData") === "unreconcile")
                $scope.getUnreconciledDispatches();
        }


    }



    $scope.getSummary = function() {


        $("#table-container").css("display", "none");
        $("#summary-container").css("display", "block");


    }


    $scope.TestAngularMethod = function(val) {
        $scope.parcelType = val;

        $scope.packages = [];
        $scope.dispatches = [];

        $scope.updateSummaryData();
    }

    $scope.getReconciledDispatches = function() {
        $scope.dispatches = [];
        $scope.packages = [];
        $scope.noPackagesMsg = "Sorry, We could not find any Reconciled Packages for This Time Period!!";
        //$scope.activeMenuHeading=["Summary View","Reconciled Dispatches","Unreconciled Dispatches"];
        $scope.dispatchType = sessionStorage.getItem('typeOfData');
        $scope.dispatches = $scope.reconciledDispatches;
        if ($scope.dispatches.length > 0)
            $scope.parcelType = $scope.dispatches[0].packageType;
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

    $scope.getUnreconciledDispatches = function() {
        $scope.dispatches = [];
        $scope.packages = [];

        $scope.noPackagesMsg = "Sorry, We could not find any Unreconciled Packages for This Time Period!!";
        //$scope.activeMenuHeading=["Summary View","Reconciled Dispatches","Unreconciled Dispatches"];
        $scope.dispatchType = sessionStorage.getItem('typeOfData');
        $scope.dispatches = $scope.unreconciledDispatches;
        if ($scope.dispatches.length > 0)
            $scope.parcelType = $scope.dispatches[0].packageType;
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


    $scope.moveToPackageScreen = function(dispatchId) {

        $scope.packages = [];
        $("#summary-container").css("display", "none");
        $("#table-container").css("display", "block");
        $scope.displayAction = true;
        if (dispatchId === "NONE")
            dispatchId = "";

        $http.get('/package-report?dispatchId=' + dispatchId, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(
            function(response) {
                // console.log(response);
                $scope.searchBy = "Package ID";
                $scope.dispatchId = dispatchId;



                $scope.reconciledPackages = [];
                $scope.unreconciledPackages = [];


                // packagesData
                (response.data.data).forEach(package => {
                    package.dateCreated = new Date(package.dateCreated);
                    if (package.settlementStatus === "Reconciled") {
                        package.displayPackageActionDropdown = false;
                        if (sessionStorage.getItem('location') === "origin")
                            package.packageUpdateAction = "Dispute Package";
                        else
                            package.packageUpdateAction = "NA"

                        $scope.reconciledPackages.push(package);


                    } else if (package.settlementStatus === "Settlement Agreed") {
                        package.displayPackageActionDropdown = false;
                        package.packageUpdateAction = "NA";

                        $scope.reconciledPackages.push(package);

                    } else if (package.settlementStatus === "Unreconciled") {
                        package.displayPackageActionDropdown = false;
                        if (sessionStorage.getItem('location') === "destination")
                            package.packageUpdateAction = "Request Settlement";
                        else
                            package.packageUpdateAction = "NA";

                        $scope.unreconciledPackages.push(package);

                    } else if (package.settlementStatus === "Settlement Disputed") {

                        package.packageUpdateAction = "NA";
                        if (sessionStorage.getItem('location') === "destination") {
                            package.actionRegistry = ["Confirm Dispute", "Request Settlement"];
                            package.displayPackageActionDropdown = true;
                        } else {
                            package.displayPackageActionDropdown = false;
                        }
                        $scope.unreconciledPackages.push(package);

                    } else if (package.settlementStatus === "Settlement Requested") {

                        package.packageUpdateAction = "NA";
                        if (sessionStorage.getItem('location') === "origin") {
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


                $scope.dispatchView = false;

                if (sessionStorage.getItem('typeOfData') === 'reconcile') {
                    $scope.tableColumns = ["PACKAGE ID", "RECONCILED WEIGHT FOR PACKAGE", "SHIPMENT STATUS", "SETTLEMENT STATUS", "ACTION"];
                    $scope.packages = $scope.reconciledPackages;
                } else {
                    $scope.tableColumns = ["PACKAGE ID", "UNRECONCILED WEIGHT FOR PACKAGE", "SHIPMENT STATUS", "SETTLEMENT STATUS", "ACTION"];
                    $scope.packages = $scope.unreconciledPackages;
                }





            },
            function(response) {
                console.log(response);
            }
        );



    }
    if (!('back' in sessionStorage)) {
        $scope.getAllDispatches();
    } else {
        $scope.getAllDispatches();
        $scope.callback(sessionStorage.getItem('typeOfData') + "-link");

        $scope.moveToPackageScreen(sessionStorage.getItem('selectedPackageDispatchId'));
        $scope.dispatches = ["dummy"];

    }

    if ($scope.originPost === sessionStorage.getItem('countryName'))
        $scope.originDispatches();
    else
        $scope.destinationDispatches();

    sessionStorage.removeItem('back');
    $scope.updateAction = function(action, packageId) {
        if (action != null && action != "NA") {
            if (action === "Dispute Package" || action === "Dispute Settlement")
                action = "Settlement Disputed";
            else if (action === "Request Settlement")
                action = "Settlement Requested";
            else if (action === "Confirm Dispute")
                action = "Dispute Confirmed";


            let updateSettlementObject = JSON.stringify({

                'type': 'package',
                'id': packageId,
                'newStatus': action,
                'post': sessionStorage.getItem('location'),
                'country': sessionStorage.getItem('countryName')

            });
            $http.post('/update-package-settlement', updateSettlementObject, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(
                function(response) {
                    $('#exampleModalCenter').modal('show');
                    $scope.getAllDispatches();
                    $scope.moveToPackageScreen($scope.dispatchId);

                },
                function(response) {

                }
            );


        }
    }

    $scope.moveToPackageTimeLineScreen = function(package) {
        sessionStorage.setItem('selectedPackageId', ((package.packageId == null || package.packageId === "" || package.packageId === "none") ? "None" : package.packageId));
        sessionStorage.setItem('selectedPackageWeight', package.weight);
        sessionStorage.setItem('selectedPackageDispatchId', ((package.dispatchId == null || package.receptacleId === "none" || package.dispatchId === "") ? "None" : package.dispatchId));

        sessionStorage.setItem('selectedPackageRecepticleId', ((package.receptacleId == null || package.receptacleId === "") ? "None" : package.receptacleId));
        sessionStorage.setItem('selectedPackageshipmentStatus', package.shipmentStatus);
        sessionStorage.setItem('selectedPackageSettlementStatus', package.settlementStatus);
        sessionStorage.setItem('back', true);
        //sessionStorage.getItem('')
        $window.location.href = '/packageTimeline.html';

    }
    $scope.backToAllDispatch = function() {
        $scope.callback(sessionStorage.getItem('typeOfData') + "-link");

    }





});