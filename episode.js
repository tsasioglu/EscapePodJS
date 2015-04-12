'use strict';

escapePodApp.directive('episode', function() {
    return {
        restrict: 'E',
        templateUrl: 'episode.html',
        scope: {
            episode: '='
        }
    };
});