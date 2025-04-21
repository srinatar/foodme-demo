'use strict';

foodMeApp.controller('MenuController',
    function MenuController($scope, $routeParams, Restaurant, cart) {

  $scope.restaurant = Restaurant.get({id: $routeParams.restaurantId});
  $scope.cart = cart;
  
  let custom_data = "{\"restaurant\": \""+$routeParams.restaurantId+"\"}";
  window.apptracker('trackCustomEvent', {
      name: "loadRestaurant",
      data: custom_data
  });

});
