// script.js
// Handles the JavaScript for this project.

/*
	suitCanvas Setup
*/

const suitNames = ["power", "varia", "gravity", "fusion_power", "fusion_varia", "fusion_gravity"];
const poseNames = ["front", "side", "walk", "run", "morph_ball"];
const poseImageCount = [4, 4, 10, 10, 8]; // Helps determine how many images there are to load
const poseOffsets = [0, 45, 55, 65, 81]; // Helps vertically center the suit on suitCanvas

let suitIndex; // Index of current suit
let poseIndex; // Index of current pose

const suitCanvas = document.getElementById("canvas"); // Suit is drawn to this canvas
const suitCtx = suitCanvas.getContext("2d");
suitCtx.imageSmoothingEnabled = false; // Disables pixel interpolation

const suitHelperCanvas = document.createElement("canvas"); // Canvas used for manipulating suit's color data
const suitHelperCtx = suitHelperCanvas.getContext("2d");

let sprites; // Array of images to draw to suitCanvas
let animationFrame; // Index of sprites

let unloadedImageCount; // Suit will start being drawn after this reaches 0
let suitCanvasLoop; // Helps with setInterval and clearInterval
let animationSpeed; // Current animation speed, from 0x to 1.5x

// Note: changes are only applied after setInterval call
function setAnimationSpeed(x) {
	animationSpeed = Math.max(0, Math.min(x, 1.5));
	document.getElementById("animationSpeedText").innerHTML = "Speed: " + animationSpeed.toString().padEnd(2, ".").padEnd(4, "0") + "x";
}

setAnimationSpeed(1);

// Changes the current suit. This function is called at the beginning of the program
function setSuit(index) {
	suitIndex = index;
	document.getElementById("suitText").innerHTML = suitNames[suitIndex].toUpperCase().replace("_", " ") + " SUIT";
	setPose(0);
	
	// When this image loads, the palette is initialized via paletteImg's EventListener function
	paletteImg.src = "https://electrixcodes.github.io/AM2RSuitEditor/assets/palettes/" + suitNames[suitIndex] + ".png";
}

// Changes the current pose, loading the necessary images to do so
function setPose(index) {
	poseIndex = index;
	document.getElementById("poseText").innerHTML = poseNames[poseIndex].toUpperCase().replace("_", " ") + " VIEW";
	
	unloadedImageCount = poseImageCount[poseIndex];
	
	sprites = [];
	animationFrame = 0;
	let stop = unloadedImageCount;
	for(let i = 0; i < stop; i++) {
		sprites.push(new Image());
		sprites[i].crossOrigin = "anonymous"; // Avoids security errors
		sprites[i].addEventListener("load", imageLoaded);
		sprites[i].src = "https://electrixcodes.github.io/AM2RSuitEditor/assets/sprites/" + suitNames[suitIndex] + "/" + poseNames[poseIndex] + "/" + i.toString() + ".png";
	}
}

// This function starts the suit-drawing loop once all images in sprites have loaded
function imageLoaded() {
	unloadedImageCount--;
	if (unloadedImageCount == 0) {
		clearInterval(suitCanvasLoop);
		suitHelperCanvas.width = sprites[0].width;
		suitHelperCanvas.height = sprites[0].height;
		drawSuit();
		if (animationSpeed > 0) {
			suitCanvasLoop = setInterval(drawNextSuitFrame, 300 / animationSpeed);
		}
	}
}

// Called regularly. Draws the suit with the next frame of its animation
function drawNextSuitFrame() {
	animationFrame = (animationFrame + 1) % sprites.length;
	drawSuit();
}

// Recolors the suit and draws it to suitCanvas
function drawSuit() {
	suitHelperCtx.clearRect(0, 0, suitHelperCanvas.width, suitHelperCanvas.height);
	suitHelperCtx.drawImage(sprites[animationFrame], 0, 0);
	let helperInfo = suitHelperCtx.getImageData(0, 0, suitHelperCanvas.width, suitHelperCanvas.height);
	let stop = 4 * helperInfo.width * helperInfo.height;
	for(let i = 0; i < stop; i += 4) { // Iterate through pixels on helper canvas
		if (helperInfo.data[i + 3] != 0) { // If pixel is not transparent
			let pixelRGB = [helperInfo.data[i], helperInfo.data[i + 1], helperInfo.data[i + 2]];
			for(let j = 0; j < targetColors.length; j++) { // Iterate through target colors
				let targetRGB = targetColors[j];
				if (pixelRGB[0] == targetRGB[0] && pixelRGB[1] == targetRGB[1] && pixelRGB[2] == targetRGB[2]) { // Pixel color matches target color
					let replaceRGB = replaceColors[j];
					helperInfo.data[i] = replaceRGB[0];
					helperInfo.data[i + 1] = replaceRGB[1];
					helperInfo.data[i + 2] = replaceRGB[2];
					break;
				}
			}
		}
	}
	suitHelperCtx.putImageData(helperInfo, 0, 0); // Update suitHelperCanvas with new pixel data
	suitCtx.clearRect(0, 0, suitCanvas.width, suitCanvas.height);
	suitCtx.drawImage(suitHelperCanvas, 0, poseOffsets[poseIndex], suitCanvas.width, suitHelperCanvas.height * (suitCanvas.width / suitHelperCanvas.width)); // Scale and draw suit
}


/*
	paletteCanvas Setup
*/

const paletteCanvas = document.getElementById("palette"); // Palette is drawn to this canvas
const paletteCtx = paletteCanvas.getContext("2d");
paletteCtx.imageSmoothingEnabled = false; // Disables pixel interpolation

const paletteHelperCanvas = document.createElement("canvas"); // Canvas used for manipulating pixel color data
const paletteHelperCtx = paletteHelperCanvas.getContext("2d");
paletteHelperCanvas.width = 2;

let targetColors = []; // Array of colors (as [r, g, b] arrays) to target during suit recoloring
let replaceColors; // Array of replacement colors for suit recoloring
let paletteIndex; // Current index of targetColors/replaceColors

let paletteImg = new Image(); // Current palette image
paletteImg.crossOrigin = "anonymous"; // Avoids security errors

// Adds colors to targetColors and replaceColors based on color data from paletteImg. (paletteImg's src is assigned in setSuit function)
paletteImg.addEventListener("load", function() {
	paletteHelperCanvas.height = paletteImg.height;
	paletteCtx.clearRect(0, 0, paletteCanvas.width, paletteCanvas.height);
	paletteHelperCtx.drawImage(paletteImg, 0, 0);
	
	// Iterate through first column of paletteImg and append color data to targetColors
	helperInfo = paletteHelperCtx.getImageData(0, 0, 1, paletteHelperCanvas.height);
	stop = 4 * paletteHelperCanvas.height;
	targetColors = [];
	for(let i = 0; i < stop; i += 4) {
		rgb = [helperInfo.data[i], helperInfo.data[i + 1], helperInfo.data[i + 2]];
		targetColors.push(rgb);
	}
	replaceColors = targetColors.map(rgb => rgb.slice()); // "Deep" clone targetColors
	setPaletteIndex(0);
});

// Updates the palette index
function setPaletteIndex(index) {
	paletteIndex = index;
	
	// Update target color display
	let rgb = targetColors[paletteIndex];
	let rgbString = "(" + rgb.join(", ") + ")";
	document.getElementById("targetColorSpan").style.backgroundColor = "rgb" + rgbString;
	document.getElementById("targetColorText").innerHTML = "Target Color:<br>" + rgbString;
	
	// Update replace color display, which also redraws the palette
	setReplaceColor(replaceColors[paletteIndex]);
}

// Changes the current replace color
function setReplaceColor(rgb) {
	replaceColors[paletteIndex] = [...rgb]; // Clone to avoid weird errors
	let rgbString = "(" + rgb.join(", ") + ")";
	document.getElementById("replaceColorSpan").style.backgroundColor = "rgb" + rgbString;
	document.getElementById("replaceColorText").innerHTML = "Replace Color:<br>" + rgbString;
	drawPalette();
}

// Draws the palette to paletteCanvas
function drawPalette() {
	paletteHelperCtx.drawImage(paletteImg, 0, 0);
	
	// Change the second column of pixels to match replaceColors
	let helperInfo = paletteHelperCtx.getImageData(1, 0, 1, paletteHelperCanvas.height);
	let stop = 4 * paletteHelperCanvas.height;
	for(let i = 0; i < stop; i += 4) {
		let newRGB = replaceColors[Math.floor(i / 4)];
		helperInfo.data[i] = newRGB[0];
		helperInfo.data[i + 1] = newRGB[1];
		helperInfo.data[i + 2] = newRGB[2];
	}
	paletteHelperCtx.putImageData(helperInfo, 1, 0); // Update paletteHelperCanvas with new pixel data
	paletteCtx.drawImage(paletteHelperCanvas, 0, 0, paletteCanvas.width, paletteCanvas.height); // Scale and draw palette
	
	// Draw palette slider
	let targetRGB = targetColors[paletteIndex];
	if ((targetRGB[0] + targetRGB[1] + targetRGB[2]) / 3 > 128) {
		paletteCtx.strokeStyle = "black";
	} else {
		paletteCtx.strokeStyle = "white";
	}
	paletteCtx.lineWidth = 2;
	paletteCtx.strokeRect(0, paletteIndex * (paletteCanvas.height / paletteHelperCanvas.height), paletteCanvas.width, paletteCanvas.height / paletteHelperCanvas.height);
}



setSuit(0);



/*
	Help Text Setup
*/

const helpText = [ // Text for #helpText
	"To change suit colors, click \"Replace Color\".",
	"Click on the palette to change the target color...",
	"...Or use the \"Up\", \"Down\", \"Home\", and \"End\" keys.",
	"Click on the suit to quickly target a specific color.",
	"After designing a palette, click \"Export Palette\".",
	"Place image in: Profiles/.../mods/ palettes/suits",
	"Enjoy your custom suit colors!<br>",
];
let helpIndex; // Current index of helpText

function setHelpIndex(n) {
	helpIndex = n;
	document.getElementById("helpText").innerHTML = helpText[helpIndex]
	+ "<br>" + "&nbsp;".repeat(13) + "(" + (helpIndex + 1) + "/" + helpText.length + ")";
}

setHelpIndex(0);

// Go to previous page of help text on button click
document.getElementById("prevHelpTextButton").addEventListener("click", function() {
	setHelpIndex(Math.max(0, helpIndex - 1));
});

// Go to next page of help text on button click
document.getElementById("nextHelpTextButton").addEventListener("click", function() {
	setHelpIndex(Math.min(helpIndex + 1, helpText.length - 1));
});


/*
	Event Handling: Left Panel
*/

// Clicking on the suit to change palette index
suitCanvas.addEventListener("click", function(evt) {
	let rect = suitCanvas.getBoundingClientRect();
	let mouseX = evt.clientX - rect.left;
	let mouseY = evt.clientY - rect.top;
	
	suitHelperCtx.drawImage(sprites[animationFrame], 0, 0);
	let helperInfo = suitHelperCtx.getImageData(0, 0,  suitHelperCanvas.width, suitHelperCanvas.height);
	
	let pixelCol = Math.floor(mouseX * (suitHelperCanvas.width / suitCanvas.width));
	let pixelRow = Math.floor((mouseY - poseOffsets[poseIndex]) * (suitHelperCanvas.width / suitCanvas.width));
	let index = 4 * ((pixelRow * suitHelperCanvas.width) + pixelCol);
	if (helperInfo.data[index + 3] != 0) { // Ignore transparent pixels
		for(let i = 0; i < targetColors.length; i++) {
			let pixelRGB = [helperInfo.data[index], helperInfo.data[index + 1], helperInfo.data[index + 2]];
			let targetRGB = targetColors[i];
			if (pixelRGB[0] == targetRGB[0] && pixelRGB[1] == targetRGB[1] && pixelRGB[2] == targetRGB[2]) { // Pixel color matches target color
				setPaletteIndex(i);
				break;
			}
		}
	}
});

// Change to previous suit on click
document.getElementById("prevSuitButton").addEventListener("click", function() {
	if (confirm("Change suit?\nWarning: This will clear your current palette.")) {
		setSuit((suitIndex + suitNames.length - 1) % suitNames.length);
	}
});

// Change to next suit on click
document.getElementById("nextSuitButton").addEventListener("click", function() {
	if (confirm("Change suit?\nWarning: This will clear your current palette.")) {
		setSuit((suitIndex + 1) % suitNames.length);
	}
});

// Change to previous pose on click
document.getElementById("prevPoseButton").addEventListener("click", function() {
	setPose((poseIndex + poseNames.length - 1) % poseNames.length);
});

// Change to next pose on click
document.getElementById("nextPoseButton").addEventListener("click", function() {
	setPose((poseIndex + 1) % poseNames.length);
});


/*
	Event Handling: Palette
*/

// Clicking on the palette to change palette index
paletteCanvas.addEventListener("click", function(evt) {
	let rect = paletteCanvas.getBoundingClientRect();
	let mouseY = evt.clientY - rect.top;
	let pixelRow = Math.floor(mouseY * (paletteHelperCanvas.height / paletteCanvas.height));
	setPaletteIndex(pixelRow);
});

// Keyboard input to change palette index
document.addEventListener("keydown", function(evt) {
	if (evt.keyCode == 38) { // up arrow
		setPaletteIndex(Math.max(paletteIndex - 1, 0));
	} else if (evt.keyCode == 40) { // down arrow
		setPaletteIndex(Math.min(paletteIndex + 1, targetColors.length - 1));
	} else if (evt.keyCode == 36 || evt.keyCode == 33) { // home or page up
		setPaletteIndex(0);
	} else if (evt.keyCode == 35 || evt.keyCode == 34) { // end or page dn
		setPaletteIndex(targetColors.length - 1);
	} else {
		return;
	}
	evt.preventDefault(); // avoid scrolling window
});

// Mouse scroll to change palette index
paletteCanvas.addEventListener("wheel", function(evt) {
	if (evt.deltaY < 0) { // scrolling up
		setPaletteIndex(Math.max(paletteIndex - 1, 0));
	} else { // scrolling down
		setPaletteIndex(Math.min(paletteIndex + 1, targetColors.length - 1));
	}
	evt.preventDefault(); // avoid scrolling the window
});


/*
	Event Handling: Right Panel
*/

// Open color picker on div click
document.getElementById("replaceDiv").addEventListener("click", function() {
	let colorPicker = document.getElementById("colorPicker");
	colorPicker.value = "#" + replaceColors[paletteIndex].map(x => {
		const hex = x.toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	}).join(""); // (Ugly rgb to hex conversion) Sets color picker's starting value to current replace color
	
	colorPicker.click(); // Opens color picker
});

 // Update replace color to match color picker on color change
colorPicker.addEventListener("input", function() {
	let colorInt = parseInt(this.value.substring(1), 16);
	let rgb = [(colorInt & 0xff0000) >> 16, (colorInt & 0x00ff00) >> 8, (colorInt & 0x0000ff)]; // Ugly hex to rgb conversion
	setReplaceColor(rgb);
	drawSuit();
});

// Reset replace color on button click
document.getElementById("resetColorButton").addEventListener("click", function() {
	let rgb = targetColors[paletteIndex];
	setReplaceColor(rgb);
	drawSuit();
});

// Decrease animation speed on button click
document.getElementById("decreaseSpeedButton").addEventListener("click", function() {
	setAnimationSpeed(animationSpeed - .25);
	clearInterval(suitCanvasLoop);
	drawSuit();
	if (animationSpeed > 0) {
		suitCanvasLoop = setInterval(drawNextSuitFrame, 300 / animationSpeed);
	};
});

// Increase animation speed on button click
document.getElementById("increaseSpeedButton").addEventListener("click", function() {
	setAnimationSpeed(animationSpeed + .25);
	clearInterval(suitCanvasLoop);
	drawSuit();
	if (animationSpeed > 0) {
		suitCanvasLoop = setInterval(drawNextSuitFrame, 300 / animationSpeed);
	};
});

// Reset all colors on button click
document.getElementById("resetAllColorsButton").addEventListener("click", function() {
	if (confirm("Reset all colors?\nWarning: This will clear your current palette.")) {
		replaceColors = targetColors.map(rgb => rgb.slice()); // Clone targetColors
		setPaletteIndex(0);
		drawSuit();
	}
});


/*
	Import and Export Palette Buttons Setup
*/

let uploadedImg = new Image(); // Used for handling imported palettes
uploadedImg.crossOrigin = "anonymous";

// Open file dialog to upload a palette image on button click
document.getElementById("importPaletteButton").addEventListener("click", function() {
	if(confirm("Upload a palette?\nWarning: This will overwrite your current palette.")) {
		let input = document.createElement('input');
		let reader = new FileReader();
		input.type = "file";
		input.accept = "image/png, image/gif, image/jpeg";
		document.body.appendChild(input);
		input.addEventListener("change", function() {
			reader.addEventListener("load", function() {
				uploadedImg.src = reader.result; // Give data URL to uploadedImg
			});
			reader.readAsDataURL(input.files[0]); // Converts chosen file to data URL
		});
		input.click(); // Opens file dialog
		document.body.removeChild(input);
	}
});

// Update replaceColors based on color data from uploaded palette image. (uploadedImg's src is assigned in import palette button's EventListener function)
uploadedImg.addEventListener("load", function() {
	replaceColors = [];
	paletteHelperCtx.clearRect(0, 0, paletteHelperCanvas.width, paletteHelperCanvas.height);
	paletteHelperCtx.drawImage(uploadedImg, 0, 0);
	helperInfo = paletteHelperCtx.getImageData(1, 0, 1, paletteHelperCanvas.height);
	let stop = 4 * paletteHelperCanvas.height;
	for(let i = 0; i < stop; i += 4) {
		let rgb = [helperInfo.data[i], helperInfo.data[i + 1], helperInfo.data[i + 2]];
		replaceColors.push(rgb);
	}
	setPaletteIndex(0);
	drawSuit();
});

// Download current palette on button click
document.getElementById("exportPaletteButton").addEventListener("click", function() {
	let a = document.createElement('a');
	a.href = paletteHelperCanvas.toDataURL();
	a.download = suitNames[suitIndex] + ".png";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
});
