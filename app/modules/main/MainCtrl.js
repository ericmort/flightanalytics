'use strict';

angular.module('FlightAnalytics').controller('MainCtrl', function ($log, $scope, $rootScope, $state, conf, QueryService) {
   $log.debug('Entering MainCtrl');
   $scope.currentUser = appstax.currentUser();
   $scope.user = appstax;
   $log.debug("User is: ", $scope.user);

   $scope.queries = QueryService.getQueries()
   $scope.logout = function(){
   	$log.debug("Trying to logout");
   	appstax.logout();
   	$rootScope.currentUser = null;
   	$state.go("public.landingsite", {},{reload:true, notify:true,inherit:true});
   }
   $log.debug('Exiting MainCtrl');
});
