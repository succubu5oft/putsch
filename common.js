//Funciones comunes de usar y tirar. Por Kulivszk v0.6b
//0.6 - Added function last()
//0.6b - Adaptado para Node.js


function swapLang(newLang) {
	//document.body.lang = newLang;
	commonLang = newLang;
}
function read(array) {
	var max = array.length-1;
	var min = rand(0,max);
	return array[min];
}
function debug(text) {
	if (commonDebug) console.log("[DEBUG] "+text);
}
function percent(min, max) {
	var calc = (min/max*100);
	calc = Math.round(calc*100)/100;

	return calc+'%';
}
function acd() {
	commonDebug = !commonDebug;
}
function maxNum(num) {
	if (num >= Number.MAX_SAFE_INTEGER) return true;
}
function numPoints(num) {
	var n = String(num);
	var decs = "";
	if (n.match(/\./) != null) {
		var decs = n.split('.');
		decs = decs[decs.length-1];
		decs = '.'+decs;
	}
	n = Math.floor(Number(n));
	n = String(n);
	if (n.length > 3) {
		var zeros = 0;
		while (n.length % 3 != 0) {
			n = '0'+n;
			zeros++;
		}
		n = n.split("");
		var l = "";
		for (i = 0; i < n.length; i++) {
			l+=n[i];
			if ((i+1) % 3 == 0 && (i+1) != n.length) l+=' ';
		}
		n = l.substring(zeros);
	}
	return n+decs;
}
function shortNum(num) {
	//if (maxNum(num)) return 'Over 9000';
	if (num > 1e120) return "OVER 9000";

	var shortLevels = [
	undefined, translate("millones|million"), translate("billones|billion"),
	translate("trillones|trillion"), translate("cuadrillones|quadrillion"),
	translate("quintillones|quintillion"), translate("sextillones|sextillion"),
	translate("septillion|septillion"), translate("octillion|octillion"),
	translate("nonillion|nonillion"), translate("decillion|decillion"),
	translate("duodecillion|duodecillion"), translate("tredecillion|tredecillion"),
	translate("quattuordecillion|quattuordecillion"), translate("quindecillion|quindecillion"),
	translate("sexdecillion|sexdecillion"), translate("septendecillion|septendecillion"),
	translate("octodecillion|octodecillion"), translate("novemdecillion|novemdecillion"),
	translate("vigintillion|vigintillion")
	];
	var n = num;
	var shortLevel = 0;
	while (num >= 1e6) {
		num /= 1e6;
		n /= 1e6;
		shortLevel++;
	}
	n = Math.floor(n*100)/100;
	var tail = shortLevels[shortLevel];
	if (tail == undefined) {
		tail = "";
	}
	else {
		tail = " "+tail;
	}
	return numPoints(n)+tail;
}

//Algoritmo de comprensión de datos
var layer = {
"one": {
	"index": [
	"000", "001", "010", "011", "100", "101", "110", "111"
	],
	"000": "q",
	"001": "Q",
	"010": "w",
	"011": "W",
	"100": "e",
	"101": "E",
	"110": "r",
	"111": "R",
},
"two": {
"index": [
"qq", "qQ", "qw", "qW", "qe", "qE", "qr", "qR", "Qq", "QQ", "Qw", "QW", "Qe", "QE", "Qr", "QR",
"wq", "wQ", "ww", "wW", "we", "wE", "wr", "wR", "Wq", "WQ", "Ww", "WW", "We", "WE", "Wr", "WR",
"eq", "eQ", "ew", "eW", "ee", "eE", "er", "eR", "Eq", "EQ", "Ew", "EW", "Ee", "EE", "Er", "ER",
"rq", "rQ", "rw", "rW", "re", "rE", "rr", "rR", "Rq", "RQ", "Rw", "RW", "Re", "RE", "Rr", "RR" 
],
"qq": "t", "qQ": "o", "qw": "d", "qW": "h", "qe": "l", "qE": "n", "qr": "0", "qR": "5",
"Qq": "T", "QQ": "O", "Qw": "D", "QW": "H", "Qe": "L", "QE": "m", "Qr": "1", "QR": "6",
"wq": "y", "wQ": "p", "ww": "e", "wW": "i", "we": "z", "wE": "X", "wr": "2", "wR": "7",
"Wq": "Y", "WQ": "P", "Ww": "E", "WW": "I", "We": "Z", "WE": "C", "Wr": "3", "WR": "8",
"eq": "u", "eQ": "a", "ew": "f", "eW": "j", "ee": "x", "eE": "V", "er": "4", "eR": "9",
"Eq": "U", "EQ": "A", "Ew": "F", "EW": "J", "Ee": "c", "EE": "B", "Er": "%", "ER": "í",
"rq": "i", "rQ": "s", "rw": "g", "rW": "k", "re": "v", "rE": "N", "rr": "ñ", "rR": "ú",
"Rq": "I", "RQ": "S", "Rw": "G", "RW": "K", "Re": "b", "RE": "M", "Rr": "á", "RR": "ó"
},
};
function binReverse(string, lay) {
	var check = layer[lay];
	for (z = 0; z < check['index'].length; z++) {
		var ct = check['index'][z];
		var ccc = check[ct];
		if (ccc == string) var l = ct;
	}
	return l;
}
function binDecode(string) {
	string = string.split("");
	//Second layer
	var lz = "";
	for (i = 0; i < string.length; i++) {
		var c = string[i];
		var rev = binReverse(c, 'two');
		lz+=rev;
	}
	//First layer
	var lcc = "";
	lz = lz.split("");
	for (i = 0; i < lz.length; i++) {
		var c = lz[i];
		var rev = binReverse(c, 'one');
		lcc+=rev;
	}
	return lcc;
}
function binCrypt(number) {
	while (!divisibleBy(number.length, 6)) number = "0"+number;

	//First layer
	number = number.match(/.{3}/g);
	var l = "";
	for (i = 0; i < number.length; i++) l+=layer['one'][number[i]];
	//End of first layer.

	//Second layer
	number = l;
	number = number.match(/.{2}/g);
	l = "";
	for (i = 0; i < number.length; i++) l+=layer['two'][number[i]];
	return l;
}

function crypt(string) {
	var ccc = "";
	var cccc = "";
	for (ni = 0; ni<string.length; ni++) {
		var c = nthPos(string, ni);
		var cc = c.charCodeAt();
		//cc = cc.toString(36);
		//
		var extra = "";
		cc = cc-32;

		var ccc = ccc+cc;
		var tos = Number(cc).toString(2);
		var cry = tos;
		cccc += cry;
	}
	cccc = binCrypt(cccc);
	
	return cccc;
}
function deCrypt(code) {
	var zz = code.split(".");


	console.log(zz);
	var b10 = parseInt(code, 36);
	console.log(b10);
}


function divisibleBy(number, test) {
	var div = (number % test) == 0;
	return div;
}
function softRandom(min, max) {
	var initMax = max;
	var max = Math.round(max/10);
	while (rand(0,1) == 1) max = max*2;
	if (max >= initMax) max = initMax;
	console.log('Soft maximum: '+max);
	return rand(min, max);
}
function simil(os, cs) {
	var osl = os.length;
	var csl = cs.length;
	var max = osl;
	if (csl > osl) max = csl;
	var min = csl;
	if (osl < csl) min = osl;
	/* Igualdad.
	La igualdad entre dos cadenas se calcula mediante el número de letras
	iguales en su misma posición comparado con la longitud de la cadena más larga */
	var eq = 0;
	for (i = 0; i < osl; i++) {
		if (nthPos(os, i) == nthPos(cs, i)) eq++;
	}
	var eq = eq / max;

	/* Longitud.
	La longitud es el número de letras que hay en cada cadena. */
	var lon = min/max;

	/* Similitud.
	La similitud calcula el número de letras iguales en ambas cadenas frente a la longitud total */
	var str = uniqueChars(os+cs);
	var ll = 0;
	for (i = 0; i < str.length; i++) {
		var c = nthPos(str, i);
		var c1 = count(os, c);
		var c2 = count(cs, c);
		ll += Math.abs(c1-c2);
	}
	var tl = osl+csl;
	var sim = tl-ll;
	sim = sim/tl;

	var jaro = eq+lon+sim;
	jaro = jaro/3;
	return jaro;

}
function nthPos(string, chara) {
	return string.substring(chara, chara+1);
}
function count(string, match) {
	return string.split(match).length-1;
}
function uniqueChars(string) {
	var l = "";
	for (i = 0; i < string.length; i++) {
		var thisC = nthPos(string, i);
		var C = count(l, thisC);
		if (C == 0) l = l + thisC;
	}
	return l;
}

function rand(minimum,maximum) {
	var randie = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
	if (randie < minimum) randie = minimum;
	if (randie > maximum) randie = maximum;
	return randie;
}
function eloCalc(matchesWon, matchesLost, eloWon, eloLost) {
	var matches = matchesWon+matchesLost;
	var wonQuo = eloWon+(matchesWon*400);
	var lostQuo = eloLost-(matchesLost*400);
	var formula = (wonQuo+lostQuo)/matches;
	return Math.round(formula);
}
var randomColorz = rand(0,360);
function randomColor(lum) {
	/*
	var max = parseInt('ffffff', 16);
	var num = rand(0,max).toString(16);
	*/
	randomColorz += 2;
	if (randomColorz >= 360) randomColorz = 0;
	num = randomColorz;

	var luminosity = 50;
	if (lum != undefined) luminosity = lum;
	luminosity += '%'

	return 'hsl('+num+', '+luminosity+', 50%)';
	return '#'+num;
}
function rainBow(text, lum) {
	text = text.split("");
	var l = "";
	for (i = 0; i < text.length; i++) {
		l+='<span style="text-shadow: 0 0 2px #000; color: '+randomColor(lum)+'">'+text[i]+'</span>';
	}
	return l;
}
function echo(loc, text) {
	//document.getElementById(loc).innerHTML = text;
}
function randChar() { return String.fromCharCode(red(rand(65,90),rand(97,122),rand(48,57))); }
function isChar(chara) {
	var num = chara.charCodeAt(0);
	if (num >= 48 && num <= 57) return true;
	if (num >= 97 && num <= 122) return true;
	if (num >= 65 && num <= 90) return true;
	return false;
}
function animCrypt(text, lastTry) {
	//48..57 (Numbers)
	//97..122 (Lowercase letters)
	//65..90 (Uppercase letters)
	if (lastTry == undefined) lastTry = "";

	var t1 = text.split("");
	var t2 = lastTry.split("");
	var l = "";
	for (i = 0; i < t1.length; i++) {
		if (t2[i] == undefined) t2[i] = randChar();

		if (isChar(t1[i]) == false) t2[i] = t1[i];
		if (t1[i] == t2[i] || rand(1,50) == true || t1[i] == 'b') t2[i] = t1[i]
		if (t2[i] != t1[i]) t2[i] = randChar();
		
		l+=t2[i];
	}
	return l;
}
function red(esto, eso, aquello) {
	if (!eso) eso = esto;
	if (!aquello) aquello = esto;
	var selection = rand(1,3);
	if (selection == 1) return esto;
	if (selection == 2) return eso;
	if (selection == 3) return aquello;
}
function isin(array, search) {
	for (i = 0; i < array.length; i++) {
		if (search == array[i]) return i;
	}
	return false;
}
function pos(id, noid) {
	//Returns top, left, bottom and right
	//if (!noid) var position = document.getElementById(id).getBoundingClientRect();
	//if (noid) var position = id.getBoundingClientRect();
	//return [ position.top, position.left, position.bottom, position.right];
}
function getFemaleName() {
	var first = [
	"Mary", "Linda", "Elizabeth", "Jennifer", "Susan",
	"Margaret", "Dorothy", "Lisa", "Nancy", "Karen",
	"Betty", "Helen", "Sandra", "Donna", "Carol", "Ruth",
	"Sharon", "Michelle", "Laura", "Sarah", "Kimberly",
	"Deborah", "Jessica", "Shirley", "Cynthia", "Angela", "Melissa"

	];
	var last = getMaleName().split(" ")[1];
	return read(first)+" "+last;
}
function getMaleName() {
var first = [
	"James", "John", "Robert", "Michael", "William",
	"David", "Richard", "Charles", "Joseph", "Thomas",
	"Christopher", "Daniel", "Paul", "Mark", "Donald",
	"George", "Kenneth", "Steven", "Edward", "Brian",
	"Ronald", "Anthony", "Kevin", "Jason", "Jeff"
];
var last = [
	"Smith", "Johnsons", "Williams", "Jones", "Brown",
	"Davis", "Miller", "Wilson", "Moore", "Taylor",
	"Anderson", "Thomas", "Jackson", "White", "Harris",
	"Martin", "Thompson", "Robinson", "Clark", "Lewis",
	"Lee", "Walker", "Hall", "Allen", "Young"
];
return read(first)+" "+read(last);
}
function doc(id) {
	//Returns object by id.
	//return document.getElementById(id);
}
function translate(string) {
	var string = string.split('|');
	if (commonLang == 'es') return string[0];
	if (commonLang == 'en') return string[1];
}
function softRound(number) {
	var number = Math.round(number);
	var len = String(number).length-2;
	var pow = Math.pow(10,len);
	var number = Math.round(number / pow) * pow;
	return number;
}
function duration(ms, ret) {
    var seconds = parseInt( (ms/1000) % 60);
    var minutes = parseInt( ( ms / (1000*60) ) % 60);
    var hours = parseInt( ( ms / (1000*3600) ) % 24);
    var days = parseInt( ( ms / (1000*86400) ) );

    var seconds = (seconds < 10) ? '0'+seconds : seconds;
    var minutes = (minutes < 10) ? '0'+minutes : minutes;
    var hours   = (hours < 10)   ? '0'+hours   : hours;

    if (ret == 'points') return days+':'+hours+':'+minutes+':'+seconds;
    return days+'d '+hours+'h '+minutes+'m '+seconds+'s';
}
function getID() {
	return rand(1,Number.MAX_SAFE_INTEGER).toString(36);
}
function screw(text) {
	var text = text.replace('&', '&amp');
	text = text.replace('<', '&lt');
	text = text.replace('>', '&gt');
	text = text.replace('"', '&quot');
	text = text.replace("'", "&#x27");
	text = text.replace('/', '&#x2F');

	var text2 = "";
	for (x in text) {
		if (!text[x]) continue;
		text2 += "%"+text[x].charCodeAt(0).toString(16);
	}
	return text2;
}
function drawBar(minValue,maxValue,returnValue) {
	var filledValue = Math.round(20*(minValue/maxValue));
	if (filledValue <= 0) {
	if (minValue > 0) {
	filledValue = 1;
	}
	}
	var pointArray = [];
	pointArray[0] = "";
	pointArray[1] = ".";
	var i = 2;
	var i2 = 1;
	while ( i <= 20 ) {
	pointArray[i] = pointArray[1]+pointArray[i2];
	i = i+1;
	i2 = i2+1;
	}
	var depletedValue = 20-filledValue;
	if (returnValue !== undefined) {
	return pointArray[filledValue];
	} else {
	return pointArray[depletedValue];
	}
}
function realDrawBar(min, max, alternate) {
	var filled = drawBar(min, max, true);
	var depleted = drawBar(min, max);

	if (alternate) {
		filled = Math.ceil((min/max)*200);
		depleted = Math.floor((1 - (min/max))*200);
		return '<span class="commonBlack">[</span><span class="commonFilled" style="display: inline-block; width: '+filled+'px">.</span><span class="commonDepleted" style="display: inline-block; width: '+depleted+'px">.</span><span class="commonBlack">]</span>';
	}
	return '<span class="commonBlack">[</span><span class="commonFilled">'+filled+'</span><span class="commonDepleted">'+depleted+'</span><span class="commonBlack">]</span>';
}
var notifObj = {
	'text': '',
	'moving': false,
	'opacity': 1,
}
function notify(textie, thees) {
	if (textie == 'hide') {
		notifObj.moving = true;
		return;
	}
	var maxW = thees.offsetWidth;
	var maxH = thees.offsetHeight;
	notifObj.text = textie;
	cursorX += 10;
	cursorY += 10;
	showNotif(cursorX, cursorY)
}
function showNotif(xx, yy) {
	notifObj.moving = false;
	notifObj.opacity = 0.9;
	doc('tooltipwr').style.left = xx+'px';
	doc('tooltipwr').style.top = yy+'px';
	doc('tooltipwr').style.opacity = 0.9;
}
function moveNotif() {
	if (!doc('tooltipwr')) return;
	if (notifObj.moving) {
		notifObj.opacity -= 0.1;
		if (notifObj.opacity <= 0) {
			notifObj.opacity = 0;
			notifObj.moving = false;
		}
	}
	doc('tooltipwr').style.opacity = notifObj.opacity;
	echo('tooltipwr', notifObj.text);
}
var commonMoveNotif = setInterval(moveNotif, 10);
function round(num) {
	return Math.round(num*100)/100;
}

function isInside(what, array) {
	for (var ii in array) {
		if (array[ii] == what) return 1;
	}
}

function notification(notext) {
	if ($('#notifHolder')) $('body').append('<div id="notifHolder" style="position: fixed; bottom: 0; right: 0"></div>');
	var nots = $('.notification').length;
	var $obj = '<div class="notification" style="float: bottom; background-color: #111; color: #eee; border-radius: 8px; padding: 8px; margin: 8px">'+notext+'</div>'
	$('#notifHolder').prepend($obj);
	$('.notification').effect('highlight', 100).effect('highlight', 100);

	$('.notification').delay(5000).fadeOut(1000, function() {
		$(this).remove();
	});
}

function swapArray(array, index_a, index_b) {
	var placeholder = array[index_a];
	array[index_a] = array[index_b];
	array[index_b] = placeholder
	return array;
}


function romanNumber(num) {
	var values = [
	1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1
	];
	var replaceWith = [
	'M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'
	];

	var result = '';

	while (num > 0) {
		for (var v in values) {
			if (num >= values[v]) {
				result += replaceWith[v];
				num -= values[v];
				break;
			}
		}
	}
	return result;
}
function last(array) {
	return array[array.length-1];
}
function rchance(float) {
	if (Math.random() < float) return 1;
	return 0;
}
function lchance(hits, attempts) {
	return (hits + 1) / (attempts + 2);
}