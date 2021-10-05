//
// The UpToDate plugin within jQuery.  It supports various events within topics.
(function($) {

	//---------------------------------------------------------
	//---------- START PRIVATE OBJECTS AND FUNCTIONS ----------
	//---------------------------------------------------------
	/**
	 * Maps class names of links to secondary topic popup pages such as images, abstracts, etc. 
	 * to the name of the window that is opened.
	 */
	var topicPopupMap = {
		drug: "utd_drug", 
		calc: "utd_calculator", 
		graphic: "utd_image", 
		grade: "utd_image", 
		citation: "utd_abstract",
		contributor: "utd_contributor",
		licenseLink: "utd_license",
		medCalcDisclaimerLink: "utd_med_calc_disclaimer"
	};
	
	
	/**
	 * Binds the click event of all secondary topic popup pages to the topic popup open method,
	 * which will open the link in a popup window with the name specified in the topicPopupMap.  
	 */
	function bindTopicPopupClick() {
		$.each(topicPopupMap, function(key, value) {
			// We don't want drug see links in drug topics to open in a new window.
			if (!($$.topic.isDrug() && key === "drug")) {    
				$('a.' + key).bind('click', $$.topicPopup.open);				
			}
		});
	}
	
	// There are 2 possible positions for the footer:
	//	- At the end of the main content if the content is long enough to cause scrolling.  This
	//		is the most common situation for most topic pages.
	//	- Pinned to the bottom if the main content is not long enough.  This occurs on very short
	//		topics and calculators, and on many of the marketing pages.
	// There are 2 separate CSS classes that implement these positions.
	// 
	// This method determines if we will ever need to adjust the footer for this page.  It uses
	// the heuristic that if the height of the main content is < 1600 then we may need to adjust
	// the footer, but if the height is larger we will not need to adjust it since a monitor will
	// not be able to display all of the content without scrolling. (Note that 1600 is WQXGA).
	function isFooterAdjustmentNeeded() {
		var f = $('#footer');
		var c = $('#patTopicLeft, #topicContent, #topicContentCalculator, #searchResults, #searchFooter');
		return (f.anyMatches() && c.anyMatches());
	}
	
	//Determines if it's the Google Chrome browser, there is not built in jQuery function
	function isChrome(){
		var isChromeB = /chrome/.test(navigator.userAgent.toLowerCase());
		if(isChromeB){
			$.browser.safari = false; //this returns true for Chrome even though it isn't Chrome
		}
		return isChromeB;
	}
	
	//-------------------------------------------------------
	//---------- END PRIVATE OBJECTS AND FUNCTIONS ----------
	//-------------------------------------------------------

	/**
	 * The utd object.  All public objects and methods are defined within this utd object.
	 */
	$.utd = {
		/**
		 * The servlet context path.  This is needed to correctly form URLs in JavaScript code.
		 * It is defaulted to root here, and should be set to the HttpServletRequest context path
		 * for each request within a JSP.  It is used by makeUrl(). 
		 */
		contextPath: '',
		
		/**
		 * This is for versionDetails and devDetails
		 */
		pageType: '',

		/**
		 * A flag indicating whether we are in the print view or not.
		 */
		isPrintView: false,
		
		/*
		 * A flag indicating whether the current user is eligible to see surveys,
		 * based on his surveyProgramAccess
		 * 
		 */
		isShowSurvey : false,
		
		/**
		 * AAAAAAAAAAAAAAAAAAAAHHHHHHHHHHHHHHHHHHHH!!!!!!!!!!!!!!!!!!!!
		 */
		isIE6: function() {
			return ($.browser.msie && ($.browser.version === '6.0'));			
		},
		
		isIE7: function() {
			return ($.browser.msie && ($.browser.version === '7.0'));			
		},
		
		isIE8: function() {
			return ($.browser.msie && ($.browser.version === '8.0'));			
		},
		showPleaseWait: {
			pwUrl: null,
			
			show: function() {
		        var objWait = $("#_PLEASEWAIT");
		        var pageDimension = $$.showPleaseWait.getPageSizeWithScroll();
	            var objMask = $("#_PLEASEWAITMASK");
	            
		        if (objWait) {
		            $$.centerObj(objWait, 300, 100);
		            objWait.css("visibility","visible");		            
		            if (objMask) {
		                objMask.css("visibility","visible");
		                objMask.width(pageDimension[0]);
		                objMask.height(pageDimension[1]);
		            }
		            setTimeout($('#_PLEASEWAITPROGRESS').attr('src', '/images/progress.myextg'), 200); 
		        }
			},
		
			showUrl: function(){
				$$.showPleaseWait.show();
				if($$.showPleaseWait.pwUrl !== null){
					window.location.href = $$.showPleaseWait.pwUrl;
			    }
			},
			
			getPageSizeWithScroll: function() {     
		    	var yWithScroll = 0;
		    	var xWithScroll = 0;
		    	var body = $('body');
		    	if (window.innerHeight && window.scrollMaxY) {
		    		// Firefox         
		    		yWithScroll = window.innerHeight + window.scrollMaxY;         
		    		xWithScroll = window.innerWidth + window.scrollMaxX;     
		    	} else if (body.scrollHeight > body.offsetHeight) { 
		    		// all but Explorer Mac         
		    		yWithScroll = body.scrollHeight;         
		    		xWithScroll = body.scrollWidth;     
		    	} else { // works in Explorer 6 Strict, Mozilla (not FF) and Safari         
		    		yWithScroll = body.offsetHeight;         
		    		xWithScroll = body.offsetWidth;       
		    	}  
		    	
		    	//Try to get something
		    	if(isNaN(yWithScroll)){
		    		yWithScroll = window.outerHeight; 
		    	}
		    	if(isNaN(xWithScroll)){
		    		xWithScroll = window.outerWidth;     
		    	}
		    	
		    	arrayPageSizeWithScroll = [xWithScroll, yWithScroll];
		    	return arrayPageSizeWithScroll; 
			}
	    },
	    
	    centerObj: function(obj, width, height) {
	    	if(obj) {
	    		var body = $('body');
	    		var scrollX = body.scrollLeft();
	    		var scrollY = body.scrollTop();

	    		var pageLength = Math.floor(body.outerHeight(), 0);
	    		var pageWidth = Math.floor(body.outerWidth(), 0);

	    		var offSetY = Math.floor(pageLength / 2) - Math.floor(height / 2);
	    		var offSetX = Math.floor(pageWidth / 2) - Math.floor(width / 2);

	    		obj.css("top",offSetY);
	    		obj.css("left", offSetX);
	    	}
	    },

		/**
		 * Adds the context path as a prefix to the specified relative URL and returns the
		 * new URL.  This is equivalent to using the Struts html:link tag (with the page attribute)
		 * within a JSP.
		 */
		makeUrl: function(url, params) {
			var u = $$.contextPath + url;
			if (params) {
				u = u + '?' + $.param(params);			
			}
			return u;
		}, // End of makeUrl

		/**
		 * When we display a movie, IE displays the following message to the user if we put
		 * the HTML directly in the page:  "Click to run an ActiveX control on this webpage".
		 * If we insert the HTML via this JavaScript call we don't get the message.
		 * 
		 * MRC 2.24.2010: Could not replicate this in IE7 or IE8.  After some investigation
		 * it appears that this is no longer an issue as of April 2008, as part of Cumulative
		 * Update 947864.  Since we can't be sure that all users have applied this update, 
		 * we'll still use this for a while.
		 */
		writeMovie: function(src, height, width) {
			var html = '<object ';
			html += ' classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B"';
			html += ' codebase="http://www.apple.com/qtactivex/qtplugin.cab"';
			html += ' height="' + height + '"'; 
			html += ' width="' + width + '"';
			html += '>';
			html += '<param name="src" value="' + src + '">';
			html += '<param name="autoplay" value="true">';
			html += '<param name="controller" value="true">';
			html += '<param name="loop" value="true">';				
			html += '<embed src="' + src + '"';
			html += ' autoplay="true"';
			html += ' controller="true"';
			html += ' loop="true"';
			html += ' pluginspage="http://www.apple.com/quicktime/download/"';
			if (height > 0) {
				html += ' height="' + height + '"';
			}
			if (width > 0) {
				html += ' width="' + width + '"';
			}
			html += '></embed></object>';
			document.write(html);
		},

		/**
		 * Simply calls the window.print() built-in JavaScript function.  
		 */
		print: function() {
			window.print();
			return false;
		},
		
		/**
		 * Simply calls the window.history.back() built-in JavaScript function.  
		 */
		back: function() {
			window.history.back();
			return false;
		},
				
		/**
		 * Simply calls the window.history.back() built-in JavaScript function.  
		 */
		cancelOrder: function() {
			window.close();
			return false;
		},

		/**
		 * We want the layout of the footer to be just below the text in the natural flow of the 
		 * document, which will generally have the effect of pinning it to the bottom since most 
		 * topics are long enough that the user has to scroll.  But if the text of the topic is too 
		 * small, the natural flow of the document will put the footer somewhere in the middle of the
		 * page, just after the short text.  In these situations we want to force the footer to
		 * the bottom by absolutely positioning it there.  We'll do some math to figure out if we
		 * are in this situation, and add or remove a class attribute to make the footer fixed or not. 
		 */
		adjustFooter: function() {
			c = $('#resultList');					
			if(c.anyMatches()){						
				//If searchResultNums isn't there, we need to remove the page number border
				var objSearchResultNums = $('#searchResultNums');
				$('#srNums').toggleClass("clearBorder",!objSearchResultNums.anyMatches());						
			}
			
			var scrollParent = $('#footer').parent();
			
			// new search landing page
			if ($('#footer').parent().attr('id') == 'searchFooter'){
				if ($$.isIE6()){
					scrollParent = $('#footer').parent().parent();
				} else {
					scrollParent = $(window);
				}
			}
			// topic page
			if ($('#topicContent').anyMatches()){
				if ($$.isIE6()){
					scrollParent = $('#footer').parent();
				} else {
					scrollParent = $(window);
				}
			}
			
			// argh! ie6!!!
			// patient topic
			if ($('#patTopicLeft').anyMatches() && $$.isIE6()){
				scrollParent = $('#footer').parent().parent();
			}
			
			// IE in print pages
			if ($$.isPrintView && ($$.isIE6() || $$.isIE7() || $$.isIE8())){
				scrollParent = $('body');
			}
			
			if (scrollParent.scrollTop() > 0){
				$('#footer').css("position", "static");
				$('#footer').toggleClass('fixedFooter', false);
			} else {
				scrollParent.scrollTop(1);
				if (scrollParent.scrollTop() == 1){
					$('#footer').css("position", "static");
					$('#footer').toggleClass('fixedFooter', false);
				} else {	// absolute time!
					$('#footer').css("bottom", "0");
					$('#footer').css("position", "absolute");
					$('#footer').css("width", "98%");
				}
			}//$('#submitBtn').attr("value", $('#footer').css("position") + $(scrollParent).scrollTop());
		}, // End of adjustFooter
		
		/**
		 * The topic that is being requested, if this is a topic page.  Topic information, such as  
		 * the topic key, can be used to form URLs in JavaScript code.  It is defaulted to an empty 
		 * object here, and should be initialized for each topic request within a JSP.   
		 */
		topic: {
			topicType: "",
			topicClass: "",
			topicKey: "",
			isTopic: function() {
				return ($$.topic.topicType && $$.topic.topicClass && $$.topic.topicKey);
			},
			isPatient: function() {
				return $$.topic.isTopic() && ("PATIENT_INFO" === $$.topic.topicType || "PATIENT_REVIEW" === $$.topic.topicType);
			},
			isProf: function() {
				return $$.topic.isTopic() && !$$.topic.isPatient();
			},
			isDrug: function() {
				return $$.topic.isTopic() && ("DRUG" === $$.topic.topicClass);
			},
			
			logSectionViewEvent: function(event) {
				var a = $(this);
				var hashIndex = a.attr('href').indexOf('#');
				hashIndex = hashIndex >= 0 && hashIndex < a.attr('href').length ? a.attr('href').indexOf('#') : 0;
				var params = {
					eventType: "TopicSectionView",
					anchor: a.attr('href').substr(hashIndex+1), 
					source: a.data().source, 
					topicKey: $$.topic.topicKey};
				var url = $$.makeUrl('/services/EventLog', params);
				$.ajax(url, {cache: false});
				return true;
			},
			
			togglePrintSection: function(event) {
				var id = $('#' + $(this).val());
				if (id.anyMatches()) {
					if (id.is(':hidden')) {
						id.show();
					}else{
						id.hide();						
					}
				}
			}
		}, // End of topic
			
		/**
		 * The image or images that that are being requested, if this is an image page.  Image 
		 * information, such as the image key, can be used to form URLs in JavaScript code.  Note
		 * that the image key is a tilde separated list of keys if multiple images are requested.
		 * It is defaulted to an empty object here, and should be initialized for each image request 
		 * within a JSP.   
		 */
		image: {
			imageKey: "",
			imageTitle: "",
			isImage: function() {
				return ($$.image.imageKey && $$.image.imageTitle);
			}
		}, // End of image

		cme: {
			isTrack: false,
			lastTopicViewedDatabaseId: "",

			topicViewEnd: function(event) {
				if ($$.cme.isTrack) {
					var params = {cme_log_id: $$.cme.lastTopicViewedDatabaseId};
					var url = $$.makeUrl('/services/CmeTopicViewEnd', params);
					$.ajax(url, {cache: false});
				}
			},
			
			initSettings: function(isFirstTime){
				var submitSec = $('#submitSettings');
				if(submitSec.anyMatches() && !isFirstTime){
					submitSec.css("visibility", "hidden");
					$("[name=cmeTypeId]").attr("disabled","true");					
				}else{
					$$.cme.showSettings();
				}
				
			},
			
			showSettings: function(){
				var submitSec = $('#submitSettings');
				var editSec = $('#editSettings');
				if(submitSec.anyMatches()){
					submitSec.css("visibility", "visible");
				}
				if(editSec.anyMatches()){
					editSec.css("visibility", "hidden");
				}
				$("[name=cmeTypeId]").removeAttr("disabled");				
			}
		}, // End of cme

		credentials: {
			show: function(event) {
				var a = $(this);
				var data = $('#patTopicContributors').data();
				if (data) {
					$('#patTopicContributor').html(data[a.attr('id')])
						.css('left', (a.offset().left + 5) + 'px')
						.css('top', (a.offset().top + 15) + 'px')
						.show();		
				}
			},
			
			hide: function(event) {
				$('#patTopicContributor').hide();
			}
		}, // End of credentials

		topicPopup: {
			open: function(event) {
				var a = $(this);
				$.each(topicPopupMap, function(key, value) {
					if (a.hasClass(key)) {
						var url = a.attr('href');
						url = $$.addUtdPopup(url);
						if (a.data('window')){
							window.open(url, value, a.data('window')).focus();
						}else{
							window.open(url, value).focus();
						}
					}
				});
				return false;
			}
		}, // End of topicPopup 
		
		addUtdPopup: function(url){
			var ques = (url.indexOf("?")>-1)?"&":"?";
			url += ques + "utdPopup=true";
			return url;
		},

		// dest required, source optional
		emailPopup: {
			open: function(event) {
				var a = $(this);
				var params = {
					destination: a.data().dest, 
					referer: window.location.href
				};
				var s = a.data().source;
				if (s) {
					params.source = s;
				}
				var url = $$.makeUrl('/feedback/letter', params);
				url = $$.addUtdPopup(url);
				window.open(url, 'contact_us', 'toolbar=no,menubar=no,resizable=no,height=498,width=450').focus();
				return false;
			}
		}, // End of emailPopup

		etacPopup: {
			open: function(event) {
				var params = {};
				if ($$.topic.isTopic()) {
					params = {topicKey: $$.topic.topicKey};
				}else if ($$.image.isImage()){
					params = {imageKey: $$.image.imageKey, title: $$.image.imageTitle};
				}
				if (params) {
					var url = $$.makeUrl('/contents/email', params);
					url = $$.addUtdPopup(url);
					window.open(url, "none", "width=790, height=590").focus();
				}
				return false;
			},
			
			submit: function(event) {
				var b = $(this);
				b.attr("disabled", "disabled");
				b.val("Please wait");
				$("#etacForm").submit();
				return false;
			}
			
		}, // End of etacPopup

		helpImprove: {
			answer: function(event) {
				// Send an AJAX request to the feedback web service to record the event.
				var answer = ($(this).attr('id') === 'helpImproveAnswerYes') ? true : false;
				var params = {
					requestType: "helpful_answer", 
					answer: answer, 
					topicKey: $$.topic.topicKey};
				var url = $$.makeUrl('/services/Feedback', params);
				$.ajax(url, {cache: false});
				
				// Replace the question with a response to the user's answer.  If the user's answer was
				// no, then we'll show a link that displays an email popup, so bind the click event
				// of the link to open the email popup.  Also add data to the no response to be used by 
				// the email popup.
				var helpImprove = $('#helpImprove');
				if (answer) {
					helpImprove.html($('#helpImproveResponseYes').html());
				}
				else {
					helpImprove.html($('#helpImproveResponseNo').html());
					$('a', helpImprove).data('dest', 'editorial').data('source', 'topicHelpfulFalse').bind('click', $$.emailPopup.open);
				}
				
				// Make the response disappear after a delay.
				helpImprove.delay(7000).hide('slide', {direction: 'down'}, 1000, function() {
					if ($$.isIE6()) {
						$('#rightPanel').removeClass('withHelpImprove');
					}
					else {
						$('#footer').css('margin-bottom', '0');
					}
				});	
				return false;
			}
		}, // End of helpImprove

		versionDetails: {
			show: function(event) {
				var more = $(this);
				var details = $('#versionDetails');
				var detailsWidth = details.outerWidth(), detailsHeight = details.outerHeight();
				var parentPanel = null;				
				var left = 0;
				var top = ($$.isIE6() ? more.offset().top : more.offsetViewport().top) + more.outerHeight();
				if ($$.pageType === 'TOPIC_PATIENT') {
					left = more.offset().left;
					parentPanel = $('#bottomPanel');				
				}else {
					var body = $('body');
					parentPanel = $('#rightPanel');				
					
					// Assume we want the right side of the details box to be aligned with the right side
					// of the More link.  This works when the More link is near the right edge of the
					// right panel as it typically is.
					left = more.offset().left + more.width() - detailsWidth;

					// If that left position would cause the details box to partially cover the outline,
					// then make it left-aligned with the More link.  This happens when the width of
					// the window is smaller and the More link is on the next line, making it near the 
					// left edge of the right panel.
					if (left < parentPanel.offset().left) {
						left = more.offset().left;
					}
					
					// If the left position would cut off some of the details box, then adjust the details
					// box by shifting it left by the amount that is cut off, plus 10 to add a bit of
					// margin from the right edge.
					if (left + detailsWidth > body.width()) {
						left = left - (left + detailsWidth - body.width()) - 10;
					}
					
					// The top is set to be just below the More link.  But if that would cut the bottom
					// of the details box off, then make the top just above the more link.
					if (top + detailsHeight > body.height()) {
						top = ($$.isIE6() ? more.offset().top : more.offsetViewport().top) - detailsHeight;
					}
				}
				details.css('left', left + 'px')
					.css('top', top + 'px')
					.show();
			},

			hide: function(event) {
				$('#versionDetails').hide();
			}
			
		}, // End of versionDetails 			

		theBasics: 
		{
			show: function(event) 
			{
				var toolTip;
				
				if ( $(this).hasClass( "basics" ) )
				{
					toolTip =
						"The Basics are short (1-3 page) articles written in plain language." +
						" They answer the 4 or 5 most important questions a person might have about a medical problem." +
						" These articles are best for people who want a general overview.";
				}
				else if ( $(this).hasClass( "beyondthebasics" ) )
				{
					toolTip = 
						"Beyond the Basics articles are 5 to 10 pages long and more detailed than The Basics." +
						" These articles are best for readers who want a lot of detailed information and who are comfortable with some technical medical terms.";
				}
				
				var top = $(this).position().top + 45;
				
				$("#tooltipper").css('top',top + 'px')					
					.html(toolTip)
					.show();
			},

			hide: function(event) 
			{
				$('#tooltipper').hide();
			}			
		
		}, // End of theBasics 

		
		devExtraDetails: {
			show: function(event) {
				var devDetails = $(this);
				var details = $('#devExtraDetails');
				var detailsWidth = details.outerWidth(), detailsHeight = details.outerHeight();
				var parentPanel = null;				
				var left = 0;
				var top = ($$.isIE6() ? devDetails.offset().top : devDetails.offsetViewport().top) + devDetails.outerHeight();
				if ($$.pageType === 'TOPIC_PATIENT') {
					left = devDetails.offset().left;
					parentPanel = $('#bottomPanel');				
				}
				else {
					var body = $('body');
					parentPanel = $('#rightPanel, #bottomPanel');				
					
					// Assume we want the right side of the details box to be aligned with the right side
					// of the devDetails link.  This works when the devDetails link is near the right edge of the
					// right panel as it typically is.
					left = devDetails.offset().left + devDetails.width() - detailsWidth;

					// If that left position would cause the details box to partially cover the outline,
					// then make it left-aligned with the devDetails link.  This happens when the width of
					// the window is smaller and the devDetails link is on the next line, making it near the 
					// left edge of the right panel.
					if (left < parentPanel.offset().left) {
						left = devDetails.offset().left;
					}
					
					// If the left position would cut off some of the details box, then adjust the details
					// box by shifting it left by the amount that is cut off, plus 10 to add a bit of
					// margin from the right edge.
					if (left + detailsWidth > body.width()) {
						left = left - (left + detailsWidth - body.width()) - 10;
					}
					
					// The top is set to be just below the devDetails link.  But if that would cut the bottom
					// of the details box off, then make the top just above the devDetails link.
					if (top + detailsHeight > body.height()) {
						top = ($$.isIE6() ? devDetails.offset().top : devDetails.offsetViewport().top) - detailsHeight;
					}
				}
				details.css('left', left + 'px')
					.css('top', top + 'px')
					.show();
			},

			hide: function(event) {
				$('#devExtraDetails').hide();
			}
			
		}, // End of devExtraDetails 
		
		dragbar: {
			init: function() {
				var dragBar = $('#dragbar');
				if (dragBar.anyMatches()) {
					dragBar.draggable({axis: 'x', cursor: 'w-resize', drag: $$.dragbar.drag});
				}
			},

			drag: function(event, ui) {
				// If the outline is currently hidden, make it visible before dragging.
				if ($('#leftPanel').width() === $$.outline.closed.width) {
					$$.outline.show();
				}
				$$.outline.position(ui.offset.left);
			}
		}, // End of dragbar

		outline: {
			open: {width: 0, title: "Collapse Topic Outline", imgSrc: "orange_arrow_left.myextg"},
			closed: {width: 26, title: "Show Topic Outline", imgSrc: "orange_arrow.myextg"},

			init: function() {
				if ($('#toggleOutline').anyMatches()) {
					if ($$.outline.open.width === 0) {
						$$.outline.open.width = $('#leftPanel').width();
						var src = $('img', $('#toggleOutline')).attr('src');
						var i = src.indexOf('orange_arrow_left.myextg');
						if (i > 0) {
							var prefix = src.substr(0, i);
							$$.outline.open.imgSrc = prefix + $$.outline.open.imgSrc; 
							$$.outline.closed.imgSrc = prefix + $$.outline.closed.imgSrc; 
						}
					}
				}
			},
				
			hide: function() {
				var toggleOutline = $('#toggleOutline');
				$('#innerOutline').hide();
				$('a', toggleOutline).attr('title', $$.outline.closed.title);
				$('img', toggleOutline).attr('src', $$.outline.closed.imgSrc);
			},
			
			show: function() {
				var toggleOutline = $('#toggleOutline');
				$('#innerOutline').show();
				$('a', toggleOutline).attr('title', $$.outline.open.title);
				$('img', toggleOutline).attr('src', $$.outline.open.imgSrc);
			},

			position: function(width) {
				$('#leftPanel').width(width);
				$('#rightPanel').css('left', width + 'px');
				$('#dragbar').css('left', width + 'px');
				var helpImprove = $('#helpImprove');
				if (helpImprove.length) {
					helpImprove.css('left', width + $('#dragbar').width() + 'px');		
				}
			},

			/**
			 * Closes the outline if it is currently open and opens it if it is currently closed.
			 */
			toggle: function(event) {
				if ($('#leftPanel').width() === $$.outline.closed.width) {
					$$.outline.show();
					$$.outline.position($$.outline.open.width);
				}
				else {
					$$.outline.hide();
					$$.outline.position($$.outline.closed.width);
				}
				return false;
			}
		}, // End of outline
		
		/**
		 * The findInPage object which supports the find in page dialog.
		 */
		findInPage: {			
			matches: [],
			matchIndex: -1,
			initialTerm: '',
			term: '',

			init: function() {
				var findPage = $('#findInPage');
				if (findPage.anyMatches()) {
					findPage.dialog({ 
						autoOpen: false, 
						width: 250,
						minHeight: 100,
						resizable: false,
						dialogClass: 'findInPageDialog' 
					});	
				}
			},
			
			/**
			 * Event handler for clicking the find link, which opens the find in page dialog.
			 */
			open: function(event) {
				// Position the dialog just below the greybar if the page has a greybar.
				var greyBar = $('#greyBar');
				var top, left; 
				if (greyBar.anyMatches()) {
					top = greyBar.offsetViewport().top + greyBar.height();
					left = greyBar.width() - 250 - 20;  // 20 for the scrollbar
				}
				else {
					var t = $(this);
					top = t.offsetViewport().top + t.outerHeight() + 3;
					left = t.offsetViewport().left;
				}
				$('#findInPage').dialog('option', 'position', [left, top]);

				// Open the dialog, making sure to show the inputs and hide the results.  
				$('#findInPageInput').show();
				$('#findInPageProgress').hide();
				$('#findInPageResults').hide();
				$('#findInPage').dialog('open');
				$('#findInPageTerm').val($$.findInPage.initialTerm).select();
				return false;
			},

			/**
			 * Event handler for pressing the enter key within the search term box in the find in page 
			 * dialog.  Actually this processes all key events and calls the find event handler if 
			 * the enter key was pressed. 
			 */
			enter: function(event) {
				if (event.which === 13) {
					$$.findInPage.find(event);
				}
			},

			/**
			 * Event handler for clicking the find button within the find in page dialog, which
			 * performs the search by making an AJAX call.
			 */
			find: function(event) {
				// If the user entered a search term, then make the AJAX call to the web service
				// to search for the term and highlight it.
				$$.findInPage.term = $.trim($('#findInPageTerm').val());
				if ($$.findInPage.term) {
					var searchType = $('input:radio[name=findInPageSearchType]:checked').val();
					var params = {
						query: $$.findInPage.term,
						matchSynonym: (searchType === 'syn'),
						topicKey: $$.topic.topicKey};
					var url = $$.makeUrl('/services/FindInPage', params);
					$.ajax(url,
						{dataType: 'json', 
						success: $$.findInPage.results,
						error: function(){ $('#findInPage').dialog('close'); },
						cache: false
					});
					
					// Hide the inputs and show the progress indicator within the find in page dialog.
					$('#findInPageInput').hide();
					$('#findInPageProgressTerm').html("&quot;" + $$.findInPage.term + "&quot;");		
					$('#findInPageProgress').show();
				}
				return false;
			},
				
			/**
			 * Process the results of the find.  We'll replace text within the body of the topic and 
			 * the outline with text returned by the server, which will have the term highlighted.
			 */
			results: function(data) {
				$('#findInPageProgress').hide();
							
				if (data.STATUS === 0) {
					// Replace the HTML for each section that is present and for which we attempt
					// to match the specified term.
					var outline = $('#outline');
					var relatedGraphics = $('#relatedGraphics');
					var relatedCalculators = $('#relatedCalculators');
					var relatedTopics = $('#relatedTopics');
					var topicText = $('#topicText');
					if (outline) {
						outline.html(data.OUTLINE_HTML);
					}
					if (relatedGraphics) {
						relatedGraphics.html(data.GRAPHICS_HTML);
					}
					if (relatedCalculators) {
						relatedCalculators.html(data.CALCULATORS_HTML);
					}
					if (relatedTopics) {
						relatedTopics.html(data.TOPICS_HTML);
					}
					if (topicText) {
						topicText.html(data.TEXT_HTML);
					}

					// Populate the matches array with the ids of the matches in the order in
					// which we will visit them when the user presses the next button in the dialog.
					var outlineCount = data.OUTLINE_INSTANCES || 0;
					var relatedGraphicsCount = data.GRAPHICS_INSTANCES || 0;
					var relatedCalculatorsCount = data.CALCULATORS_INSTANCES || 0;
					var relatedTopicsCount = data.TOPICS_INSTANCES || 0;
					var topicTextCount = data.TEXT_INSTANCES || 0;
					var i, count = 0;
					
					$$.findInPage.matches = [];
					$$.findInPage.matchIndex = -1;
					
					for (i = 0; i < outlineCount; i++) {
						$$.findInPage.matches[count++] = "mark_outline_" + i;
					}
					for (i = 0; i < relatedGraphicsCount; i++) {
						$$.findInPage.matches[count++] = "mark_graphic_" + i;
					}
					for (i = 0; i < relatedCalculatorsCount; i++) {
						$$.findInPage.matches[count++] = "mark_calculator_" + i;
					}
					for (i = 0; i < relatedTopicsCount; i++) {
						$$.findInPage.matches[count++] = "mark_topic_" + i;
					}
					for (i = 0; i < topicTextCount; i++) {
						$$.findInPage.matches[count++] = "mark_text_" + i;
					}

					// Rebind all events for the HTML that was replaced.
					bindTopicPopupClick();
					if ($$.topic.isProf()) {
						$('a.local').data('source', 'see_link').bind('click', $$.topic.logSectionViewEvent);
						$('.outlineLink').data('source', 'outline_link').bind('click', $$.topic.logSectionViewEvent);
					}
					
					// Show the results.  We show/hide different results depending upon whether
					// there were any matches.
					$('.findInPageResultsCount').html(count);					
					$('#findInPageResultsTerm').html("&quot;" + $$.findInPage.term + "&quot;");
					$('#findInPageResultsInstance').html((count === 1) ? 'instance' : 'instances');
					if (count > 0) {
						$('#findInPageResultsNone').hide();					
						$('#findInPageResultsIterator').show();					
					}
					else {
						$('#findInPageResultsIterator').hide();					
						$('#findInPageResultsNone').show();					
					}
					$('#findInPageResults').show();					

					// Highlight the first result.
					$$.findInPage.next();
				} 
				else {
					$('#findInPage').dialog('close');
				}
			},
			
			/**
			 * Event handler for pressing the next button within the find in page dialog.  We'll
			 * unhighlight the current match and highlight the next match as the new "current" match. 
			 */
			next: function() {
				// Remove the current highlighting from the current match. 
				$('.highlightedCurrent').removeClass('highlightedCurrent').addClass('highlighted');
				
				// Increment the match index, rolling it over if needed.
				$$.findInPage.matchIndex++;
				if ($$.findInPage.matchIndex >= $$.findInPage.matches.length) {
					$$.findInPage.matchIndex = 0;
				}
				
				// Update the index number in the find in page dialog.
				$('#findInPageResultsIndex').html($$.findInPage.matchIndex + 1);

				// Find the next match and mark it as the current match.
				var m = $('#' + $$.findInPage.matches[$$.findInPage.matchIndex]);
				m.removeClass('highlighted').addClass('highlightedCurrent');

				// Find the panel that contain the current match, and scroll to the match if it is
				// not visible.  The calculations for how to scroll are different based on whether
				// the matches are in the fixed left panel or just within the non-fixed body
				// (i.e. right panel or bottom panel), so these are handled separately.
				var panel = m.parents('#leftPanel');
				if (!panel.anyMatches() && $$.isIE6()) {
					panel = m.parents('#rightPanel, #bottomPanel');
				}
				var buffer = 20;
				var matchTop = m.position().top;
			    var matchHeight = m.outerHeight();
				if (panel.anyMatches()) {
					var topPanelHeight = $('#topPanel').height();
				    var panelTop = panel.scrollTop();
				    var panelHeight = panel.height();
				    if (matchTop < 0) {
				      panel.scrollTop(panelTop + matchTop - buffer);
				    }  
				    else if ((matchTop + matchHeight) > panelHeight) {
				      panel.scrollTop(panelTop + (matchTop + matchHeight - panelHeight) + buffer);
				    }  
				}
				else {
					if(isChrome() || $.browser.safari){
						panel = m.parents('body');
					}else{
						panel = m.parents('html');
					}
					
					if (panel.anyMatches()) {
						var improve = $('#helpImprove');
						if (improve.anyMatches() && !(improve.is(':hidden'))) {
							buffer += improve.outerHeight();						
						}
						var panelTop = panel.scrollTop();
						var panelHeight = $(window).height() - $('#topPanel').height();
					    if (matchTop < panelTop) {
					      panel.scrollTop(matchTop - buffer);
					    }  
					    else if ((matchTop + matchHeight) > (panelTop + panelHeight - buffer)) {
					      panel.scrollTop(matchTop + matchHeight - panelHeight + buffer);
					    }  
					}					
				}
				return false;
			},

			/**
			 * Event handler for pressing the new find button within the find in page dialog.  We'll
			 * show the inputs for performing a new search.
			 */
			newFind: function() {
				$('#findInPageInput').show();
				$('#findInPageProgress').hide();
				$('#findInPageResults').hide();
				$('#findInPageTerm').val($$.findInPage.initialTerm).select();
				return false;
			},

			/**
			 * Event handler for pressing the clear button within the find in page dialog.  We'll
			 * unhighlight all matches and show the inputs to allow another search.
			 */
			clear: function() {
				// Clear the matches.
				$('.highlighted').removeClass('highlighted');
				$('.highlightedCurrent').removeClass('highlightedCurrent');
				$$.findInPage.matches = [];
				$$.findInPage.matchIndex = -1;
				
				// Show the inputs.
				$('#findInPageProgress').hide();
				$('#findInPageResults').hide();
				$('#findInPageInput').show();

				// Clear the search term and set focus to it.
				$('#findInPageTerm').val('').focus();
				return false;
			}
			
		}, // End of findInPage
				
		sampleTopic: {
			changeLang: function() {
				$('.sample_container').removeClass('showSample'); 
				$('#sample_' + this.value).addClass('showSample');
			},

			close: function() {
				$(this).parent().parent().slideUp(1000, function(){$(this).remove();});
				$('div#greyBar').css('background-image','url(../images/bg_topic_breadcrumb.myextg)').animate({top: '69px'}, 1000);
				$('div#leftPanel, div#rightPanel, div#dragbar').animate({top: '109px'}, 1000);
				$('div#topPanel').animate({height: '109px'}, 1000);
				if ($$.isIE6()) {
					$('div#rightPanel').height($('div#rightPanel').height() + 226 + 'px'); 
				} 
				$('body').removeClass('sampletopic');
				return false;
			}
			
		}, // End of sampleTopic 
		
		warningMessage: {
			top: "",
			init: function(isLayout){
				if($('#warningMessageContainer').anyMatches() && !$('.sampletopic').anyMatches()){
					$('body').addClass("warningMsg");
					if($('#greyBar').anyMatches()){
						if($('#backtosearch_container').anyMatches()){
							$$.warningMessage.top = "129px";
						}else{
							$$.warningMessage.top = "109px";
						}
					}else{
						$$.warningMessage.top = "75px";
					}
					$('#warningMessageContainer').css("top", $$.warningMessage.top);
					
					if($.browser.msie && isLayout){
						$('#warningMessageContainer').height("42px");
					}
				}
			}
			
			/* Keep this because it may be used in the near future... Today is: 12/8/10
			  close: function() {
				$(this).parent().parent().slideUp(1000, function(){$(this).remove();});
				var t = $('#warningMessageContainer').css("top");
				var animateElem = null;
				if($('#greyBarSimple').anyMatches()){
					animateElem = $('#bottomPanel'); 					
				}else if($('#greyBar')){
					if($('#contentBody').anyMatches()){
						animateElem = $('#pageLeftNav, #contentBody');				
					}else if($('#bottomPanel').anyMatches()){
						animateElem = $('#bottomPanel');
					}else{
						animateElem = $('div#leftPanel, div#rightPanel, div#dragbar');
					}
				}
				if(animateElem != null){
					animateElem.animate({top: $$.warningMessage.top}, 1000);
				}
			}*/
			
		}, // End of warningMessage
		
		tab: function(tabId) {
			var current = $('#headerMenu li.current');
			if(current.anyMatches()){
				current.removeClass("current");
			}
			current = ($("#"+tabId));
			current.addClass("current");
		},
		
		backToSearch: {
			gup: function(name) {
				name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			    var regexS = "[\\?&]" + name + "=([^&#/]*)";
			    var regex = new RegExp(regexS);
			    var results = regex.exec(window.location.href);
			    if (results === null) {
			    	return "1";
			    }
			    else { 
			    	return results[1];
			    }
			},
			createUrl: function() {
				var itemsPerPage = 50;
			    var term = $("span#backtosearch_term").text().replace(/ /g, "+");
			    var item = $$.backToSearch.gup("selectedTitle").split("%7E")[0].split("~")[0];
			    var page = Math.ceil(item / itemsPerPage);
			    if (page === 0) {
			    	page = 1;
			    }
			    var urlstring = "/contents/search?search=" + term + "&searchOffset=" + ((page - 1) * itemsPerPage) + "&pageChange=true&source=backtosearch";
				return urlstring;
			},
			setup: function() {
				var back2Search = $("a#backtosearch");
				if (back2Search.length) {
					var back2SearchTerm = $("a#backtosearch span#backtosearch_term");
					if (!back2SearchTerm.text().length){
						$$.backToSearch.abort();
					}
					var maxLength = 32;
					back2Search.css("left",$("#topSearchBar").offset().left + 1 + "px").attr("href",$$.backToSearch.createUrl);
					if (back2SearchTerm.text().length > maxLength) {
						back2SearchTerm.text(back2SearchTerm.text().substring(0, maxLength) + "...");
					}
					back2Search.css("visibility","visible");
					$(window).resize(function(){
						back2Search.css("left",$("#topSearchBar").offset().left + 1 + "px");
					});
				}
			},
			abort: function() {
				$("div#backtosearch_container").remove();
				$("body").removeClass("backtosearch");
			}
			
		}, // End of backToSearch 
		
		/**
		 * Functions related to the search box
		 */
		search: {
			mousedOver: false,
			closeThread: null,
			searchMessage: "Please Wait",
			onReadyUrl: null,
			
			initSearch: function(data){
				var smallSearchBox = $('#smallSearchBox'); //div for search box in header
				var txtSearch = $('#txtSearch'); //search box
				var dropDwnLink = $('#smallSearchBox #dropDwnLink'); //the button for session history
				
				$$.search.setSearchEnabled();
				//Bind Events
				$('[name=SearchForm]').bind('submit', $$.search.submitSearch);	
				$('#dropDwnLink').bind('blur',function(){
					$$.search.attemptCloseSearchHistory();})
					.bind('click',$$.search.showSearchHistory);
				//Session History
				$('#sessionHistory').bind('blur', $$.search.closeSearchHistory)
					.hover($$.search.cancelCloseSearchHistory, $$.search.beginCloseSearchHistory);
				
				if(!smallSearchBox.anyMatches()){	
					txtSearch.bind('keyup',function(event){
						if (event.keyCode !== 13) {							
							$$.search.showHelpBox();
						}
					});
					$('#clearBtn').bind('click', function(){
						txtSearch.val(" ").focus();
					});
				}else{					
					txtSearch.bind('click',function(){
						$$.search.fieldOnFocus($('#txtSearch'), 'New Search');
					});					
					txtSearch.bind('focus',function(){
						$$.search.fieldOnFocus(this, 'New Search');						
					});
					txtSearch.bind('blur',function(){
						$$.search.fieldOnBlur(this, 'New Search');
					});
				}
				//Init CSS
				if(smallSearchBox.anyMatches()){	
					$('#searchBox #clearBtn').css("visibility", "hidden");					
				}else{
					if($('#home_searchBox').anyMatches()){
						$('#searchBox #clearBtn').css("visibility", "hidden");	
					}else{
						$('#searchBox #submitBtn').val("Go");
					}
				}
					
				if($$.isIE8()){
					if(dropDwnLink.anyMatches()){
						dropDwnLink.css("margin-top","2px");
					}
					$('#dropDwnLink').append("&nbsp;&nbsp;&nbsp;");
				}
			},
			
			initAutoComplete: function(){
				var txtSearch = $("#txtSearch");
				if($("#patientHomeAC").anyMatches()){
					return false;
				}
				if (!txtSearch.length){
					return false;
				}
				// We need to attach the dropdown to a div, but the div varies.  #contentFullPage, #bottomPanel, #topPanel
				var ac_class = "";
				var initContainer = null;
				var searchBoxPosition = null;
				if ($("#contentFullPage #txtSearch").length) {
					initContainer = $("#contentFullPage");
					searchBoxPosition = txtSearch.position();
					ac_class = "inContentFullPage";
				} else if ($("#bottomPanel #txtSearch").length) {
					initContainer = $("#bottomPanel");
					searchBoxPosition = txtSearch.position();
				} else if ($("#topPanel #txtSearch").length) {
					initContainer = $("body");
					searchBoxPosition = txtSearch.offset();
					if (document.doctype) {
						ac_class = "ac_small";
					} else {
						ac_class = "ac_nodoctype";
					}
				}
				if(initContainer !== null){
					initContainer.append("<ul id=\"autoCompleteList\" class=\"" + ac_class + "\"></ul>");
				}
				txtSearch.bind('keyup', function(e){
									if (e.keyCode !== 13 && e.keyCode !== 35 && e.keyCode !== 36 && e.keyCode !== 37 && e.keyCode !== 38 && e.keyCode !== 39 && e.keyCode !== 40) {
										if(window.ac_timeout) {
							                clearTimeout(ac_timeout);
										}
										if (this.value.length >= 3) {	
											var $this = this;
											ac_timeout = setTimeout(function() {
												ac_timeout = undefined;
												$$.search.runAutoComplete($this.value);
											}, 500); // Keypress Timeout
										} else {
											$("body").removeClass("autoCompleteOpen");
											$("#autoCompleteList").hide();
											$("#autoCompleteList li").remove();
										}
									}
								});
				txtSearch.bind('keydown',function(e){
								  	var autoCompleteListActive = $("#autoCompleteList li.active");
									if (e.keyCode === 40) { // down arrow
										if ((autoCompleteListActive) && (autoCompleteListActive.index() < ($("#autoCompleteList li").length) - 1) ) {
											autoCompleteListActive.removeClass("active").next().addClass("active");
											this.value = $("#autoCompleteList li.active").text();
										}
										if (autoCompleteListActive.index() === -1) {
											$("#autoCompleteList li:first").addClass("active");
											this.value = $("#autoCompleteList li.active").text();
										}
									} else if (e.keyCode === 38) { // up arrow
										if ((autoCompleteListActive) && (autoCompleteListActive.index() > 0)) {
											autoCompleteListActive.removeClass("active").prev().addClass("active");
											this.value = $("#autoCompleteList li.active").text();
										}
									}
				});
				$("#autoCompleteList").css("top",searchBoxPosition.top + $("#box").height()).css("left",searchBoxPosition.left);
				$("#autoCompleteList").bind('mouseenter', function(){
					$("#autoCompleteList li.active").removeClass("active");
				});
				$(".autoCompleteOpen").live('click', function() {
					$("body").removeClass("autoCompleteOpen");
					$("#autoCompleteList").hide();
					$("#autoCompleteList li").remove();
				});
				$("#autoCompleteList li").live('click', function() {
					txtSearch.val($(this).text());
					$$.search.autoCompleteSubmitSearch();
				});
				$(window).resize(function(){
					if ($("#contentFullPage #txtSearch").length) {
						searchBoxPosition = txtSearch.position();
						ac_class = "inContentFullPage";
					} else if ($("#bottomPanel #txtSearch").length) {
						searchBoxPosition = txtSearch.position();
					} else if ($("#topPanel #txtSearch").length) {
						searchBoxPosition = txtSearch.offset();
					}
					$("#autoCompleteList").css("top",searchBoxPosition.top + $("#box").height()).css("left",searchBoxPosition.left);
				});
			},
			
			runAutoComplete: function(term){
				$.getJSON($$.search.onReadyUrl,
					"prefix=" + term,
					 function(data) {
						if (data === null){
							return false; // break if response fails or is invalid
						}
						var results = data.termList;
						if ($(data.termList).length) {
							$("body").addClass("autoCompleteOpen");
							$("#autoCompleteList li").remove();
							$.each(results, function(i, result) {
								$("#autoCompleteList").append("<li>" + result.term + "</li>");
							});
							$("#autoCompleteList li").hover(
								function () {
									$(this).addClass("active");
								}, 
								function () {
									$(this).removeClass("active");
								}
							);
							$("#autoCompleteList").show();
							$("*").scroll(function(){
								$("body").removeClass("autoCompleteOpen");
								$("#autoCompleteList").hide();
								$("#autoCompleteList li").remove();
							});
						} else {
							$("body").removeClass("autoCompleteOpen");
							$("#autoCompleteList").hide();
							$("#autoCompleteList li").remove();
						}
					});
			},
			
			initSubmitSearch: function(){
				var txtSearch = $('#txtSearch');
				if(txtSearch.val() === 'New Search' || txtSearch.val() === ''){
					return false;
				}
				$("#autoCompleteList").hide();
				//$('#submitBtn').val($$.search.searchMessage).attr("disabled", "true");
			},
			
			submitSearch: function(){
				$$.search.initSubmitSearch();
				return true;
			},
			
			autoCompleteSubmitSearch: function(){
				$$.search.initSubmitSearch();
				$('[name=SearchForm]').submit();
				return false;
			},
			
			setSearchFocus: function() {
				var objSearch = $('#txtSearch');
				if (objSearch.anyMatches()) {
					objSearch.focus();
				}
			},
		
			//This appears on the main search page
			showHelpBox: function() {
				var objHelp = $('#divSearchHelp');
				if (objHelp.anyMatches()) {
					objHelp.css("visibility","visible");
				}
			},
			
			//Ensure the search button is enabled on page load
			setSearchEnabled: function(){
				$('#submitBtn').removeAttr("disabled");
			},
			showSearchHistory: function(numItems) {
				if (numItems > 0) {
					$$.search.closeSearchHistory();					
					$('#sessionHistory').css("display", "block");
				}
				return false;
			},
			
			closeSearchHistory: function() {
				$$.search.mousedOver = false;
				$('#sessionHistory').css("display","none");
			},
			
			attemptCloseSearchHistory: function() {
				if (!$$.search.mousedOver) { 
					$$.search.closeSearchHistory();
				}
			},

			beginCloseSearchHistory: function() {
				$$.search.closeThread = setTimeout("$$.search.closeSearchHistory();", 1000);
			},

			cancelCloseSearchHistory: function() {
				$$.search.mousedOver = true;
				clearTimeout($$.search.closeThread);
			},
			
			//Used to put New Search or clear the text box
			fieldOnFocus: function(field, defaultValue) {
				var dValue = defaultValue;
				if (!defaultValue) {
					dValue = field.defaultValue;
				}
				
				if (dValue === field.value) {
					field.value = "";
				}
			},

			//Used to put New Search or clear the text box
			fieldOnBlur: function(field, defaultValue) {
				var dValue = defaultValue;
				if (!defaultValue) {
					dValue = field.defaultValue;
				}
				
				if (field.value === "") {
					field.value = dValue;
				}
			}
		},
		
		/**
		 * Functions related to the Search Results page
		 */
		searchResults: {			
			waitBeforeOpen: '300',
			cachedContents: {},
			cachedRanks: {},
			currentToolTip: null,
			currentDisplayed: null,
			contentShown: false,
			runningThread: null,
			toolTipUrl: null,
			outlineMessage: "Please Wait",
			isSearchResults: false,
			isProspect: false,
			
			highlightLink: function(linkId) {
				var lastLink = "";
				if($$.searchResults.currentDisplayed !== null){
					lastLink = "#" + $$.searchResults.currentDisplayed.replace("/","\\/");
				}
				var objLastLink = $(lastLink);
				if (objLastLink.anyMatches()) {
					objLastLink.removeClass("searchResultPreviewed");
				}				
				if (linkId !== null) {
					linkId = '#'+linkId.replace("/","\\/");
					var objCurLink = $(linkId);
					if (objCurLink.anyMatches()) {
						objCurLink.addClass("searchResultPreviewed");
					}
				}
			},

			renderOutline: function(jsonObj) {
				if(!$$.searchResults.isProspect){
					var objDiv = $('#topicOutlinePreview');
					try {
						objDiv.html("Rendering . . .");
						var status = jsonObj.STATUS;
				
						if (status === 0) {
							var content = jsonObj.CONTENT_HTML;
							var topicKey = jsonObj.TOPIC_KEY;
							$$.searchResults.cachedContents[topicKey] = content;
							
							if (topicKey === $$.searchResults.currentToolTip || !$$.searchResults.contentShown) {
								objDiv.html(content);
								objDiv.css("visibility", "visible");
								$$.searchResults.contentShown = true;								
								$$.searchResults.highlightLink(topicKey);				
								$$.searchResults.currentDisplayed = topicKey;
							}
						} else {
							$$.searchResults.highlightLink(null);
							objDiv.html("No Topic Outline Available.");
						}
					} catch (e) {
						objDiv.html("No Topic Outline Available.");
					}
				}
			},

			closeToolTip: function() {
				var objDiv = $('#topicOutlinePreview');
				if (objDiv.anyMatches()) {
					objDiv.html("").css("visibility", "visible");
				}

				$$.searchResults.highlightLink(null);
				$$.searchResults.currentToolTip = null;
				$$.searchResults.currentDisplayed = null;
			},

			showToolTip: function() {
				var a = $(this);
				var div = $('#resultList');		
				var data = $('#resultList').data();
				if (data) {
					var topicKey = a.attr('id');
					var rank = data[topicKey];
					if ($$.searchResults.currentToolTip !== topicKey) {
						if($$.searchResults.runningThread !== null){
							clearTimeout($$.searchResults.runningThread);
						}
						$$.searchResults.currentToolTip = topicKey;
						$$.searchResults.runningThread = setTimeout(function(){
							$$.searchResults.startToolTip(topicKey);
							}, $$.searchResults.waitBeforeOpen);
					}
					$$.searchResults.cachedRanks[topicKey] = rank;
				}				
			},

			abandonToolTip: function() {
				var a = $(this);
				var div = $('#resultList');		
				var data = div.data();
				if (data) {
					var topicKey = a.attr('id');
					if ($$.searchResults.currentToolTip === topicKey) {
						$$.searchResults.currentToolTip = null;
					}
				}				
			},
			
			gotoImage: function(topicKey, url) {			
				if ($$.searchResults.cachedRanks[topicKey] !== null) {
					url += "&selectedTitle=" + $$.searchResults.cachedRanks[topicKey];
				}
				var w = window.open(url);		
				w.focus();
				return false;
			},
			
			startToolTip: function(toolTip) {
				var objDiv = $('#topicOutlinePreview');
				if (($$.searchResults.currentToolTip === toolTip && $$.searchResults.currentDisplayed !== toolTip) 
						|| objDiv.html() === "No Topic Outline Available.") {
					if(!$$.searchResults.isProspect){
						if ($$.searchResults.cachedContents[toolTip] != null && $$.searchResults.cachedContents[toolTip] != '') {
							objDiv.html($$.searchResults.cachedContents[toolTip])
								.css("visibility", "visible");
							
							$$.searchResults.highlightLink(toolTip);						
							$$.searchResults.currentDisplayed = toolTip;
						} else if ($.getJSON($$.searchResults.toolTipUrl + "?topicKey=" + toolTip, $$.searchResults.renderOutline)) {
							var date = new Date();
			
							objDiv.html("<img src=\"" + $$.contextPath + "/images/progress.myextg\" style='vertical-align: text-bottom;'/>&nbsp;" + $$.searchResults.outlineMessage)
								.css("visibility", "visible");
							$$.searchResults.contentShown = false;
						}
					}
				}
			},
				
			init: function(priority, ttUrl){
				$$.searchResults.toolTipUrl = ttUrl;
				if($$.searchResults.isProspect){
					$$.searchResults.adjustSubscribeBox();				
				}else{
					$$.searchResults.adjustTopicOutlineHeight();					
				}
				$$.searchResults.adjustDivHeight();
				
				if(priority <=0){
					$('#allPriority').addClass("boldPriority");
				}else if(priority === 1){
					$('#adultPriority').addClass("boldPriority");
				}else if(priority === 2){
					$('#pediPriority').addClass("boldPriority");
				}else if(priority === 3){
					$('#patientPriority').addClass("boldPriority");
				}
								
				if($$.isIE6()){					
					if($$.searchResults.isProspect){
						var objSR = $('#searchResults');
						objSR.css("width","99.5%");
					}
				}
					
				if($$.isIE8()){
					var objTSResults = $('#topSearchResult');
					if(objTSResults.anyMatches()){
						objTSResults.css("overflow"," ");
					}
				}
			},
			
			setIsProspect: function(isUn){
				$$.searchResults.isProspect = isUn;
			},
				
			adjustDivHeight: function() {
				var headerBtnBgMid = $('#headerBtnBgMid');
				var objLP = $('#leftPanel');
				var objRP = $('#rightPanel');
				var bodyWidth = $('body').outerWidth();
				var width = bodyWidth-objLP.outerWidth();
				if($$.isIE6() && !$$.searchResults.isProspect){					
					width = bodyWidth - 735;
				}
				if(width < bodyWidth*0.35 && !$$.searchResults.isProspect){
					if($$.isIE6()){		
						objLP.width("723px");
					}					
					objRP.width(width +"px");
				}else if(!$$.searchResults.isProspect){
					if($$.isIE6()){
						objRP.width("34%");
					}else{
						objRP.width("35%");
					}
					objLP.width("65%");
				}
				if(headerBtnBgMid.anyMatches()){
					var objResults = $('#searchResults');
					var objTooltip = $('#topicOutlinePreview');
					var docHeight = $(document).height();
					if($$.isIE6()){
						docHeight = $('body').height();
					}
					var headHeight = headerBtnBgMid.offset().top;
					var offset = docHeight - headHeight - 8;								
					
					if (objResults.anyMatches()) {
						objResults.height(offset + "px");
					}
					
					if (objTooltip.anyMatches()) {
						objTooltip.height(offset + "px");
					}
				}
			},
			
			adjustTopicOutlineHeight: function (){
				if(!$$.searchResults.isProspect){
					var sp = $('#searchResults');
					if(sp.anyMatches()){
						var spYCoord = sp.offset().top;					
						var toolTipYCoord = $('#topicOutlinePreview').offset().top;
						var additionalPadding = spYCoord - toolTipYCoord + 8;
						var padding = additionalPadding + "px";
						$('#topicOutlineText').css("padding-bottom", padding);
					}
				}
			},
			
			adjustSubscribeBox: function(){
				if($$.searchResults.isProspect){
					var objSubNowBox = $('#subscribenow_callout');
					var objSearchPriority = $('#searchresults_priority');
					if(objSubNowBox.anyMatches()){
						var priorityWidth = objSearchPriority.width();
						var priorityMarginLt = objSearchPriority.css("margin-left");
						var ltAmt = parseInt(priorityMarginLt.replace("px",""),10);
						var subNowBoxWidth = objSubNowBox.width();
						var subNowBoxMarginRt = objSubNowBox.css("margin-right");
						var rtAmt = parseInt(subNowBoxMarginRt.replace("px",""),10);
						var width = priorityWidth + ltAmt + subNowBoxWidth + rtAmt + 15;
						if($('#searchResultNums').anyMatches()){
							width += 13;
						}
						var objBody = $('body').width();
						if(objBody < width){
							objSubNowBox.css("margin-top", "0px");
						}else{
							objSubNowBox.css("margin-top", "-47px");
						}
					}
				}
			},
			//Used by preview		
			addCachedRanks: function(url, topicKey, anchor) {	
				if ($$.searchResults.cachedRanks[topicKey] != null) {
					url += "&selectedTitle=" + $$.searchResults.cachedRanks[topicKey];
				}

				if(anchor !== null){
					url += "#" + anchor;
				}
				window.location = url;			
				return false;
			}
		},
		
		cleanURLs: function(){
			$('form').each(function(){
				var href = $(this).attr("action");
				if(href.length !== 0){					
					if(href.search("search.do") !== -1){
						$(this).attr("action",href.replace("search.do", "search"));
					}else if(href.search("store.do") !== -1){
						$(this).attr("action",href.replace("store.do", "store"));
					}else if(href.search("agreement.do") !== -1){
						$(this).attr("action",href.replace("agreement.do", "agreement"));
					}else if(href.search("drug-disclaimer.do") !== -1){
						$(this).attr("action",href.replace("drug-disclaimer.do", "drug-disclaimer"));
					}else if(href.search("email.do") !== -1){
						$(this).attr("action",href.replace("email.do", "email"));
					}else if(href.search("/cme") !== -1 && href.search(".do") !== -1){
						$(this).attr("action",href.replace(".do", ""));
					}else if(href.search("/account") !== -1 && href.search(".do") !== -1){
						$(this).attr("action",href.replace(".do", ""));
					}else if(href.search("login.do") !== -1){
						$(this).attr("action",href.replace("login.do", "login"));
					}else if(href.search("register.do") !== -1){
						$(this).attr("action",href.replace("register.do", "register"));
					}else if(href.search("letter.do") !== -1){
						$(this).attr("action",href.replace("letter.do", "letter"));
					}else if(href.search("survey.do") !== -1){
						$(this).attr("action",href.replace("survey.do", "survey"));
					}
				}
			});
		},
		
		userInfo: {
			init: function(){
				$("#progAccessDetails .progDetails").hide();
				$("#progAccessDetails .progLinksRow").hide();
				$("#progAccessDetails .progLinksRow").hide();
				$("#progAccessDetails .progAttsRows").hide();
			},		
			toggle: function(){
				var id = $(this).attr("id");
				var table = $("#program" + id);
				table.toggle();
				var par = table.parent().parent();
				par.toggle();
			},
			togglePTT: function(){
				var id = $(this).attr("id");
				var table = $("#ptt" + id);
				if(table.anyMatches()){
					table.toggle();
				}
				var table2 = $("#tk" + id);
				if(table2.anyMatches()){
					table2.toggle();
				}
				var par = null;
				if(table.anyMatches()){
					par = table.parent().parent();
					par.toggle();
				}
				if(table2.anyMatches()){
					par = table2.parent().parent();
					par.toggle();
				}				
			}
		},
		
		//account/usage report. Add change handler then submit the form to refresh it
		usageReport:{ 
			init: function(){
				$('#startDate').bind('change', $$.usageReport.refresh);
				$('#endDate').bind('change', $$.usageReport.refresh);
			},
			
			refresh: function(){
				$('#usageForm').submit();
			}
		},
		
		//Tries to read either the class or id in the event, change the value of the button
		//and then disable the button to prevent multiple submits.
		disableButton: function(event){
			var clazz = $(event.data.clazz);
			var id = $(event.data.id);
			if(clazz.length){
				clazz.val("Please wait...").attr("disabled","true");
			}else if(id.length){
				id.val("Please wait...").attr("disabled","true");
			}
			return true;
		},

		logWidgetHomeLinkEvent: function() {
			var vars = [], hash;
			var hashes = window.location.search.substring(1).split('&');
			for(var i = 0; i < hashes.length; i++){
				hash = hashes[i].split('=');
				vars.push(hash[0]);
				vars[hash[0]] = hash[1];
			}
			var clientId = vars['clientId'];
			var source = vars['source'];
			if (clientId != null && source != null && clientId.length > 0 && source.length > 0) {
				var params = {
					eventType: "WidgetHomeLink",
					clientId: clientId, 
					source: source};
				var url = $$.makeUrl('/services/EventLog', params);
				$.ajax(url, {cache: false});
			}
			return true;
		},

		ovidLink:{
			
			linkType : null,

			openDialog: function(event){
				event.preventDefault();
				var url = $(this).attr('href');
				$$.ovidLink.linkType = $(this).html();
				$.ajax(url,
					{dataType: 'json', 
					success: $$.ovidLink.showLinks,
					error: $$.ovidLink.showError,
					cache: false
					});				
			},
	
			closeDialog: function(event){
				event.preventDefault();
				$('#ovidMask').hide();
				$('#ovidDialog').hide();
			},		

			showError: function(){
				$('#ovidDialog #ovidDialogInstruction').html("Full text link information not available.");
				$('#ovidDialog #ovidDialogLinks').html("");
				$$.ovidLink.showDialog();
			},		
	    
			showLinks: function(links) { 
				if (links != null && links.length > 0) {
					if (links.length == 1) {
						var win = window.open(links[0].link, "_fulltext");
						if (win == null || typeof(win)=='undefined') {  
							$('#ovidDialog #ovidDialogInstruction').html("Disable pop-up blocker and click the full text link again.");
							$$.ovidLink.showDialog();
						} 
						else {  
							win.focus();
						}
						return;
					}
					var html =  '';
					html +=     ' <ul>';					
					for(var i=0; i<links.length; i++) {
						var ovidLink = links[i];
						html += '   <li>';
						html += '      <a href="' + ovidLink.link + '" target="_fulltext">' + ovidLink.name + '</a>';
						html += '   </li>';
					}
					html +=     ' </ul>';
					$('#ovidDialog #ovidDialogLinks').html(html);
					$$.ovidLink.showDialog();
				}
				else {
					$$.ovidLink.showError();
				}				
			},
	    
			showDialog: function(){
				$('#ovidDialog #ovidDialogTitle #text').html($$.ovidLink.linkType);
				
				var windowHeight = $(window).height();
				var windowWidth = $(window).width();
		
				// Fill up the whole screen
				$('#ovidMask').css({'width':windowWidth,'height':windowHeight});
				$('#ovidMask').fadeTo("fast",0.5);	

				// Display the dialog in the center
				$('#ovidDialog').css('top',  windowHeight/2-$('#ovidDialog').height()/2);
				$('#ovidDialog').css('left', windowWidth/2-$('#ovidDialog').width()/2);
				$('#ovidDialog').fadeIn();		    	
			}

		},		
				
		agreement:{
			acceptUrl: null,
			declineUrl: null,
			
			init: function(){
				$('#acceptUrl').bind('click',{url:$$.agreement.acceptUrl}, $$.agreement.go);
				$('#declineUrl').bind('click',{url:$$.agreement.declineUrl},$$.agreement.go);
				$('#acceptUrl').bind('click',{id:'#acceptUrl'}, $$.disableButton);
				$('#declineUrl').bind('click',{id:'#declineUrl'}, $$.disableButton);
				if($$.isIE6()){
					$('#bottomPanelNG').css("padding-top","64px");
					$('body').css("overflow", "auto");
				}
			},
		
			go: function(e){				
				var anchor = self.document.location.hash;
				var url = e.data.url;
				var param = self.document.location.search.search("anchor");
				if(param === -1){
					var ques = url.search("/\\?/");
					if(ques === -1){
						url += "&";
					}else{
						url += "?";
					}
					url += "agreement_anchor=" + anchor.replace("#","");
				}
				window.location.href = url;
			}
		},
		
		showSLALightBox: {
			acceptUrl: null,
			declineUrl: null,
			guestSLA: null,
			patientSLA: null,
			checkUrl: null,			
			init: function(){
				//We need to check if the sessionBean has flipped the need to view license flag
				//because the user may have clicked the back button and we don't want to show it twice.
				$.ajax($$.showSLALightBox.checkUrl, {
					cache: false,
					dataType: 'json',
					success:function(data){
						$$.showSLALightBox.initLB(data.needToViewLicense);
					},
					error:function(){
						//if there's some kind of error show it again as a fail safe
						$$.showSLALightBox.initLB(true);
					}
				});
				
			},
			initLB: function(needToViewLicense){
				if(needToViewLicense){
					$('#acceptUrl').bind('click',{url:$$.showSLALightBox.acceptUrl}, $$.showSLALightBox.recordAgreement);
					$('#declineUrl').bind('click',{url:$$.showSLALightBox.declineUrl},$$.showSLALightBox.decline);
					$('#acceptUrl').bind('click',{id:'#acceptUrl'}, $$.disableButton);
					$('#declineUrl').bind('click',{id:'#declineUrl'}, $$.disableButton);
					$('#sla_light_box').bind('click', $$.logSLALinkEvent);
					$(window).bind('resize',$$.showSLALightBox.adjustLightBox);
					$('#rightPanel').css('overflow', 'hidden'); //this prevents scrolling
					$$.showSLALightBox.adjustLightBox();
				}
			},
			adjustLightBox: function(){
				var windowHeight = $(window).height();
				var windowWidth = $(window).width();

				if($$.showSLALightBox.guestSLA){
					$('#slaDialog').addClass('guest');
				}else if($$.showSLALightBox.patientSLA){
					$('#slaDialog').addClass('patient');
					$('#slaDialog #boxDialog hr').css('width','99%');
				}
				
				// Fill up the whole screen
				$('#slaMask').css({'width':windowWidth,'height':windowHeight});				
				$('#slaMask').fadeTo("fast",0.5);	

				// Display the dialog in the center
				$('#slaDialog').css('top',  windowHeight/2-$('#slaDialog').height()/2);
				$('#slaDialog').css('left', windowWidth/2-$('#slaDialog').width()/2);			
				$('#slaDialog').fadeIn();
			},
			recordAgreement: function(e){
				//Record the acceptance of the SLA in AgreementWebService
				var url = e.data.url;
				$.ajax(url, {cache: false});
				$(window).unbind('resize',$$.showSLALightBox.adjustLightBox); //prevent light box from being shown again
				$('#rightPanel').css('overflow', 'visible');
				$('#slaMask').hide();
				$('#slaDialog').hide();
			},
			decline: function(e){
				//Send them to the contact us page
				var url = e.data.url;
				window.location.href = url;
			}
		},
		
		showSLAMessage: {	
			checkUrl: null,			
			init: function(){
				//We need to check if the sessionBean has flipped the need to view the sla message
				//because the user may have clicked the back button and we don't want to show it twice.
				$.ajax($$.showSLAMessage.checkUrl, {
					cache: false,
					dataType: 'json',
					success:function(data){
						$$.showSLAMessage.initMessage(data.needToViewSLAMessage);
					},
					error:function(){
						//if there's some kind of error show it again as a fail safe
						$$.showSLAMessage.initMessage(true);
					}
				});
				
			},
			initMessage: function(needToViewSLAMessage){
				if(needToViewSLAMessage){
					$('#rightPanel, #leftPanel,#slaMessageContainer #closeMessage, #bottomPanel, #txtSearch')
						.bind('click',$$.showSLAMessage.close);
					$('#leftPanel,#rightPanel').bind('scroll',$$.showSLAMessage.close);
					setTimeout("$(window).bind('scroll',$$.showSLAMessage.close)",500);
					$('#slaMessageContainer').animate({bottom: '0px'}, 1000);
					$('#sla_message').bind('click', $$.logSLALinkEvent);
				}
			},
			close: function(event) {
				if(event.type === "click" && event.currentTarget.id === 'closeMessage'){
					event.preventDefault();
					var params = {eventType: "SLACloseButtonClickEvent"};
					var url = $$.makeUrl('/services/EventLog', params);
					$.ajax(url, {cache: false});
				}
				$('#slaMessageContainer').animate({opacity: '0'}, 1000, function(){
					$('#slaMessageContainer').hide();
				});
				$('#rightPanel, #leftPanel,#slaMessageContainer #closeMessage, #bottomPanel')
					.unbind('click',$$.showSLAMessage.close);
				$(window).unbind('scroll',$$.showSLAMessage.close);
				$('#leftPanel,#rightPanel').unbind('scroll',$$.showSLAMessage.close);
			}			
		}, 
		
		showDrugDisclaimerLightBox: {
			acceptUrl: null,
			checkUrl: null,
			init: function(){
				//We need to check if the sessionBean has flipped the need to view the drug disclaimer
				//because the user may have clicked the back button and we don't want to show it twice.
				$.ajax($$.showDrugDisclaimerLightBox.checkUrl, {
					cache: false,
					dataType: 'json',
					success:function(data){
						$$.showDrugDisclaimerLightBox.initLB(data.hasViewedDrugTerms);
					},
					error:function(){
						//if there's some kind of error show it again as a fail safe
						$$.showDrugDisclaimerLightBox.initLB(false);
					}
				});
				
			},
			initLB: function(hasViewedDrugTerms){
				//Make sure we are on a drug topic
				if($$.topic.topicClass === "DRUG" && !hasViewedDrugTerms){
					$('#drugDisclaimDialog').bind('click',{url:$$.showDrugDisclaimerLightBox.acceptUrl}, $$.showDrugDisclaimerLightBox.recordAgreement);
					$('#drugDisclaimMask').bind('click',{url:$$.showDrugDisclaimerLightBox.acceptUrl}, $$.showDrugDisclaimerLightBox.recordAgreement);
					$(window).bind('resize',$$.showDrugDisclaimerLightBox.adjustLightBox);
					$('#rightPanel').css('overflow', 'hidden'); //this prevents scrolling
					$$.showDrugDisclaimerLightBox.adjustLightBox();
				}
			},
			adjustLightBox: function(){
				var windowHeight = $(window).height();
				var windowWidth = $(window).width();
		
				// Fill up the whole screen
				$('#drugDisclaimMask').css({'width':windowWidth,'height':windowHeight});				
				$('#drugDisclaimMask').fadeTo("fast",0.5);	
				
				// Display the dialog in the center
				$('#drugDisclaimDialog').css('top',  windowHeight/2-$('#drugDisclaimDialog').height()/2);
				$('#drugDisclaimDialog').css('left', windowWidth/2-$('#drugDisclaimDialog').width()/2);			
				$('#drugDisclaimDialog').fadeIn();
			},
			recordAgreement: function(e){
				//records in AgreementWebService the viewing of the drug disclaimer
				var url = e.data.url;
				$.ajax(url, {cache: false});
				$('#rightPanel').css('overflow', 'visible');
				$(window).unbind('resize',$$.showDrugDisclaimerLightBox.adjustLightBox); //prevent light box from being shown again
				$('#drugDisclaimDialog').hide();
				$('#drugDisclaimMask').hide();
			}
		},
		
		logSLALinkEvent: function(event) {
			var a = $(this);
			var params = {
				eventType: "SLAClickEvent",
				type: a[0].id 
				};
			var url = $$.makeUrl('/services/EventLog', params);
			$.ajax(url, {cache: false});
			return true;
		},
		
		/**
		 * Binds all event handlers to their elements.
		 */
		bindEventHandlers: function() {
			// Bind the click event of all links to secondary popup pages such as images, 
			// abstracts, etc. to the topic popup open method.
			bindTopicPopupClick();
			
			// Bind the patient topic contributors mouse events to handlers that show and hide
			// the contributor's credentials.
			if ($('#patTopicContributors').anyMatches()) {
				$('a', $('#patTopicContributors')).each(function() {
					var a = $(this);
					if (a.attr('id')) {
						a.hover($$.credentials.show, $$.credentials.hide);
					}
				});
			}
			
			// If the toggle outline link is present, then bind its click event.
			$('a', $('#toggleOutline')).bind('click', $$.outline.toggle);

			// Bind the find in page links to open the find in page dialog, and bind the events
			// for all buttons within the dialog.
			$('.patientInformationLink').data('source','icon_link').bind('click', $$.topic.logSectionViewEvent);
			$('.findInPageLink').bind('click', $$.findInPage.open);  
			$('#findInPageFind').bind('click', $$.findInPage.find); 
			$('#findInPageClear').bind('click', $$.findInPage.clear);
			$('#findInPageTerm').bind('keydown', $$.findInPage.enter);  
			$('#findInPageResultsClear').bind('click', $$.findInPage.clear);
			$('#findInPageResultsNext').bind('click', $$.findInPage.next);
			$('#findInPageResultsNewFind').bind('click', $$.findInPage.newFind);
			
			var improve = $('#helpImprove');
			if (improve.anyMatches()) {
				// Bind the click event of the help improve answers.
				$('#helpImproveAnswerYes').bind('click', $$.helpImprove.answer);  
				$('#helpImproveAnswerNo').bind('click', $$.helpImprove.answer);  

				// If the help improve question is showing, then adjust the footer to give it a bottom
				// margin equal to the height of the help improve question so the footer is not
				// covered by the help improve question.
				if (!(improve.is(':hidden'))) {
					if ($$.isIE6()) {
						$('#rightPanel').addClass('withHelpImprove');
					}
					else {
						$('#footer').css('margin-bottom', improve.outerHeight() + 'px');
					}
				}
			}

			// Bind the feedback link in the header to open the email popup, first adding data to
			// be used by the popup.
			$('#feedback').data('dest', 'editorial').bind('click', $$.emailPopup.open);

			// Bind the email links to open the ETAC popup.
			$('.etacLink').bind('click', $$.etacPopup.open);
			$('#etacSubmit').bind('click', $$.etacPopup.submit);

			// Bind the more link to show the version details.
			$('#moreLink').hover($$.versionDetails.show, $$.versionDetails.hide);
			
			// Bind the extra details link to show the dev details.
			$('#devExtraDetailsLink').hover($$.devExtraDetails.show, $$.devExtraDetails.hide);
			
			// Bind sample topic controls
			$('#sample_close').bind('click', $$.sampleTopic.close);
			$('#sample_lang').bind('change', $$.sampleTopic.changeLang);
			
			// Bind certain events only for professional topics.
			if ($$.topic.isProf()) {
				// For local see links and outline links, bind their click event to a handler to
				// log a topic section view event, first adding data to describe the event source. 
				$('a.local').data('source', 'see_link').bind('click', $$.topic.logSectionViewEvent);
				$('.outlineLink').data('source', 'outline_link').bind('click', $$.topic.logSectionViewEvent);
				
				// Bind the window unload event to log a CME topic view end event.
				$(window).bind('unload', $$.cme.topicViewEnd);
				
				// Bind certain header links to show the topic survey.
				$('a', $('#headerLogo')).bind('click', topic_checkForPendingSurvey);
				$('a', $('#headerLinks')).bind('click', topic_checkForPendingSurvey);
				$('a', $('#headerMenu')).bind('click', topic_checkForPendingSurvey);
			}

			// Bind the print and back links within a print view.
			$('#printHeaderPrint').bind('click', $$.print);
			$('#printHeaderBack').bind('click', $$.back);

			// Bind the checkboxes to toggle various sections within the print view of a topic.
			$('input:checkbox', $('#printControls')).bind('click', $$.topic.togglePrintSection);	
			
			// We must bind the window resize event so we can adjust the footer positioning as 
			// necessary as the window size changes.  See comments in the isFooterAdjustmentNeeded() 
			// function.
			if (isFooterAdjustmentNeeded()) {
				if (!($('#topicContent').anyMatches() && $$.isIE6())){
					$(window).bind('resize', $$.adjustFooter);
				}
			}
			
			//Search Results
			if($$.searchResults.isSearchResults){
				//Bind the search results mouse events to handlers that show and hide the topic outline
				//This is for customer users only
				var resultList = $('#resultList');
				if (resultList.anyMatches() && $('#priorities').anyMatches()) {
					$('.searchResult', resultList)
						.hover($$.searchResults.showToolTip, $$.searchResults.abandonToolTip)
						.bind('click', searchOnClick);
				}
				
				$(window).bind('resize',$$.searchResults.adjustDivHeight);
				
				//Search Results - Prospect
				$(window).bind('resize',$$.searchResults.adjustSubscribeBox);
			}
			
			//Usage Report
			$$.usageReport.init();
			
			//Contact Information, Change Login
			$('#submitAccount').bind('click',$$.showPleaseWait.show);
			$('#cancelAccount').bind('click',$$.showPleaseWait.showUrl);
			
			//Reset Password
			$('#submitReset').bind('click',$$.showPleaseWait.show);
			
			//Register EMR
			$('#registerEmrSubmit').bind('click',$$.showPleaseWait.show);
			
			//NOTE: This is ugly, but works.  If you can find a CSS fix, by all means get rid of this
			//The outline links don't go the right spot b/c of how ie6 handles margin-top (ignoring it...) so
			//the below sends the scroll bar to the top of the page, then figures out where
			//the link should go in reference to that. Just to make it interesting, drugs seem to mess that
			//up even more, so there's some more additional logic! And one last catch,  if it has back to search
			//or it's the references section do what DRUGS do. 
			if ($$.isIE6() && $$.topic.isProf()) {
				$('a',$('#outline')).bind('click', function(event){
					event.preventDefault(); //stops the click event
					//Creates a fake click event
					var rp = $('#rightPanel');
					var rightOff = rp.offset().top;
					rp.scrollTop(0);
					var currentId = $(this).attr('href');
					var offset = $(currentId).offset().top;	
					var total = offset-rightOff;		
					//No idea why these act differently, they just do
					if("DRUG" === $$.topic.topicClass || $("a#backtosearch").anyMatches() || currentId === "#references"){
						total = offset;
					}
					rp.scrollTop(total);
				});
			}
			
			// bind the cancelOrder function on all storefront screens
			//$('#cancelButton').bind('click', $$.cancelOrder);
			
			// bind hover text to topic section heading Basics topic UI
			$('.basics').hover($$.theBasics.show, $$.theBasics.hide);
			$('.beyondthebasics').hover($$.theBasics.show, $$.theBasics.hide);
			
			$('#editSettingsBtn').bind('click', $$.cme.showSettings);			
			
			//user-info
			$("#progLinks a.pal").bind('click',$$.userInfo.toggle);
			$("#progLinks a.booleanLink").bind('click',$$.userInfo.togglePTT);
			$("#progLinks a").hover(function(){
				$(this).addClass("mouseoverPAL");
			},
			function(){
				$(this).removeClass("mouseoverPAL");
			});
			
			//Disable buttons CME 
			$('[name=WidgetRequestForm]').bind('submit',{id:'#widgetRequestSubmitBtn'},$$.disableButton);
			$('[name=CmeProcessForm]').bind('submit',{id:'#cmeProcessSubmitBtn'},$$.disableButton);
			$('[name=CmeProcessForm]').bind('submit',{id:'#surveySubmitBtn'},$$.disableButton);
			$('[name=MonthForm]').bind('submit',{clazz:'.saveMonthBtn'},$$.disableButton);
			
			//Drug Disclaimer
			$('#drugUrl').bind('click',$$.drugDisclaimer);
			
			//Ovid Link
			$('.ovidLink').bind('click',$$.ovidLink.openDialog);
			$('#ovidDialog #close').bind('click',$$.ovidLink.closeDialog);	
			
			//SLA link in topic
			$('#sla_in_page').bind('click', $$.logSLALinkEvent);
			$('#sla_footer').bind('click', $$.logSLALinkEvent);
			
		}, // End of bindEventHandlers

		/**
		 * Initializes the utd object.  The input data object contains all initialization parameters
		 * that must be processed within a JSP, e.g. parameters that are request attributes that
		 * must be set via EL expressions.
		 */
		init: function(data) {
			// Set all properties that were specified in the input data object.
			$$.contextPath = data.contextPath || $$.contextPath;
			$.extend($$.topic, {
				topicType: data.topicType || $$.topic.topicType,
				topicClass: data.topicClass || $$.topic.topicClass,
				topicKey: data.topicKey || $$.topic.topicKey
			});
			$$.pageType = data.pageType || $$.pageType;
			$.extend($$.image, {
				imageKey: data.imageKey || $$.image.imageKey,
				imageTitle: data.imageTitle || $$.image.imageTitle
			}); 
			$.extend($$.cme, {
				isTrack: data.trackCme || $$.cme.isTrack,
				lastTopicViewedDatabaseId: data.lastTopicViewedDatabaseId || $$.cme.lastTopicViewedDatabaseId			
			});
			$.extend($$.searchResults,{
				isSearchResults: data.isSearchResults || $$.searchResults.isSearchResults
			});
			$.extend($$.search,{
				onReadyUrl: data.onReadyUrl || $$.search.onReadyUrl
			});
			
			$.extend($$.showPleaseWait,{
				pwUrl: data.pwUrl || $$.showPleaseWait.pwUrl
			});
									
			if(data.isHomePage){
				$('#footer').addClass("home_support_tags");
				$('#topPanel').css("overflow", "hidden");
				
				$('#home_search').toggleClass("bkgnd1",!$('.loginbutton').anyMatches());
				$('#home_search').toggleClass("bkgnd2",$('.loginbutton').anyMatches());
			}
			
			$('#home_sidebar .sub_button a').toggleClass("sub", !data.isIndividualSubscribeBtn);
			$('#home_sidebar .sub_button a').toggleClass("ind_ben_button", data.isIndividualSubscribeBtn);
			
			if(data.isLayout){
				$('#smallSearchBox').addClass("old");
				if($('#simpleGreyBar').anyMatches()){
					$('#topPanel').css("overflow", "hidden");
				}
			}
			//initialize the News from UpToDate link
			$('#headerLinks').toggleClass("news", $('#newsLink').anyMatches());
			
			//ie7 hack because hasLayout gets triggered by padding and 
			//once there, you can't get rid of it.
			//This causes problems in print preview and the below fixes that by recreating
			//the headingAnchor class without padding.
			if($$.isIE7()){
				var ptmRef = $('#patTopicMiddle #references'); //patTopicMiddle ensures we are in a patient topic
				//printHeader makes sure we are in print preview
				if($('#printHeader').length && ptmRef.length){
					ptmRef.removeClass("headingAnchor");
					//re-create headingAnchor without padding
					ptmRef.css("margin-top","-74px");
					ptmRef.css("text-decoration","none");
					ptmRef.css("display","inline");
					ptmRef.css("position", "static");
					ptmRef.css("z-index", "auto");
				}
			}
			
			$$.findInPage.initialTerm = data.searchTerm || $$.findInPage.initialTerm;
			$$.isPrintView = data.isPrintView || $$.isPrintView; 

			// Initialize objects that need initializing.
			$$.dragbar.init();
			$$.findInPage.init();
			$$.outline.init();
			$$.warningMessage.init(data.isLayout);
			$$.tab(data.tabId || $$.tab.tabId);
			
			// Bind all event handlers.
			$$.bindEventHandlers();
			
			$$.cleanURLs();

			// By default we style the footer to flow after the main content.  Here determine if
			// we need to adjust the footer to stick to the bottom, and change the style appropriately 
			// if so.   See comments in the isFooterAdjustmentNeeded() function.
			if (isFooterAdjustmentNeeded()) {
				if ($('#searchResults').anyMatches()){
					$$.searchResults.adjustDivHeight();
				}
				$$.adjustFooter();
			}
			
			$('a.medCalcDisclaimerLink').data('window','scrollbars=yes,location=no,toolbar=no,menubar=no,resizable=yes,height=540,width=550');
			
			$$.isShowSurvey = data.showSurvey;
		} // End of init

	}; // End of utd
})(jQuery);

/**
 * Our anyMatches jQuery plug-in.  Returns true if the jQuery selector returns any matches
 * and false otherwise.  
 */
jQuery.fn.anyMatches = function() {
	var e = false;
	this.each(function() {
		e = true;
		return false;  // breaks out of the each loop
	});
	return e;
};

/**
 * Our htmlOuter jQuery plug-in.  This is similar to the jQuery html() method except that
 * it performs an "outer" HTML, returning the HTML of the first element itself wrapped around 
 * its "inner" HTML. 
 */
jQuery.fn.htmlOuter = function() {
  return $('<div>').append(this.first().clone()).html();
};

/**
 * Our offsetViewport jQuery plug-in.  This is similar to the jQuery offset() method except that
 * it calculates left and top from the element's position relative to the viewport, not the
 * document.  
 */
jQuery.fn.offsetViewport = function() {
  var offset = $(this).offset();  
  return {
    left: offset.left - $(window).scrollLeft(),
    top: offset.top - $(window).scrollTop()
  };
};

/**
 * Bind the utd object to window.utd and window.$$.
 */
window.utd = window.$$ = jQuery.utd;


// document.ready
$(document).ready(function() {
	// initialize back to search button if exists
	$$.backToSearch.setup();
	$$.search.setSearchFocus();
	$$.search.initSearch();
	$$.search.initAutoComplete();
});
