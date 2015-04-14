'use strict';

var escapePodApp = angular.module('escapePodApp', ['LocalStorageModule'])
    .controller('EscapePodController', ['$scope', '$q', 'localStorageService', 'mockData', function($scope, $q, localStorageService, mockData) {
        var debug = true;

        if(debug) {
            var xml = mockData.mockXml;
            populateFromXml($(xml));
        }

        loadSubscriptions();

        $scope.loadRss = function() {
            $scope.loadPodcast($scope.rssUrl);
        };

        $scope.loadPodcast = function(url) {
            downloadXml(url).then(function(xml) { populateFromXml(xml)});
        };

        function downloadXml(rssUrl) {
            var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from xml where url="' + rssUrl + '"') + '&format=xml&callback=?';
            var deferred = $q.defer();

            $.getJSON(yql, function (data)
            {
                var xml = $(data.results[0]);
                deferred.resolve(xml);
                $scope.$digest();
            });

            return deferred.promise;
        }

        function populateFromXml(xml) {
            var items = xml.find('item');

            if(debug)
                $scope.imageUrl = mockData.mockImageUrl;
            else
                $scope.imageUrl = xml.find('itunes\\:image').attr('href');

            $scope.title = xml.find('title').first().text();
            $scope.description = xml.find('description').first().text();
            $scope.category = xml.find('category').first().text();

            $scope.episodes = $.map(items, function(episode)
            {
              return parseEpisode(episode)
            });
        }

        function parseEpisode(episode) {
            return {
                title       : $(episode).find('title')      .text(),
                description : $(episode).find('description').text(),
                date        : new Date($(episode).find('pubDate').text()),
                url         : $(episode).find('enclosure').attr('url'),
                duration    : $(episode).find('itunes\\:duration').text()
            };
        }

        function loadSubscriptions() {
            $scope.subscriptions = localStorageService.get('podcasts');
        }

       $scope.subscribe = function() {
           var url = $scope.rssUrl;

           if(typeof url == "undefined")
               return;

            getSubscription().then(function(subscription) {

                var cookies = localStorageService.get('podcasts');

                if(cookies == null)
                    cookies = [];

                if(_.some(cookies, function(cookie) { return cookie.url == url})) {
                    console.log('Subscription already added');
                    return;
                }

                cookies.push(subscription);
                localStorageService.set('podcasts', cookies);
                loadSubscriptions();
            });
       };

        function getSubscription() {
            var deferred = $q.defer();

            downloadXml($scope.rssUrl).then(function(xml)
            {
                deferred.resolve({
                    title: xml.find('title').first().text(),
                    url  : $scope.rssUrl
                });
            });

            return deferred.promise;
        }

        $scope.removeSubscription = function(url)
        {
            var cookies = localStorageService.get('podcasts');
            cookies = _.filter(cookies, function(cookie) {
                return cookie.url != url}
            );
            localStorageService.set('podcasts', cookies)
        };
}]);


