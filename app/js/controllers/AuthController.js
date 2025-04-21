'use strict';

foodMeApp.controller('AuthController', function AuthController($scope, $routeParams, customer) {
  let auth_data = JSON.stringify({
    assetId: $routeParams.id
  });
  window.apptracker('trackCustomEvent', {
      name: 'authPage',
      data: auth_data
  });
  $scope.videoId = $routeParams.id;
});
