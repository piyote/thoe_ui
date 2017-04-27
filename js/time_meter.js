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
		render_status : 0, // add_two_divs: 1,2,3; remove_two_divs: 4, render: 5
		center_div : 0,
		y : 0,
		seconds_in_a_year : new BigNumber("31540000"),
		milky_way : new BigNumber("-4570000000"),
		human_prehistory : new BigNumber("-200000"),
		// max_division_seconds : new BigNumber("315400000000"),
		construct : function() {
			var meter_with = $("#meter").width();
			Meter.max_num_of_divs = Math.floor(meter_with/(Meter.min_div_width));
			Meter.initial_number_of_divisions = Math.round((Meter.min_num_of_divs+Meter.max_num_of_divs)/3);
			Thoe.timelines.forEach(function(timeline, index) {
				Meter.set_min_max(timeline.result.item,index);
		  	});
			Meter.render();
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
		render : function() {
			// divide main div into smaller parts
			if(Meter.y>0) {

				var item = $("#division_"+Meter.center_div);
				var secs = new BigNumber(parseFloat(item.attr("secs")));
				// var new_time = Meter.division_seconds.add(secs.multiply(Meter.initial_number_of_divisions));
				// Meter.min_time = secs;
				var mousex_convert = Meter.mousex_convert(Meter.mousex);
				var meter_with = $("#meter").width();
				var new_position_div_id = parseInt(mousex_convert/(meter_with/Meter.initial_number_of_divisions));
				// the old div should be placed under the mouse position
				var new_div_secs = Meter.division_seconds.divide(Meter.initial_number_of_divisions);
				Meter.min_time = (secs.subtract(new_div_secs.multiply(new_position_div_id)));
				Meter.max_time = Meter.min_time.add(Meter.division_seconds);
				
				Meter.control_max_min(false);
				
			} 
			$(".division").remove();
			Meter.recalculate_time_ranges(5);
			Meter.new_frames(Meter.initial_number_of_divisions);
		},
		control_max_min : function(render=false) {
			
			var min_sit = false;
			var max_sit = false;
			if(Meter.min_time.compare(Meter.universe_age)>0){
				min_sit = true;
			}
			
			if(Meter.max_time.compare(Meter.year_10000)>-1) {
				max_sit = true;
			}
			
			if(min_sit && max_sit) {
				// do nothing
				Meter.max_time = Meter.year_10000;
				console.log("both reached");
			}
			else {
				if(min_sit) {
					Meter.min_time = Meter.universe_age;
				}
				else if (max_sit) {
					Meter.max_time = Meter.year_10000;
				}
			}
			
			var total_seconds_on_timeline = Meter.max_time.subtract(Meter.min_time);
			Meter.division_seconds = total_seconds_on_timeline.divide(Meter.initial_number_of_divisions);
			
			if(render) {
				Meter.render();
			}
			
		},
		recalculate_time_ranges : function(render_status) {
			switch(render_status) {
				case 0:
					// do nothing
					break;
				case 1:
					Meter.min_time = Meter.min_time.subtract(Meter.division_seconds.multiply(2));
					Meter.control_max_min();
					break;
				case 2:
					Meter.min_time = Meter.min_time.subtract(Meter.division_seconds);
					Meter.max_time = Meter.max_time.add(Meter.division_seconds);
					Meter.control_max_min();
					break;
				case 3:
					Meter.max_time = Meter.max_time.add(Meter.division_seconds.multiply(2));
					Meter.control_max_min();
					break;					
				case 4:	
					Meter.min_time = Meter.min_time.add(Meter.division_seconds);
					Meter.max_time = Meter.max_time.subtract(Meter.division_seconds);
					Meter.control_max_min();
					break;
				case 5:
					// var total_seconds_on_timeline = Meter.max_time.subtract(Meter.min_time);
					// Meter.division_seconds = total_seconds_on_timeline.divide(Meter.initial_number_of_divisions);
					Meter.control_max_min();
					break;
			}
		},
		new_frames : function(num_of_divs,start_from = 0) {
			for(i=start_from;i<num_of_divs;i++) {
				var secs = Meter.min_time.add(Meter.division_seconds.multiply(i));
				
				var control = Meter.seconds_control(secs);
				if(control) {
					var division_html = "<div class='division_level_1 division' id='division_"+i+"' num='"+i+"' secs='"+secs+"'></div>";
					$("#main_meter").append(division_html);
					var meter_with = $("#meter").width();
					var division_width = meter_with/num_of_divs;
					$("#division_"+i).width(division_width);
					var format_time = Meter.format_seconds(secs);
					$("#division_"+i).html(format_time);
					$("#division_"+i).css("left",$("#division_"+i).attr("num")*$("#division_"+i).width());
				}
			}
		},
		mousex_convert : function(mousex) {
			var meter_width = $("#meter").width();
			var difference = (Thoe.width-meter_width)/2;
			
			if(mousex<difference) {
				mousex_convert = 0;
			}
			else if((mousex-difference)>meter_width) {
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
			
			var min_abs = Meter.min_time.abs();
			var universe_abs = Meter.universe_age.abs();
			
			var min_check = (min_abs.compare(universe_abs)<0);
			
			if(y<0) {
				if (min_check) {
					if(Meter.max_time.compare(Meter.year_10000)>-1) {
						// console.log("condition 1");
						left = meter_width-new_width*(num_of_divs-div_id);
					}
					else {
						// normal
						// console.log("condition 2");
					}
				}
				else {
					if(Meter.max_time.compare(Meter.year_10000)>-1) {
						// this shouldn't happen at all
						// console.log("condition 3");
					}
					else {
						left = div_id*new_width;
						// console.log("condition 4");
					}
				}
			}
			else {
				if(Meter.max_time.compare(Meter.year_10000)>-1) {
					// console.log("condition 5");
					// left = meter_width-new_width*(num_of_divs-div_id);
				}
				else {
					// console.log("condition 6");
				}
			}
			
			item.css("left",left);		
		},
		zoom_center : function(y,mousex) {
			var mousex_convert = Meter.mousex_convert(mousex);
			var real_mousex = mousex_convert + Math.abs(parseFloat($("#division_0").css("left")));
			var center_div_id = parseInt(real_mousex/$(".division").width());
			return center_div_id;
		},
		total_rerender : function(y,mousex) {
			if(((Meter.division_seconds<=1 && y>0)) || (Meter.min_time.compare(Meter.universe_age)<1 && Meter.max_time.compare(Meter.year_10000)>-1 && y<0) ) {
				return;
			}
			// var num_of_divs = $(".division").length;
			var first_item_initial_left = parseFloat($("#division_0").css("left"));
			var old_width = $(".division").width();
			var new_width = old_width*(1 + y/50);
			$(".division").width(new_width);
			
			$(".division").each(function(){
				Meter.calculate_left($(this),new_width,y,first_item_initial_left,old_width,mousex);
			});
			
			Meter.frame_control();
		},
		frame_control : function() {
			var num_of_divs = $(".division").length;
			var division_width = $(".division").width();
			var meter_with = $("#meter").width();
			
			if(num_of_divs>=Meter.max_num_of_divs) {
				Meter.render();
			}
			
			if(num_of_divs*division_width>=meter_with) {
				if(num_of_divs<=Meter.min_num_of_divs ) {
					Meter.render();
				}
				else {
					if(num_of_divs*division_width>=meter_with*2) {
						Meter.remove_two_divs();
					}
				}
			}
			else if(num_of_divs*division_width<meter_with*0.9) {
				Meter.add_two_divs();
			}
		},
		remove_two_divs : function() {
			$(".division:first-child").remove();
			$(".division:last-child").remove();
			$(".division").each(function(index){
				$(this).attr("id","division_"+index);
				$(this).attr("num",index);
			});

			Meter.recalculate_time_ranges(4);
		},
		seconds_control : function(secs) {
			var result = true;
			// if(secs.compare(Meter.universe_age)>0){
			// 	result = false;
			// 	Meter.min_time = Meter.universe_age;
			// 	// secs = Meter.min_time;
			// }
			// 
			if(secs.compare(Meter.year_10000)>0) {
				console.log("secs reached max");
				Meter.max_time = Meter.year_10000;
				result = false;
				// secs = Meter.max_time;
			}
			
			if(!result) {
				// Meter.render();
			}
			return result;
			// return true;
		},
		add_two_divs : function() {
			var control1 = control2 = control3 = control4 = control5 = false;
			if(Meter.min_time.compare(Meter.universe_age)) {
				if(Meter.max_time.compare(Meter.year_10000)<0) {
					
					var secs1 = Meter.min_time.subtract(Meter.division_seconds);
					var secs2 = Meter.max_time.add(Meter.division_seconds);
					
					control1 = Meter.seconds_control(secs1);
					control2 = Meter.seconds_control(secs2);
					
					if(control1 && control2) {
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

						Meter.recalculate_time_ranges(1);
					}
					
				}
				else {
					
					var secs3 = Meter.min_time.subtract(Meter.division_seconds);
					control3 = Meter.seconds_control(secs3);
					
					if(control3) {
						var division_html = "<div class='division_level_1 division' id='division_999' num='999'></div>";
						$("#main_meter").prepend(division_html);
						$("#division_999").width($("#division_0").width());

						var left = parseFloat($("#division_0").css("left")) - $("#division_0").width();
						$("#division_999").css("left", left);

						var division_html = "<div class='division_level_1 division' id='division_1000' num='1000'></div>";
						$("#main_meter").prepend(division_html);
						$("#division_1000").width($("#division_0").width());

						var num_of_divs = $(".division").length - 3;
						var left = parseFloat($("#division_0").css("left")) - $("#division_0").width()*2;
						$("#division_1000").css("left", left);

						Meter.recalculate_time_ranges(2);
					}

				}
			}
			else {
				
				var secs4 = Meter.max_time.add(Meter.division_seconds);
				var secs5 = Meter.max_time.add(Meter.division_seconds.multiply(2));
				
				control4 = Meter.seconds_control(secs4);
				control5 = Meter.seconds_control(secs5);
				
				if(control4) {
					var division_html = "<div class='division_level_1 division' id='division_999' num='999'></div>";
					$("#main_meter").append(division_html);
					$("#division_999").width($("#division_0").width());

					var num_of_divs = $(".division").length - 2;
					var left_1000 = parseFloat($("#division_"+num_of_divs).css("left")) + $("#division_0").width() ;

					$("#division_999").css("left", left_1000);
				}
				else {
					console.log("secs > max");
				}
				
				if(control5) {
					var division_html = "<div class='division_level_1 division' id='division_1000' num='1000'></div>";
					$("#main_meter").append(division_html);
					$("#division_1000").width($("#division_0").width());

					var num_of_divs = $(".division").length - 3;
					var left_1000 = parseFloat($("#division_"+num_of_divs).css("left")) + $("#division_0").width() ;
					$("#division_1000").css("left", left_1000);
				}
				
				else {
					console.log("secs > max 2");
				}
				
				if(control4 || control5) {
					Meter.recalculate_time_ranges(3);
				}
				
			}
			
			if(control1 || control2 || control3 || control4 || control5) {
				$(".division").each(function(index){
					var secs = Meter.min_time.add(Meter.division_seconds*index);
					$(this).attr("id","division_"+index);
					$(this).attr("num",index);
					$(this).attr("secs",secs);
					var format_time = Meter.format_seconds(secs);
					$(this).html(format_time);
				});
			}

		},
		scroll : function(x,y,factor,mousex,mousey) {
			Meter.center_div = Meter.zoom_center(y,mousex);
			Meter.total_rerender(y,mousex);
			Meter.y = y;
			Meter.mousex = mousex;
			$("#min").text(Meter.min_time);
			$("#max").text(Meter.max_time);
			$("#secs").text(Meter.division_seconds);
			Thoe.svg_jobs();
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
			
			var one_year = new BigNumber("31540000");
			var solar_system = new BigNumber("-287960200000000000");
			var text = "";			
			
			// between 13.7 - 9.13 billion years 
			if(solar_system.compare(round_seconds)) {
				var result = Meter.universe_age.subtract(round_seconds);
				result = result.multiply((-1));
				var check_zero = result.compare(0);
				
				if(check_zero == 0) {
					text = "Big bang";
				}
				else if(result.compare(0)  && result.compare(60)<=0) {
					text = result + " seconds";
				}
				else if(result.compare(60)>0 && result.compare(3600)<=0) {
					var minutes = parseFloat(result.divide(60)).toFixed(2);
					text = minutes + " minutes";
				}
				else if(result.compare(3600)>0 && result.compare(86400)<=0) {
					var hours = parseFloat(result.divide(3600)).toFixed(2);
					text = hours + " hours";
				}
				else if(result.compare(86400)>0 && result.compare(86400*7)<=0) {
					var days = parseFloat(result.divide(86400)).toFixed(2);
					text = days + " days";
				}
				else if(result.compare(86400*7)>0 && result.compare(86400*30)<=0) {
					var weeks = parseFloat(result.divide(86400*7)).toFixed(2);
					text = weeks + " weeks";
				}
				else if(result.compare(86400*30)>0 && result.compare(one_year)<=0) {
					var months = parseFloat(result.divide(86400*30)).toFixed(2);
					text = months + " months";
				}
				else if(result.compare(one_year)>0 && result.compare(one_year.multiply(1000))<=0) {
					var years = parseFloat(result.divide(one_year)).toFixed(2);
					text = years + " years";
				}
				else if(result.compare(one_year.multiply(1000))>0 && result.compare(one_year.multiply(1000000))<=0) {
					var ka = parseFloat(result.divide(one_year.multiply(1000))).toFixed(2);
					text = ka + " thousand years";
				}
				else if(result.compare(one_year.multiply(1000000))>0 && result.compare(one_year.multiply(1000000000))<=0) {
					var ma = parseFloat(result.divide(one_year.multiply(1000000))).toFixed(2);
					text = ma + " million years";
				}
				else if(result.compare(one_year.multiply(1000000000))>0) {
					var ga = parseFloat(result.divide(one_year.multiply(1000000000))).toFixed(2);
					text = ga + " billion years";
				}
			}
			var max = Meter.division_seconds.add(seconds);
			text = "<div class='division_secs' min='"+round_seconds+"' max='"+max+"'>"+text+"</div>"
			return text;
			
		},
		/*
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
		}*/
	}
})(jQuery);