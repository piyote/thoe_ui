// Changes XML to JSON
function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

(function ($) {
	$(document).ready(function(){
		// $("#main_wrapper").height(Thoe.height);
		// 		$('body').on('mousewheel', function(event) {
		// 		    Meter.scroll(event.deltaX, event.deltaY, event.deltaFactor,event.pageX,event.pageY);
		// 			event.preventDefault();
		// 		});
		
		$("#shortcuts li").on('click',function(){
			switch($(this).attr("time")) {
				case "bigbang":
					Meter.min_time = Meter.universe_age;
					Meter.max_time = Meter.universe_age.add(100);
					Meter.division_seconds = new BigNumber("10");
					break;
				case "natural":
					Meter.min_time = Meter.seconds_in_a_year.multiply(Meter.milky_way);
					var till = new BigNumber("-200000");
					Meter.max_time = till.multiply(Meter.seconds_in_a_year);
					Meter.division_seconds = new BigNumber("10");
					break;
				case "prehistory":
					Meter.min_time = Meter.seconds_in_a_year.multiply(Meter.human_prehistory);
					Meter.max_time = Meter.seconds_in_a_year.multiply(-10000);
					Meter.division_seconds = new BigNumber("10");
					break;
				case "10_5_bc":
					var till = new BigNumber("-10000");
					Meter.min_time = till.multiply(Meter.seconds_in_a_year);
					var mill = new BigNumber("-5000");
					Meter.max_time = mill.multiply(Meter.seconds_in_a_year);
					Meter.division_seconds = new BigNumber("10");
					break;
				case "40_19_c":
					var till = new BigNumber("-5000");
					Meter.min_time = till.multiply(Meter.seconds_in_a_year);
					var mill = new BigNumber("-1900");
					Meter.max_time = mill.multiply(Meter.seconds_in_a_year);
					Meter.division_seconds = new BigNumber("10");
					break;
				case "1790_740_bc":
					var till = new BigNumber("-1790");
					Meter.min_time = till.multiply(Meter.seconds_in_a_year);
					var mill = new BigNumber("-740");
					Meter.max_time = mill.multiply(Meter.seconds_in_a_year);
					Meter.division_seconds = new BigNumber("10");
					break;
				case "0":
					Meter.min_time = new BigNumber("0");
					var till = new BigNumber("2000");
					Meter.max_time = till.multiply(Meter.seconds_in_a_year);
					Meter.division_seconds = new BigNumber("10");
					break;
			}
			Thoe.refresh_line();
			// var total_seconds_on_timeline = Meter.max_time.subtract(Meter.min_time);
			// Meter.division_seconds = total_seconds_on_timeline.divide(Meter.initial_number_of_divisions);
			Meter.render();
		});
		
		$("#main_meter").on('click','.division_secs',function(){
			Meter.min_time = new BigNumber($(this).attr("min"));
			Meter.max_time = new BigNumber($(this).attr("max"));
			Thoe.refresh_line();
			Meter.render();
		});			
		
	});
})(jQuery);













