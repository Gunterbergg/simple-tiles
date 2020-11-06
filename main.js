const canvas = document.querySelector("#drawer");
const keyboards = [];

const config = 
{
	loopInterval: 6,
	canvasSize: Math.min(window.innerHeight, window.innerWidth),
	keyFont: "12px Verdana",
	keyColor: "#ffffff",
	background: "#ffffff",
	keyTilePercentSize: 11,
}

document.addEventListener("DOMContentLoaded", main);

function Keyboard(canvas, vecPos, vecSize, tileLines) 
{
	if (canvas != null) {
		this.canvas = canvas.getContext("2d");
		this.enabled = true;
	} else {
		this.enabled = false;
	}
	this.vecPos = vecPos;
	this.vecSize = vecSize;
	this.tileLines = tileLines;
	document.addEventListener("keypress", (event) => this.onKeyPress(event));
	//document.addEventListener("keydown", (event) => this.onKeyDown(event));
	document.addEventListener("keyup", (event) => this.onKeyUp(event));
}

Keyboard.prototype.tick = function()
{
	this.draw();
};

Keyboard.prototype.draw = function()
{
 	const canvas = this.canvas;
 	canvas.fillStyle = config.background;
 	canvas.fillRect(this.vecPos.x, this.vecPos.y, this.vecSize.x, this.vecSize.y);
 	//canvas.clearRect(this.vecPos.x, this.vecPos.y, this.vecSize.x, this.vecSize.y);
	
	const tileLineWidth = this.vecSize.x / this.tileLines.length;
	const keyTileHeight = (config.canvasSize / 100) * config.keyTilePercentSize;
	const keyTileYPos = (this.vecPos.y + this.vecSize.y) - keyTileHeight;
	const keyBaseline = "middle";

	for(let i = 0, length1 = this.tileLines.length; i < length1; i++){
		const tileLine = this.tileLines[i];
		const keyTileXPos = i * tileLineWidth;

		//Draw keyTiles
		canvas.fillStyle = tileLine.color;
		canvas.fillRect(keyTileXPos, keyTileYPos, tileLineWidth, keyTileHeight);

		//Draw keys
		const key = tileLine.key.toUpperCase();
		const keySize = canvas.measureText(key);
		canvas.fillStyle = config.keyColor;
		canvas.font = config.keyFont;
		canvas.textBaseline = keyBaseline;
		canvas.fillText(key,
			(keyTileXPos + (tileLineWidth / 2)) - (keySize.width / 2),
			(keyTileYPos + (keyTileHeight / 2)));

		//Draw pressed tileLine
		if (tileLine.isPressed) {
			const pressedGradient = canvas.createLinearGradient(keyTileXPos + tileLineWidth / 2, this.vecPos.y + this.vecSize.y / 2, keyTileXPos + tileLineWidth / 2, this.vecSize.y - keyTileHeight);
			pressedGradient.addColorStop(0, config.background + "00");
			pressedGradient.addColorStop(1, tileLine.color + "b0");
			canvas.fillStyle = pressedGradient;
			canvas.fillRect(keyTileXPos, this.vecPos.y, tileLineWidth, this.vecSize.y - keyTileHeight);
		}
	}
};

Keyboard.prototype.onKeyPress = function(event)
{
	for (const tileLine of this.tileLines) {
		if (event.key != tileLine.key) continue;
		tileLine.isPressed = true;
	}
};

Keyboard.prototype.onKeyUp = function(event)
{
	for (const tileLine of this.tileLines) {
		if (event.key != tileLine.key) continue;
		tileLine.isPressed = false;
	}
};

function main ()
{
	canvas.width = config.canvasSize;
	canvas.height = config.canvasSize;
	keyboards.push(
		new Keyboard(canvas, {x:0, y:0}, {x:canvas.width, y:canvas.height},
			[ 
				{ color:"#f03434", key:"a", isPressed:true },
				{ color:"#22a7f0", key:"s", },
				{ color:"#2ecc71", key:"d", },
				{ color:"#f5e653", key:"j", },
				{ color:"#674172", key:"k", },
				{ color:"#f9690e", key:"l", },
			] ));

	setInterval(loop, config.loopInterval);
}

function loop()
{
	for (const keyboard of keyboards)
		keyboard.tick();
}