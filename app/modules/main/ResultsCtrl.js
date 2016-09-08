'use strict';

angular.module('FlightAnalytics').controller('ResultsCtrl', function ($log, $scope, $rootScope, $state, conf, QueryService, results) {
   $log.debug('Entering ResultsCtrl');
   $scope.currentUser = appstax.currentUser();

   $scope.user = appstax;

   $log.debug('Exiting ResultsCtrl');
});
