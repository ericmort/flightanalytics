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


 

angular.module('FlightAnalytics').provider("conf", function() {
  
return {
    $get: function () {
      return {
        siteName: "FlightAnalytics"
      };
    }
  };

});
'use strict';

angular.module('FlightAnalytics').controller('UserCtrl', function ($log, $scope, $state, conf, $timeout) {
   $log.debug('Entering UserCtrl');
   
   $scope.email = "";
   $scope.password = "";
   $scope.message = "";
   $scope.conf = conf;
   $scope.error = false;
   
   $scope.login = function(){
   	 $log.debug("Login is called");
   	 $log.debug("Username is: " + $scope.email);
   	 $log.debug("Password is is: " + $scope.password);
   	 appstax.login($scope.email, $scope.password)
       .then(function(user) {
        $scope.error = false;
           $log.debug("User logged in successfully...");
           $state.go('app');

       })
       .fail(function(error) {
          $scope.$apply(function(){
            $scope.error = true;
            $scope.message = "Could not log in. Please verify your username and password.";  
          });

          //Cancel the error after 3 seconds
           $timeout(function(){
            $scope.error = false;
            $scope.message = "";  
          },3000);
          
           
       });
   }

   $scope.signup = function(){
     $log.debug("Signup is called");
     $log.debug("Username is: " + $scope.email);
     $log.debug("Password is is: " + $scope.password);
     appstax.signup($scope.email, $scope.password)
       .then(function(user) {          
           $log.debug("User logged in successfully...");
           $state.go('app');

       })
       .fail(function(error) {
        
          $scope.$apply(function(){
            $scope.error = true;
            $scope.message = "Could not sign up.";  
          });

          //Cancel the error after 3 seconds
          $timeout(function(){
            $scope.error = false;
            $scope.message = "";  
          },3000);
                   
       });
   }

   $scope.cancel = function() {
      $state.go("public.landingsite");
   }

   $log.debug('Exiting UserCtrl');
});

'use strict';

var module = angular.module('FlightAnalytics');

module.service('QueryService', ['$http', '$q', '$log', function($http, $q, $log, $rootScope) {
	$log.debug("Entering QueryService");

	/*this.getCollection = function(collectionName){
		var deferred = $q.defer();
		$log.debug("Fetching data for: " + collectionName);
		appstax.findAll(collectionName).then(function(objects) {   
           deferred.resolve(objects);
       	})
		.fail(function(error) {
           $log.error("Error: " + error);
           deferred.reject(error); 
       });
		return deferred.promise;
	}*/

	this.getQueries = function() {
		return [
			{
				id: 0,
				name: "Number of flights per carrier",
				description: "through all years 1988-2003",
				sql: "select c, Code, Description from (select Code,Description from carriers) all inner join (select count(*) as c, Carrier as Code from flights group by Carrier) using Code order by c desc",
				columns: ["integer", "string", "string"]
			},
			{
				id: 1,
				name: "Average delay in minutes per carrier",
				description: "through all years 1988-2003",
				columns: ["number","string"],
				sql: "select avg(DepDelay), Carrier from test.flights group by Carrier order by avg(DepDelay) desc"
			},
			{
				id: 2,
				name: "Average delay in minutes per year",
				description: "...",
				columns: ["number","string"],
				sql: "select avg(DepDelay), Carrier from test.flights where Year=2000 group by Carrier having avg(DepDelay)>10 order by avg(DepDelay) desc"
			},			
		]
	}




	this.getData = function(queryId) {
		var start = new Date().getTime();
		if (queryId == undefined) {
			$log.debug("NO queryId");
			return
		}
		$log.debug("Entering QueryService:getData()");
		$log.debug("queryId: ", queryId)
		var queries = this.getQueries()
		var query = queries[queryId]
		var deferred = $q.defer();
		
		var columns = query.columns
		var sql = query.sql
		$http({
	        url: 'http://10.1.2.237:3001/mgmt/queries',
	        method: "POST",
	        data: {dataTypes:columns, sql:sql},
	        withCredentials: true,
	        headers: {
	        	'Content-Type': 'application/json',
	        	'x-rocketstack-trackingkey': 'q09wXaS2E1Y6'
	        }
    	}).success(function(data, status, header, config){
			$log.debug("Got data...returning from service", data);  
			var end = new Date().getTime();  		
			var total = end - start;
			
			data.requestTime = total/1000 + ' seconds';
    		deferred.resolve(data);
    	})
    	.error(function(error, status, headers, config) {

    		$log.error("Could not get data", error);
    		deferred.reject('Could not get data why...'); 
    	});

		//Debug
		//console.log("AccountService:accountID : " + accountID);

		$log.debug("Exiting QueryService:getData()");
		return deferred.promise;
	}
	$log.debug("Exiting QueryService");
}]);
'use strict';

var module = angular.module('FlightAnalytics');

module.service('Service', ['$http', '$q', '$log', function($http, $q, $log) {
	$log.debug("Entering Service");

	this.getSomething = function(){
		
	}
	$log.debug("Exiting Service");
}]);
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

'use strict';

angular.module('FlightAnalytics').controller('OpenCtrl', function ($log, $scope, $sce,$state, QueryService) {
   $log.debug('Entering OpenCtrl');
   
   
   $log.debug('Exiting OpenCtrl');
});





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

'use strict';

angular.module('FlightAnalytics').controller('ResultsCtrl', function ($log, $scope, $rootScope, $state, conf, QueryService, results) {
   $log.debug('Entering ResultsCtrl');
   $scope.currentUser = appstax.currentUser();

   $scope.user = appstax;

   $log.debug('Exiting ResultsCtrl');
});
