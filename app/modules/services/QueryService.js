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