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
		min_div_width: 100,
		min_num_of_divs : 3,
		max_num_of_divs : 7,
		max_division_seconds : new BigNumber("315400000000"),
		construct : function() {
			var meter_with = $("#meter").width();
			// Meter.min_num_of_divs = Math.ceil(meter_with/(Meter.min_div_width*4));
			Meter.max_num_of_divs = Math.floor(meter_with/(Meter.min_div_width));
			Meter.initial_number_of_divisions = Math.round((Meter.min_num_of_divs+Meter.max_num_of_divs)/3);
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
				
    			i++;
		  	});
		},
		set_initial_line : function() {
			var main_meter_html = "<div id='main_meter' class='full_border'></div>";
			$("#meter").append(main_meter_html);
			Meter.render();
		},
		render : function() {
			$(".division").remove();
			// divide main div into smaller parts
			var total_seconds_on_timeline = Meter.max_time.subtract(Meter.min_time);
			
			Meter.division_seconds = total_seconds_on_timeline.divide(Meter.initial_number_of_divisions);
			Meter.new_frames(Meter.initial_number_of_divisions);
		},
		new_frames : function(num_of_divs,start_from = 0) {
			for(i=start_from;i<num_of_divs;i++) {
				var division_html = "<div class='division_level_1 division' id='division_"+i+"' num='"+i+"'></div>";
				$("#main_meter").append(division_html);
				var meter_with = $("#meter").width();
				var division_width = meter_with/num_of_divs;
				$("#division_"+i).width(division_width);
				var format_time = Meter.format_seconds(Meter.min_time.add(Meter.division_seconds*i));
				$("#division_"+i).text(format_time);
				$("#division_"+i).css("left",$("#division_"+i).attr("num")*$("#division_"+i).width());
				// Meter.recalculate_max_secs();
			}
			// Meter.recalculate_division_secs();
		},
		remove_divisions : function() {
			var division_width = $(".division").width();
			var meter_with = $("#meter").width();
			var number_of_visible_divisions = Math.ceil(meter_with/division_width);
			$( ".division:gt("+number_of_visible_divisions+")" ).remove();
			Meter.recalculate_max_secs();
		},
		recalculate_division_secs : function() {
			var num_of_divs = $(".division").length;
			var total_seconds_on_timeline = Meter.max_time.subtract(Meter.min_time);
			Meter.division_seconds = total_seconds_on_timeline.divide(num_of_divs);
			// Meter.division_seconds = Meter.division_seconds.intPart();
			Meter.division_seconds = (Meter.division_seconds<1) ? new BigNumber("1") : Meter.division_seconds;
			// Meter.division_seconds = (Meter.division_seconds>=Meter.max_division_seconds) ? Meter.max_division_seconds : Meter.division_seconds;
		},
		recalculate_max_secs : function() {
			var num_of_divs = $(".division").length;
			Meter.max_time = Meter.min_time.add(Meter.division_seconds.multiply(num_of_divs));
			// Meter.max_time = Meter.max_time.intPart();
			// Meter.max_time = (Meter.max_time>Meter.year_10000) ? Meter.year_10000 : Meter.max_time;
		},
		recalculate_min_secs : function() {
			var num_of_divs = $(".division").length;
			Meter.min_time = Meter.max_time.subtract(Meter.division_seconds.multiply(num_of_divs));
			// Meter.max_time = Meter.max_time.intPart();
			// Meter.min_time = (Meter.min_time>Meter.year_10000) ? Meter.year_10000 : Meter.max_time;
		},
		zoom_center : function(y,mousex) {
			var meter_width = parseFloat($("#meter").width());
			var difference = (Thoe.width-meter_width)/2;
			var num_of_divs = $(".division").length;
			
			var mousex_convert = Meter.mousex_convert(mousex);

			var center_div_id = Math.ceil(mousex_convert/meter_width*num_of_divs);
			// console.log(center_div_id);
			return center_div_id;
		},
		mousex_convert : function(mousex) {
			var meter_width = $("#meter").width();
			var difference = (Thoe.width-meter_width)/2;
			
			if(mousex<difference) {
				mousex_convert = 0;
			}
			else if(mousex>meter_width) {
				mousex_convert = meter_width;
			}
			else {
				mousex_convert = mousex - difference;
			}
			return mousex_convert;
		},
		calculate_left : function(item,new_width,y,first_item_initial_left,old_width,mousex) {	
			
			var mousex_convert = Meter.mousex_convert(mousex);
			var meter_width = $("#meter").width();
			var num_of_divs = $(".division").length;
			var div_id = parseInt(item.attr("num"));
			var c = 1+y/50;
			
			var left = mousex_convert/meter_width*((num_of_divs)*(c-1)*old_width)*(-1)+first_item_initial_left+div_id*new_width;
			
			if(y<0 && !Meter.min_time.compare(Meter.universe_age)) {
				left = div_id*new_width;
			}
			else {
				if(Meter.max_time>Meter.year_10000) {
					left = meter_width-new_width*(num_of_divs-div_id);
				}
				else if(!Meter.min_time.compare(Meter.universe_age)) {
					left = div_id*new_width;
				}
			}
			
			item.css("left",left);		

		},
		total_rerender : function(y,mousex) {
			if((Meter.division_seconds<=1 && y>0) || (Meter.max_time>=Meter.year_10000 && y<0)) {
				return;
			}
			var num_of_divs = $(".division").length;
			var first_item_initial_left = parseFloat($("#division_0").css("left"));
			var old_width = $(".division").width();
			var new_width = old_width*(1 + y/50);
			var total_expand = new_width - old_width;
			$(".division").width(new_width);
			
			// 1. change division widths
			$(".division").each(function(){
				Meter.calculate_left($(this),new_width,y,first_item_initial_left,old_width,mousex);
			});
			
			// 2. create new divs
			// var meter_with = $("#meter").width();
			// var new_division_width = $(".division").width();
			// var new_number_of_divisions = Math.floor(meter_with/new_division_width);
			// var start_from = parseInt($(".division:last-child").attr("num")) + 1;
			
			// Meter.new_frames(new_number_of_divisions,start_from);
			
			// 3. remove divisions if there are more than allowed visible
			// Meter.remove_divisions();
			
			// 4. can divs fit?
			// var num_of_divs = $(".division").length;
			// var division_width = $(".division").width();
			// var max_num_of_divs = Math.ceil(meter_with/Meter.min_div_width);
			// if(num_of_divs<=Meter.min_num_of_divs || num_of_divs>max_num_of_divs) {
			// 	if(Meter.division_seconds>=Meter.min_division_seconds) {
			// 		Meter.render();
			// 	}
			// }
			Meter.frame_control();
		},
		frame_control : function() {
			var num_of_divs = $(".division").length;
			var division_width = $(".division").width();
			var meter_with = $("#meter").width();
			if(num_of_divs*division_width>=meter_with*1.5) {
				if(num_of_divs<=Meter.min_num_of_divs ) {
					Meter.render();
				}
				else {
					Meter.remove_two_divs();
				}
			}
			else if(num_of_divs*division_width<meter_with*0.9) {
				// console.log("we need to add new divs from both sides.");
				Meter.add_two_divs();
			}

			// Meter.recalculate_max_secs();
			// 			Meter.recalculate_min_secs();
			// Meter.recalculate_division_secs();
		},
		remove_two_divs : function() {
			$(".division:first-child").remove();
			$(".division:last-child").remove();
			$(".division").each(function(index){
				$(this).attr("id","division_"+index);
				$(this).attr("num",index);
			});
			Meter.min_time = Meter.min_time.add(Meter.division_seconds);
			Meter.max_time = Meter.max_time.subtract(Meter.division_seconds);
		},
		add_two_divs : function() {
			var num_of_divs = $(".division").length;
			if(num_of_divs>=Meter.max_num_of_divs) {
				Meter.render();
			}
			
			if(Meter.min_time.compare(Meter.universe_age)) {
				var division_html = "<div class='division_level_1 division' id='division_999' num='999'></div>";
				$("#main_meter").prepend(division_html);
				$("#division_999").width($("#division_0").width());

				var left = parseFloat($("#division_0").css("left")) - $("#division_0").width();
				$("#division_999").css("left", left);

				var division_html = "<div class='division_level_1 division' id='division_1000' num='1000'></div>";
				$("#main_meter").append(division_html);
				$("#division_1000").width($("#division_0").width());

				var num_of_divs = $(".division").length - 3;
				var left_1000 = parseFloat($("#division_"+num_of_divs).css("left")) + $("#division_0").width() ;
				$("#division_1000").css("left", left_1000);
				
				Meter.min_time = Meter.min_time.subtract(Meter.division_seconds);
				Meter.max_time = Meter.max_time.add(Meter.division_seconds);
			}
			else {
				// console.log("limit exceed");
				var division_html = "<div class='division_level_1 division' id='division_999' num='999'></div>";
				$("#main_meter").append(division_html);
				$("#division_999").width($("#division_0").width());

				var num_of_divs = $(".division").length - 2;
				var left_1000 = parseFloat($("#division_"+num_of_divs).css("left")) + $("#division_0").width() ;
				
				$("#division_999").css("left", left_1000);

				var division_html = "<div class='division_level_1 division' id='division_1000' num='1000'></div>";
				$("#main_meter").append(division_html);
				$("#division_1000").width($("#division_0").width());

				var num_of_divs = $(".division").length - 3;
				var left_1000 = parseFloat($("#division_"+num_of_divs).css("left")) + $("#division_0").width() ;
				$("#division_1000").css("left", left_1000);
				
				Meter.max_time = Meter.max_time.add(Meter.division_seconds.multiply(2));
			}
			
			
			$(".division").each(function(index){
				$(this).attr("id","division_"+index);
				$(this).attr("num",index);
				var format_time = Meter.format_seconds(Meter.min_time.add(Meter.division_seconds*index));
				$(this).text(format_time);
			});

		},
		scroll : function(x,y,factor,mousex,mousey) {
			Meter.total_rerender(y,mousex);
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