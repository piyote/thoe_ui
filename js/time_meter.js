(function ($) {
	Meter = {
		min_time : new BigNumber("-435252000000000000"),
		max_time : new BigNumber("-435252000000000000"),
		meter_height : 50,
		universe_age : new BigNumber("-435252000000000000"), // 13.8 billion years times seconds in a year (3.154e+7)
		initial_number_of_divisions: 4,
		division_seconds : 0,
		min_division_seconds : 1,
		year_10000 : new BigNumber("315400000000"),
		construct : function() {
			Thoe.timelines.forEach(function(timeline, index) {
				Meter.set_min_max(timeline.result.item,index);
		  	});
			Meter.set_initial_line();
		},
		set_min_max : function(timeline,index) {
			var i = 0;
			var dates = [];
		  	timeline.forEach(function(item, key) { // create items on the timeline
    			var node_item = $("#map_"+index+"_item_"+key); // node item already created, just select it

				var tis = new BigNumber(item.time_in_seconds["#text"]);
				
				Meter.min_time = (tis.compare(Meter.min_time)) ? Meter.min_time : tis;
				Meter.max_time = (tis.compare(Meter.max_time)) ? tis : Meter.max_time;
				// dates.push(item.time_in_seconds["#text"]);
				
				// check if it's a big date
				//     			if(item.abbrevation["#text"]!="") {
				// 	// check if it's after big bang
				// 	if(item.agoafter["#text"]=="after") {
				// 		// var time = Meter.correct_big_date(item.time["#text"],item.abbrevation["#text"]);
				// 		// dates.push(time);
				// 		
				// 	}
				// }
    			i++;
		  	});
			// Meter.min_time = Math.min.apply(Math, dates);
			// Meter.max_time = Math.max.apply(Math, dates);
			// console.log(10-435252000000000000);
			// document.write(Meter.min_time);
			// document.write(Meter.max_time);
		},
		set_initial_line : function() {
			var main_meter_html = "<div id='main_meter' class='full_border'></div>";
			$("#meter").append(main_meter_html);

			// divide main div into smaller parts
			var total_seconds_on_timeline = Meter.max_time.subtract(Meter.min_time);
			// console.log(total_seconds_on_timeline);
			
			Meter.division_seconds = total_seconds_on_timeline.divide(Meter.initial_number_of_divisions);
			// Meter.division_seconds.ROUND_UP;
			// console.log(division_seconds);
			for(i=0;i<Meter.initial_number_of_divisions;i++) {
				var division_html = "<div class='division_level_1 division' id='division_"+i+"' num='"+i+"'></div>";
				$("#main_meter").append(division_html);
				var division_width = Thoe.width*0.9/Meter.initial_number_of_divisions-1;
				$("#division_"+i).width(division_width);
				var format_time = Meter.format_seconds(Meter.min_time.add(Meter.division_seconds*i));
				$("#division_"+i).text(format_time);
			}
		},
		create_new_divisions : function() {
			if(Meter.max_time<=Meter.year_10000) {
				var old_time_range = Meter.max_time.subtract(Meter.min_time);
				var number_of_divisions = $(".division").length;
				var meter_with = $("#meter").width();
				var new_division_width = $(".division").width();
				var new_number_of_divisions = Math.floor(meter_with/new_division_width);
				// var missing_divisions_number = new_number_of_divisions - number_of_divisions;
				var start_from = parseInt($(".division:last-child").attr("num")) + 1;
				Meter.max_time = Meter.max_time.add(Meter.division_seconds.multiply(new_number_of_divisions));
				Meter.max_time = (Meter.max_time>Meter.year_10000) ? Meter.year_10000 : Meter.max_time;
				// divide main div into smaller parts
				var total_seconds_on_timeline = Meter.max_time.subtract(Meter.min_time);
				// console.log(total_seconds_on_timeline);

				for(i=start_from;i<new_number_of_divisions;i++) {
					var division_html = "<div class='division_level_1 division' id='division_"+i+"' num='"+i+"'></div>";
					$("#main_meter").append(division_html);
					var division_width = Thoe.width*0.9/new_number_of_divisions-1;
					$("#division_"+i).width(division_width);
					var format_time = Meter.format_seconds(Meter.min_time.add(Meter.division_seconds*i));
					$("#division_"+i).text(format_time);
				}
			}
		},
		rerender_increase : function() {
			if(Meter.max_time<Meter.year_10000) {
				$(".division").remove();
				// divide main div into smaller parts
				var total_seconds_on_timeline = Meter.max_time.subtract(Meter.min_time);
				// document.write(total_seconds_on_timeline);

				Meter.division_seconds = total_seconds_on_timeline.divide(Meter.initial_number_of_divisions);
				Meter.division_seconds = (Meter.division_seconds<1) ? new BigNumber("1") : Meter.division_seconds;
				for(i=0;i<Meter.initial_number_of_divisions;i++) {
					var division_html = "<div class='division_level_1 division' id='division_"+i+"' num='"+i+"'></div>";
					$("#main_meter").append(division_html);
					var division_width = Thoe.width*0.9/Meter.initial_number_of_divisions-1;
					$("#division_"+i).width(division_width);
					var format_time = Meter.format_seconds(Meter.min_time.add(Meter.division_seconds*i));
					$("#division_"+i).text(format_time);
				}
			}
			
		},
		rerender_reduce : function() {
			if(Meter.max_time<=Meter.year_10000) {
				$(".division").remove();

				Meter.max_time = Meter.max_time.subtract(Meter.division_seconds.multiply(2));
				Meter.max_time = (Meter.max_time>Meter.year_10000) ? Meter.year_10000 : Meter.max_time;
				// divide main div into smaller parts
				var total_seconds_on_timeline = Meter.max_time.subtract(Meter.min_time);
				// document.write(total_seconds_on_timeline);

				Meter.division_seconds = total_seconds_on_timeline.divide(Meter.initial_number_of_divisions);
				Meter.division_seconds = (Meter.division_seconds<1) ? new BigNumber("1") : Meter.division_seconds;
				for(i=0;i<Meter.initial_number_of_divisions;i++) {
					var division_html = "<div class='division_level_1 division' id='division_"+i+"' num='"+i+"'></div>";
					$("#main_meter").append(division_html);
					var division_width = Thoe.width*0.9/Meter.initial_number_of_divisions-1;
					$("#division_"+i).width(division_width);
					var format_time = Meter.format_seconds(Meter.min_time.add(Meter.division_seconds*i));
					$("#division_"+i).text(format_time);
				}
			}
			
		},
		remove_divisions : function() {
			var division_width = $(".division").width();
			var meter_with = $("#meter").width();
			var number_of_visible_divisions = Math.ceil(meter_with/division_width);
			$( ".division:gt("+number_of_visible_divisions+")" ).remove();
		},
		scroll : function(x,y,factor) {
			// console.log(x,y,factor);
			// we only care about the scroll on the y axis
			
			if(y>0) {
				if(Meter.division_seconds>1) {
					$(".division").each(function(){
						$(this).width($(this).width()*(1+y/50));
						if($(this).width()>$("#meter").width()/2) {
							Meter.rerender_reduce();
						}
					});
					Meter.remove_divisions();
				}
			}
			else if(Meter.max_time<=Meter.year_10000) {
				$(".division").each(function(){
					if($(this).width()>100) {
						$(this).width($(this).width()/(1+Math.abs(y)/50));
					}
					else{
						Meter.rerender_increase();
					}
				});
				Meter.create_new_divisions();
			}
			$("#min").text(Meter.min_time);
			$("#max").text(Meter.max_time);
			$("#secs").text(Meter.division_seconds);
		},
		milestones : function() {
			// Big bang to solar system: 0 - 9.13 billion years AFTER BIG BANG (BIG BANG)  
			// Solar system to first homo sapiens 4,57 billion years AGO - 200,000 year ago (NATURAL HISTORY)
			// Homo sapiens to 10th millennium BC 200,000 year ago - 10,000 years ago Neolithic ages (HUMAN PREHISTORY)
			// 10th Millennium BC to 5th millennium BC (Every thousand years)
			// 40th century BC - 19th century BC (Every hundred years)
			// 1790s BC - 740s BC (Every decade)
			// 729BC - 1BC (Every year)
			// 1AD - 100AD (Every year)
			// 
		},
		format_seconds : function(seconds) {
			var round_seconds = seconds.intPart();
			return round_seconds;
			
		},
		correct_big_date : function(time,abbrevation) {
			var value = 0;
			switch(abbrevation) {
				case "zero":
					value = 0;
					break;
				case "neg":
					value = Math.pow(10,(time*(-1)));
					break;
				case "sec":
					value = time;
					break;
				case "min":
					value = time*60;
					break;
				case "hr":
					value = time*60*60;
					break;
				case "day":
					value = time*86400;
					break;
				case "we":
					value = time*86400*7;
					break;
				case "mo":
					value = time*86400*30;
					break;
				case "ye":
					value = time*86400*365;
					break;
				case "dec":
					value = time*86400*365*10;
					break;
				case "cen":
					value = time*86400*365*100;
					break;
				case "ka":
					value = time*86400*365*1000;
					break;
				case "ma":
					value = time*86400*365*1000000;
					break;
				case "ga":
					value = time*86400*365*1000000000;
					break;
			}
			// console.log(value);
			return value;
		}
	}
})(jQuery);