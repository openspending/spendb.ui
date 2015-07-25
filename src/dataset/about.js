
spendb.controller('DatasetAboutCtrl', ['$scope', '$location', '$http', 'dataset', 'model', 'managers', 'sources', 'config', 'reference',
    function($scope, $location, $http, dataset, model, managers, sources, config, reference) {
  $scope.setTitle(dataset.label);
  $scope.dataset = dataset;
  $scope.managers = managers;
  $scope.model = model.model;
  $scope.config = config;
  $scope.sources = sources;

  $scope.getReferenceLabel = function(list, code) {
    for (var i in reference[list]) {
      var val = reference[list][i];
      if (val.code == code) {
        return val.label;
      }
    }
    return code;
  };

}]);
