'use strict';

angular.module('FlightAnalytics').controller('MainCtrl', function ($log, $scope, $rootScope, $stateParams, $state, conf, QueryService, data) {
   $log.debug('Entering MainCtrl');

   $scope.currentUser = appstax.currentUser();
   $scope.user = appstax;
   $log.debug("User is: ", $scope.user);

   $scope.requestTime = data.requestTime || 0;
   $scope.queries = QueryService.getQueries()
   var queryId = $stateParams.queryId;
   $scope.queryId = queryId;
   $scope.data = data;

   this.getChartData = function(name, data) {

      $log.debug("name:", name)
      $log.debug("data:", data)
      var values = []
      for (var i=0;i<data.length && i<10;i++){
         var description = data[i][2]
         var code = data[i][1]
         var cnt = data[i][0]
         if (description) {
         	values.push({label: description + "(" + code + ")", value:cnt})	
         }
         else {
         	values.push({label: "(" + code + ")", value:cnt})
         }
         
      }
      var chart = [
         {
            key: name,
            values: values
         }
      ]
      return chart
   }

   this.getPieData = function(name, data) {

      $log.debug("name:", name)
      $log.debug("data:", data)
      var values = []
      for (var i=0;i<data.length && i<10;i++){
         var description = data[i][2]
         var code = data[i][1]
         var cnt = data[i][0]

         console.log("Cnt length", cnt);
         if (cnt.length > 9) {
         	var v = cnt.split(".");
         	cnt = v[0];
         }
         
         if (description && description.length > 15) {
         	values.push({key:description.substr(0,15) + '...', y:cnt})	
         } else {
         	values.push({key:code, y:cnt})	
         }
         
        
         
      }
      
      return values
   }

   $scope.pieOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }
        };

   $scope.nvd3options = {
      chart: {
        type: 'discreteBarChart',
        color: ['#45C1EF', '#1A92BE'],
        height: 450,
        margin : {
            top: 20,
            right: 20,
            bottom: 150,
            left: 100
        },
        x: function(d){return d.label;},
        y: function(d){return d.value;},
        showValues: true,
        valueFormat: function(d){
            return d3.format(',.4f')(d);
        },
        duration: 500,
        showLegend:true,
        xAxis: {
            axisLabel: 'X Axis',
            'rotateLabels':30
        },
        yAxis: {
            axisLabel: 'Y Axis',
            axisLabelDistance: -10
        }
    }
   }

   $scope.lineOptions = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                x: function(d){ return d.x; },
                y: function(d){ return d.y; },
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function(e){ console.log("stateChange"); },
                    changeState: function(e){ console.log("changeState"); },
                    tooltipShow: function(e){ console.log("tooltipShow"); },
                    tooltipHide: function(e){ console.log("tooltipHide"); }
                },
                xAxis: {
                    axisLabel: 'Time (ms)'
                },
                yAxis: {
                    axisLabel: 'Voltage (v)',
                    tickFormat: function(d){
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: -10
                },
                callback: function(chart){
                    console.log("!!! lineChart callback !!!");
                }
            },
            title: {
                enable: true,
                text: 'Title for Line Chart'
            },         
        };

   $scope.nvd3data = this.getChartData($scope.queries[queryId].name, data)
   $scope.pieData = this.getPieData($scope.queries[queryId].name, data)


    
   $log.debug("nvd3data: ",$scope.nvd3data)

});
