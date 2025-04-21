'use strict';

foodMeApp.controller('CheckoutController',
    function CheckoutController($scope, cart, customer, $location) {

  $scope.cart = cart;
  $scope.restaurantId = cart.restaurant.id;
  $scope.customer = customer;
  $scope.submitting = false;
  
  if($scope.submitting == false) {
    let custom_data = "{\"customer\": \""+$scope.customer.name+"\",\"cartItemCount\": "+$scope.cart.items.length+"}"
    //console.log(JSON.stringify(custom_data));
    window.apptracker('trackCustomEvent', {
        name: "checkoutPageLoad",
        data: custom_data
    });
    console.log("Custom Event checkoutPageLoad");
  }
  

  $scope.purchase = function() {
    if ($scope.submitting) return;

    $scope.submitting = true;
    cart.submitOrder().then(function(orderId) {
      $location.path('thank-you').search({orderId: orderId});
    });
  };
});
