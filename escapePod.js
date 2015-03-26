angular.module('escapePodApp', [])
    .controller('EscapePodController', ['$scope', function($scope)
    {
        $scope.loadRss = function()
        {

            var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from xml where url="' + $scope.rssUrl + '"') + '&format=xml&callback=?';

            // Request that YSQL string, and run a callback function.
            // Pass a defined function to prevent cache-busting.
            $.getJSON(yql, function (data) {

                var xml = $(data.results[0]);
                var items = xml.find('item');

                $scope.imageUrl = xml.find('itunes\\:image').attr('href');

                $scope.episodes = $.map(items, function(episode) {
                   return { title       : $(episode).find('title')      .text(),
                            description : $(episode).find('description').text() };
                });

            });
        };
    }]);