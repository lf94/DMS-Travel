/*
 * A service to handle Facebook communications.
 */
var Facebook = angular.module("FacebookServices", []);


/* 
 * Initialize the Facebook SDK and check login status.
 */
Facebook.service(
    'FacebookInitialization',
    [
        function() {
            var self = this;
            this.initialized = false;
           
            /* Initialize the Facebook SDK. */
            this.init = function(statusChanged, loggedInCallback, guestCallback) {
              FB.init({
                appId      : '455942297942233',
                xfbml      : true,
                status     : true,
                cookie   : true,
                version    : 'v2.4'
              });
              console.log("Initialized FB");
              self.initialized = true;

              FB.getLoginStatus(function(response) {
                statusChanged(response, loggedInCallback, guestCallback);
              });

            };

        }
]
);

/*
 * Provide an autheticator for users to use.
 */
Facebook.service(
    'FacebookAuthentication',
    [ 
        function() {
            var self = this;
            this.authenticated = false;
            this.statusChanged = function(response, loggedInCallback, guestCallback) {
                console.log("Response: "+response.status);
                
                if (response.status === 'connected') {
                    self.authenticated = true;
                    loggedInCallback();
                } else if (response.status === 'not_authorized') {
                    self.authenticated = false;
                    alert("Please try to login again.");
                }  else {
                    self.authenticated = false;
                    guestCallback();
                }
            }

        }
    ]
);

/* Handle Facebook requests made by the user. */
Facebook.service(
    'FacebookRequests',
    [ 
        function() {
            var self = this;
            this.request = function(query, scope, callback) {
                FB.api(query, function(response) {
                    if(response && !response.error) {
                        callback(response);
                    }
                });
            };

        }
    ]
);

/*
 * This service checks to make sure the Facebook SDK is always ready for to use
 * and that the user is authenticated.
 */
Facebook.service(
    'ReadyAndSecure',
    [ 'FacebookInitialization', 'FacebookAuthentication', '$location',
      function(FacebookInitialization, FacebookAuthentication, $location) {
          var self = this;
         
          /* Logout the user and redirect them to / */
          this.logout = function(scope) {
              FB.logout(function(response) {
                  scope.$apply(function() {
                      FacebookAuthentication.authenticated = false;
                      $location.path("/");
                  });
              });
              return;
          };
         
          /* Check to make sure the FB SDK is initialized, and then check if the
           * user is authenticated.
           */
          this.check = function(scope, success) {
                if(FacebookInitialization.initialized == false) {
                    console.log("Facebook SDK not initialized.");
                    // Just init and continue...don't do anything.
                    FacebookInitialization.init(
                        FacebookAuthentication.statusChanged,
                        function(){
                          console.log("1:"+FacebookAuthentication.authenticated);
                          success();
                        },
                        function() {
                          console.log("Not authenticated.");
                          scope.$apply(function() { $location.path("/"); });
                        });
                } else {
                    if(FacebookAuthentication.authenticated == true) {
                        success();
                    } else {
                        $location.path("/");
                    }
                }

                scope.logout = function(){ self.logout(scope); };
                
            };
        }
    ]
);
