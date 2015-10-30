'use strict';

describe('Step auto generated form', function () {

  var $rootScope, scope, $location, contractSrvc, urlParser, $window, gettextCatalog, i18nService, $q, mainCtrl, deferedTaskExecution;

  beforeEach(module('autogeneratedForm'));

  beforeEach(inject(function ($injector, $controller) {

    $rootScope = $injector.get('$rootScope');
    $q = $injector.get('$q');
    contractSrvc = $injector.get('contractSrvc');
    urlParser = $injector.get('urlParser');
    $location = $injector.get('$location');
    $window = $injector.get('$window');
    gettextCatalog = $injector.get('gettextCatalog');
    i18nService = $injector.get('i18nService');
    spyOn($window.location, 'assign');
    spyOn($window.parent, 'postMessage');
    spyOn(urlParser, 'getQueryStringParamValue').and.returnValue('1');
    var humanTaskAPIMock = {
      get: function(parameters, success, error) {
        return success({
          "success": true,
          "message": null,
          "data": '{"id":1}'
        });
      }
    };
    spyOn(contractSrvc, "fetchContract").and.callFake(function() {
      var deferred = $q.defer();
      deferred.resolve('{"data":{}}');
      return deferred.promise;
    });
    deferedTaskExecution = $q.defer();
    spyOn(contractSrvc, "executeTask").and.callFake(function() {
      return deferedTaskExecution.promise;
    });

    scope = $rootScope.$new();
    // set the default value for property method

    mainCtrl = $controller('MainCtrl', {
      '$scope': scope,
      'contractSrvc': contractSrvc,
      'urlParser': urlParser,
      '$window': $window,
      'humanTaskAPI': humanTaskAPIMock,
      'gettextCatalog': gettextCatalog,
      'i18nService': i18nService
    });
  }));

  describe('postMessage', function () {

    var currentWindow;

    var stringifiedJSONArgsMatcher = function(actualArgs, expectedArgs) {
      for (var i= 0; i < actualArgs.length; i++) {
        var argBeforeStringify;
        try {
          argBeforeStringify = JSON.parse(actualArgs[i]);
        } catch (e) {
          argBeforeStringify = actualArgs[i];
        }
        if (!jasmine.matchersUtil.equals(argBeforeStringify, expectedArgs[i])) {
          return false;
        }
      }
      return true;
    };

    beforeEach(function () {
      currentWindow = $window.self;
    });

    afterEach(function () {
      $window.self = currentWindow;
    });

    it('should be sent on success', function () {
      jasmine.addCustomEqualityTester(stringifiedJSONArgsMatcher);
      $window.self = null;
      var responseStatus = 204;
      deferedTaskExecution.resolve({data:'', status: responseStatus});

      $rootScope.$digest();

      scope.postData();

      $rootScope.$digest();

      expect($window.parent.postMessage).toHaveBeenCalledWith(jasmine.objectContaining(
        {
          message: 'success',
          status: responseStatus,
          action: 'Submit task',
          targetUrlOnSuccess: '/bonita'
        }), '*');
    });

    it('should be sent on error', function () {
      jasmine.addCustomEqualityTester(stringifiedJSONArgsMatcher);
      $window.self = null;
      var responseStatus = 500;
      deferedTaskExecution.reject({data:'FileTooBigError', status: responseStatus});

      $rootScope.$digest();

      scope.postData();

      $rootScope.$digest();

      expect($window.parent.postMessage).toHaveBeenCalledWith(jasmine.objectContaining(
        {
          message: 'error',
          status: responseStatus,
          action: 'Submit task',
          targetUrlOnSuccess: '/bonita'
        }), '*');
    });

    it('should not be sent if not in an iframe', function () {
      $window.self = $window.parent;

      $rootScope.$digest();

      scope.postData();

      $rootScope.$digest();

      expect($window.parent.postMessage).not.toHaveBeenCalled();
    });
  });
});
