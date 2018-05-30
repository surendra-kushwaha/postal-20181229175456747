mainApp
  .controller('LoginController', function($scope,$window, $http) {
    $scope.loginError = false;
 $scope.validateUser = function (username, password) {
   if ((username === undefined || username === "") || (password === undefined || password === "")) {
     alert("Please enter the details!!");
     return;

   }

   var data = JSON.stringify({
     credentials: {
       user_name: username,
       password: password,
     }
   });

   $http({
     method: 'post',
     url: '/login',
     data: data,
     config: 'Content-Type: application/json;',
   }).then(
     function (response) {
         //$location.url('/home.html');
         sessionStorage.setItem('countryName', response.data.name);
         $window.location.href = '/home.html';
     },
     function (response) {
     

       console.log(response)
     },
   );
 };
});