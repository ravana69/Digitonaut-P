
function fullScreen() {
	createCanvas(document.body.clientWidth ,document.body.clientHeight);
}

function randomColor() {
	return Math.floor(Math.random()*16777215).toString(16);
}

function circle(x,y,size) {
	ellipse(x,y,size,size);
}

function createArray(count,value) {
	var r = new Array();
	for(var i = 0; i<count; i++) r.push(value);
	return r;
}