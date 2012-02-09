	function randomXToY(minVal,maxVal,floatVal) {
		var randVal = minVal+(Math.random()*(maxVal-minVal));
		return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
	}
	
var placeRandom = function(data) {
	//<li><a href="#" class="polaroid"><img src="' + data.thumbnail_url + '" alt=""></a></li>')
		var tempVal = Math.round(Math.random());
		if(tempVal == 1) {
			var rotDegrees = randomXToY(330, 360); // rotate left
		} else {
			var rotDegrees = randomXToY(0, 30); // rotate right
		}
		
		// Internet Explorer doesn't have the "window.innerWidth" and "window.innerHeight" properties
		if(window.innerWidth == undefined) { 
			var wiw = 1000;
			var wih = 700;
		} else {
			var wiw = window.innerWidth;
			var wih = window.innerHeight;	
		}
		
		//var posx = 200; // Math.random()*(wiw-400)
		//var posy = 80; //Math.random()*(wih-400)
		
		var posx =Math.random()*(wiw-700);
		var posy =Math.random()*(wih-500);
		
		
		var cssObj = { 'left' : posx,
			'top' : posy,
			'-webkit-transform' : 'rotate('+ rotDegrees +'deg)',  // safari only
			'transform' : 'rotate('+ rotDegrees +'deg)' }; // added in case CSS3 is standard

		$('<div class="polaroid"><img src="' + data.thumbnail_url + '" alt="' + data.title + '" /><p>' + data.title + '</p></div>').appendTo('#media').css(cssObj);	
		
	}
