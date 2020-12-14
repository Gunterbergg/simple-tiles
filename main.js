const canvas = document.querySelector("#drawer");
let keyboard;

const config = 
{
	loopInterval: 10,
	canvasSize: Math.min(window.innerHeight, window.innerWidth),
	keyFont: "12px Verdana",
	keyColor: "#ffffff",
	background: "#ffffff",
	keyTilePercentSize: 11
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
	this.tickStep = 1;
	this.tickCount = 0;
	this.playingMusic = null;
	document.addEventListener("keypress", (event) => this.onKeyPress(event));
	//document.addEventListener("keydown", (event) => this.onKeyDown(event));
	document.addEventListener("keyup", (event) => this.onKeyUp(event));
}

Keyboard.prototype.tick = function()
{
	this.draw();
	this.songTick();
	this.tickCount += this.tickStep;
};

Keyboard.prototype.draw = function()
{
 	const canvas = this.canvas;

 	//Clear canvas
 	canvas.fillStyle = config.background;
 	canvas.fillRect(this.vecPos.x, this.vecPos.y, this.vecSize.x, this.vecSize.y);
 	//canvas.clearRect(this.vecPos.x, this.vecPos.y, this.vecSize.x, this.vecSize.y);
	
	const tileLineWidth = this.vecSize.x / this.tileLines.length;
	const keyTileHeight = (config.canvasSize / 100) * config.keyTilePercentSize;
	const keyTileYPos = (this.vecPos.y + this.vecSize.y) - keyTileHeight;
	const keyBaseline = "middle";

	for(let i = 0, linesLength = this.tileLines.length; i < linesLength; i++){
		const tileLine = this.tileLines[i];
		const keyTileXPos = i * tileLineWidth;

		//Draw tiles
		canvas.fillStyle = tileLine.color;
		for (let tile of tileLine.tiles) {
			const tileLength = tile.l * this.tickStep;
			canvas.fillRect(keyTileXPos, this.tickCount - tile.t - tileLength, tileLineWidth, tileLength);
		}

		//Draw keyTiles
		canvas.fillStyle = tileLine.color;
		canvas.fillRect(keyTileXPos, keyTileYPos, tileLineWidth, keyTileHeight);

		//Draw keys
		canvas.fillStyle = config.keyColor;
		canvas.font = config.keyFont;
		canvas.textBaseline = keyBaseline;
		const key = tileLine.key.toUpperCase();
		const keySize = canvas.measureText(key);
		canvas.fillText(key,
			(keyTileXPos + (tileLineWidth / 2)) - (keySize.width / 2),
			(keyTileYPos + (keyTileHeight / 2)));

		//Draw pressed keyTiles
		if (tileLine.isPressed) {
			const pressedGradient = canvas.createLinearGradient(keyTileXPos + tileLineWidth / 2, this.vecPos.y + this.vecSize.y / 2, keyTileXPos + tileLineWidth / 2, this.vecSize.y - keyTileHeight);
			pressedGradient.addColorStop(0, config.background + "00");
			pressedGradient.addColorStop(1, tileLine.color + "c0");
			canvas.fillStyle = pressedGradient;
			canvas.fillRect(keyTileXPos, this.vecPos.y, tileLineWidth, this.vecSize.y - keyTileHeight);
		}

		//Draw missed and hit amount
		canvas.font = "#eb4034";
		//canvas.fillText()
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


Keyboard.prototype.songTick = function(music)
{
	for(let lineIndex = 0, linesLength = this.playingMusic.notes.length; lineIndex < linesLength; lineIndex++){
		const tileLine = this.tileLines[lineIndex].tiles;
		for(let tileIndex = 0, tilesLength = this.playingMusic.notes[lineIndex].length; tileIndex < tilesLength; tileIndex++){
			const tile = this.playingMusic.notes[lineIndex][tileIndex];
			const tilePos = this.tickCount - tile.t;
			if (!tileLine.includes(tile)) {
				if (tilePos < 0 || tilePos > this.vecSize.y) continue;
				tileLine.push(tile);
			}
			if (tilePos > this.vecSize.y) {
				switchRemove(tileLine, tileIndex);
				continue;
			}
		}
	}
};

Keyboard.prototype.startSong = function(music)
{
	this.playingMusic = music;
};


function main ()
{
	canvas.width = config.canvasSize;
	canvas.height = config.canvasSize;
	keyboard = new Keyboard(canvas, {x:0, y:0}, {x:canvas.width, y:canvas.height},
			[ 
				{ color:"#f03434", key:"a", isPressed:true, tiles: [] },
				{ color:"#22a7f0", key:"s", isPressed:true, tiles: [] },
				{ color:"#2ecc71", key:"d", isPressed:true, tiles: [] },
				{ color:"#f5e653", key:"j", isPressed:true, tiles: [] },
				{ color:"#674172", key:"k", isPressed:true, tiles: [] },
				{ color:"#f9690e", key:"l", isPressed:true, tiles: [] },
			]);
	const music = 
	{
		notes: [
			[ { t: 100, l: 10} ],
			[ { t: 200, l: 10} ],
			[ { t: 300, l: 10} ],
			[ { t: 400, l: 10} ],
			[ { t: 500, l: 10} ],
			[ { t: 600, l: 10} ]
		]
	}

	keyboard.startSong(music);

	setInterval(loop, config.loopInterval);
}

function loop()
{
	keyboard.tick();
}

function switchRemove(arr, index) 
{
	this[index] = arr[arr.length - 1];
	arr.pop();
}