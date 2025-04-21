var convivaVideoIntegration =
  convivaVideoIntegration ||
  (function () {
    let videoAnalytics;
    let adAnalytics;
    const PRODUCTION_CUSTOMER_KEY = "af65934b0b34dd0b9a740f85f79b4b9d9f013a65"; // c3.Customer-Demo
    const TEST_CUSTOMER_KEY = "af65934b0b34dd0b9a740f85f79b4b9d9f013a65"; // c3.Customer-Demo
    this.assetInfo = null;
    this.customer = null;

    var parseAdMetadata = function (adEvent) {
      const convivaAdMetadata = {};
      if (adEvent.client === "googima") {
        convivaAdMetadata[Conviva.Constants.ASSET_NAME] = adEvent.adtitle;
        convivaAdMetadata[Conviva.Constants.IS_LIVE] =
          Conviva.Constants.StreamType.VOD; // @TODO: Or Conviva.Constants.StreamType.LIVE
        convivaAdMetadata[Conviva.Constants.VIEWER_ID] = ""; // @TODO Set to the same value as content viewer ID
        convivaAdMetadata[Conviva.Constants.STREAM_URL] = adEvent.mediaFile
          ? adEvent.mediaFile.file
          : adEvent.tag;
        convivaAdMetadata[Conviva.Constants.DURATION] = adEvent.duration;
        convivaAdMetadata[Conviva.Constants.FRAMEWORK_NAME] = adEvent.client;
        convivaAdMetadata[Conviva.Constants.FRAMEWORK_VERSION] = "NA";
        convivaAdMetadata["c3.ad.technology"] =
          Conviva.Constants.AdType.CLIENT_SIDE;
        convivaAdMetadata["c3.ad.id"] = adEvent.adId || "NA";
        convivaAdMetadata["c3.ad.creativeId"] = adEvent.creativeAdId || "NA";
        convivaAdMetadata["c3.ad.system"] = adEvent.adsystem || "NA";
        let adPosition;
        switch (adEvent.adposition) {
          case "pre":
            adPosition = Conviva.Constants.AdPosition.PREROLL;
            break;
          case "post":
            adPosition = Conviva.Constants.AdPosition.POSTROLL;
            break;
          case "mid":
            adPosition = Conviva.Constants.AdPosition.MIDROLL;
            break;
          default:
            adPosition = "NA";
            break;
        }
        convivaAdMetadata["c3.ad.position"] = adPosition;
        convivaAdMetadata["c3.ad.mediaFileApiFramework"] = "NA";
        convivaAdMetadata["c3.ad.isSlate"] = "false";
        convivaAdMetadata["c3.ad.adStitcher"] = "NA";

        let firstAdSystem = "NA";
        let firstAdId = "NA";
        let firstCreativeId = "NA";
        if (adEvent.ima && adEvent.ima.ad) {
          const ad = adEvent.ima.ad;
          if (ad.getWrapperAdIds() && ad.getWrapperAdIds().length !== 0) {
            const len = ad.getWrapperAdIds().length;
            firstAdSystem = ad.getWrapperAdSystems()[len - 1];
            firstAdId = ad.getWrapperAdIds()[len - 1];
            firstCreativeId = ad.getWrapperCreativeIds()[len - 1];
          } else {
            firstAdSystem = ad.getAdSystem();
            firstAdId = ad.getAdId();
            firstCreativeId = ad.getCreativeId();
          }
        }
        convivaAdMetadata["c3.ad.firstAdId"] = firstAdId;
        convivaAdMetadata["c3.ad.firstAdSystem"] = firstAdSystem;
        convivaAdMetadata["c3.ad.firstCreativeId"] = firstCreativeId;
      } else if (adEvent.client === "freewheel") {
        let freewheelAd = adEvent.freewheel ? adEvent.freewheel.ad : {};
        convivaAdMetadata[Conviva.Constants.ASSET_NAME] = adEvent.adtitle || "";
        convivaAdMetadata[Conviva.Constants.IS_LIVE] =
          Conviva.Constants.StreamType.VOD; // @TODO: Or Conviva.Constants.StreamType.LIVE
        convivaAdMetadata[Conviva.Constants.VIEWER_ID] = ""; // @TODO Set to the same value as content viewer ID
        convivaAdMetadata[Conviva.Constants.STREAM_URL] = adEvent.mediaFile
          ? adEvent.mediaFile.file
          : adEvent.tag || null;
        convivaAdMetadata[Conviva.Constants.DURATION] = adEvent.duration
          ? Number(adEvent.duration)
          : null;
        convivaAdMetadata[Conviva.Constants.FRAMEWORK_NAME] =
          "JWPlayer " + adEvent.client;
        convivaAdMetadata[Conviva.Constants.FRAMEWORK_VERSION] =
          window._fw_admanager.version;
        convivaAdMetadata["c3.ad.technology"] =
          Conviva.Constants.AdType.CLIENT_SIDE;
        convivaAdMetadata["c3.ad.id"] =
          adEvent.adId || freewheelAd.adId || "NA";
        convivaAdMetadata["c3.ad.creativeId"] = adEvent.creativeAdId || "NA";
        convivaAdMetadata["c3.ad.system"] = adEvent.adsystem || "NA";
        let adPosition;
        switch (adEvent.adposition) {
          case "pre":
            adPosition = Conviva.Constants.AdPosition.PREROLL;
            break;
          case "post":
            adPosition = Conviva.Constants.AdPosition.POSTROLL;
            break;
          case "mid":
            adPosition = Conviva.Constants.AdPosition.MIDROLL;
            break;
          default:
            adPosition = "NA";
            break;
        }
        convivaAdMetadata["c3.ad.position"] = adPosition;
        convivaAdMetadata["c3.ad.mediaFileApiFramework"] = "NA";
        convivaAdMetadata["c3.ad.isSlate"] = "false";
        convivaAdMetadata["c3.ad.adStitcher"] = "NA";
        convivaAdMetadata["c3.ad.firstAdId"] = "NA";
        convivaAdMetadata["c3.ad.firstAdSystem"] = "NA";
        convivaAdMetadata["c3.ad.firstCreativeId"] = "NA";
        // convivaAdMetadata[ADD_CUSTOM_TAGS_HERE] = ''; // @TODO: Add all the custom tags for ads here
      } else {
        // @ TODO for adEvent.client === 'vast'
      }
      return convivaAdMetadata;
    };

    this.initConviva = function (assetInfo, customer) {
      this.assetInfo = assetInfo;
      this.customer = customer;
      // eslint-disable-next-line no-constant-condition
      if (true /* DEBUG ONLY */) {
        const settings = {};
        settings[Conviva.Constants.GATEWAY_URL] =
          "https://conviva-test.testonly.conviva.com"; // 'https://[ACCOUNT-NAME]-test.testonly.conviva.com';
        settings[Conviva.Constants.LOG_LEVEL] =
          Conviva.Constants.LogLevel.DEBUG;
        Conviva.Analytics.init(TEST_CUSTOMER_KEY, null, settings);
      } else {
        // production release
        Conviva.Analytics.init(PRODUCTION_CUSTOMER_KEY);
      }

      Conviva.Analytics.setDeviceMetadata({
        [Conviva.Constants.DeviceMetadata.CATEGORY]:
          Conviva.Constants.DeviceCategory.WEB,
      });
    };

    this.reportPlaybackRequested = function () {
      const metadata = {};
      metadata[Conviva.Constants.ASSET_NAME] = ['[', this.assetInfo.assetId, '] ', this.assetInfo.assetName].join('');
      metadata[Conviva.Constants.IS_LIVE] = Conviva.Constants.StreamType.VOD;
      metadata[Conviva.Constants.PLAYER_NAME] = "FoodMe Browser";
      metadata[Conviva.Constants.VIEWER_ID] = this.customer ? this.customer.name : null;
      metadata[Conviva.Constants.FRAMEWORK_NAME] = "JWPlayer";
      metadata[Conviva.Constants.FRAMEWORK_VERSION] = jwplayer().version.split('+')[0];
      metadata["c3.app.version"] = "1.0.0"; // @TODO: set this
      metadata["c3.cm.contentType"] = "vod";
      metadata["c3.cm.id"] = String(this.assetInfo.assetId);
      // metadata[ADD_CUSTOM_TAGS_HERE] = ''; // @TODO: Add all the custom tags for content here
      videoAnalytics =
        videoAnalytics || Conviva.Analytics.buildVideoAnalytics();
      videoAnalytics.reportPlaybackRequested(metadata);
    };

    this.setupEventListeners = function (playerInstance) {
      videoAnalytics =
        videoAnalytics || Conviva.Analytics.buildVideoAnalytics();

      playerInstance.on('displayClick', (evt, type) => {
        this.reportPlaybackRequested();
      });
      playerInstance.on("playlistItem", (evt) => {
        // Report the video duration and any other metadata updates needed
        const metadata = {};
        metadata[Conviva.Constants.STREAM_URL] = evt.item.file;
        videoAnalytics.setContentInfo(metadata);
      });
      playerInstance.on("visualQuality", (evt) => {
        const visualQuality = playerInstance.getVisualQuality();
        if (visualQuality) {
          const level = visualQuality.level;
          if (level) {
            videoAnalytics.reportPlaybackMetric(
              Conviva.Constants.Playback.BITRATE,
              level.bitrate / 1000 // bps to kbps
            );
          }
        }
      });
      playerInstance.on("firstFrame", (evt) => {
        // Report the video duration and any other metadata updates needed
        const metadata = {};
        metadata[Conviva.Constants.DURATION] = playerInstance.getDuration();
        videoAnalytics.setContentInfo(metadata);
      });
      playerInstance.on("play", (evt) => {
        if (!videoAnalytics) {
          reportPlaybackRequested();
        }
        videoAnalytics.reportPlaybackMetric(
          Conviva.Constants.Playback.PLAYER_STATE,
          Conviva.Constants.PlayerState.PLAYING
        );
      });
      playerInstance.on("buffer", (evt) => {
        if (!videoAnalytics) {
          reportPlaybackRequested();
        }
        videoAnalytics.reportPlaybackMetric(
          Conviva.Constants.Playback.PLAYER_STATE,
          Conviva.Constants.PlayerState.BUFFERING
        );
      });
      playerInstance.on("pause", (evt) => {
        if (!videoAnalytics) {
          return;
        }
        videoAnalytics.reportPlaybackMetric(
          Conviva.Constants.Playback.PLAYER_STATE,
          Conviva.Constants.PlayerState.PAUSED
        );
      });
      playerInstance.on("seek", (evt) => {
        if (videoAnalytics) {
          videoAnalytics.reportPlaybackMetric(
            Conviva.Constants.Playback.SEEK_STARTED
          );
        }
      });
      playerInstance.on("seeked", (evt) => {
        if (videoAnalytics) {
          videoAnalytics.reportPlaybackMetric(
            Conviva.Constants.Playback.SEEK_ENDED
          );
        }
      });
      playerInstance.on("complete", (evt) => {
        if (videoAnalytics) {
          videoAnalytics.reportPlaybackEnded();
          videoAnalytics.release();
          videoAnalytics = null;
        }
      });
      playerInstance.on("remove", (evt) => {
        if (videoAnalytics) {
          videoAnalytics.reportPlaybackEnded();
          videoAnalytics.release();
          videoAnalytics = null;
        }
      });
      playerInstance.on("captionsChanged", (evt) => {
        const currentTrack = evt.tracks[evt.track];
        if (videoAnalytics) {
          videoAnalytics.reportPlaybackEvent('captionsChanged', currentTrack);
        }
      });
      playerInstance.on("setupError", (evt) => {
        if (videoAnalytics) {
          videoAnalytics.reportPlaybackFailed(evt.message);
          videoAnalytics.release();
          videoAnalytics = null;
        }
      });
      playerInstance.on("error", (evt) => {
        if (!videoAnalytics) {
          return;
        }
        const captionErrorCodes = [
          "306001",
          "306002",
          "306003",
          "306004",
          "306005",
          "306006",
          "306007",
          "306008",
          "306009",
          "306400",
          "306599",
          "306400-306599",
          "301121",
          "301131",
        ];
        var message = "";
        // Don't report caption errors
        if (
          captionErrorCodes.indexOf(String(evt.code)) === -1 &&
          evt.message !== "Captions failed to load" &&
          evt.message !== "Captions renderer failed to load"
        ) {
          // Generate error message
          if (evt.message && evt.code) {
            message =
              "ErrorCode[" + evt.code + "]:ErrMessage[" + evt.message + "]";
          } else if (evt.message) {
            message = evt.message;
          } else if (evt.code) {
            message = evt.code;
          }
          videoAnalytics.reportPlaybackError(
            message,
            Conviva.Constants.ErrorSeverity.FATAL
          );
          videoAnalytics.release();
          videoAnalytics = null;
        }
      });

      videoAnalytics.setCallback(function () {
        if (playerInstance && videoAnalytics) {
          videoAnalytics.reportPlaybackMetric(
            Conviva.Constants.Playback.PLAY_HEAD_TIME,
            playerInstance.getPosition()
          );
        }
      });

      // Handle ads
      playerInstance.on("adBreakStart", (evt) => {
        if (!videoAnalytics) {
          return;
        }
        videoAnalytics.reportAdBreakStarted(
          Conviva.Constants.AdType.CLIENT_SIDE,
          Conviva.Constants.AdPlayer.SEPARATE
        );
      });
      playerInstance.on("adBreakEnd", (evt) => {
        if (!videoAnalytics) {
          return;
        }
        videoAnalytics.reportAdBreakEnded();
      });
      playerInstance.on("adLoaded", (evt) => {
        if (!adAnalytics) {
          adAnalytics = Conviva.Analytics.buildAdAnalytics(videoAnalytics);
        }
        const adInfo = parseAdMetadata(evt);
        adAnalytics.reportAdLoaded(adInfo);
        adAnalytics.reportAdMetric(
          Conviva.Constants.Playback.PLAYER_STATE,
          Conviva.Constants.PlayerState.BUFFERING
        );
      });
      playerInstance.on("adPlay", (evt) => {
        if (!adAnalytics) {
          adAnalytics = Conviva.Analytics.buildAdAnalytics(videoAnalytics);
        }
        const adInfo = parseAdMetadata(evt);
        adAnalytics.reportAdStarted(adInfo);
        adAnalytics.reportAdMetric(
          Conviva.Constants.Playback.PLAYER_STATE,
          Conviva.Constants.PlayerState.PLAYING
        );
      });
      playerInstance.on("adPause", (evt) => {
        adAnalytics.reportAdMetric(
          Conviva.Constants.Playback.PLAYER_STATE,
          Conviva.Constants.PlayerState.PAUSED
        );
      });
      playerInstance.on("adSkipped", (evt) => {
        adAnalytics.reportAdSkipped();
        adAnalytics.release();
        adAnalytics = null;
      });
      playerInstance.on("adComplete", (evt) => {
        // @TODO: This doesn't seem to be fired for Freewheel. Is this a JW player issue?
        adAnalytics.reportAdEnded();
        adAnalytics.release();
        adAnalytics = null;
      });
      playerInstance.on("adError", (evt) => {
        if (!adAnalytics) {
          adAnalytics = Conviva.Analytics.buildAdAnalytics(videoAnalytics);
          const adInfo = parseAdMetadata(evt);
          adAnalytics.reportAdFailed(evt.message, adInfo);
        } else {
          adAnalytics.reportAdFailed(evt.message);
        }
        adAnalytics.release();
        adAnalytics = null;
      });
    };

    this.removeEventListeners = function (playerInstance) {
      if (playerInstance) {

      }
      playerInstance.off('all');
    };

    this.reportPlaybackEnded = function() {

      if (adAnalytics) {
        adAnalytics.reportAdEnded();
        adAnalytics = null;
      }
      if (videoAnalytics) {
        videoAnalytics.reportPlaybackEnded();
        videoAnalytics = null;
      }
    };

    return this;
  })();
