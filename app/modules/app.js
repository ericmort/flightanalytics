'use strict';

//
//  Initialize the Appstax app engine with your appkey
//
appstax.init("ODMxTmJqb2NrbWRvbw==");

var module = angular.module('FlightAnalytics', [
    'ngSanitize',    
    'ui.router',
    //'nvd3ChartDirectives'
    'nvd3'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 
    function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $log, conf) {

      $stateProvider
        .state('public', {
          template: '<ui-view>',
          abstract: true    
      });


      $stateProvider
        .state('public.landingsite', {
          url: '/',
          templateUrl: 'modules/main/landingsite.html',
          controller: 'OpenCtrl'
      });

      $stateProvider
        .state('public.login', {
         url: '/login', 
        templateUrl: 'modules/user/login.html',
        controller: 'UserCtrl'
      });

      $stateProvider
        .state('public.signup', {
          url: '/signup',
          templateUrl: 'modules/user/signup.html',
          controller: 'UserCtrl'
      });

      $stateProvider.state('app', {
        url: '/app/:queryId',
        templateUrl: 'modules/main/main.html',
        controller: 'MainCtrl',
        resolve: {
          data: function(QueryService, $stateParams, $q, $log) {
              var queryId = 0;
              if ($stateParams.queryId) {
                queryId = $stateParams.queryId
              }
              var promise = QueryService.getData(queryId).then(function success(data){
                return data;
              }, function fail(){$log.error("Error getting data...");});
              $log.debug("resolving results: ", $stateParams.queryId)
              
              return promise; 
          },
      


        }
      });

      /*$stateProvider.state('app.flights', {
        url: '/:queryId',
        templateUrl: 'modules/main/view.html',
        controller: 'QueriesCtrl',
        
      });

      /*$stateProvider.state('app.flights.view', {
        url: '/',
        templateUrl: 'modules/main/view.html',
        controller: 'ResultsCtrl',
        resolve: {
          results: function(QueryService, $stateParams, $q, $log) {
              $log.debug("resolving results view: ", $stateParams.queryId)
              return QueryService.getData($stateParams.queryId)
          }

        }
      });*/

      $urlRouterProvider.otherwise('/#/');
      
      // Send browser to landing page "/#/" when URL is "/"
      if(location.pathname === "/" && location.hash === "") {
        location.replace("/#/");
      }

  }]);

/* Configure degug logging */
module.config(function ($logProvider) {
  $logProvider.debugEnabled(true);
});


/* Directive for autofocusing the input field in modals */

module.directive('focusMe', function($timeout) {
    return function(scope, element, attrs) {
        attrs.$observe('focusMe', function(value) {
            if ( value==="true" ) {
                $timeout(function(){
                    element[0].focus();
                },5);
            }
        });
    }
});

/*
 * Module that checks if the user is logged in every time a route is changed.
 * If the user is logged in he gets to proceed to the requested url, if not he is redirected to
 * the main page.
 */

module.run(['$rootScope', '$state', '$location', '$log', function ($rootScope, $state, $location, $log) {
  $rootScope.$on("$stateChangeStart", function (event, toState, fromState, fromParams) {

    $rootScope.loading = true;
    if (appstax.currentUser()) {
      $rootScope.currentUser = appstax.currentUser().username;
      $log.debug('User is logged in');
      $location.path("/app/0");
    } else {
      $location.path("/");
      $log.debug('User is not logged in');
    }
   
  });

  $rootScope.$on("$stateChangeSuccess", function (event, toState, fromState, fromParams) {
    $log.debug("State change success--");
    $log.debug("fromState", fromState);
    $log.debug("fromParams", fromParams);
    $log.debug("toState", toState);
    $rootScope.loading = false;
        
  });

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
    $log.error('Error from stateChange: ' + error);
  });

    // somewhere else
  $rootScope.$on(['$stateNotFound', '$log'],
    function(event, unfoundState, fromState, fromParams, $log){
        $log.error('Unfound state to' + JSON.stringify(unfoundState.to)); 
        $log.error('unfoundState params:',  unfoundState.toParams);
        $log.error('unfoundState options:', unfoundState.options); 
    });
}]);


 
