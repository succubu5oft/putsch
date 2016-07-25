var socket = io();

var commonLang = 'es';
var uname = Math.floor(Math.random() * 100);

socket.emit('chat message', 'Estoy en linea');
socket.on('chat message', function(msg){
      chatMessages.innerHTML += '<div>'+msg+'</div>';
      chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on('loginSucess', function(token) {
	loginToken = token;
});
socket.on('onlineUsers', function(arr) {
	var og = '<b>Usuarios conectados</b><br>';
	for (var e in arr) og += '<span onclick="getUserInfo('+e+')">'+arr[e]+'</span><br>';
	onlineGuys.innerHTML = og;
});
socket.on('getUserInfo', function(data) {
	console.log(data);
	displayUserInfo(data);

});
socket.on('ping', function() {
	socket.emit('pong');
});
socket.on('loggedIn', function() {
	$('#loginStuff').slideUp(100);
});

function addToLog(msg) {
	chatMessages.innerHTML += '<div>'+msg+'</div>';
	chatMessages.scrollTop = chatMessages.scrollHeight;
}
function displayUserInfo(playerData) {
	if (!playerData) return;
	var p = playerData.player;
	dui = '';
	dui += playerData.name+' <meter min="0" max="'+p.hp+'" value="'+p.hpx+'"></meter><br>';
	dui += 'Nivel '+p.level+' ('+p.exp+' exp)<br>';
	dui += 'Objetos ('+p.inventory.length+')<br>';

	dui += displayInventory(p.inventory);

	playerInfo.innerHTML = dui;
}
function displayInventory(inv) {
	var currentDate = new Date();
	var c = currentDate.getTime();
	var di = '';
	for (var ee in inv) {
		var i = inv[ee];
		di += i.name+' <i>'+i.description+'</i> '+((c - i.age) / 1000)+'<br>';
	}
	return di;
}
function getUserInfo(id) {
	socket.emit('getUserInfo', id);
}
function increaseValue(num) {
	game.value += num;
	update('game_value');
}
function sendMessage() {
	var msg = chatMessage.value;
	chatMessage.value = '';
	socket.emit('chat message', msg);
}
function resetVariables() {
	if (!game.value) game.value = 0;
	if (!game.tiles) game.tiles = [];
}
function saveGame() {
	localStorage.setItem('game', JSON.stringify(game));
}
function loadGame() {
	var losto = localStorage.getItem('game');
	if (!losto) return;
	game = JSON.parse(losto);
}
function update(step) {
	if (step == 'game_value' || !step) game_value.innerHTML = shortNum(game.value);
}
function checkRegister() {
	var uname = registerCheck.value;
	var pwd = registerPwd.value;
	var obj = {
		'username': uname,
		'password': pwd,
	}
	socket.emit('register', obj);
}
function getStartingPosition(color) {
	var colors = getColors();
	var ix = colors.indexOf(color);
	var leftSpot = (ix % 4) * 12;
	var topSpot = Math.floor(ix / 3) * 8;

	return {'top': topSpot, 'left': leftSpot};
}
function getColors(max) {
	var colors = ['red', 'orange', 'yellow', 'green', 'lime', 'jade', 'aqua', 'sky', 'blue', 'indigo', 'violet', 'pink'];
	if (!max) return colors;
	if (max < 1) max = 1;
	if (max > colors.length) max = colors.length;
	var newColors = [];

	for (var x = 0; x < max; x++) {
		var col = read(colors);
		var ix = colors.indexOf(col);
		colors.splice(ix, 1);
		newColors.push(col);
	}
	return newColors;
}
function createBoard(width) {
	var height = Math.ceil(width / 2);
	var squares = (width * 2) + (height * 2);
	var initialSquares = 2;

	var players = getColors(4);

	var jump = Math.floor(squares / players.length);
	var startingPoints = [];
	for (var sp in players) {
		startingPoints[sp] = jump * sp;
	}

	var tiles = [];
	for (var s = 0; s < squares; s++) {
		var tile = createTile();
		for (var pl in players) if (s >= startingPoints[pl] && s <= startingPoints[pl] + initialSquares) tile.owner = players[pl];

		tiles.push(tile);

	}
	game.players = [];
	for (var pl in players) {
		game.players.push(newPlayer(players[pl], startingPoints[pl]));
	}
	//game.players[0].human = true;
	return tiles;
}
function newPlayer(color, startingPoint) {
	return {
		'color': color,
		'square': startingPoint,
	}
}
function getBoardHeight(board, width) {
	return (board.length - (width * 2)) / 2;
}
function drawBoard(board) {
	var squareSize = 50;
	var l = '';
	var width = game.width;
	var height = getBoardHeight(board, width);
	for (var b in board) {
		var t = board[b];
		var e = document.createElement('tile');
		e.className = 'boardTile';
		e.innerHTML = b;
		e.style.top = '0px';
		e.style.left = (b * squareSize)+'px';

		if (b > width) {
			e.style.left = (width * squareSize)+'px';
			e.style.top = ((b - width) * squareSize)+'px';
		}
		if (b > (width + height)) {
			var newWidth = ((width + height - (b)) * squareSize) + (width * squareSize);
			e.style.left = newWidth+'px';
			e.style.top = ((height) * squareSize)+'px';
		}
		if (b > ((width * 2) + height)) {
			e.style.left = '0px';
			var newHeight = Math.abs(b - ((height + width) * 2)) * squareSize;
			e.style.top = newHeight+'px';
		}
		if (t.owner != 'none') e.className = t.owner;

		e.id = 'tile_'+b;


		putschGame.appendChild(e);
	}
	for (var p in game.players) {
		var e = document.createElement('player');
		var pl = game.players[p];
		e.className = pl.color+'_2';
		var sp = getStartingPosition(pl.color);
		var pos = squarePosition(pl.square, width, height, 50);
		e.style.left = pos.left + sp.left+'px';
		e.style.top = pos.top + sp.top+'px';
		e.id = 'player_'+pl.color;
		e.innerHTML = getPlayerStrength(pl.color);

		putschGame.appendChild(e);
	}
	return l;
}
function ticker() {
	if (!game.ticker) game.ticker = 0;
	if (!game.tiles) return;
	if (game.ticker > game.tiles.length) game.ticker = 0;

	if (!tickerElement) {
		tickerElement = document.createElement('ticker');
		putschGame.appendChild(tickerElement);
	}
	var pos = squarePosition(game.ticker, game.width, getBoardHeight(game.tiles, game.width), 50);
	game.ticker++;

	tickerElement.style.top = pos.top+'px';
	tickerElement.style.left = pos.left+'px';
}
function squarePosition(square, width, height, size) {
	var left = 0;
	var top = 0;

	width = game.width;
	height = getBoardHeight(game.tiles, game.width);

	left = square * size;

	if (square > width) {
		left = (width * size);
		top = ((square - width) * size);
	}
	if (square > (width + height)) {
		var newWidth = ((width + height - square) * size) + (width * size);
		left = newWidth;
		top = ((height) * size);
	}
	if (square > ((width * 2) + height)) {
		left = 0;
		var newHeight = Math.abs(square - ((height + width) * 2)) * size;
		top = newHeight;
	}

	return {'left': left, 'top': top};
}
function startGame() {
	game.width = 18;
	game.tiles = createBoard(game.width);
	drawBoard(game.tiles);
	game.turn = -1;

	var turny = document.createElement('turn');
	turny.id = 'turny';
	putschGame.appendChild(turny);

	var action = document.createElement('end_turn');
	action.id = 'action';
	putschGame.appendChild(action);

	newTurn();
}
function rollDie() {
	return rand(1, 6);
}
function updatePlayer(player) {
	var element_id = 'player_'+player.color;
	var pos = squarePosition(player.square, 0, 0, 50);
	document.getElementById(element_id).style.top = pos.top+'px';
	document.getElementById(element_id).style.left = pos.left+'px';
	document.getElementById(element_id).innerHTML = getPlayerStrength(player.color);
}
function move() {
	var player = getActivePlayer();
	if (player.moved) return;
	var die = rollDie();
	player.square += die;
	if (player.square >= game.tiles.length) player.square -= game.tiles.length;
	player.moved = true;

	captureSquare();

	updatePlayer(player);
	updateAction();
}
function newTurn() {
	if (!game.totalTurn) game.totalTurn = 0;
	game.turn++;
	game.totalTurn++;
	if (game.turn >= game.players.length) {
		game.turn = 0;
	}
	getActivePlayer().moved = false;
	turny.innerHTML = game.players[game.turn].color+'\'s turn (T:'+game.totalTurn+')';

	updateAction();

	if (getPlayerStrength(getActivePlayer().color) == 0) {
		getActivePlayer().out = true;
	}
	if (getActivePlayer().out == true) newTurn();
	if (getActivePlayer().dead > 0) {
		addToLog('<b>'+getActivePlayer().color+' is dead ('+getActivePlayer().dead+').</b>');
		getActivePlayer().dead--;
		newTurn();
	}
}
function updateAction() {
	action.onclick = function() {};

	if (getActivePlayer().human) {
		action.onclick = function() { newTurn(); };
		action.innerHTML = 'End Turn';

		if (!getActivePlayer().moved) {
			action.onclick = function() { move(); };
			action.innerHTML = 'Move';
		}
	}
}
function getActivePlayer() {
	return game.players[game.turn];
}
function getActiveSquare() {
	return game.tiles[getActivePlayer().square];
}
function getPlayerStrength(color) {
	if (color == 'none') return 0;
	var s = 0;
	for (var t in game.tiles) {
		if (game.tiles[t].owner == color) s++;
	}
	return s;
}
function captureSquare() {
	var playerTurn = getActivePlayer();
	if (playerTurn.color != getActiveSquare().owner) {
		getActiveSquare.owner = playerTurn.color;
		var n = 'tile_'+playerTurn.square;

		var allyStrength = getPlayerStrength(playerTurn.color);
		var enemyStrength = getPlayerStrength(getActiveSquare().owner);

		var attack = rand(allyStrength, (allyStrength * 2));
		var defense = rand(enemyStrength, (enemyStrength * 2));

		var sucess = (attack > defense);

		//Sucess
		if (sucess) {
			document.getElementById(n).className = playerTurn.color;
			getActiveSquare().owner = playerTurn.color;
		}
		if (!sucess) {
			playerTurn.dead = 3;
		}
	}
}
function aiMove() {
	var turn = game.turn;
	var playerTurn = game.players[turn];
	if (playerTurn.human) return;
	if (playerTurn.dead) return;
	if (playerTurn.out) return;

	move();
	newTurn();
}
function createTile() {
	return {'owner': 'none', 'attack': 20, 'defense': 20};
}

var game = {};
var loginToken;
loadGame();
resetVariables();
startGame();
var tickerElement;
var t = setInterval(saveGame, 60000);
var tt = setInterval(ticker, 50);
var ttt = setInterval(aiMove, 20);