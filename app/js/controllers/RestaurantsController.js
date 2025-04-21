'use strict';

foodMeApp.controller('RestaurantsController',
    function RestaurantsController($scope, customer, $location, Restaurant) {


  if (!customer.address) {
    $location.url('/customer');
  }

  var filter = $scope.filter = {
    cuisine: [],
    price: null,
    rating: null
  };

  var allRestaurants = Restaurant.query(filterAndSortRestaurants);
  $scope.$watch('filter', filterAndSortRestaurants, true);

  function filterAndSortRestaurants() {
    $scope.restaurants = [];

    // filter
    angular.forEach(allRestaurants, function(item, key) {
      if (filter.price && filter.price !== item.price) {
        return;
      }

      if (filter.rating && filter.rating !== item.rating) {
        return;
      }

      if (filter.cuisine.length && filter.cuisine.indexOf(item.cuisine) === -1) {
        return;
      }

      $scope.restaurants.push(item);
    });

    if($scope.filter.price) {
      var price = $scope.filter.price;
    }

    if($scope.filter.rating) {
      var rating = $scope.filter.rating;
    }

    if($scope.filter.cuisine) {
      var cuisine = $scope.filter.cuisine.toString();
    }

    var resultCount = $scope.restaurants.length;

    if(price || rating || cuisine) {

      let custom_data = "{\"cuisine\": \""+$scope.filter.cuisine.toString()+"\", \"price\": \""+$scope.filter.price+"\", \"rating\": \""+$scope.filter.rating+"\", \"resultCount\": \""+resultCount+"\"}";
      window.apptracker('trackCustomEvent', {
          name: "filterRestaurants",
          data: custom_data
      });

      /*
      if(customer.name == 'Brighton Headleye') {
        var i = 0;
        while (i < 100) {
          console.log(i);
          i++;
          let custom_data = [];
          custom_data[i] = "{\"cuisine\": \""+$scope.filter.cuisine.toString()+"\", \"price\": \""+$scope.filter.price+"\", \"rating\": \""+$scope.filter.rating+"\", \"resultCount\": \""+resultCount+"\"}";
          window.apptracker('trackCustomEvent', {
              name: "filterRestaurants",
              data: custom_data[i]
          });
        }
        
      }
      else {
        let custom_data = "{\"cuisine\": \""+$scope.filter.cuisine.toString()+"\", \"price\": \""+$scope.filter.price+"\", \"rating\": \""+$scope.filter.rating+"\", \"resultCount\": \""+resultCount+"\"}";
        window.apptracker('trackCustomEvent', {
            name: "filterRestaurants",
            data: custom_data
        });
      }
      */
      
    }


    // sort
    $scope.restaurants.sort(function(a, b) {
      if (a[filter.sortBy] > b[filter.sortBy]) {
        return filter.sortAsc ? 1 : -1;
      }

      if (a[filter.sortBy] < b[filter.sortBy]) {
        return filter.sortAsc ? -1 : 1;
      }

      return 0;
    });
  };


  $scope.sortBy = function(key) {
    if (filter.sortBy === key) {
      filter.sortAsc = !filter.sortAsc;
    } else {
      filter.sortBy = key;
      filter.sortAsc = true;
    }
  };


  $scope.sortIconFor = function(key) {
    if (filter.sortBy !== key) {
      return '';
    }

    return filter.sortAsc ? '\u25B2' : '\u25BC';
  };


  $scope.CUISINE_OPTIONS = {
    african: 'African',
    american: 'American',
    barbecue: 'Barbecue',
    cafe: 'Cafe',
    chinese: 'Chinese',
    'czech/slovak': 'Czech / Slovak',
    german: 'German',
    indian: 'Indian',
    japanese: 'Japanese',
    mexican: 'Mexican',
    pizza: 'Pizza',
    thai: 'Thai',
    vegetarian: 'Vegetarian'
  };

});
