// script.js
// Handles the JavaScript for this project.

var canvas = document.getElementById("suit");
var ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false; // disable interpolation when upscaling images

var suit = "gravity";
var pose = "front";
var imageIndex = 0;

var sprites = [];
var stop = (pose == "morph_ball" ? 8 : 4);
for(var i = 0; i < stop; i++) {
	sprites.push(new Image());
	sprites[i].src = "https://electrixcodes.github.io/AM2RSuitEditor/assets/sprites/" + suit + "/" + pose + "/" + i.toString() + ".png";
}

/*
var img = new Image();
img.onload = function() {
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}
img.src = "https://electrixcodes.github.io/AM2RSuitEditor/assets/sprites/gravity/front/0.png";
*/

function suitLoop() {
	ctx.drawImage(sprites[imageIndex], 0, 0, canvas.width, canvas.height);
	imageIndex = (imageIndex + 1) % sprites.length;
}

setInterval(suitLoop, 500);