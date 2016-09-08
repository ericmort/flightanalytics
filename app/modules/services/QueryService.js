'use strict';

var module = angular.module('FlightAnalytics');

module.service('QueryService', ['$http', '$q', '$log', function($http, $q, $log) {
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
				description: "...",
				sql: "select c, Code, Description from (select Code,Description from carriers) all inner join (select count(*) as c, Carrier as Code from flights group by Carrier) using Code order by c desc",
				columns: ["integer", "string", "string"]
			},
			{
				id: 1,
				name: "Average delay in minutes per carrier",
				description: "through all years 1988-2003",
				columns: ["number","string"],
				sql: "select avg(DepDelay), Carrier from test.flights group by Carrier order by avg(DepDelay) desc"
			}

		]
	}

	this.getData = function(queryId) {
		if (queryId == undefined) {
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
	        url: 'http:///mgmt/queries',
	        method: "POST",
	        data: {dataTypes:columns, sql:sql},
	        withCredentials: true,
	        headers: {
	        	'Content-Type': 'application/json',
	        	'x-rocketstack-trackingkey': 'q09wXaS2E1Y6'
	        }
    	}).success(function(data, status, header, config){
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