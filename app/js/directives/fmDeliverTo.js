'use strict';

foodMeApp.directive('fmDeliverTo', function() {
  return {
    restrict: 'E',
    templateUrl: 'js/directives/fmDeliverTo.html',
    scope: {},
    controller: function FmDeliverToController($scope, customer) {
      window.apptracker('setUserId', customer.name);
      $scope.customer = customer;
    }
  };
});
