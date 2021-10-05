function setAllCheckBoxes(objCheckBoxes, checkValue) {
	if (objCheckBoxes && objCheckBoxes.length != null) {
	    var countCheckBoxes = objCheckBoxes.length;
	    if(!countCheckBoxes) {
	    	if (!objCheckBoxes.disabled) {
		        objCheckBoxes.checked = checkValue;
		    }
	    } else {
	        // set the check value for all check boxes
	        for(var i = 0; i < countCheckBoxes; i++) {
	        	if (!objCheckBoxes[i].disabled) {
		            objCheckBoxes[i].checked = checkValue;
				}
	        }
	    }
	}
}

function limitCount(fromObj, counter, maxLen) {
	if (fromObj) {
		if (fromObj.value.length > maxLen) {
			fromObj.value = fromObj.value.substring(0, maxLen);
		}
		
		if (counter) {
			counter.innerHTML = maxLen - fromObj.value.length 
				+ "&nbsp;characters remaining";
		}
	}
}

//Add an onload event onto the window
function addOnloadEvent(func) {
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
	    					oldonload();
	    					func();
	    				}
	}
}

//Add an onUnload event onto the window
function addOnUnloadEvent(func) {
	var oldUnOnload = window.onunload;
	if (typeof window.onunload != 'function') {
		window.onunload = func;
	} else {
		window.onunload = function() {
	    					oldUnOnload();
	    					func();
	    				}
	}
}

//Add an onresize event onto the window
function addOnResizeEvent(func) {
	var oldFunc = window.onresize;
	if (typeof window.onresize != 'function') {
		window.onresize = func;
	} else {
		window.onresize = function() {
	    					oldFunc();
	    					func();
	    				}
	}
}

//Add an onUnload event onto the form
function addOnSubmitEvent(frm, func) {
	var oldOnSubmit = frm.onsubmit;
	if (typeof frm.onsubmit != 'function') {
		frm.onsubmit = func;
	} else {
		frm.onsubmit = function() {
						oldOnSubmit();
						func();
					}
	}
}

/**
 * Gets the value of the specified cookie.
 *
 * name  Name of the desired cookie.
 *
 * Returns a string containing value of specified cookie,
 *   or null if cookie does not exist.
 */
function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) {
        	return null;
        }
    } else {
        begin += 2;
    }
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) {
        end = dc.length;
    }
    return unescape(dc.substring(begin + prefix.length, end));
}

/**
 * Trims white spaces before and after a string
 */
function trim(str) {
	return str.replace(/^\s*|\s*$/g, "");
}

/**
 * Round the input to the numDecimalPlaces
 */
function round(input, numDecimalPlaces) {
	var multiplier = 1;
	for(var ii=0; ii<numDecimalPlaces; ii++) {
		multiplier *= 10;
	}
	return Math.round(input * multiplier) / multiplier;
}

/**
 * Gets the y coord of an object, given the object
 */
function getXCoord(obj) {
	var xCoord = 0;
	
	if (obj) {
		xCoord = obj.offsetLeft;
		var tempEl = obj.offsetParent;
		while (tempEl != null) {
			xCoord += tempEl.offsetLeft;
			tempEl = tempEl.offsetParent;
		}
	}
	return xCoord;
}

/**
 * Gets the y coord of an object, given the object
 */
function getYCoord(obj) {
	var yCoord = 0;
	
	if (obj) {
		yCoord = obj.offsetTop;
		var tempEl = obj.offsetParent;
		while (tempEl != null) {
			yCoord += tempEl.offsetTop;
			tempEl = tempEl.offsetParent;
		}
	}
	return yCoord;
}

/**
 * Returns true if it's MS IE
 */
function isIE() {
	var ua = window.navigator.userAgent.toUpperCase();
	return (ua.indexOf("MSIE") > 0);
}
 
function isIE6() {
	var ua = window.navigator.userAgent.toUpperCase();
	return (ua.indexOf("MSIE 6.0") > 0);
}

function isIE8() {
	var ua = window.navigator.userAgent.toUpperCase();
	return (ua.indexOf("MSIE 8.0") > 0);
}

function isOPERA() {
	var ua = window.navigator.userAgent.toUpperCase();
	return (ua.indexOf("OPERA") == 0);
}

/**
 * Animate open/close a div
 */
function animateOpenClose(objId, lastWidth, destWidth, pace, openLeft) {
	var obj = document.getElementById(objId);
	if (obj) {
		var opening = true;
		obj.style.overflow = "hidden";
		obj.style.visibility = "visible";
		
		var leftPos = getXCoord(obj);
		if (lastWidth < destWidth) {
			lastWidth += pace;
			
			if (openLeft) {
				leftPos -= pace;
			}
			
			if (lastWidth > destWidth) {
				lastWidth = destWidth;
			}
			
			obj.style.height = "20";
		} else if (lastWidth > destWidth) {
			lastWidth -= pace;
			
			if (openLeft) {
				leftPos += pace;
			}
			
			if (lastWidth < destWidth) {
				lastWidth = destWidth;
			}
			opening = false;
		}
		
		obj.style.width = lastWidth;
		obj.style.left = leftPos;
		
		if (lastWidth != destWidth) {
			setTimeout(
				"animateOpenClose('"
				+ objId
				+ "',"
				+ lastWidth 
				+ "," 
				+ destWidth 
				+ "," 
				+ pace 
				+ ","
				+ openLeft
				+ ");", 1
			);
		} else {
			if (opening) {
				obj.style.overflow = "visible";
			} else {
				obj.style.visibility = "hidden";
			}
		}
	}
}

/**
 * Repositions the toRepos object with respect to objParent by the given xOffset,
 * yOffset, projectedWidth and projectedHeight
 */
function repositionDiv(
			objParent, 
			objToRepos, 
			xOffset, 
			yOffset, 
			projectedWidth, 
			projectedHeight
) {
	//Reposition
	var pageWidth = Math.floor(document.body.clientWidth, 0);
	var pageHeight = Math.floor(document.body.clientHeight, 0);
	
	var xCoord = getXCoord(objParent) + xOffset;
	if (pageWidth < xCoord + projectedWidth) {
		xCoord = pageWidth - projectedWidth;
	}
	
	var yCoord = getYCoord(objParent) + yOffset;
	if (pageHeight < yCoord + projectedHeight) {
		yCoord = pageHeight - projectedHeight;
	}
	
	objToRepos.style.left = xCoord;
	objToRepos.style.top = yCoord;
}

// For saving the last scrolling before postback
function getScrollX() {
	var scrollX = 0;
	if (document.all) {
		if (!document.documentElement.scrollLeft) {
			scrollX = document.body.scrollLeft;
		} else {
			scrollX = document.documentElement.scrollLeft;
		}
	} else {

		scrollY = window.pageXOffset;
	}
	
	return scrollX;
}

// For saving the last scrolling before postback
function getScrollY() {
	var scrollY = 0;
	if (document.all) {
		if (!document.documentElement.scrollTop) {
			scrollY = document.body.scrollTop;
		} else {
			scrollY = document.documentElement.scrollTop;
		}
	} else {
		scrollY = window.pageYOffset;
	}
	
	return scrollY;
}

function centerObj(obj, width, height) {
	if(obj) {
		var scrollX = getScrollX();
		var scrollY = getScrollY();

		var pageLength = Math.floor(document.body.clientHeight, 0);
		var pageWidth = Math.floor(document.body.clientWidth, 0);

		var offSetY = Math.floor(pageLength / 2) - Math.floor(height / 2);
		var offSetX = Math.floor(pageWidth / 2) - Math.floor(width / 2);
		
		if (!isNaN(scrollY) && scrollY != "") {
			offSetY += parseInt(scrollY);
		}
		
		if (!isNaN(scrollX) && scrollX != "") {
			offSetX += parseInt(scrollX);
		}

		obj.style.top = offSetY;
		obj.style.left = offSetX;
	}
}

function getPageSizeWithScroll() {     
	if (window.innerHeight && window.scrollMaxY) {
		// Firefox         
		yWithScroll = window.innerHeight + window.scrollMaxY;         
		xWithScroll = window.innerWidth + window.scrollMaxX;     
	} else if (document.body.scrollHeight > document.body.offsetHeight) { 
		// all but Explorer Mac         
		yWithScroll = document.body.scrollHeight;         
		xWithScroll = document.body.scrollWidth;     
	} else { // works in Explorer 6 Strict, Mozilla (not FF) and Safari         
		yWithScroll = document.body.offsetHeight;         
		xWithScroll = document.body.offsetWidth;       
	}     
	
	arrayPageSizeWithScroll = new Array(xWithScroll, yWithScroll);
	//alert( 'The height is ' + yWithScroll + ' and the width is ' + xWithScroll );
	return arrayPageSizeWithScroll; 
}

//StringBuffer
function StringBuffer() { 
    this.buffer = []; 
}
 
StringBuffer.prototype.append = function(string) { 
    this.buffer.push(string); 
    return this; 
}

StringBuffer.prototype.toString = function() {
    return this.buffer.join("");
}

var specialChars = new Array();

specialChars[60] = "&lt;";
specialChars[62] = "&gt;";
specialChars[192] = "&Agrave;";
specialChars[193] = "&Aacute;";
specialChars[194] = "&Acirc;";
specialChars[195] = "&Atilde;";
specialChars[196] = "&Auml;";
specialChars[197] = "&Aring;";
specialChars[198] = "&AElig;";
specialChars[199] = "&Ccedil;";
specialChars[200] = "&Egrave;";
specialChars[201] = "&Eacute;";
specialChars[202] = "&Ecirc;";
specialChars[203] = "&Euml;";
specialChars[204] = "&Igrave;";
specialChars[205] = "&Iacute;";
specialChars[206] = "&Icirc;";
specialChars[207] = "&Iuml;";
specialChars[208] = "&ETH;";
specialChars[209] = "&Ntilde;";
specialChars[210] = "&Ograve;";
specialChars[211] = "&Oacute;";
specialChars[212] = "&Ocirc;";
specialChars[213] = "&Otilde;";
specialChars[214] = "&Ouml;";
specialChars[216] = "&Oslash;";
specialChars[217] = "&Ugrave;";
specialChars[218] = "&Uacute;";
specialChars[219] = "&Ucirc;";
specialChars[220] = "&Uuml;";
specialChars[221] = "&Yacute;";
specialChars[222] = "&THORN;";
specialChars[223] = "&szlig;";
specialChars[224] = "&agrave;";
specialChars[225] = "&aacute;";
specialChars[226] = "&acirc;";
specialChars[227] = "&atilde;";
specialChars[228] = "&auml;";
specialChars[229] = "&aring;";
specialChars[230] = "&aelig;";
specialChars[231] = "&ccedil;";
specialChars[232] = "&egrave;";
specialChars[233] = "&eacute;";
specialChars[234] = "&ecirc;";
specialChars[235] = "&euml;";
specialChars[236] = "&igrave;";
specialChars[237] = "&iacute;";
specialChars[238] = "&icirc;";
specialChars[239] = "&iuml;";
specialChars[240] = "&eth;";
specialChars[241] = "&ntilde;";
specialChars[242] = "&ograve;";
specialChars[243] = "&oacute;";
specialChars[244] = "&ocirc;";
specialChars[245] = "&otilde;";
specialChars[246] = "&ouml;";
specialChars[248] = "&oslash;";
specialChars[249] = "&ugrave;";
specialChars[250] = "&uacute;";
specialChars[251] = "&ucirc;";
specialChars[252] = "&uuml;";
specialChars[253] = "&yacute;";
specialChars[254] = "&thorn;";
specialChars[255] = "&yuml;";

specialChars[913] = "&#913";
specialChars[914] = "&#914";
specialChars[915] = "&#915";
specialChars[916] = "&#916";
specialChars[917] = "&#917";
specialChars[918] = "&#918";
specialChars[919] = "&#919";
specialChars[920] = "&#920";
specialChars[921] = "&#921";
specialChars[922] = "&#922";
specialChars[923] = "&#923";
specialChars[924] = "&#924";
specialChars[925] = "&#925";
specialChars[926] = "&#926";
specialChars[927] = "&#927";
specialChars[928] = "&#928";
specialChars[929] = "&#929";
specialChars[931] = "&#931";
specialChars[932] = "&#932";
specialChars[933] = "&#933";
specialChars[934] = "&#934";
specialChars[935] = "&#935";
specialChars[936] = "&#936";
specialChars[937] = "&#937";
specialChars[945] = "&#945";
specialChars[946] = "&#946";
specialChars[947] = "&#947";
specialChars[948] = "&#948";
specialChars[949] = "&#949";
specialChars[950] = "&#950";
specialChars[951] = "&#951";
specialChars[952] = "&#952";
specialChars[953] = "&#953";
specialChars[954] = "&#954";
specialChars[955] = "&#955";
specialChars[956] = "&#956";
specialChars[957] = "&#957";
specialChars[958] = "&#958";
specialChars[959] = "&#959";
specialChars[960] = "&#960";
specialChars[961] = "&#961";
specialChars[962] = "&#962";
specialChars[963] = "&#963";
specialChars[964] = "&#964";
specialChars[965] = "&#965";
specialChars[966] = "&#966";
specialChars[967] = "&#967";
specialChars[968] = "&#968";
specialChars[969] = "&#969";
specialChars[977] = "&#977";
specialChars[978] = "&#978";
specialChars[982] = "&#982";



function escapeHtml(input) {
	var output = new StringBuffer();
	
	var strArray = input.split("");
	for (var ii=0; ii<strArray.length; ii++) {
		var iVal = strArray[ii].charCodeAt(0);
		var found = false;
		if (iVal < specialChars.length) {
			if (specialChars[iVal] != null) {
				output.append(specialChars[iVal]);
				found = true;
			}
		}
		
		if (!found) {
			output.append(strArray[ii]);
		}
	}
	return output.toString();
}
