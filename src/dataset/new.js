
spendb.controller('DatasetNewCtrl', ['$scope', '$rootScope', '$http', '$location', 'slugifyFilter', 'config', 'validation', 'session', 'config',
  function($scope, $rootScope, $http, $location, slugifyFilter, config, validation, session, config) {
  var bindSlug = true;

  $rootScope.setTitle("Create a new dataset");
  $scope.baseUrl = config.site_url + '/datasets/';
  $scope.forms = {};
  $scope.session = session;

  $scope.editSlug = function() {
    bindSlug = false;
  }

  $scope.$watch('dataset.label', function(e) {
    if (bindSlug && e) {
      $scope.dataset.name = slugifyFilter(e, '-');
    }
  });

  $scope.dataset = {'category': 'budget', 'territories': [], 'private': true};

  $scope.createDataset = function() {
    validation.clear($scope.forms.dataset);
    $http.post(config.apiBaseUrl + '/api/3/datasets', $scope.dataset).then(function(res) {
      $scope.dataset = res.data;
      $location.search({mode: 'wizard'});
      $location.path('/datasets/' + res.data.name + '/upload');
    }, validation.handle($scope.forms.dataset));
  };

  $scope.canCreate = function() {
    return $scope.dataset.label && $scope.dataset.label.length >= 2;
  };

}]);
