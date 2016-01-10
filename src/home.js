
var loadIndex = ['$q', '$route', '$http', 'config', function($q, $route, $http, config) {
  var dfd = $q.defer();
  // yes that's what baby jesus made APIs for.
  $http.get(config.apiBaseUrl + '/api/3/pages/index.html').then(function(res) {
    dfd.resolve(res.data);
  });
  return dfd.promise;
}];


var loadIndexDatasets = ['$q', '$http', '$location', '$route', 'config', function($q, $http, $location, $route, config) {
  var dfd = $q.defer();
  $http.get(config.apiBaseUrl + '/api/3/datasets', {params: $location.search()}).then(function(res) {
    dfd.resolve(res.data);
  });
  return dfd.promise;
}];


spendb.controller('HomeCtrl', ['$scope', '$rootScope', '$location', '$sce', 'page', 'config', 'datasets', 'session',
    function($scope, $rootScope, $location, $sce, page, config, datasets, session) {
  $scope.setTitle(config.site_title);
  $scope.page = page;
  $scope.session = session;
  $scope.datasets = datasets;
  $scope.page_html = $sce.trustAsHtml('' + page.html);

  $scope.hasFacet = function(name, value) {
    var query = $location.search();
    if (angular.isArray(query[name])) {
      return query[name].indexOf(value) != -1;
    }
    return query[name] == value;
  };

  $scope.scrollToDatasets = function() {
    $scope.scrollToId('datasets');
  }

  $scope.toggleFacet = function(name, value) {
    var query = $location.search(),
        isArray = angular.isArray(query[name]);
    if ($scope.hasFacet(name, value)) {
      if (isArray) {
        query[name].splice(query[name].indexOf(value), 1);
      } else {
        delete query[name];
      }
    } else {
      if (isArray) {
        query[name].push(value);
      } else if (query[name]) {
        query[name] = [query[name], value]; 
      } else {
        query[name] = value;
      }
    }
    if (query.offset) {
      delete query['offset'];
    }
    $location.search(query);
  };

}]);
