// JavaScript Document 
	var DTI = DTI || {};
	DTI.namespace = function (nsString) {
		var parts = nsString.split('.'),
		parent = DTI, i;
		// strip redundant leading global
		if (parts[0] === "DTI") {
			parts = parts.slice(1);
		}
		for (i = 0; i < parts.length; i += 1) {
			// create a property if it doesn't exist
			if (typeof parent[parts[i]] === "undefined")
				parent[parts[i]] = {};
			parent = parent[parts[i]];
		}
		return parent;
	};

	/** TO RESOLVE UNDERSCORE JS/JSP CONFLICT */
	
	_.templateSettings = {
	    interpolate: /\<\@\=(.+?)\@\>/gim,
	    evaluate: /\<\@(.+?)\@\>/gim,
	    escape: /\<\@\-(.+?)\@\>/gim
	};

	/** SHOW/HIDE LOADING SPINNER */
	
	window.loadingSpinner = {
			show: function(selector) {
				var loadingDiv = $('<div class="loadingSpinner"></div>')
				if(selector)
					$(selector).append(loadingDiv);
				else {
					var wrapper = $('<div class="loading-wrapper"></div>')
					$('body').append(wrapper.html(loadingDiv));
				}
			},
			hide: function() {
				$('.loadingSpinner').fadeOut(function() {
					$(this).remove();
					$('.loading-wrapper').remove();
				});
			}
	}

	/** utils */	
	var AppUtils = {
			/** Scroll to bottom of the container */
			scrollToBottomOf: function(selector) {
				$(selector).scrollTop($(selector).prop("scrollHeight"));
			},
			/** Get file extension */
			getFileExtension: function(filename) {
			  var ext = /^.+\.([^.]+)$/.exec(filename);
			  return ext == null ? "" : ext[1];
			},
			/** MANAGE VIRTUAL: REMOVE THE NPI FROM THE CHOOSEN PROVIDERS LIST */
			removeObjectWithKey: function(array, id, keyToMatch) {
				return $.grep(array, function(item) {
					  return item[keyToMatch] != id;
				});
			},
			/** CONVERT ARRAY OF CHOSEN PROVIDER LIST TO COMMA SEPERATED VALUE */
			getCommaSeperatedIdsFromArray:  function(array, keyToPluck) {
				return _.pluck(_.filter(array, function(item) {return item[keyToPluck] != undefined }), keyToPluck).join(',');
			},
			addSeperatorIfNotEmpty: function(value,seperator) {
				if(value == null || value == '' || value == undefined)
					return '';
				else
					return value  +seperator + ' ';
			},
			isIOS : function() {
				return /iPad|iPhone|iPod/.test( navigator.userAgent );
			},
			formatPhone: function(number) {
			    var numbers = number.replace(/\D/g, ''),
			        char = {0:'(',3:') ',6:' - '};
			    number = '';
			    for (var i = 0; i < numbers.length; i++) {
			        number += (char[i]||'') + numbers[i];
			    }
			    return number;
			},
			hasValue: function(val) {
				if(val == undefined || val == null)
					return false;
				else if(val.trim() == '')
					return false;
				else
					return true;
			},
			getValue: function(val) {
				if(this.hasValue(val))
					return val;
				else
					return '';
			},
			swapListItems: function(firstItem, secondItem, callback) {
				var firstItemHeight =  firstItem.outerHeight(true);
				var secondItemHeight =  secondItem.outerHeight(true);
				firstItem.addClass('animate');
		    	secondItem.addClass('animate');
				firstItem.animate({'top': -firstItemHeight});
				secondItem.animate({'top':secondItemHeight});
		    	setTimeout(function(){
		    		secondItem.removeClass('animate');
		    		firstItem.removeClass('animate');
		    		firstItem.removeAttr('style');
					secondItem.removeAttr('style');
		    		firstItem.insertBefore(secondItem);
		    		callback();
		    	},500);
			},
			capitalizeFirstLetter: function (string) {
			    return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
			},

			isTouchDevice: function () {
				return (('ontouchstart' in window)
			      || (navigator.MaxTouchPoints > 0)
			      || (navigator.msMaxTouchPoints > 0));
			}
	} 


	$(function() {

		$.widget( "custom.dtiAutoComplete", $.ui.autocomplete, {
		    search: function( value, event ) {
		        value = value != null ? value : this._value();

				// always save the actual value, not the one passed as an argument
				this.term = this._value();

				if ( value.length < this.options.minLength ) {
					return;
				}

				if ( this._trigger( "search", event ) === false ) {
					return;
				}

				return this._search( value );
		    }
		});	
		
		/** add attr data-fancy-close to any link to close fancy box */
		$(document).on('click', '*[data-fancy-close]', function(e) {
			e.preventDefault();
			$.fancybox.close();
		});
		
		/** perform click on associated button on enter key */
		$(document).on('keypress', '*[on-enter-key]', function(e) {
			var associatedButton = $(this).attr('on-enter-key');
			if(e.which == 13) 
				$(associatedButton).trigger('click' , e );
		});
		
		/** Remove REMOVE-ON-CLICK messages when user clicks on the document */
		$(document).bind('click', function (event) { 
			$('*[hide-on-click]').fadeOut();
		});
		$(document).bind('click', function (event) { 
			var allowedExts = ['createVirtual','uploadFile','createGroupButton']
			if(allowedExts.indexOf(event.target.id) != -1) return;
			$('.remove-on-click').remove();
		});
		
		$(document).on('keyup','.ui-autocomplete-input',function(e) {
			if($(this).val() == '') $('.remove-on-click').remove();
		});

		/** truncate lengthier texts and add show hide buttons */
		$('*[truncate-text]').each(function() {
			var content = $(this).attr('data-content');
			var maxLimit = $(this).attr('truncate-text');
			if(content.length > maxLimit) {
				$(this).text(content.substr(0,maxLimit) + '...');
				$(this).append('<a href="#" class="js-show-truncated read-more-link">show more</a>');
				$(this).attr('content-hidden',true);
			}
			else
				$(this).text(content);
		})

		/** truncate lengthier texts and add show hide buttons */
		$(document).on('click', '.js-show-truncated', function(event) {
			event.preventDefault();
			var $parent = $(this).parent();
			var content = $parent.attr('data-content'),
				maxLimit = $parent.attr('truncate-text'),
				isContentHidden = $parent.attr('content-hidden');
				
			if(isContentHidden == 'true') { 
				$parent.text(content);
				$parent.append('<a href="#" class="js-show-truncated read-more-link">show less</a>');
				$parent.attr('content-hidden',false);
			} else {
				$parent.text(content.substr(0,maxLimit) + '...');
				$parent.append('<a href="#" class="js-show-truncated read-more-link">show more</a>');
				$parent.attr('content-hidden',true);
			}
		})
		
		/** Set min height for body to over come issues with fancybox */
		
		if ($(window).width() < 768) {
			$('.content').click(function() { $(".navbar-collapse").collapse('hide'); });
		} else if($(window).width() >= 768 && $(window).width() < 1025) {
			$('.content').click(function() { $(".navbar-nav.open").removeClass('open'); });
		} else {
			$('.navbar-nav .dropdown-toggle').removeAttr('data-toggle');
		}

		/** touch devices */
		if ("ontouchstart" in document.documentElement) {
			$('.navbar-dti .navbar-nav > li > ul.dropdown-menu > li > a').bind('touchstart touchend', function(e) {
		        $(this).toggleClass('hovered');
		    });
		}

		$('*[refresh-page-fade]').click(function(event) {
			event.preventDefault();
			$('body').fadeOut(1000, function() {
				window.location.reload();
			});
		});

		
		if(AppUtils.isTouchDevice()) {
			$.widget( "ui.selectmenu", $.ui.selectmenu, {
			    _renderItem: function( ul, item ) {
			    	var _li = $( "<li>" );
			    	_li.bind('touchstart', function() {
			    		$(this).siblings('li').removeClass('ui-state-focus')
			    		$(this).addClass('ui-state-focus');
			    	});
			        return _li.text( item.label ).appendTo( ul );
			    }
			});
		}
		
	});

/** START MENU JQUERY/CSS */

	 $(function() {
   	 	
		$('nav#menu').mmenu();
  
  	 });



/** START JQUERY OVERLAY/FANCYBOX */         

	$(function() {
		$('.fancybox').fancybox();
	});
	
/** START VIEW DISPLAY TOGGLE JQUERY */

	$(function() {
		$('#viewByToggle').tabs();
	});
	
	/** START JQUERY ADD/REMOVE */

    $(function() {
		var min_fields      = 1; //maximum input boxes allowed
		var addRemoveProvider         = $("#addRemoveProvider"); //Fields wrapper
		var addRemoveVirtual         = $("#addRemoveVirtual"); //Fields wrapper
		var add_provider    = $("#addAnotherProvider"); //Add button ID
		var add_virtual     = $("#addAnotherVirtual"); //Add button ID
		var add_location     = $("#addAnotherLocation"); //Add button ID
		var add_group     = $("#addAnotherGroup"); //Add button ID
	
	// autocomplete enablement
	
	///////////////////////////////////// JOAN - check this out for referencing the JSON: http://stackoverflow.com/questions/25396513/jquery-ui-autocomplete-with-external-json-file
	
		/* Code has been deleted */

  });
		

    
		//$("#lookUp").change();


	/** START JQUERY TABLE SORTING -*/      

	/* Code has been deleted */	
	
	/** START JQUERY EDIT IN PLACE */

	/* Code has been deleted */
		
	/** START LOCATION/GROUP CREATE MESSAGES */

	/* Code has been deleted */

	// end virtual location
	// start group name

	/* Code has been deleted */

	/** UPLOAD APPEARS */

	$(function() {
		$('#bulkPopup > div > input.createInput').attr("value", "");;
		if ($('#bulkPopup > div > input.createInput').val()) {
			$('#bulkPopup > #manageThisSaveCancel').show()
		} else {
			$('#bulkPopup > #manageThisSaveCancel').hide() 
		}
	});

	$(function(){
			$('.non-mcit-admin section div.disabled').remove();
	});
	