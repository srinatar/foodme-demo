'use strict';

foodMeApp.controller('VideosController', function VideosController($scope, $routeParams, $location, Videos) {

  var allVideos = Videos.query(function() {
    $scope.assets = allVideos;
  });
  let custom_data = JSON.stringify({});
  window.apptracker('trackCustomEvent', {
    name: "videoList",
    data: custom_data
  });

  $scope.$watch('selectedSearchResult', function() {
    if (!$scope.selectedSearchResult) {
      return;
    }
    const asset = $scope.selectedSearchResult.originalObject;
    let custom_data = JSON.stringify(asset);
    window.apptracker('trackCustomEvent', {
      name: "selectedSearchResults",
      data: custom_data
    });
    if (asset.passwordProtected) {
      $location.path('/auth/' + asset.assetId);
    } else {
      $location.path('/video/' + asset.assetId);
    }
  });
});
