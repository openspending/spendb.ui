
spendb.controller('AccountResetCtrl', ['$scope', '$modalInstance', '$window', '$location', '$http', 'config',
  function($scope, $modalInstance, $window, $location, $http, config) {

  $scope.data = {};
  $scope.res = {};
  $scope.sent = false;

  $scope.close = function() {
    $modalInstance.dismiss('ok');
  };

  $scope.send = function() {
    $scope.sent = true;
    $http.post(config.apiBaseUrl + '/api/3/reset', $scope.data).then(function(res) {
      $scope.res = res.data;
    }, function(res) {
      $scope.res = res.data;
      $scope.sent = false;
    });
  };

}]);
