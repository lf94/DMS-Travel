var loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", function(event) {
    alert("This feature is unavailable.");
});

var searchForm = document.getElementById("search-form");
var originalPhotos = cloneNodes(document.getElementsByTagName("img"));

searchForm.addEventListener("submit",function(event) {
    var searchField = document.getElementById("search-field");
    (function() {
	var i;
	var replacements = searchField.value;
	var grid = document.querySelector(".grid .row");
	var newPhotos;

	if(replacements == "") {
	    grid.innerHTML = generateImageThumbnailCell(originalPhotos);
	    grid.className = "row"
	    return;
	}
	
	if(/[0-9]+/.test(replacements) == false) {
	    alert("Please enter an integer.");
	    return;
	}

	grid.className = "row even"
	replacements = parseInt(replacements);

	newPhotos = (new Array(replacements)).fill(originalPhotos[0]);
	grid.innerHTML = generateImageThumbnailCell(newPhotos);
	
    })();
    
    /* Prevent the page from reloading. */
    event.preventDefault();
});


function generateImageThumbnailCell(photos) {
    var i;
    var html = "";
    for(i = 0; i < photos.length; i += 1) {
	html += "<div class='column-1-3'><figure class='image' ><a href="+photos[i].src+">"+photos[i].outerHTML+"</a><figcaption>"+photos[i].alt+"</figcaption></figure></div>";
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
