// script.js
// Handles the JavaScript for this project.

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false; // disable interpolation when upscaling images

let tempCanvas = document.createElement('canvas'); // temporary canvas used in renderSprite
tempCanvas.width = 24;
tempCanvas.height = 40;
tempCtx = tempCanvas.getContext("2d");

let targetColors = []; // maybe instead of using color ints, use hexidecimals?
let replaceColors = []; // maybe just leave these as RGB pairs?

let suit = "gravity";
let pose = "front";
let imageIndex = 0;

let sprites = [];
let stop = (pose == "morph_ball" ? 8 : 4);
for(let i = 0; i < stop; i++) {
	sprites.push(new Image());
	sprites[i].crossOrigin = "anonymous";
	sprites[i].src = "https://electrixcodes.github.io/AM2RSuitEditor/assets/sprites/" + suit + "/" + pose + "/" + i.toString() + ".png";
}

// Updates the sprite with the next frame of its animation.
function suitLoop() {
	imageIndex = (imageIndex + 1) % sprites.length;
	renderSprite();
}

// Recolors the sprite and draws it to the canvas
function renderSprite() {
	tempCtx.drawImage(sprites[imageIndex], 0, 0);
	let spriteData = tempCtx.getImageData(0, 0, 24, 40);
	let stop = 4 * spriteData.width * spriteData.height;
	for (let index = 0; index < stop; index += 4) {
		if (spriteData.data[index + 3] == 0) { // skip loop if pixel is transparent
			continue;
		}
		let pixelColor = toColorInt(spriteData.data[index], spriteData.data[index + 1], spriteData.data[index + 2]); // R,G,B to color integer
		let targetIndex = targetColors.indexOf(pixelColor);
		if (targetIndex != -1) {
			let newPixelColor = toRGB(replaceColors[targetIndex]);
			spriteData.data[index] = newPixelColor.r;
			spriteData.data[index + 1] = newPixelColor.g;
			spriteData.data[index + 2] = newPixelColor.b;
		}
	}
	tempCtx.putImageData(spriteData, 0, 0);
	ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
}

// Takes a (r, g, b) pair and converts it to a color integer
function toColorInt(r, g, b) {
	return (r << 16) + (g << 8) + b;
}

// Takes a color integer and converts it to a (r, g, b) pair
function toRGB(colorInt) {
	let c = 0xff03c0; // 16712640
	return {
		r: (colorInt & 0xff0000) >> 16,
		g: (colorInt & 0x00ff00) >> 8,
		b: (colorInt & 0x0000ff)
	};
}

function setTargetColor(r, g, b) {
	let rgbString = "(" + r + ", " + g + ", " + b + ")";
	let rgbStringInverted = "(" + (255 - r) + ", " + (255 - g) + ", " + (255 - b) + ")";
	document.getElementById("targetColorSpan").style.backgroundColor = "rgb" + rgbString;
	document.getElementById("targetColorSpan").style.borderColor = "rgb" + rgbStringInverted;
	document.getElementById("targetColorText").innerHTML = "Target Color:<br>" + rgbString;
}

function setReplaceColor(r, g, b) {
	let rgbString = "(" + r + ", " + g + ", " + b + ")";
	let rgbStringInverted = "(" + (255 - r) + ", " + (255 - g) + ", " + (255 - b) + ")";
	document.getElementById("replaceColorSpan").style.backgroundColor = "rgb" + rgbString;
	document.getElementById("replaceColorSpan").style.borderColor = "rgb" + rgbStringInverted;
	document.getElementById("replaceColorText").innerHTML = "Replace Color:<br>" + rgbString;
}


setInterval(suitLoop, 500); // todo: make this default animation speed more precise
setTargetColor(0, 0, 0);
setReplaceColor(0, 0, 0);


document.getElementById("replaceDiv").addEventListener("click", function() {
	document.getElementById("colorPicker").click();
});

document.getElementById("colorPicker").addEventListener("input", function() {
	let colorInt = parseInt(this.value.substring(1), 16);
	let colorRGB = toRGB(colorInt);
	setReplaceColor(colorRGB.r, colorRGB.g, colorRGB.b);
	renderSprite();
});

canvas.addEventListener("click", function(evt) {
	let rect = canvas.getBoundingClientRect();
	let mouseX = evt.clientX - rect.left;
	let mouseY = evt.clientY - rect.top;
	
	tempCtx.drawImage(sprites[imageIndex], 0, 0);
	let spriteData = tempCtx.getImageData(0, 0, 24, 40).data;
	
	let pixelCol = Math.floor(mouseX / 11.25);
	let pixelRow = Math.floor(mouseY / 11.25);
	let index = 4 * ((pixelRow * tempCanvas.width) + pixelCol);
	if (spriteData[index + 3] != 0) { // pixel is not transparent
		let pixelColor = toColorInt(spriteData[index], spriteData[index + 1], spriteData[index + 2]);
		setTargetColor(spriteData[index], spriteData[index + 1], spriteData[index + 2]);
	}
	
	/*let canvasPixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	let index = 4 * ((canvas.width * mouseY) + mouseX);
	
	if (canvasPixels[index + 3] != 0) { // pixel is not transparent
		let pixelColor = toColorInt(canvasPixels[index], canvasPixels[index + 1], canvasPixels[index + 2]);
		document.getElementById("targetColorSpan").style.backgroundColor = "rgb(" + canvasPixels[index] + ", " + canvasPixels[index + 1] + ", " + canvasPixels[index + 2] + ")";
	}
	*/
});