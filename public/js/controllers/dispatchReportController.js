mainApp.controller('DispatchReportController', function ($scope, $window, $http) {

  $scope.parcelRegistry = ["Tracked Packet", "Express", "Untracked Packet", "Parcel", "Registered"];
  sessionStorage.setItem('location', 'origin');
  sessionStorage.setItem('typeOfData', 'summary');
  $scope.originPost = sessionStorage.getItem('originPost');
  $scope.destinationPost = sessionStorage.getItem('destinationPost');
  $scope.startDate = sessionStorage.getItem('startDate');
  $scope.endDate = sessionStorage.getItem('endDate');
  $scope.dispatchView = true;
  $scope.dispatches = [];
  $scope.packages = ["dummy"];







  $scope.updateOutput = function () {

    $scope.query = $('#searchBox').val();

  }
  $scope.updateSummaryData=function(){
    $scope.reconciledDispatches=[];
    $scope.unreconciledDispatches=[];
    $scope.totalReconciledWeight = 0;
    $scope.totalUnreconciledWeight = 0;
    $scope.totalReconciledPackages = 0;
    $scope.totalUnreconciledPackages = 0;
    $scope.allDispatches.forEach(dispatch => {
      if(dispatch.packageType===$scope.parcelType){
        $scope.totalReconciledWeight += dispatch.totalReconciledWeight;
        $scope.totalUnreconciledWeight += dispatch.totalUnreconciledWeight;
        $scope.totalReconciledPackages += dispatch.totalReconciledPackages;
        $scope.totalUnreconciledPackages += dispatch.totalUnreconciledPackages;
        if(dispatch.dispatchId==="" || dispatch.dispatchId==="none")
        dispatch.dispatchId="NOT AVAILABLE";
        if (dispatch.settlementStatus === "Reconciled" || dispatch.settlementStatus === "Settlement Agreed")
          $scope.reconciledDispatches.push(dispatch);
        else
          $scope.unreconciledDispatches.push(dispatch);
      }


    });
    if($scope.totalUnreconciledWeight % 1 !=0)
        $scope.totalUnreconciledWeight=$scope.totalUnreconciledWeight.toFixed(2);
        if($scope.totalReconciledWeight % 1 !=0)
        $scope.totalReconciledWeight=$scope.totalReconciledWeight.toFixed(2);
    $("#" + sessionStorage.getItem('typeOfData') + "-link").click();
    //$scope.callback(sessionStorage.getItem('typeOfData') + "-link");
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
        $scope.allDispatches=response.data.data;
        if (response.data.data.length == 0) {
          $scope.parcelType = "Express";
          return;
        }
        $scope.parcelType = response.data.data[0].packageType;
        $('.select-styled').text($scope.parcelType);
        //(response.data.data)

$scope.updateSummaryData();

      },
      function (response) {
        console.log(response);
      },
    );
  }
  $scope.getAllDispatches();


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
  if($scope.originPost===sessionStorage.getItem('countryName'))
  $scope.originDispatches();
  else
  $scope.destinationDispatches();


  $scope.getSummary = function () {


    $("#table-container").css("display", "none");
    $("#summary-container").css("display", "block");


  }


  $scope.TestAngularMethod = function (val) {

    $scope.parcelType = val;


    $scope.updateSummaryData();
  }

  $scope.getReconciledDispatches = function () {

    $scope.dispatchType=sessionStorage.getItem('typeOfData');
    $scope.dispatches = $scope.reconciledDispatches;
    if($scope.dispatches.length>0)
    $scope.parcelType=$scope.dispatches[0].packageType;
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

    $scope.dispatchType=sessionStorage.getItem('typeOfData');
    $scope.dispatches = $scope.unreconciledDispatches;
    if($scope.dispatches.length>0)
    $scope.parcelType=$scope.dispatches[0].packageType;
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
if(dispatchId==="NOT AVAILABLE")
dispatchId="";

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

        // packagesData
        (response.data.data).forEach(package => {

          if (package.settlementStatus === "Reconciled") {
            package.displayPackageActionDropdown = false;
            if (sessionStorage.getItem('location') === "origin")
            package.packageUpdateAction = "Dispute Package";
            else
            package.packageUpdateAction = "NA"
            package.actionRegistry = ["NA", "NA"];
            $scope.reconciledPackages.push(package);


          } else if (package.settlementStatus === "Settlement Agreed") {
            package.displayPackageActionDropdown = false;
            package.packageUpdateAction = "NA";
            package.actionRegistry = ["NA", "NA"];
            $scope.reconciledPackages.push(package);

          } else if (package.settlementStatus === "Unreconciled") {
            package.displayPackageActionDropdown = false;
            if (sessionStorage.getItem('location') === "destination")
              package.packageUpdateAction = "Request Settlement";
            else
              package.packageUpdateAction = "NA";
            package.actionRegistry = ["NA", "NA"];
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

  $scope.updateAction = function (action, packageId) {
    if (action != null && action != "NA") {
      let updateSettlementObject = {

        'type': 'package',
        'id': packageId,
        'newStatus': action,
        'post': sessionStorage.getItem('location'),
        'country': sessionStorage.getItem('countryName')

      }
      $http.post('/update-package-settlement', updateSettlementObject, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(
        function (response) {

          $scope.getAllDispatches();
          $scope.moveToPackageScreen($scope.dispatchId);

        },
        function (response) {

        }
      );


    }
  }

  $scope.moveToPackageTimeLineScreen = function (package) {
    sessionStorage.setItem('packageId', package.packageId);
    sessionStorage.setItem('packageWeight', package.weight);
    //sessionStorage.getItem('')
    $window.location.href = '/packageTimeline.html';

  }
  $scope.backToAllDispatch = function () {
    $scope.callback(sessionStorage.getItem('typeOfData') + "-link");

  }





});
