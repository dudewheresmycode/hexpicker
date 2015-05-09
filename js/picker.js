var picker = {
	rgb: {r:255,g:0,b:0},
	hsv: {h:0,s:100,v:100},
	hex: 'FF0000',
	pickerLastHex: 'FF0000',
	huedrag: false,
	shadedrag: false,
	init: function(){
		
		picker.setByHex();
		picker.setVals();
		picker.setHex();
		picker.setShaderBg();
		
		$('#hue-wrapper').mousedown(function(e){
			picker.huedrag=true;
			picker.handleHueDrag(e);
		});
		$("#shade-wrapper").mousedown(function(e){
			picker.shadedrag=true;
			picker.handleShadeDrag(e);
		});
		
		$(window).mousemove(function(e){
			if(picker.huedrag){
				picker.handleHueDrag(e);
			}
			if(picker.shadedrag){
				picker.handleShadeDrag(e);
			}
		}).mouseup(function(e){
			picker.huedrag=false;
			picker.shadedrag=false;
		});
		
		$("#colorhex").click(function(e){ $(this).select(); }).keypress(function(e){
			
			var key = e.which;
			var letter = String.fromCharCode(key);
			var reg = /^[0-9A-F]/i;
			var res = reg.test(letter);
			if(!res && !e.metaKey){
				e.preventDefault();
				return false;
			}
		}).keyup(function(){
			var v = $(this).val().toUpperCase();
			if(v.length==6 && picker.pickerLastHex!=v){
				picker.hex = v.toUpperCase();
				picker.setByHex();
				picker.pickerLastHex = picker.hex.toUpperCase();
			}
		});
		
		$(".hsvval").bind('input',function(e){
			var v = $(this).val();
			var t = $(this).attr('data-obj');
			picker.hsv[t] = parseInt(v);
			picker.rgb = picker.hsvToRgb(picker.hsv.h, picker.hsv.s, picker.hsv.v);
			picker.setPos();
			picker.setHex();
			picker.setShaderBg();				
			picker.setVals();

		});
		$(".rgbval").bind('input',function(e){
			var v = $(this).val();
			var t = $(this).attr('data-obj');
			picker.rgb[t] = parseInt(v);
			picker.hsv = picker.rgbToHsv(picker.rgb.r, picker.rgb.g, picker.rgb.b);
			picker.setPos();
			picker.setHex();
			picker.setShaderBg();				
			picker.setVals();
		});
		$(window).bind('hashchange',function(e){
			var h = window.location.hash.substr(2);
			if(h.length==6){
				picker.hashSet();
			}
		});
		picker.hashSet();		
		
	},
	hashSet: function(){
		var h = window.location.hash.substr(2);
		if(h.length==6 && h!=picker.hex){
			picker.hex = h;
			picker.setByHex();
		}
	},
	handleShadeDrag: function(e){
		var off_x = e.pageX-$("#shade-wrapper").offset().left;
		var off_y = e.pageY-$("#shade-wrapper").offset().top;
		off_x = off_x<0?0:off_x;
		off_x = off_x>256?256:off_x;
		
		off_y = off_y<0?0:off_y;
		off_y = off_y>256?256:off_y;
		
		$("#crosshair").css('top', (off_y-8)+'px').css('left', (off_x-8)+'px');

		picker.hsv.s = Math.round((off_x/256)*100);
		picker.hsv.v = Math.round(100-((off_y/256)*100));
		picker.rgb = picker.hsvToRgb(picker.hsv.h, picker.hsv.s, picker.hsv.v);
		
		picker.setVals();
		picker.setHex();

		
	},
	handleHueDrag: function(e){
		var hstop = e.pageY-$("#hue-wrapper").offset().top;
		hstop = hstop>0?hstop:0;
		hstop = hstop<255?hstop:255;
		$("#hue-slider").css('top', (hstop-4)+'px');

		var h = 360-Math.round((hstop/255)*360);
		h = h>359?0:h;
		picker.hsv.h = h;
		picker.rgb = picker.hsvToRgb(picker.hsv.h, picker.hsv.s, picker.hsv.v);
		picker.setVals();
		picker.setHex();
		picker.setShaderBg();				
	},
	setVals: function(){
		$("#val-h").val(picker.hsv.h);
		$("#val-s").val(picker.hsv.s);
		$("#val-v").val(picker.hsv.v);

		$("#val-r").val(picker.rgb.r);
		$("#val-g").val(picker.rgb.g);
		$("#val-b").val(picker.rgb.b);
		
						
	},
	setShaderBg: function(){
		var rgb_sel = picker.hsvToRgb(picker.hsv.h, 100, 100);				
		$("#shade-wrapper").css('background-color','rgb('+rgb_sel.r+','+rgb_sel.g+','+rgb_sel.b+')');				
	},
	setHashTime: null,
	setHex: function(){
		picker.hex = picker.rgbToHex(picker.rgb.r,picker.rgb.g,picker.rgb.b);
		picker.pickerLastHex = picker.hex.toUpperCase();
		$("#colorhex").val(picker.hex.toUpperCase()).css('background',"#"+picker.hex);				
		var col = picker.hsv.v<60?'rgba(255,255,255,0.55)':'rgba(0,0,0,0.55)';
		$("#colorhex").css('color',col);
		$("#colorhex").css('color',col);
		$("#crosshair").css('background',"#"+picker.hex);
		
		clearTimeout(picker.setHashTime);
		picker.setHashTime = setTimeout(picker.setHash, 100);
		
	},
	setHash: function(){
		window.location.hash = '#/'+picker.hex;		
	},
	loadImg: function(url, ctx){
		var im = new Image();
		im.onload = function(){ ctx.drawImage(this, 0, 0); }
		im.src = url;
	},
	componentToHex: function(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	},
	rgbToHex: function(r, g, b) {
		return picker.componentToHex(r) + picker.componentToHex(g) + picker.componentToHex(b);
	},
	setPos: function(){
		var t = 255-((picker.hsv.h/360)*255);
		$("#hue-slider").css('top',(t-4)+'px');
		
		var t2 = 255-(255*(picker.hsv.v/100));
		var l2 = (255*(picker.hsv.s/100));
		
		
		$("#crosshair").css('top', (t2-8)+'px').css('left', (l2-8)+'px');
		
	},
	setByHex: function(){
		picker.rgb = picker.hexToRgb(picker.hex);
		picker.hsv = picker.rgbToHsv(picker.rgb.r, picker.rgb.g, picker.rgb.b);
		
		picker.setPos();
		picker.setVals();
		picker.setHex();
		picker.setShaderBg();
	},
	swatches: [],
	swatch: function(){
		if($(".swatch-item").length<18){
		var col = picker.hsv.v<60?'rgba(255,255,255,0.55)':'rgba(0,0,0,0.55)';
		var $e = $('<a data-color="'+picker.hex+'" href="#/'+picker.hex+'" style="color:'+col+';background:#'+picker.hex+';" class="swatch-item">'+picker.hex+'</a>');
		$("#swatch-list").append($e);
		}else{
			alert('max swatches is 18');
		}
	},
	hexToRgb: function(h){
		function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
		return {r:parseInt((cutHex(h)).substring(0,2),16), g: parseInt((cutHex(h)).substring(2,4),16), b: parseInt((cutHex(h)).substring(4,6),16)};
	},
	hsvToRgb: function(h, s, v) {
		h = h/360;
		s = s/100;
		v = v/100;
	  var r, g, b;
	 
	  var i = Math.floor(h * 6);
	  var f = h * 6 - i;
	  var p = v * (1 - s);
	  var q = v * (1 - f * s);
	  var t = v * (1 - (1 - f) * s);
	 
	  switch (i % 6) {
	    case 0: r = v, g = t, b = p; break;
	    case 1: r = q, g = v, b = p; break;
	    case 2: r = p, g = v, b = t; break;
	    case 3: r = p, g = q, b = v; break;
	    case 4: r = t, g = p, b = v; break;
	    case 5: r = v, g = p, b = q; break;
	  }
	 
	  return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
	},
	rgbToHsv: function(r, g, b){
	    r = r/255, g = g/255, b = b/255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, v = max;
	
	    var d = max - min;
	    s = max == 0 ? 0 : d / max;
	
	    if(max == min){
	        h = 0; // achromatic
	    }else{
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }
	
	    return {h:Math.round(h*360), s:Math.round(s*100), v:Math.round(v*100)};
	}
};
