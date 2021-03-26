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

	for(let tileLineIndex = 0, linesLength = this.tileLines.length; tileLineIndex < linesLength; tileLineIndex++){
		const tileLine = this.tileLines[tileLineIndex];
		const keyTileXPos = tileLineIndex * this.keyTileSize;

		//Draw background
	 	canvas.fillStyle = tileLine.backgroundColor;
	 	canvas.fillRect(keyTileXPos, this.vecPos.y, this.keyTileSize, this.vecSize.y);

		//Draw pressed keyTiles
		if (tileLine.isPressed) {const pressedGradient =
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
		for (let tileIndex = tileLine.lastTileIndex; tileIndex < tileLine.firstTileIndex; tileIndex++) {
			const tile = this.playingMusic.tiles[tileLineIndex][tileIndex];
			canvas.fillRect(keyTileXPos, (this.tickCount - tile.t) - tile.l, this.keyTileSize, tile.l);
		}

		//Draw press gaps
		canvas.fillStyle = tileLine.pressGapColor;
		for (let tileIndex = tileLine.lastTileIndex; tileIndex < tileLine.firstTileIndex; tileIndex++) {
			const tile = this.playingMusic.tiles[tileLineIndex][tileIndex];
			canvas.fillRect(keyTileXPos, (this.tickCount - tile.t) - this.tilePressGap, this.keyTileSize, this.tilePressGap);			
		}

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
	for (let lineIndex = 0, tileLinesLength = this.tileLines.length; lineIndex < tileLinesLength; lineIndex++) {
		const keyboardTileLine = this.tileLines[lineIndex];
		const musicTiles = this.playingMusic.tiles[lineIndex];

		let nextTile = musicTiles[keyboardTileLine.firstTileIndex];
		while (keyboardTileLine.firstTileIndex < musicTiles.length) {
		 	let tilePosition = this.tickCount - nextTile.t;
		 	if (tilePosition > 0) {
		 		keyboardTileLine.firstTileIndex = Math.min(musicTiles.length, keyboardTileLine.firstTileIndex+1);
				nextTile = musicTiles[keyboardTileLine.firstTileIndex];
		 	} else break;
		}

		let lastTile = musicTiles[keyboardTileLine.lastTileIndex];
		while (keyboardTileLine.lastTileIndex < musicTiles.length) {
		 	let tilePosition = this.tickCount - lastTile.t - lastTile.l;
		 	if (tilePosition > this.vecSize.y) {
		 		keyboardTileLine.lastTileIndex++;
		 		lastTile = musicTiles[keyboardTileLine.lastTileIndex];
		 		debugger;
		 	} else break;
		}
	}
};

Keyboard.prototype.startSong = function(music)
{
	//Setup for musics with multiple 
	this.keyTileSize = Math.min(Math.max(window.innerWidth / music.tiles.length, 20), 40);
	this.vecSize.x = this.keyTileSize * music.tiles.length;
	this.vecSize.y = window.innerHeight;
	this.canvasElement.width = this.vecSize.x;
	this.canvasElement.height = this.vecSize.y;
	this.playingMusic = music;

	//Sort guaranteed needed for tile rendering system
	this.playingMusic.tiles.forEach((tileLine, index) => {
		if (index > this.tileLines.length) return;
		tileLine.sort((tile, otherTile) => tile.t - otherTile.t);
	});;
	this.tileLines.forEach((tileLine) => { tileLine.firstTileIndex = 0; tileLine.lastTileIndex = 0;});
	window.requestAnimationFrame(this.tick.bind(this));
};


function main ()
{
	keyboard = new Keyboard(canvas, {x:0, y:0}, {x:canvas.width, y:canvas.height},
			[
				{ color:"#f03434", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#f8adad", pressGapColor:"#f8adad", pressedGradient:["#f8adad00","#f8adadff"], key:"a", isPressed:false },
				{ color:"#22a7f0", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#a6dbf8", pressGapColor:"#a6dbf8", pressedGradient:["#a6dbf800","#a6dbf8ff"], key:"s", isPressed:false },
				{ color:"#2ecc71", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#aaebc6", pressGapColor:"#aaebc6", pressedGradient:["#aaebc600","#aaebc6ff"], key:"d", isPressed:false },
				{ color:"#f5e653", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#fbf5ba", pressGapColor:"#fbf5ba", pressedGradient:["#fbf5ba00","#fbf5baff"], key:"j", isPressed:false },
				{ color:"#674172", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#c6aace", pressGapColor:"#c6aace", pressedGradient:["#c6aace00","#c6aaceff"], key:"k", isPressed:false },
				{ color:"#f9690e", keyColor:"#fff", backgroundColor:"#fff", pressedColor:"#fcc39e", pressGapColor:"#fcc39e", pressedGradient:["#fcc39e00","#fcc39eff"], key:"l", isPressed:false }
			]);
	const music =
	{
		tiles: [
			[ { t: 200, l: 100}, { t: 121, l: 100} ],
			[ { t: 200, l: 100} ],
			[ { t: 300, l: 200} ],
			[ { t: 400, l: 300} ],
			[ { t: 500, l: 200} ],
			[ { t: 600, l: 100} ]
		]
	}

	keyboard.startSong(music);
	//Temporary random tiles generator
	/*setInterval(function(){
		const tiles = keyboard.playingMusic.tiles;
		const randomRange = 300;
		tiles[Math.floor(Math.random() * tiles.length)].push({t: keyboard.tickCount + Math.random() * randomRange, l: 6});
	}, 300);*/
}