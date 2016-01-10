angular.module('spendb.config', []).constant('config', SPENDB_CONFIG);

var spendb = angular.module('spendb', ['spendb.config', 'spendb.templates', 'ngCookies',
                                       'ngRoute', 'angular.filter', 'duScroll',
                                       'ngFileUpload', 'ui.bootstrap', 'ui.select', 'ngBabbage']);


spendb.constant('config', {
   appName: 'SpenDB',
   appVersion: 1.0,
   apiBaseUrl: ''
});
spendb.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {

  $routeProvider.when('/', {
    templateUrl: 'home.html',
    controller: 'HomeCtrl',
    reloadOnSearch: true,
    resolve: {
      session: loadSession,
      page: loadIndex,
      datasets: loadIndexDatasets
    }
  });

  $routeProvider.when('/docs/:path', {
    templateUrl: 'docs.html',
    controller: 'DocsCtrl',
    resolve: {
      page: loadPage
    }
  });

  $routeProvider.when('/login', {
    templateUrl: 'account/login.html',
    controller: 'AccountLoginCtrl',
    resolve: {}
  });

  $routeProvider.when('/settings', {
    templateUrl: 'account/settings.html',
    controller: 'AccountSettingsCtrl',
    resolve: {
      session: loadSession,
      account: loadSessionAccount
    }
  });

  $routeProvider.when('/accounts/:account', {
    templateUrl: 'account/profile.html',
    controller: 'AccountProfileCtrl',
    reloadOnSearch: true,
    resolve: {
      profile: loadProfile
    }
  });

  $routeProvider.when('/datasets', {
    templateUrl: 'dataset/index.html',
    controller: 'DatasetIndexCtrl',
    reloadOnSearch: true,
    resolve: {
      datasets: loadIndexDatasets
    }
  });

  $routeProvider.when('/datasets/new', {
    templateUrl: 'dataset/new.html',
    controller: 'DatasetNewCtrl',
    resolve: {
      session: loadSession,
      reference: loadReferenceData
    }
  });

  $routeProvider.when('/datasets/:dataset', {
    templateUrl: 'dataset/query.html',
    controller: 'DatasetQueryCtrl',
    reloadOnSearch: false,
    resolve: {
      dataset: loadDataset
    }
  });

  $routeProvider.when('/datasets/:dataset/about', {
    templateUrl: 'dataset/about.html',
    controller: 'DatasetAboutCtrl',
    resolve: {
      dataset: loadDataset,
      managers: loadManagers,
      model: loadModel,
      sources: loadSources,
      reference: loadReferenceData
    }
  });

  $routeProvider.when('/datasets/:dataset/upload', {
    templateUrl: 'dataset/upload.html',
    controller: 'DatasetUploadCtrl',
    resolve: {
      dataset: loadDataset
    }
  });

  $routeProvider.when('/datasets/:dataset/edit', {
    templateUrl: 'dataset/edit.html',
    controller: 'DatasetEditCtrl',
    resolve: {
      session: loadSession,
      dataset: loadDataset,
      reference: loadReferenceData,
      managers: loadManagers
    }
  });

  $routeProvider.when('/datasets/:dataset/sources', {
    templateUrl: 'dataset/sources.html',
    controller: 'DatasetSourcesCtrl',
    resolve: {
      dataset: loadDataset
    }
  });

  $routeProvider.when('/datasets/:dataset/model/measures', {
    templateUrl: 'dataset/measures.html',
    controller: 'DatasetMeasuresCtrl',
    resolve: {
      dataset: loadDataset,
      data: loadModel
    }
  });

  $routeProvider.when('/datasets/:dataset/model/dimensions', {
    templateUrl: 'dataset/dimensions.html',
    controller: 'DatasetDimensionsCtrl',
    resolve: {
      dataset: loadDataset,
      data: loadModel
    }
  });

  $routeProvider.otherwise({
    redirectTo: '/'
  });

  $locationProvider.html5Mode(true);
}]);


spendb.controller('AppCtrl', ['$scope', '$rootScope', '$location', '$http', '$cookies', '$window', '$document', '$sce', 'session', 'config',
  function($scope, $rootScope, $location, $http, $cookies, $window, $document, $sce, session, config) {

  // EU cookie warning
  $scope.showCookieWarning = !$cookies.neelieCookie;
  $scope.showSpinner = true;

  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    $scope.showSpinner = true;
  });

  $rootScope.$on("$routeChangeSuccess", function (event, next, current) {
    $scope.showSpinner = false;
  });

  $rootScope.$on("$routeChangeError", function (event, next, current) {
    $scope.showSpinner = false;
  });

  $scope.hideCookieWarning = function() {
    $cookies.neelieCookie = true;
    $scope.showCookieWarning = !$cookies.neelieCookie;
  };

  session.get(function(s) {
    if (s.logged_in) {
      $scope.hideCookieWarning();
    }
  });

  // Language selector
  $scope.setLocale = function(locale) {
    $http.post('/set-locale', {'locale': locale}).then(function(res) {
      $window.location.reload();
    });
    return false;
  };

  $rootScope.setTitle = function(title) {
    $rootScope.currentTitle = title;
    angular.element(document.getElementsByTagName('title')).html(title + ' - ' + config.site_title);
  };

  // reset the page.
  $scope.resetScroll = function() {
    var elem = angular.element(document.getElementsByTagName('body'));
    $document.scrollToElement(elem, 0, 300);
  };

  $scope.scrollToId = function(id) {
    var elem = angular.element(document.getElementById(id));
    $document.scrollToElement(elem, 0, 200);
  };

  // Allow SCE escaping in the app
  $scope.trustAsHtml = function(text) {
    return $sce.trustAsHtml('' + text);
  };

}]);


var loadPage = ['$q', '$route', '$http', 'config', function($q, $route, $http, config) {
  var dfd = $q.defer();
  $http.get(config.apiBaseUrl+'/api/3/pages/' + $route.current.params.path).then(function(res) {
    dfd.resolve(res.data);
  });
  return dfd.promise;
}];


spendb.controller('DocsCtrl', ['$scope', '$sce', 'page', function($scope, $sce, page) {
  $scope.setTitle(page.title);
  $scope.page = page;
  $scope.page_html = $sce.trustAsHtml('' + page.html);
}]);
