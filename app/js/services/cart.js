'use strict';

foodMeApp.service('cart', function Cart(localStorage, customer, $rootScope, $http, alert) {
  var self = this;

  self.add = function(item, restaurant) {
    if (!self.restaurant || !self.restaurant.id) {
      self.restaurant = {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description
      };
    }
    let itemName = item.name;
    let itemPrice = item.price;
    
    if (self.restaurant.id == restaurant.id) {
      self.items.forEach(function(cartItem) {
        if (item && cartItem.name == item.name) {
          cartItem.qty++;
          item = null;
        }
      });
      if (item) {
        item = angular.copy(item);
        item.qty = 1;
        self.items.push(item);
      }
      
      let addtocart_data = "{\"restaurant\": \""+restaurant.name+"\", \"itemName\": \""+itemName+"\", \"itemPrice\": \""+itemPrice+"\"}";
      window.apptracker('trackCustomEvent', {
         name: "addtoCart",
         data: addtocart_data
      });
      console.log("Custom Event addtoCart");
    }
    else {
      alert('Can not mix menu items from different restaurants.');
    }
  };

  self.remove = function(item) {
    var index = self.items.indexOf(item);
    if (index >= 0) {
      self.items.splice(index, 1);
    }
    if (!self.items.length) {
      self.restaurant = {};
    }
  }


  self.total = function() {
    return self.items.reduce(function(sum, item) {
      return sum + Number(item.price * item.qty);
    }, 0);
  };


  self.submitOrder = function() {
    if (self.items.length) {
      
      //let purchase_data = "{\"status\": \"start\"}";
      let purchase_data = "{\"status\": \"start\", \"cartItemCount\": "+self.items.length+", \"totalCost\": \""+self.total(self.items).toFixed(2)+"\", \"restaurant\": \""+self.restaurant.name+"\", \"paymentType\": \""+self.payment.type+"\"}";
      window.apptracker('trackCustomEvent', {
          name: "purchase",
          data: purchase_data
      });
      console.log("Custom Event purchase_start");

      //const apiReqURL = 'https://reqbin.com/echo/post/json';
      const apiReqURL = '/api/userValidation';
      return $http.get(apiReqURL, {

      }).then(function(resopnse) {
        return $http.post('/api/order', {
          items: self.items,
          restaurant: self.restaurant,
          payment: self.payment,
          deliverTo: customer
        }).then(function(response) {
          // **************************************
          // Add custom instrumentation code here
          // **************************************
          let purchase_success = "{\"status\": \"success\", \"cartItemCount\": "+self.items.length+", \"orderId\": \""+response.data.orderId+"\", \"totalCost\": \""+self.total(self.items).toFixed(2)+"\", \"restaurant\": \""+self.restaurant.name+"\", \"paymentType\": \""+self.payment.type+"\"}";
          window.apptracker('trackCustomEvent', {
              name: "purchase",
              data: purchase_success
          });
          console.log("Custom Event purchase_success");
          self.reset();
          return response.data.orderId;
        })
          
      });
    }
  }


  self.reset = function() {
    self.items = [];
    self.restaurant = {};
  };


  createPersistentProperty('items', 'fmCartItems', Array);
  createPersistentProperty('restaurant', 'fmCartRestaurant', Object);
  self.payment = {}; // don't keep CC info in localStorage


  function createPersistentProperty(localName, storageName, Type) {
    var json = localStorage[storageName];

    self[localName] = json ? JSON.parse(json) : new Type;

    $rootScope.$watch(
      function() { return self[localName]; },
      function(value) {
        if (value) {
          localStorage[storageName] = JSON.stringify(value);
        }
      },
      true);
  }
});
