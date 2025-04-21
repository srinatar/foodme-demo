'use strict';

foodMeApp.controller('VideoController', function VideoController($scope, $routeParams, $location, Video, customer) {
  window.apptracker('setUserId', customer.name);

  const videoIdString = $routeParams.id;
  let playerInstance = null;
  if (!videoIdString) {
    $location.url('/videos');
  }

  function trackAppVideoStart(assetInfo) {
    let custom_data = {assetId: String(assetInfo.assetId), assetName: assetInfo.assetName};
    window.apptracker('trackCustomEvent', {
      name: "videoStart",
      data: JSON.stringify(custom_data)
    });
  }

  function initVideoPlayer(assetInfo) {
    playerInstance = jwplayer('player-container').setup({
      primary: 'html5',
      width: 918,
      height: 500,
      autostart: false,
      preload: false,
      mute: true,
      repeat: false,
      type: 'hls',
      dash: 'shaka',
      playlist: [
        {
          title: assetInfo.assetName,
          file: assetInfo.streamUrl
        }
      ],
      advertising: {
        client: 'googima',
        tag: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
      },
    });
    convivaVideoIntegration.setupEventListeners(playerInstance);
  }

  var assetInfo = Video.get({id: videoIdString}, function() {
    $scope.asset = assetInfo;
    if (!assetInfo) {
      $location.url('/videos');
    }
    trackAppVideoStart(assetInfo);
    convivaVideoIntegration.initConviva(assetInfo, customer);
    initVideoPlayer(assetInfo);
  });

  $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
    convivaVideoIntegration.removeEventListeners(playerInstance);
    convivaVideoIntegration.reportPlaybackEnded();
  });
});
