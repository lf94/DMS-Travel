var MainControllers = angular.module("MainControllers", []);

/* Auto-forward user if they're already logged into Facebook. Otherwise prompt them. */
MainControllers.controller(
    "SplashController", [
        "$scope", "$location",
        "FacebookInitialization",
        "FacebookAuthentication",
        function($scope, $location, FacebookInitialization, FacebookAuthentication) {
            if(FacebookInitialization.initialized == false) {
                FacebookInitialization.init(FacebookAuthentication.statusChanged, authenticationSuccess, guestUser);
            }

            /* Login function binding for the login button. */
            $scope.login = function() {
                FB.login(function(response) {
                    console.log("Getting login status.");
                    FB.getLoginStatus(function(response) {
                        FacebookAuthentication.statusChanged(response, authenticationSuccess, guestUser);
                    });
                }, { scope: "public_profile,publish_actions,user_likes" } );
            };
           

            function guestUser() {
                /* Do nothing! */
            }

            /* If the user is authenticated, bring them to the main page. */
            function authenticationSuccess() {
                /* Navigate to /home */
                // Force Angular to cause View updates.
                $scope.$apply(function(){
                    $location.path("/home");
                });
            }
            
            console.log("SplashController");
        }
    ]
);

/* Handle displaying an album's photos and set them up for "liking". */
MainControllers.controller(
    "PhotosController", [
        "$scope", "$routeParams",
        "ReadyAndSecure",
        "FacebookRequests",
        function($scope, $routeParams, ReadyAndSecure, FacebookRequests) {
            var self = this;
            
            ReadyAndSecure.check($scope, function() {
                
                /* 
                 * Check to make sure the user is logged in before allowing 
                 * them to like a photo. Make a request to see if they've 
                 * already liked it. If they have, then dislike the photo, 
                 * otherwise like it. Modify the model to reflect the change in 
                 * likes and redraw.
                */
                $scope.likeToggle = function(photo) {
                    FacebookRequests.request("/"+photo.id+"/likes?summary=has_liked", $scope, function(response) {
                        if(response.summary.has_liked === false) {
                            FB.api("/"+photo.id+"/likes", "post",  function(response){
                                photo.likeClass = "btn btn-danger";
                                photo.likeText = "Dislike";
                                photo.likes.data.push({});
                                $scope.$apply();
                            });
                        } else {
                            FB.api("/"+photo.id+"/likes", "delete", function(response){
                                photo.likeClass = "btn btn-primary";
                                photo.likeText = "Like";
                                photo.likes.data.pop();
                                $scope.$apply();
                            });
                        }
                    });
                };
               
                /* Prepare our Facebook query. */
                var query = "/"+$routeParams.albumId+"?fields=photos{images,name,id,likes}";
                $scope.photos = [];
                
                FacebookRequests.request(query, $scope, function(response) {
                    /*
                     * Recursively fetch if a user has liked a photo. The reason 
                     * for this is because I need to have synchronous loading, 
                     * so the UI can be loaded properly.
                     *
                     * For some reason I can't define this function outside of 
                     * this scope either. We call it later on in this request.
                    */
                    var getLikes = function ($scope, index) {
                        if($scope.photos.length == index) {
                            $scope.$apply(); // Load the UI after all the Like buttons are configured.
                            return;
                        }
                        
                        var photo = $scope.photos[index];

                        FacebookRequests.request("/"+photo.id+"/likes?summary=has_liked", $scope, function(response) {

                            // Set the button's Like or Dislike status.
                            if(response.summary.has_liked === false) {
                                photo.likeClass = "btn btn-primary";
                                photo.likeText = "Like";
                            } else {
                                photo.likeClass = "btn btn-danger";
                                photo.likeText = "Dislike";
                            }

                            // Call this function again on the next photo.
                            getLikes($scope, index+1);
                        });
                    };

                    $scope.photos = response.photos.data;
                    /* Modify photos so we can determine the largest image and our thumbnail of  aphoto. */
                    $scope.photos = $scope.photos.map(function(element) {

                        /* Find our thumbnail that is just about 320px in height (320px image not always available). */
                        element.thumbnail = element.images.reduce(function(previous, current) {
                            if(current.height < previous.height && current.height >= 320) {
                                return current;
                            } 
                            return  previous;
                        });

                        /* Find our original image. */
                        element.largest = element.images[0];

                        /* Put in some additional information. */
                        element.likeText = "";
                        element.likeClass = "";

                        return element;
                    });

                    // Now that we've drawn the photos, we can worry about fetching the likes now.
                    $scope.$apply(function() {
                        getLikes($scope, 0);
                    });
                    
                    
                });

                console.log("PhotosController");
            });
        }
    ]
);


/* The controller that handles the main page's Facebook communication. */
MainControllers.controller(
    "MainController", [
        "$scope", "$location",
        "ReadyAndSecure",
        "FacebookRequests",
        function($scope, $location, ReadyAndSecure, FacebookRequests) {
            console.log("MainController");

            ReadyAndSecure.check($scope, function() { 

                $scope.description = "";
                $scope.destinations = [];

                /* Don't re-fetch the destinations if we already have them. */
                if($scope.destinations.length != 0) {
                    return;
                }

                /* Get the description. */
                FacebookRequests.request("/815157038515764?fields=description", $scope, function(response) {
                    $scope.$apply(function() {
                        $scope.description = response.description;
                    });
                });

                /* Get the destinations. */
                var query = "/815157038515764/albums?fields=location,name,id,likes,picture";
                
                FacebookRequests.request(query, $scope, function(response) {
                    $scope.destinations = response.data;

                    $scope.$apply(function() {
                        /* Only select albums that are located in Australia. */
                        $scope.destinations = $scope.destinations.filter(function(element) {
                            if(element.location === undefined) { return false; }
                            
                            return element.location.indexOf("Australia") >= 0;
                        });

                        /* 
                           This is a little tricky because "likes" will be set to `undefined` if likes is zero.
                           So we have to account for some special cases here.
                        */
                        $scope.destinations.sort(function(a,b) {
                            if(a.likes === b.likes) { return 0; } // Both are undefined.
                            if(b.likes === undefined) { return -1; }
                            if(a.likes === undefined) { return 1; }
                            
                            if(a.likes.data.length > b.likes.data.length) { return -1; }
                            if(a.likes.data.length < b.likes.data.length) { return 1; }
                            return 0;
                        });
                        
                    });
                    
                });


                /* Get the page's feed with user comments and their profile pictures. */
                FacebookRequests.request("/815157038515764/feed?fields=from{picture},message,story,likes,type=status", $scope, function(response) {
                    $scope.posts = response.data;

                    $scope.$apply(function() {
                        $scope.posts = $scope.posts.filter(function(post) {
                            if(post.likes === undefined) { return false; }

                            /* Only show posts where that administrator liked. */
                            for(var index = 0; index <  post.likes.data.length; index += 1) { 
                                if(post.likes.data[index].id == "815157038515764") {
                                    return true;
                                }
                            }
                            
                            return false;
                        });
                        
                    });
                });
            });
            
        }
    ]
);

/* A controller that does nothing. For pages with no business logic. */
MainControllers.controller(
    "NullController", [ function() {} ]
);
