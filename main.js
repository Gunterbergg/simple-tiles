let keyboard;
const canvas = document.querySelector("#drawer");

document.addEventListener("DOMContentLoaded", main);

function Keyboard(canvas, vecPos, vecSize, tileLines)
{
	this.canvasElement = canvas;
	if (this.canvasElement != null) {
		this.canvas = this.canvasElement.getContext("2d");
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
	this.tilePressGap = 20;
	document.addEventListener("keypress", (event) => this.onKeyPress(event));
	//document.addEventListener("keydown", (event) => this.onKeyDown(event));
	document.addEventListener("keyup", (event) => this.onKeyUp(event));
}

Keyboard.prototype.tick = function()
{
	this.songTick();
	this.draw();
	this.tickCount += this.tickStep;
	window.requestAnimationFrame(this.tick.bind(this));
};

Keyboard.prototype.draw = function()
{
 	const canvas = this.canvas;
	const keyTileYPos = (this.vecPos.y + this.vecSize.y) - this.keyTileSize;
	const keyBaseline = "middle";

	for(let i = 0, linesLength = this.tileLines.length; i < linesLength; i++){
		const tileLine = this.tileLines[i];
		const keyTileXPos = i * this.keyTileSize;

		//Draw background
	 	canvas.fillStyle = tileLine.backgroundColor;
	 	canvas.fillRect(keyTileXPos, this.vecPos.y, this.keyTileSize, this.vecSize.y);
		//Draw pressed keyTiles
		if (tileLine.isPressed) {
			const pressedGradient = 
				canvas.createLinearGradient(
					keyTileXPos + this.keyTileSize / 2,
					this.vecPos.y,
					keyTileXPos + this.keyTileSize / 2,
					this.vecPos.y + this.vecSize.y - this.keyTileSize);
			tileLine.pressedGradient.forEach(
				(color, index) => { 
					let result = (index) * (1 / (tileLine.pressedGradient.length - 1));
					pressedGradient.addColorStop(result, color);
				});

			canvas.fillStyle = pressedGradient;
			canvas.fillRect(keyTileXPos, this.vecPos.y, this.keyTileSize, this.vecSize.y - this.keyTileSize);
		}

		//Draw tiles
		canvas.fillStyle = tileLine.color;
		for (let tile of tileLine.tiles)
			canvas.fillRect(keyTileXPos, this.tickCount - tile.t - tile.l, this.keyTileSize, tile.l);			

		//Draw press gaps
		canvas.fillStyle = tileLine.pressGapColor;
		for (let tile of tileLine.tiles)
			canvas.fillRect(keyTileXPos, this.tickCount - tile.t - this.tilePressGap, this.keyTileSize, this.tilePressGap);			
		
		//Draw keyTiles
		canvas.fillStyle = tileLine.isPressed ? tileLine.pressedColor : tileLine.color;
		canvas.fillRect(keyTileXPos, keyTileYPos, this.keyTileSize, this.keyTileSize);

		//Draw keys
		canvas.fillStyle = tileLine.keyColor;
		canvas.font = "12px Verdana";
		canvas.textBaseline = keyBaseline;
		const key = tileLine.key.toUpperCase();
		const keySize = canvas.measureText(key);
		canvas.fillText(key,
			(keyTileXPos + (this.keyTileSize / 2)) - (keySize.width / 2),
			(keyTileYPos + (this.keyTileSize / 2)));
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
	this.keyTileSize = Math.min(Math.max(window.innerWidth / music.notes.length, 20), 40);
	this.vecSize.x = this.keyTileSize * music.notes.length;
	this.vecSize.y = window.innerHeight;
	this.canvasElement.width = this.vecSize.x;
	this.canvasElement.height = this.vecSize.y;
	this.playingMusic = music;
	window.requestAnimationFrame(this.tick.bind(this));
};


function main ()
{
	keyboard = new Keyboard(canvas, {x:0, y:0}, {x:canvas.width, y:canvas.height},
			[
				{ color:"#f03434", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#f8adad", pressGapColor:"#f8adad", pressedGradient:["#f8adad00","#f8adadff"], key:"a", isPressed:false, tiles: [] },
				{ color:"#22a7f0", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#a6dbf8", pressGapColor:"#a6dbf8", pressedGradient:["#a6dbf800","#a6dbf8ff"], key:"s", isPressed:false, tiles: [] },
				{ color:"#2ecc71", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#aaebc6", pressGapColor:"#aaebc6", pressedGradient:["#aaebc600","#aaebc6ff"], key:"d", isPressed:false, tiles: [] },
				{ color:"#f5e653", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#fbf5ba", pressGapColor:"#fbf5ba", pressedGradient:["#fbf5ba00","#fbf5baff"], key:"j", isPressed:false, tiles: [] },
				{ color:"#674172", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#c6aace", pressGapColor:"#c6aace", pressedGradient:["#c6aace00","#c6aaceff"], key:"k", isPressed:false, tiles: [] },
				{ color:"#f9690e", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#fcc39e", pressGapColor:"#fcc39e", pressedGradient:["#fcc39e00","#fcc39eff"], key:"l", isPressed:false, tiles: [] }
			]);
	const music =
	{
		notes: [
			[ { t: 100, l: 100}, { t: 121, l: 100} ],
			[ { t: 200, l: 100} ],
			[ { t: 300, l: 200} ],
			[ { t: 400, l: 300} ],
			[ { t: 500, l: 200} ],
			[ { t: 600, l: 100} ]
		]
	}

	keyboard.startSong(music);
	//Temporary random notes generator
	/*setInterval(function(){
		const notes = keyboard.playingMusic.notes;
		const randomRange = 300;
		notes[Math.floor(Math.random() * notes.length)].push({t: keyboard.tickCount + Math.random() * randomRange, l: 6});
	}, 300);*/
}

function switchRemove(arr, index)
{
	this[index] = arr[arr.length - 1];
	arr.pop();
}