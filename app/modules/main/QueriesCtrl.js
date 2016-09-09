'use strict';

angular.module('FlightAnalytics').controller('QueriesCtrl', function ($log, $scope, $rootScope, $state,$stateParams, conf, QueryService, data) {
   $log.debug('Entering QueriesCtrl');
   $scope.currentUser = appstax.currentUser();

   $scope.user = appstax;

   var queries = QueryService.getQueries()
   var queryId = $stateParams.queryId;

   console.log("queries:", queries)
   $log.debug("User is: ", $scope.user);

   $scope.logout = function(){
   	$log.debug("Trying to logout");
   	appstax.logout();
   	$rootScope.currentUser = null;
   	$state.go("public.landingsite", {},{reload:true, notify:true,inherit:true});
   }
   $scope.queries = queries
   $scope.data = data
   $log.debug("data: ", $scope.data)
   $scope.nvd3options = {
      chart: {
                type: 'discreteBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: true,
                valueFormat: function(d){
                    return d3.format(',.4f')(d);
                },
                duration: 500,
                xAxis: {
                    axisLabel: 'X Axis'
                },
                yAxis: {
                    axisLabel: 'Y Axis',
                    axisLabelDistance: -10
                }
            }
   }



   this.getChartData = function(name, data) {
      $log.debug("name:", name)
      var values = []
      for (var i=0;i<data.length && i<10;i++){
         var description = data[i][2]
         var code = data[i][1]
         var cnt = data[i][0]
         values.push({label: description + "(" + code + ")", value:cnt})
      }
      var chart = [
         {
            key: name,
            values: values
         }
      ]
      /*chart  = [{
    "values": [{
        "label": 1025409600000 ,
            "value": 3.5
    }, {
        "label": 1028088000000 ,
            "value": 4
    }],
        "key": "Sine Wave",
}]*/
      return chart
   }

   $scope.nvd3data = this.getChartData(queries[queryId].name, data)
   $log.debug("nvd3data: ",$scope.nvd3data)
   /*$scope.getData = function(queryId) {
      $log.debug("executing query:", queryId)
      $scope.data = QueryService.getData(queryId)
      $log.debug("data:", $scope.data)
   }*/
   $log.debug('Exiting QueriesCtrl');
});
