var appPort = 3000;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var com = require('./common.js');
var fs = require('fs');
var express = require('express');

http.listen(appPort, "0.0.0.0", function(){
  console.log('listening on *:'+appPort);
});

io.on('connection', function(socket){
  io.emit('user connected', 'Un usuario se ha conectado.');
  socket.emit('user connected', 'Te has conectado.');
  allUsers[socket.id] = 20;
  socket.emit('onlineUsers', getUserList());
});

io.on('connection', function(socket){
	socket.send(socket.id);
  socket.on('chat message', function(msg){
  	var user = socket.id;

  	if (currentUsers[socket.id]) user = '&lt'+currentUsers[socket.id]+'&gt';
  	if (!currentUsers[socket.id]) user = generateUniqueName(user);
    io.emit('chat message', user+' '+msg);
  });
  socket.on('pong', function() {
    allUsers[socket.id] += 1;
  });
  socket.on('getUserInfo', function(userID) {
    console.log('User id: '+userID);
    socket.emit('getUserInfo', getUserPlayerByID(userID));
  });

  socket.on('register', function(dat) {
  	var username = dat.username;
  	var pwd = dat.password;

    if (!username || !pwd) {
      socket.emit('chat message', 'Error. Los campos "usuario" o "contraseña" no pueden estar vacíos.');
      return;
    }
    var userLoggedIn = false;
    for (var ue in currentUsers) {
        if (username == currentUsers[ue]) userLoggedIn = true;
        console.log('User '+username+' is logged in!');
    }
      if (userLoggedIn) {
      socket.emit('chat message', 'El usuario ya está conectado. Espera a que se desconecte.');
      return;
    }

  	var userExists = data.users[username];
  	if (userExists) {
  		if (pwd == userExists.password) {
  			socket.emit('chat message', 'Has iniciado sesión.');
  			socket.emit('loginSucess', socket.id);
  			currentUsers[socket.id] = username;
        socket.emit('onlineUsers', getUserList());
        socket.emit('loggedIn');
  		}
  		else {
  			socket.emit('chat message', 'Contraseña incorrecta.');
  		}
  	}
  	else {
  		addUser(dat.username, dat.password);
  		socket.emit('chat message', 'Usuario registrado correctamente. Ahora ya puedes iniciar sesión.');
  		console.log('User registered.');
  	}
  });
});

app.use(express.static(__dirname + '/public'));

function getUserPlayerByID(userID) {
  var u = getUserByID(userID);
  if (!u.player) u.player = newPlayer();
  return {'player': u.player, 'name': getUserByID(userID, 1)};
}
function newPlayer() {
  var p = {};
  p.level = 1;
  p.exp = 0;
  p.hp = 10;
  p.hpx = 10;
  p.inventory = [new Item(read(items))];
  return p;
}
function read(arr) {
  var min = 0;
  var max = arr.length - 1;
  var r = Math.floor(Math.random()*max) + min;
  return arr[r];
}
function getUserByID(userID, name) {
  var ix = 0;
  var u = '';
  for (var gubi in allUsers) {
    if (ix == userID) u = gubi;
    ix++;
  }
  if (name) return currentUsers[u];
  if (!u) return 'Error. User does not exist.';
  var user = currentUsers[u];
  if (!user) return 'Error. User not logged in.';
  return data.users[user];
}
function getUserList() {
  var gul = [];
  for (var g in allUsers) gul.push(getUserName(g));
  return gul;
}
function getUserName(clientID) {
  var name = currentUsers[clientID];
  if (!name) name = generateUniqueName(clientID);
  return name;
}
function generateUniqueName(clientID) {
  var r = stringTo255(clientID.slice(0, 4));
  var g = stringTo255(clientID.slice(4, 8));
  var b = stringTo255(clientID.slice(8, 12));
  return '<i style="color: rgb('+r+', '+g+', '+b+')">'+clientID.slice(0, 8)+'</i>';
}
function stringTo255(string) {
  var s = string.replace(/-|_/g, '');
  s = parseInt(s, 36);
  return s % 256;
}
function loadGame() {
	var JSONdata = require('fs').readFileSync('variables.json', 'utf8');
	var dat = {};

	if (JSONdata) dat = JSON.parse(JSONdata);

	data = dat;

	if (!data) data = {};
	if (!data.users) data.users = {};
  for (var lg in data.users) {
    if (!data.users[lg].player || !data.users[lg].player.inventory) data.users[lg].player = newPlayer();
  }
}
function User(password) {
	this.password = password;
  this.player = newPlayer();
}
function Item(name) {
  this.name = name;
  this.description = '';
  var d = new Date();
  this.age = d.getTime();
  this.owner = '';
  this.lastOwner = '';
}
function addUser(username, password) {
	data.users[username] = new User(password);
	saveGame();
}
function update() {
  for (var e in allUsers) {
    var user = e;
    if (!allUsers[e]) allUsers[e] = 20;
    allUsers[e] -= 1;
    if (allUsers[e] <= 0) {
      var hasName = currentUsers[e];
      if (!hasName) hasName = generateUniqueName(e);
      io.emit('chat message', '<b>'+hasName+' se ha desconectado.</b>');
      delete allUsers[e];
      delete currentUsers[e];
      io.emit('onlineUsers', getUserList());
      return;
    }
  }
  io.emit('ping');
}

function saveGame() {
  fs.writeFile('variables.json', JSON.stringify(data));

  io.emit('onlineUsers', getUserList());
}

loadGame();

var currentUsers = {};
var allUsers = {};

var items = [
'Palo', 'Casco', 'Botas', 'Espada'
];

setInterval(saveGame, 10000);
setInterval(update, 100);