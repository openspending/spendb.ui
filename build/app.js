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
;
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
;
var loadProfile = ['$q', '$http', '$location', '$route', 'config', function($q, $http, $location, $route, config) {
  var url = config.apiBaseUrl + '/api/3/accounts/' + $route.current.params.account,
      dfd = $q.defer(),
      account = $route.current.params.account,
      params = angular.extend({}, $location.search(), {account: account});
  $q.all([
    $http.get(config.apiBaseUrl + '/api/3/accounts/' + account),
    $http.get(config.apiBaseUrl + '/api/3/datasets', {params: params})
  ]).then(function(data) {
    dfd.resolve({
      account: data[0].data,
      datasets: data[1].data
    });
  });
  return dfd.promise;
}];


spendb.controller('AccountProfileCtrl', ['$scope', '$http', '$location', 'session', 'profile',
  function($scope, $http, $location, session, profile) {
  $scope.setTitle(profile.account.display_name);
  $scope.account = profile.account;
  $scope.own_profile = false;
  $scope.datasets = profile.datasets;

  session.get(function(sess) {
    $scope.own_profile = sess.logged_in && sess.user.name == profile.account.name;
  });

}]);
;
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
;
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
;
spendb.controller('DatasetCtrl', ['$scope', '$rootScope', '$http', '$modal', 'config',
  function($scope, $rootScope, $http, $modal, config) {
  $scope.currentSection = 'home';

  $scope.dataset = config.dataset;

  $rootScope.setSection = function(section) {
    $scope.currentSection = section;
  };

  $scope.deleteDataset = function() {
    var d = $modal.open({
      templateUrl: 'admin/delete.html',
      controller: 'AdminDeleteCtrl',
      backdrop: true,
      resolve: {
        dataset: function() {
          return $scope.dataset;
        },
      }
    });
  };

  $scope.togglePrivate = function() {
    $scope.dataset.private = !$scope.dataset.private;
    $http.post($scope.dataset.api_url, $scope.dataset).then(function(res) {
      $scope.dataset = res.data;
    })
  };

}]);
;
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
;
spendb.controller('DatasetDeleteCtrl', ['$scope', '$modalInstance', '$window', '$location', '$http', 'dataset',
  function($scope, $modalInstance, $window, $location, $http, dataset) {
  $scope.dataset = dataset;

  $scope.close = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.delete = function() {
    $http.delete($scope.dataset.api_url).error(function(res) {
      $location.path('/');
      $modalInstance.close('ok');
    });
  };
}]);
;
spendb.controller('DatasetDimensionEditCtrl', ['$scope', '$modalInstance', '$window', '$location', '$http', 'slugifyFilter', 'dimension', 'dimensions',
  function($scope, $modalInstance, $window, $location, $http, slugifyFilter, dimension, dimensions) {
  $scope.dimension = dimension;

  $scope.removeAttribute = function(attribute) {
    var idx = $scope.dimension.attributes.indexOf(attribute);
    if (idx != -1 || $scope.dimension.attributes.length > 1) {
      $scope.dimension.attributes.splice(idx, 1);
      if ($scope.dimension.label_attribute == attribute) {
        $scope.dimension.label_attribute = $scope.dimension.attributes[0];
      }
      if ($scope.dimension.key_attribute == attribute) {
        $scope.dimension.key_attribute = $scope.dimension.attributes[0];
      }
    }
  };

  $scope.breakSlugLink = function(obj) {
    obj.slug_linked = false;
  };

  $scope.updateSlug = function(obj) {
    if (obj.slug_linked) {
      obj.name = slugifyFilter(obj.label, '_');
    }
  };

  $scope.validLabel = function(obj) {
    if (!obj || !obj.label || obj.label.length < 2) {
      return false;
    }
    return true;
  };

  var validSlug = function(obj) {
    if (!obj || !obj.name || obj.name.length < 2) {
      return false;
    }
    if (obj.name != slugifyFilter(obj.name, '_')) {
      return false;
    }
    return true;
  };

  $scope.validAttributeSlug = function(obj) {
    if (!validSlug(obj)) {
      return false;
    }
    for (var i in $scope.dimension.attributes) {
      var attr = $scope.dimension.attributes[i];
      if (attr != obj && attr.name == obj.name) {
        return false;
      }
    }
    return true;
  };

  $scope.validDimensionSlug = function(obj) {
    obj.$invalidName = null;
    if (!validSlug(obj)) {
      return false;
    }
    for (var i in dimensions) {
      var dim = dimensions[i];
      if (dim != obj && dim.name == obj.name) {
        obj.$invalidName = 'A dimension with this name already exists.';
        return false;
      }
    }
    return true;
  };

  $scope.canUpdate = function() {
    if (!$scope.validDimensionSlug($scope.dimension)) {
      return false;
    }
    if (!$scope.validLabel($scope.dimension)) {
      return false;
    }
    for (var i in $scope.dimension.attributes) {
      var attr = $scope.dimension.attributes[i];
      if (!$scope.validAttributeSlug(attr)) {
        return false;
      }
      if (!$scope.validLabel(attr)) {
        return false;
      }
    }
    return true;
  };

  $scope.update = function() {
    if ($scope.canUpdate) {
      $modalInstance.close($scope.dimension);
    }
  };

  $scope.close = function() {
    $modalInstance.dismiss('ok');
  };
}]);
;
spendb.controller('DatasetDimensionsCtrl', ['$scope', '$modal', '$http', '$location', '$q', 'slugifyFilter', 'flash', 'validation', 'dataset', 'data',
  function($scope, $modal, $http, $location, $q, slugifyFilter, flash, validation, dataset, data) {
  $scope.dataset = dataset;
  $scope.selectedFields = {};
  $scope.dimensions = [];

  var load = function(model) {
    var measures = model.measures || {},
        dimensions = model.dimensions || {},
        dims = [];
    for (var name in dimensions) {
      var dim = dimensions[name];
      dim.name = name;
      dim.slug_linked = false;
      var attributes = dim.attributes || {},
          attrs = [];
      for (var an in attributes) {
        var attr = attributes[an];
        attr.name = an;
        attr.slug_linked = false;
        if (an == dim.label_attribute) {
          dim.label_attribute = attr;
        }
        if (an == dim.key_attribute) {
          dim.key_attribute = attr;
        }
        attrs.push(attr);
      }
      dim.attributes = attrs;
      dims.push(dim);
    }
    $scope.dimensions = dims;
  };

  var unload = function() {
    var dimensions = {};
    for (var i in $scope.dimensions) {
      var dim = angular.copy($scope.dimensions[i]),
          attributes = {};
      for (var j in dim.attributes) {
        var attr = dim.attributes[j];
        attributes[attr.name] = attr;
      }
      dim.attributes = attributes;
      dim.label_attribute = dim.label_attribute.name;
      dim.key_attribute = dim.key_attribute.name;
      dimensions[dim.name] = dim;
    }
    var model = angular.copy(data.model) || {};
    model.dimensions = dimensions;
    return model;
  };

  $scope.getAvailableFields = function() {
    var fields = [],
        measures = data.model.measures || {};
    for (var f in data.structure.fields) {
      var field = data.structure.fields[f],
          include = true;
      for (var i in measures) {
        var measure = measures[i];
        if (measure.column == field.name) {
          include = false
        }
      }
      if (include) {
        for (var i in $scope.dimensions) {
          var dim = $scope.dimensions[i];
          for (var j in dim.attributes) {
            var attr = dim.attributes[j];
            if (attr.column == field.name) {
              include = false;
            }
          }
        }
      }
      if (include) {
        fields.push(field);
      }
    }
    return fields.sort(function(a, b) { return a.title.localeCompare(b.title); });
  };

  $scope.toggleSamples = function(field) {
    field.show_samples = !field.show_samples;
  };

  $scope.canAdd = function() {
    for (var n in $scope.selectedFields) {
      if($scope.selectedFields[n]) {
        return true;
      }
    }
    return false;
  };

  $scope.addFields = function(dimension) {
    dimension = dimension || {};
    dimension.attributes = dimension.attributes || [];

    var labels = [];
    for (var n in $scope.selectedFields) {
      if ($scope.selectedFields[n]) {
        for (var i in data.structure.fields) {
          var field = data.structure.fields[i];
          if (field.name == n) {
            dimension.attributes.push({
            name: field.name,
            column: field.name,
            label: field.title,
            slug_linked: true
          });
          labels.push(field.title);
          delete $scope.selectedFields[n];
          }
        }
      }
    }

    var isNew = !angular.isDefined(dimension.name);
    if (isNew) {
      dimension.slug_linked = true;

      // try and cleverly generate labels and names for
      // attributes and dimensions.
      // this will cause a headache, but it might just be worth it.
      var common = longestCommonStart(labels),
          lastChar = common.length ? common.charAt(common.length - 1) : ' ',
          atBoundary = new RegExp(/[\W_]/g).test(lastChar);
      dimension.label = cleanLabel(atBoundary || labels.length == 1 ? common : '');
      dimension.name = slugifyFilter(dimension.label, '_');

      if (atBoundary) {
        for (var i in dimension.attributes) {
          var attr = dimension.attributes[i];
          if (labels.indexOf(attr.label) != -1 && common.length < attr.label.length) {
            attr.label = cleanLabel(attr.label.slice(common.length));
            attr.name = slugifyFilter(attr.label, '_');
          }
        }
      }
    }
    $scope.editDimension(dimension);
  };

  $scope.editDimension = function(dimension) {
    var dim = angular.copy(dimension)

    dim.attributes = dim.attributes.sort(function(a, b) {
      return a.label.localeCompare(b.label);
    });

    if (!dim.label_attribute) {
      dim.label_attribute = dim.attributes[0];
    }
    if (!dim.key_attribute) {
      dim.key_attribute = dim.attributes[0];
    }

    var d = $modal.open({
      templateUrl: 'dataset/dimension_edit.html',
      controller: 'DatasetDimensionEditCtrl',
      backdrop: true,
      resolve: {
        dimension: function () {
          return dim;
        },
        dimensions: function () {
          var dimensions = [];
          for (var i in $scope.dimensions) {
            var d = $scope.dimensions[i];
            if (d != dimension) {
              dimensions.push(d);
            }
          }
          return dimensions;
        }
      }
    });

    d.result.then(function(changed) {
      $scope.deleteDimension(dimension);
      $scope.dimensions.push(changed);
    });
  };

  $scope.deleteDimension = function(dimension) {
    var idx = $scope.dimensions.indexOf(dimension);
    if (idx != -1) {
      $scope.dimensions.splice(idx, 1);
    }
  };

  $scope.getDimensions = function() {
    return $scope.dimensions.sort(function(a, b) {
      return a.label.localeCompare(b.label);
    });
  };

  $scope.getAttributes = function(dim) {
    return dim.attributes.sort(function(a, b) {
      return a.label.localeCompare(b.label);
    });
  };

  $scope.getSamples = function(field) {
    return field.samples.sort(function(a, b) { return a - b; });
  };

  $scope.back = function() {
    $location.path('/datasets/' + dataset.name + '/model/measures');
  };

  $scope.canSave = function() {
    return true;
  };

  $scope.save = function() {
    var model = unload();
    $scope.errors = {};
    $http.post(dataset.api_url + '/model', model).then(function(res) {
      load(res.data);
      if ($scope.wizard) {

        // final step: publish the dataset
        var ds = angular.copy(dataset);
        ds['private'] = false;
        $http.post(dataset.api_url, ds).then(function() {
          $location.search({});
          $location.path('/datasets/' + dataset.name);
          flash.setMessage("That's it! Your dataset is now ready for use.", "success");
        });
      } else {
        flash.setMessage("Your changes have been saved!", "success");
      }
      $scope.resetScroll();
    }, function(res) {
      $scope.errors = res.data.errors;
      $scope.resetScroll();
    });
  };

  load(data.model || {});

}]);
;
spendb.controller('DatasetEditCtrl', ['$scope', '$document', '$http', '$location', '$q', 'flash', 'reference', 'validation', 'dataset', 'managers', 'session', 'config',
  function($scope, $document, $http, $location, $q, flash, reference, validation, dataset, managers, session, config) {
  $scope.dataset = dataset;
  $scope.reference = reference;
  $scope.managers = managers;
  $scope.forms = {};
  $scope.session = session;

  $scope.suggestAccounts = function(query) {
    var dfd = $q.defer(),
        params =  {q: query};
    $http.get(config.apiBaseUrl + '/api/3/accounts/_complete', {params: params}).then(function(es) {
      var accounts = []
      for (var i in es.data.results) {
        var account = es.data.results[i],
            seen = false;
        for (var j in $scope.managers.managers) {
          var other = $scope.managers.managers[j];
          if (other.name == account.name) {
            seen = true;
          }
        }
        if (!seen) {
          accounts.push(account);
        }
      }
      dfd.resolve(accounts);
    });
    return dfd.promise;
  };

  $scope.addAccount = function() {
    if ($scope.managers.fresh && $scope.managers.fresh.name) {
      $scope.managers.managers.push($scope.managers.fresh);
      $scope.managers.fresh = null;
    }
  };

  $scope.removeAccount = function(account) {
    var idx = $scope.managers.managers.indexOf(account);
    if (idx != -1) {
      $scope.managers.managers.splice(idx, 1);
    }
  };

  $scope.canSave = function() {
    return true;
  };

  $scope.upload = function() {
    $location.path('/datasets/' + dataset.name + '/upload');
  };

  $scope.save = function() {
    var dfd = $http.post(dataset.api_url, $scope.dataset);
    validation.clear($scope.forms.dataset);
    dfd.then(function(res) {
      $scope.dataset = res.data;
      $http.post(dataset.api_url + '/managers', $scope.managers).then(function(res) {
        $scope.managers = res.data;
        if ($scope.wizard) {
          $location.path('/datasets/' + dataset.name + '/sources');
        } else {
          flash.setMessage("Your changes have been saved!", "success");
        }
        $scope.resetScroll();
      });
    }, validation.handle($scope.forms.dataset));
  };

}]);

;
spendb.controller('DatasetMeasuresCtrl', ['$scope', '$rootScope', '$http', '$location', '$q', 'slugifyFilter', 'flash', 'validation', 'dataset', 'data',
  function($scope, $rootScope, $http, $location, $q, slugifyFilter, flash, validation, dataset, data) {
  $scope.dataset = dataset;
  $scope.columns = [];
  $scope.fields = [];
  $scope.errors = {};

  $scope.back = function() {
    $location.path('/datasets/' + dataset.name + '/sources');
  };

  var isNumeric = function(fld) {
    return fld.type == 'integer' || fld.type == 'number';
  };

  var load = function() {
    var model = data.model,
        measures = model.measures || {},
        fields = [];

    for (var i in data.structure.fields) {
      var field = data.structure.fields[i];
      field.numeric = isNumeric(field);
      field.slug_linked = true;
      for (var mn in measures) {
        var m = measures[mn];
        if (m.column == field.name) {
          m.name = mn;
          field.slug_linked = false;
          field.measure = m;
        }
      }
      fields.push(field);
    }
    $scope.fields = fields.sort(function(a, b) { return a.title.localeCompare(b.title); });
  };

  var unload = function() {
    var measures = {};
    for (var i in $scope.fields) {
      var field = $scope.fields[i];
      if (field.measure) {
        measures[field.measure.name] = {
          label: field.measure.label,
          column: field.name,
          description: field.measure.description
        }
      }
    }
    var model = angular.copy(data.model) || {};
    model.dimensions = model.dimensions || {};
    model.measures = measures;
    return model;
  };

  $scope.toggleIgnore = function(field) {
    field.ignore = !field.ignore;
  };

  $scope.toggleSamples = function(field) {
    field.show_samples = !field.show_samples;
  };

  $scope.getSamples = function(field) {
    return field.samples.sort(function(a, b) { return a - b; });
  };

  $scope.toggleMeasure = function(field) {
    if (field.measure) {
      delete field.measure;
    } else {
      var label = cleanLabel(field.title);
      field.measure = {name: slugifyFilter(label, '_'), label: label};
    }
  };

  $scope.breakSlugLink = function(field) {
    field.slug_linked = false;
  };

  $scope.updateSlug = function(field) {
    if (field.slug_linked) {
      field.measure.name = slugifyFilter(field.measure.label, '_');
    }
  };

  $scope.validLabel = function(field) {
    if (!field.measure || !field.measure.label ||
        field.measure.label.length < 2) {
      return false;
    }
    return true;
  };

  $scope.validSlug = function(field) {
    if (!field.measure || !field.measure.name ||
        field.measure.name.length < 2) {
      return false;
    }
    if (field.measure.name != slugifyFilter(field.measure.name, '_')) {
      return false;
    }
    for (var i in $scope.fields) {
      var f = $scope.fields[i];
      if (f.measure && field.name != f.name &&
          f.measure.name == field.measure.name) {
        return false;
      }
    }
    return true;
  };

  $scope.canSave = function() {
    for (var i in $scope.fields) {
      var field = $scope.fields[i];
      if (field.measure) {
        return true;
      }
    }
    return false;
  };

  $scope.save = function() {
    var model = unload();
    console.log("Saving", model);
    $scope.errors = {};
    $http.post(dataset.api_url + '/model', model).then(function(res) {
      if ($scope.wizard) {
        $location.path('/datasets/' + dataset.name + '/model/dimensions');
      } else {
        flash.setMessage("Your changes have been saved!", "success");
      }
      $scope.resetScroll();
    }, function(res) {
      $scope.errors = res.data.errors;
      $scope.resetScroll();
    });
  };

  load();

}]);
;
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
;
spendb.controller('DatasetQueryCtrl', ['$scope', '$location', 'dataset', function($scope, $location, dataset) {
  $scope.setTitle(dataset.label);
  $scope.dataset = dataset;

  if (!dataset.has_model) {
    $location.path('/datasets/' + dataset.name + '/about');
    $location.search({});
  }
  
}]);
;
var loadRun = ['$route', '$q', '$http', 'config', function($route, $q, $http, config) {
  var p = $route.current.params,
      url = config.apiBaseUrl + '/api/3/datasets/' + p.dataset + '/runs/' + p.run;
  return $http.get(url);
}];


spendb.controller('DatasetSourcesCtrl', ['$scope', '$document', '$http', '$location', '$timeout', 'flash', 'dataset',
  function($scope, $document, $http, $location, $timeout, flash, dataset) {
  var sourcesUrl = dataset.api_url + '/sources',
      loadTimeout = null;
  
  $scope.LOGLEVELS = {'WARNING': 'warning', 'ERROR': 'danger'};
  $scope.dataset = dataset;
  $scope.source = {};
  $scope.errors = {};

  $scope.hasSource = function() {
    return angular.isDefined($scope.source.api_url);
  };

  $scope.canContinue = function() {
    if (!$scope.source.runs || $scope.source.runs.length == 0) {
      return false;
    }
    var run = $scope.source.runs[$scope.source.runs.length - 1];
    if (run.status != 'complete') {
      return false;  
    }
    return run.operation.indexOf('to database') != -1;
  };

  $scope.continue = function() {
    if ($scope.wizard) {
      $location.path('/datasets/' + dataset.name + '/model/measures');  
    } else {
      flash.setMessage("Yeah this doesn't do anything.", "success");
    }
    $scope.resetScroll();
  };

  $scope.back = function() {
    $location.path('/datasets/' + dataset.name + '/edit');
  };

  $scope.upload = function() {
    $location.search(angular.extend({}, $location.search(), {next: 'sources'}));
    $location.path('/datasets/' + dataset.name + '/upload');
  };

  var loadRunLog = function(run) {
    var url = dataset.api_url + '/runs/' + run.id;
    $http.get(url).then(function(res) {
      res.data.messages.reverse();
      $scope.errors = res.data;
    });
  };

  $scope.recheck = function() {
    $http.get(sourcesUrl).then(function(res) {
      var sources = res.data;
      if (sources.results.length) {
        var url = sources.results[0].runs_url;
        $http.get(url).then(function(res) {
          if (!sources.results.length) {
            loadTimeout = $timeout($scope.recheck, 2000);
          }
          sources.results[0].runs = res.data.results;
          $scope.source = sources.results[0];
          var run = res.data.results[res.data.results.length - 1];
          if (run.status == 'failed') {
            loadRunLog(run);
          } else {
            loadTimeout = $timeout($scope.recheck, 2000);  
          }
        });
      } else {
        $scope.source = {};
        loadTimeout = $timeout($scope.recheck, 2000);
      }
    });
  };

  $scope.recheck();

  $scope.$on('$destroy', function() {
    $timeout.cancel(loadTimeout);
  });

}]);

;
spendb.controller('DatasetUploadCtrl', ['$scope', '$document', '$http', '$location', 'Upload', 'config', 'flash', 'validation', 'dataset',
  function($scope, $document, $http, $location, Upload, config, flash, validation, dataset) {
  $scope.dataset = dataset;
  $scope.urlForm = {};
  $scope.uploadPercent = null;
  $scope.file = {};

  var uploadDone = function() {
    var nextDefault = $scope.wizard ? 'edit' : 'sources',
        next = $location.search().next || nextDefault;
    $location.path('/datasets/' + dataset.name + '/' + next);
  };

  $scope.setFile = function(files) {
    for (var i in files) {
      $scope.file = files[i];
    }
  };

  $scope.uploadServer = function() {
    Upload.upload({
      url: dataset.api_url + '/sources/upload',
      file: $scope.file
    }).progress(function (evt) {
      $scope.uploadPercent = Math.max(1, parseInt(95.0 * evt.loaded / evt.total));
    }).success(function (data, status, headers, config) {
      uploadDone();
    }).error(function (data, status, headers, conf) {
      $scope.uploads = [];
      $scope.uploadPercent = null;
      flash.setMessage("There was an error uploading your file. Please try again.", "danger");
    });
  };

  $scope.uploadBucket = function(config) {
    Upload.upload({
        url: config.url,
        method: 'POST',
        fields : {
          key: config.key,
          AWSAccessKeyId: config.aws_key_id, 
          acl: config.acl,
          policy: config.policy,
          signature: config.signature,
          //"Content-Type": config.mime_type,
          //filename: $scope.file.name
        },
        file: $scope.file,
      }).progress(function (evt) {
        $scope.uploadPercent = Math.max(1, parseInt(95.0 * evt.loaded / evt.total));
      }).success(function (data, status, headers, conf) {
        // trigger a load by telling the backend there's now a file.
        $http.post(dataset.api_url + '/sources/load/' + config.source_name).then(function() {
          uploadDone();
        });  
      }).error(function (data, status, headers, conf) {
        $scope.uploads = [];
        $scope.uploadPercent = null;
        flash.setMessage("There was an error uploading your file. Please try again.", "danger");
      });
  };

  $scope.uploadFile = function() {
    if (!$scope.hasFile()) return;
    $scope.uploadPercent = 1;

    var sign = {file_name: $scope.file.name, mime_type: $scope.file.type};
    $http.post(dataset.api_url + '/sources/sign', sign).then(function(res) {
      if (res.data.status == 'ok') {
        $scope.uploadBucket(res.data);
      } else {
        $scope.uploadServer();
      }
    });
  };

  $scope.submitUrl = function() {
    if (!$scope.hasUrl()) return;
    var form = angular.copy($scope.urlForm);
    $scope.urlForm = {};

    $http.post(dataset.api_url + '/sources/submit', form).then(function(res) {
      uploadDone();
    });
  };

  $scope.hasUrl = function() {
    return $scope.urlForm.url && $scope.urlForm.url.length > 3;
  };

  $scope.hasFile = function() {
    return !$scope.uploadPercent && $scope.file && $scope.file.name;
  };

  $scope.continue = function() {
    if ($scope.hasUrl()) {
      $scope.submitUrl();
    } else {
      $scope.uploadFile();
    }
  };

  $scope.canContinue = function() {
    return $scope.hasUrl() || $scope.hasFile();
  };

}]);

;
spendb.directive('datasetList', ['$http', '$location',
  function ($http, $location) {
  return {
    restrict: 'AE',
    scope: {
      "datasets": "="
    },
    templateUrl: 'directives/dataset_list.html',
    link: function (scope, element, attrs, model) {
      scope.load = function(offset) {
        var state = angular.extend({}, $location.search(), {offset: offset});
        $location.search(state);
      };

      scope.getDatasetLink = function(dataset) {
        var link = '/datasets/' + dataset.name;
        if (!dataset.has_model) {
          link = link + '/about';
        }
        return link;
      };
    }
  };
}]);
;
spendb.directive('datasetSettings', ['$rootScope', '$http', '$location',
  function ($rootScope, $http, $location) {
  return {
    restrict: 'AE',
    transclude: true,
    scope: {
      "dataset": "=",
      "step": "@",
      "nextLabel": "@",
      "prevLabel": "@",
      "prevActive": "=",
      "prevHidden": "=",
      "nextActive": "&",
      "next": "&",
      "prev": "&"
    },
    templateUrl: 'directives/dataset_settings.html',
    link: function (scope, element, attrs, model) {
      var title = scope.dataset ? scope.dataset.label : "Create a new dataset",
          mode = $location.search().mode,
          wizard = mode == 'wizard' || !scope.dataset || !scope.dataset.api_url;
      $rootScope.setTitle(title);
      scope._step = parseInt(scope.step, 10);
      scope._nextLabel = scope.nextLabel || 'Next';
      scope._prevLabel = scope.prevLabel || 'Back';
      scope.prevShow = scope.prevHidden ? false : wizard;
      scope.wizard = scope.$parent.wizard = wizard;
      scope.navDataset = wizard ? null : scope.dataset;

      console.log(scope.wizard ? "Wizard mode" : "Edit mode");
    }
  };
}]);
;
spendb.directive('pageBody', ['$http', '$location',
  function ($http, $location) {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'directives/page_body.html',
    link: function (scope, element, attrs, model) {
    }
  };
}]);
;
spendb.directive('pageHeader', ['$http', '$rootScope', '$route', '$location', '$modal', 'flash', 'config', 'session',
  function ($http, $rootScope, $route, $location, $modal, flash, config, session) {
  return {
    restrict: 'E',
    //transclude: true,
    scope: {
      dataset: '=',
      section: '@'
    },
    templateUrl: 'directives/page_header.html',
    link: function (scope, element, attrs, model) {
      scope.session = {};
      scope.flash = flash;
      scope.home_page = $route.current.loadedTemplateUrl == 'home.html';
      scope.title = scope.dataset ? scope.dataset.label : $rootScope.currentTitle;

      session.get(function(s) {
        scope.session = s;
      });

      // Logout
      scope.logout = function() {
        session.logout(function(s) {
          scope.session = s;
          $location.path('/');
        });
      };

      scope.deleteDataset = function() {
        var d = $modal.open({
          templateUrl: 'dataset/delete.html',
          controller: 'DatasetDeleteCtrl',
          backdrop: true,
          resolve: {
            dataset: function () {
              return scope.dataset;
            }
          }
        });
      };

      scope.togglePrivate = function() {
        scope.dataset.private = !scope.dataset.private;
        $http.post(scope.dataset.api_url, scope.dataset).then(function(res) {
          if (res.data.private) {
            flash.setMessage("The dataset has been made private.", "danger");
          } else {
            flash.setMessage("The dataset is now public!", "success");
          }
        });
      };

    }
  };
}]);
;spendb.directive('responsePager', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            'response': '=',
            'load': '&load'
        },
        templateUrl: 'directives/response_pager.html',
        link: function (scope, element, attrs, model) {
            scope.$watch('response', function(e) {
                scope.showPager = false;
                scope.pages = [];
                if (scope.response.pages <= 1) {
                    return;
                }
                var pages = [],
                    current = (scope.response.offset / scope.response.limit) + 1,
                    num = Math.ceil(scope.response.total / scope.response.limit),
                    range = 3,
                    low = current - range,
                    high = current + range;

                if (low < 1) {
                    low = 1;
                    high = Math.min((2*range)+1, num);
                }
                if (high > num) {
                    high = num;
                    low = Math.max(1, num - (2*range)+1);
                }

                for (var page = low; page <= high; page++) {
                    var offset = (page-1) * scope.response.limit;
                    pages.push({
                        page: page,
                        current: page == current,
                        offset: offset
                    });
                }
                scope.showPager = true;
                scope.pages = pages;
            });
        }
    };
}]);
;ngBabbage.filter('formatDate', function() {
  var format = d3.time.format("%d.%m.%Y");
  return function(val) {
    var date = new Date(Date.parse(val));
    return format(date);
  };
});
;
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
;var loadSession = ['$q', 'session', function($q, session) {
  var dfd = $q.defer();
  session.get(function(s) {
    dfd.resolve(s);
  });
  return dfd.promise;
}];


var loadDataset = ['$route', '$http', '$q', 'config', function($route, $http, $q, config) {
  var dfd = $q.defer(),
      url = config.apiBaseUrl + '/api/3/datasets/' + $route.current.params.dataset,
      authzUrl = config.apiBaseUrl + '/api/3/sessions/authz',
      authzParams = {'dataset': $route.current.params.dataset};
  $q.all([
    $http.get(url),
    $http.get(authzUrl, {params: authzParams})
  ]).then(function(data) {
    var dataset = data[0].data,
        authz = data[1].data;
    dataset.can_read = authz.read;
    dataset.can_update = authz.update;
    dfd.resolve(dataset);
  });
  return dfd.promise;
}];


var loadManagers = ['$route', '$http', '$q', 'config', function($route, $http, $q, config) {
  var dfd = $q.defer(),
      url = config.apiBaseUrl + '/api/3/datasets/' + $route.current.params.dataset + '/managers';
  $http.get(url).then(function(res) {
    dfd.resolve(res.data);
  });
  return dfd.promise;
}];


var loadSources = ['$route', '$http', '$q', 'config', function($route, $http, $q, config) {
  var dfd = $q.defer(),
      url = config.apiBaseUrl + '/api/3/datasets/' + $route.current.params.dataset + '/sources';
  $http.get(url).then(function(res) {
    dfd.resolve(res.data);
  });
  return dfd.promise;
}];


var loadReferenceData = ['$q', 'data', function($q, data) {
  var dfd = $q.defer();
  data.get(function(rd) {
    dfd.resolve(rd);
  });
  return dfd.promise;
}];


var loadModel = ['$route', '$q', '$http', 'config', function($route, $q, $http, config) {
  var url = config.apiBaseUrl + '/api/3/datasets/' + $route.current.params.dataset,
      dfd = $q.defer();
  $q.all([
    $http.get(url + '/structure'),
    $http.get(url + '/model')
  ]).then(function(data) {
    dfd.resolve({
      structure: data[0].data,
      model: data[1].data
    });
  });
  return dfd.promise;
}];
;

spendb.factory('flash', ['$rootScope', '$timeout', function($rootScope, $timeout) {
  // Message flashing.
  var currentMessage = null;

  return {
    setMessage: function(message, type) {
      currentMessage = [message, type];
      $timeout(function() {
        currentMessage = null;
      }, 4000);
    },
    getMessage: function() {
      if (currentMessage) {
        return currentMessage[0];
      }
    },
    getType: function() {
      if (currentMessage) {
        return currentMessage[1];
      }
    }
  };
}]);


spendb.factory('validation', ['flash', 'config', function(flash, config) {
  // handle server-side form validation errors.
  return {
    handle: function(form) {
      return function(res) {
        if (res.status == 400 || !form) {
            var errors = [];
            for (var field in res.data.errors) {
                form[field].$setValidity('value', false);
                form[field].$message = res.data.errors[field];
                errors.push(field);
            }
            if (angular.isDefined(form._errors)) {
                angular.forEach(form._errors, function(field) {
                    if (errors.indexOf(field) == -1) {
                        form[field].$setValidity('value', true);
                    }
                });
            }
            form._errors = errors;
        } else {
          flash.setMessage(res.data.message || res.data.title || 'Server error', 'danger');
        }
      }
    },
    clear: function(form) {
      if (angular.isDefined(form._errors)) {
        for (var i in form._errors) {
          var field = form._errors[i];
          form[field].$setValidity('value', true);
          form[field].$message = undefined;
        }
      };
      form._errors = undefined;
      form.$setPristine();
      form.$setValidity();
    }
  };
}]);


spendb.factory('data', ['$http', 'config', function($http, config) {
  /* This is used to cache reference data once it has been retrieved from the
  server. Reference data includes the canonical lists of country names,
  currencies, etc. */
  var referenceData = $http.get(config.apiBaseUrl + '/api/3/reference');

  var getData = function(cb) {
    referenceData.then(function(res) {
      cb(res.data);
    });
  };

  return {get: getData}
}]);


spendb.factory('session', ['$http', 'config', function($http, config) {
  var sessionDfd = null;

  var logout = function(cb) {
    $http.post(config.apiBaseUrl + '/api/3/sessions/logout').then(function() {
      sessionDfd = null;
      get(cb);
    });
  };

  var flush = function() {
    sessionDfd = null;
  };

  var get = function(cb) {
    if (sessionDfd === null) {
      var data = {'_': new Date()}
      sessionDfd = $http.get(config.apiBaseUrl + '/api/3/sessions', {params: data});
    }
    sessionDfd.then(function(res) {
      cb(res.data);
    });
  };

  return {
    get: get,
    flush: flush,
    logout: logout
  }
}]);
;

// https://stackoverflow.com/questions/1916218/find-the-longest-common-starting-substring-in-a-set-of-strings
function longestCommonStart(array){
    var A = array.concat().sort(), 
    a1 = A[0], a2 = A[A.length-1], L = a1.length, i = 0;
    while(i < L && a1.charAt(i) === a2.charAt(i)) i++;
    return a1.substring(0, i);
}

// https://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
function cleanLabel(text) {
    var ws = ' ',
        pieces = text.replace(/[\W_]/g, ws).split(ws);
    for ( var i = 0; i < pieces.length; i++ )
    {
        var j = pieces[i].charAt(0).toUpperCase();
        pieces[i] = j + pieces[i].substr(1);
    }
    return pieces.join(ws).replace(/\s+/g, ws).trim();
}
