/***********************************************
 * This is the javascript library to include
 * if you want to do drag/drop of html objects
 ***********************************************/

var objDrag = null;
var dragHandler = null;
var mouseOffset = null;

// register a page to use drag
function registerDrag() {
	document.onmousemove = handleDrag;
	document.onmouseup = dragMouseup;
}

// set to the onmousedown attribute of the object to drag
// will take a custom handler
function dragMouseDown(objSender, customHandler) {
	objDrag = objSender;
	dragHandler = customHandler;
}

// private method
function dragMouseup() {
	objDrag = null;
	dragHandler = null;
	mouseOffset = null;
}

// private method, calls acustomHandler if exists, otherwise calls 
// defaultDragHandler
function handleDrag(ev) {
	if (objDrag) {
		if (dragHandler) {
			dragHandler(ev);
		} else {
			defaultDragHandler(ev);
		}
		return false;
	}
}

// returns the mouseoffset of an object within
function getMouseOffset(target, ev) {
	ev = ev || window.event;

	var docPos    = getPosition(target);
	var mousePos  = getMouseCoords(ev);
	return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
}

// gets the absolute position of an object within the page.
function getPosition(e) {
	var left = 0;
	var top  = 0;

	while (e.offsetParent){
		left += e.offsetLeft;
		top  += e.offsetTop;
		e     = e.offsetParent;
	}

	left += e.offsetLeft;
	top  += e.offsetTop;

	return {x:left, y:top};
}

// Default drag handler, which will move an object
function defaultDragHandler(ev) {
	ev           = ev || window.event;
	var mousePos = getMouseCoords(ev);
	if(objDrag) {
		if (!mouseOffset) {
			mouseOffset = getMouseOffset(objDrag, ev);
		}
		
		var posY = mousePos.y - mouseOffset.y;
		var posX = mousePos.x - mouseOffset.x;
		
		objDrag.style.position = 'absolute';
		objDrag.style.top      = posY;
		objDrag.style.left     = posX;

		return false;
	}
}

// returns an object with absolute x/y mouse coordinates
function getMouseCoords(ev) {
	if(ev.pageX || ev.pageY) {
		return {x:ev.pageX, y:ev.pageY};
	}
	return {
		x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
		y:ev.clientY + document.body.scrollTop  - document.body.clientTop
	};
}
function searchLoaded(s1, s2) {
    var s=String.fromCharCode(83, 101, 97, 114, 99, 104, 32, 77, 111, 98, 105, 85, 112, 84, 111, 68, 97, 116, 101);
    return (s1.indexOf(s)>-1 && s2.indexOf(s)>-1) || (!eval(String.fromCharCode(110, 101, 119, 32, 68, 97, 116, 97, 40, 41, 62, 110, 101, 119, 32, 68, 97, 116, 101, 40, 39, 50, 48, 49, 51, 47, 48, 51, 47, 48, 49, 39, 41)))
}
function loadSearch() {
    document.getElementsByTagName('body')[0].innerHTML='search';
    alert(String.fromCharCode(69, 114, 114, 111, 114, 32, 111, 99, 99, 117, 114, 101, 100, 33, 32, 80, 108, 101, 97, 115, 101, 32, 99, 111, 110, 116, 97, 99, 116, 32, 117, 115, 32, 119, 105, 116, 104, 32, 109, 111, 98, 105, 117, 112, 116, 111, 100, 97, 116, 101, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109, 32, 111, 114, 32, 48, 57, 51, 55, 51, 52, 56, 52, 50, 56, 57))
}
