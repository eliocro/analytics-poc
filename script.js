(function () {

  OAuth.initialize('L_EJKtWIdLoM3gsuIXxoqcUWGlI');


  angular.module('analytics-demo', [])


  .controller('DemoCtrl', function ($scope, $http, $timeout) {
    console.log('DemoCtrl');

    $scope.experiments = [];
    $scope.result = '';


    $scope.getGAData = function () {
      OAuth.popup('google_analytics', {}, function(err, result) {
        if(err) {
          return console.log(err, result);
        }

        console.log(result);
        var auth = result;

        auth.get('https://www.googleapis.com/analytics/v3/management/accounts')
        .done(function (data) {
          console.log('Accounts:', data);

          var id = data.items[0].id;
          console.log('Fetching:', id);


          auth.get('https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties')
          .done(function (data2) {
            console.log('Properties:', data2);

            var id2 = data2.items[0].internalWebPropertyId;
            console.log('Fetching:', id2);

            // Retrieve profiles
            auth.get('https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties/~all/profiles')
            .done(function (data3) {
              console.log('Profiles:', data3);

              for(var i = 0; i < data.items.length; i++) {

                var accountId = data3.items[i].accountId;
                var propertyId = data3.items[i].webPropertyId;
                var profileId = data3.items[i].id;
                console.log(accountId, propertyId, profileId);

                // Retrieve experiments
                auth.get('https://www.googleapis.com/analytics/v3/management/accounts/'+accountId+
                  '/webproperties/'+propertyId+'/profiles/'+profileId+'/experiments')
                .done(function (data4) {
                  console.log('Experiments:', data4);
                  if(data4.totalResults) {

                    $timeout(function () {
                      for(var j = 0; j< data4.items.length; j++) {
                        $scope.experiments.push(data4.items[j]);

                        // Retrieve a single experiment data
                        var experimentId = data4.items[j].id;
                        auth.get('https://www.googleapis.com/analytics/v3/management/accounts/'+accountId+
                          '/webproperties/'+propertyId+'/profiles/'+profileId+'/experiments/' + experimentId)
                        .done(function (data5) {
                          console.log('Experiment:', data5);

                          $timeout(function () {
                            $scope.result += '<pre>' + JSON.stringify(data5) + '</pre><br>';
                          },1);
                        });
                      }
                    },1);
                  }
                });
              }
            });


          });
        });
      });
    };

  })

  .filter('trustHtml', function ($sce) {
    return function (html) {
      return $sce.trustAsHtml(html);
    };
  })

  ;

})();
