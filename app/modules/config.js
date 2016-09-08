angular.module('FlightAnalytics').provider("conf", function() {
  
return {
    $get: function () {
      return {
        siteName: "FlightAnalytics"
      };
    }
  };

});