'use strict';

foodMeApp.controller('CustomerController',
    function CustomerController($scope, customer, $location) {

  $scope.customerName = customer.name;
  $scope.customerAddress = customer.address;
  window.apptracker('setUserId', customer.name);
  const cohorts = ["Cohort1", "Cohort2", "Cohort3"];
  const random = Math.floor(Math.random() * cohorts.length);
  let customTagsToSet = {"CustomCohort": cohorts[random]};
  window.apptracker('setCustomTags', customTagsToSet);

  //console.error('This is an example console error');
  try {
    adddlert("This should fail");
  }
  catch(err) {
    window.apptracker('trackError', {
        message: err.message,
        filename: 'CustomerController.js',
        error: err //Exception object containing properties describing the exception.
    });
  }



  $scope.findRestaurants = function(customerName, customerAddress) {
    customer.name = customerName;
    customer.address = customerAddress;
    
    $location.url('/');
  };
});
