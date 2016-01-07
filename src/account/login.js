
spendb.controller('AccountLoginCtrl', ['$scope', '$modal', '$http', '$location', 'validation', 'session', 'config',
  function($scope, $modal, $http, $location, validation, session, config) {
  $scope.setTitle("Login and registration");

  $scope.credentials = {};
  $scope.account = {};

  $scope.login = function(form) {
    var cred = angular.copy($scope.credentials);
    $scope.credentials.password = '';
    $http.post(config.apiBaseUrl + '/api/3/sessions/login', cred).then(function(res) {
      session.flush();
      $location.path('/accounts/' + $scope.credentials.login);
    }, validation.handle(form));
  };

  $scope.register = function(form) {
    $http.post(config.apiBaseUrl + '/api/3/accounts', $scope.account).then(function(res) {
      session.flush();
      $location.path('/accounts/' + $scope.account.name);
    }, validation.handle(form));
  };

  $scope.resetPassword = function() {
    var d = $modal.open({
      templateUrl: 'account/reset.html',
      controller: 'AccountResetCtrl',
      backdrop: true,
      resolve: {},
    });
  };

}]);
