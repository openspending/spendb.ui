
var loadSessionAccount = ['$q', '$http', 'session', 'config', function($q, $http, session, config) {
  var dfd = $q.defer();
  session.get(function(s) {
    $http.get(config.apiBaseUrl + '/api/3/accounts/' + s.user.name).then(function(res) {
      dfd.resolve(res.data);
    });
  });
  return dfd.promise;
}];


spendb.controller('AccountSettingsCtrl', ['$scope', '$http', '$location', 'validation', 'account', 'flash', 'session',
  function($scope, $http, $location, validation, account, flash, session) {
  $scope.setTitle("Account Settings");
  $scope.account = account;
  $scope.session = session;

  $scope.save = function(form) {
    $http.post(account.api_url, $scope.account).then(function(res) {
      flash.setMessage("Your changes have been saved!", "success");
      validation.clear(form);
    }, validation.handle(form));
  };

}]);
