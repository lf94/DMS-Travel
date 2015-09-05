$(document).ready(function() {
    var photosStore = null;
    
    var transitionSplashButton = document.getElementById("splash-transition-button");
    var transitionBackButton = document.getElementById("splash-transition-back-button");
    $(transitionSplashButton).click(function(event) {
	$("#splash").fadeOut(500, function() {
	    $.get("js/data/photos.json", function(photos, textStatus, jqXHR) {
		photosStore = photos;
		$(".grid .row").html(generateImageThumbnailCells(photosStore));
		$("main").fadeIn();
	    });
	});
    });
    $(transitionBackButton).click(function(event) {
	$("main").fadeOut(500, function() {
	    $("#splash").fadeIn();
	});
    });
    
    var loginButton = $("#login-button");
    loginButton.click(function(event) {
	alert("This feature is unavailable.");
    });

    var searchForm = $("#search-form");

    searchForm.submit(function(event) {
	var searchField = $("#search-field");
	(function() {
	    var i;
	    var query = searchField.val();
	    var grid = $(".grid .row");
	    var filteredPhotos;

	    if(query == "") {
		grid.html(generateImageThumbnailCells(photosStore));
		grid.className = "row"
		return;
	    }

	    filteredPhotos = photosStore.filter(function(element) {
		return (new RegExp(query.trim(), "i")).test(element.desc);
	    });

	    if(filteredPhotos.length > 0) {
		grid.html(generateImageThumbnailCells(filteredPhotos));
	    } else {
		grid.html("No results.");
	    }
	    
	})();
	
	/* Prevent the page from reloading. */
	event.preventDefault();
    });


    function generateImageThumbnailCells(photos) {
	var i;
	var html = "";
	for(i = 0; i < photos.length; i += 1) {
	    html += "<div class='column-1-3'>"
		+"<figure class='image' >"
		+"<a href="+photos[i].url+" data-lightbox='image-set' data-title='"+photos[i].desc+"'>"
		+"<img src='"+photos[i].url+"' alt='"+photos[i].desc+"' />"
		+"</a>"
		+"<figcaption>"+photos[i].desc+"</figcaption>"
		+"</figure>"
		+"</div>";
	}
	return html;
    }

    function cloneNodes(nodeArray) {
	var i;
	var cloned = [];
	for(i = 0; i < nodeArray.length; i += 1) {
	    cloned.push(nodeArray[i].cloneNode(true));
	}
	return cloned;
    }
});
