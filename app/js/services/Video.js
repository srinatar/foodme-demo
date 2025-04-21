'use strict';

foodMeApp.factory('Video', function($resource) {
  return $resource('/api/videos/:id', {id: '@id'});
});

foodMeApp.factory('Videos', function($resource) {
  return $resource('/api/videos');
});
