(function ($) {

	Thoe = {
		width: $(window).width(),
		height: $(window).height(),
		line_height: 10,
		item_width : 200,
		item_height : 200,
		max_items_on_a_line : 10,
		left_padding : 100,
		service_url : "http://services.thoe.co/",
//		service_url : "http://localhost/thoe_services/",
		app_path : "app/views/nodes?display_id=page_1",
		colors : ["#a39cb8","#bf3faa","#8cbfd9","#8bae85","#8bd8e3","#ba9cca","#d07777","#c99be3","#c5ab3d","#ecdd83","#7d89df","#ecaae2","#557979","#9c7375"],
		timelines : [],
//		number_of_timelines : this.timelines.length,
		construct_page : function()
		{
			
			Thoe.max_items_on_a_line = Math.floor((this.width-this.left_padding)/this.item_width);
			if(document.domain=="localhost") {
				Thoe.service_url = "http://localhost/thoe_services/";
			}
			Thoe.get_line();
		},
		get_line : function(filters) {
		  $.get( Thoe.service_url + Thoe.app_path, filters )
	      .done(function( data ) {
	    	var json_data = xmlToJson(data);
	        Thoe.timelines.push(json_data);
			     Meter.construct();
			Thoe.render();
			
			$("#main_wrapper").height(Thoe.height);
			$('body').on('mousewheel', function(event) {
			    Meter.scroll(event.deltaX, event.deltaY, event.deltaFactor,event.pageX,event.pageY);
				event.preventDefault();
				
				clearTimeout($.data(this, 'scrollTimer'));
			    $.data(this, 'scrollTimer', setTimeout(function() {
			        Thoe.refresh_line();
			    }, 250));
			});
	      });
		},
		refresh_line : function() {
		  var filters = "&field_tis_value[min]="+Meter.min_time+"&field_tis_value[max]="+Meter.max_time;
		  $(".timeline").remove();
		  $("#svg_canvas line").remove();
		  $.get( Thoe.service_url + Thoe.app_path + filters )
	      .done(function( data ) {
	    	var json_data = xmlToJson(data);
			Thoe.timelines = [];
	        Thoe.timelines.push(json_data);
			Thoe.render();
			
			$("#main_wrapper").height(Thoe.height);
			// $('body').on('mousewheel', function(event) {
			//     Meter.scroll(event.deltaX, event.deltaY, event.deltaFactor,event.pageX,event.pageY);
			// 	event.preventDefault();
			// 	
			// });
	      });
		},
		render : function() {
		  var nodes = [];
		  Thoe.timelines.forEach(function(timeline, index) {
			Thoe.set_timeline(timeline.result.item,index);
		  });
			Thoe.svg_jobs();
		// $("#svg_map").attr("height",Thoe.height);
		},
		set_timeline : function(timeline, index) { // create timeline for each line
		  var timeline_html = "<div class='timeline' id='timeline_"+index+"'></div>";
		  $("#map").append(timeline_html);
		
		  // todo: parameter needed here, shouldn't address as 0
		  $("#timeline_0").css("top",(Thoe.height-Thoe.line_height)/2);
		  $("#timeline_0").css("height",Thoe.line_height);
		  
		  var rand_color_index = Math.floor(Math.random() * Thoe.colors.length);
		  var rand_color = Thoe.colors[rand_color_index];
		  // Thoe.colors.splice(rand_color_index,1);
		  var new_map = $("#timeline_"+index);
		  new_map.css("background-color",rand_color);
		  
		  var total_items = timeline.length;
		  total_items = (total_items>Thoe.max_items_on_a_line) ? Thoe.max_items_on_a_line : total_items;
		  
		  var i = 0;
		  timeline.forEach(function(item, key) { // create items on the timeline
    		var hidden = (i<total_items) ? "" : "hidden";
			
   			var item_html = "<div id='map_"+index+"_item_"+key+"' class='map_item "+hidden+"'></div>";
   			new_map.append(item_html);
   			var new_item = $("#map_"+index+"_item_"+key);
   			new_item.css("top",(-1)*(Thoe.item_width-Thoe.line_height)/2); // todo: fix this to meet the relative height from top
   			new_item.css("width",Thoe.item_width);
   			new_item.css("height",Thoe.item_height);
   			var empty_space = (Thoe.width - Thoe.left_padding - Thoe.item_width*total_items)/total_items;
   			var one_item_absolute_width = empty_space + Thoe.item_width;
   			new_item.css("left",one_item_absolute_width*key+Thoe.left_padding);
   			
			item.image["#text"] = (item.image["#text"]!=undefined) ? item.image["#text"] : "";
   			new_item.append("<div class='node_image' >"+item.image["#text"]+"</div>");
			new_item.attr("secs",item.time_in_seconds["#text"]);
   			
   			var img_url = new_item.find(".node_image img").attr("src");
   			
			if(item.image["#text"]!=undefined) {
				new_item.find(".node_image").css("background-image","url('"+img_url+"')");
	   			new_item.find(".node_image img").remove();
			}
			var date = Thoe.date_format(item);
			var date_top = Thoe.item_width*0.84;
			var node_top = Thoe.item_width*0.925;
			new_item.append("<div class='node_date' style='width:"+Thoe.item_width+"px;top:"+date_top+"px;'>"+date+"</div>");
			new_item.append("<div class='node_title' style='width:"+Thoe.item_width+"px;top:"+node_top+"px;'>"+item.node_title["#text"]+"</div>");

   			i++;
		  });
		},
		date_format : function(item) {
			var date = "";
			if(item.time["#text"]!==undefined) {
				date += item.time["#text"];
			}
			if(item.abbrevation["#text"]=="neg") {
				date = " x 10^-"+item.time["#text"]+" after big bang";
			}
			else{
				switch (item.abbrevation["#text"]) {
					case "zero":
						date = "0 seconds";
						break;
					case "sec":
						date += " Seconds";
						break;
					case "min":
						date += " Minutes";
						break;
					case "hr":
						date += " Hours";
						break;
					case "day":
						date += " Days";
						break;
					case "we":
						date += " Weeks";
						break;
					case "mo":
						date += " Months";
						break;
					case "ye":
						date += " Years";
						break;
					case "dec":
						date += " Decades";
						break;
					case "cen":
						date += " Centuries";
						break;
					case "ka":
						date += " Thousand years";
						break;
					case "ma":
						date += " Million Years";
						break;
					case "ga":
						date += " Billion years";
						break;
				}
				if(item.agoafter["#text"]=="after") {
					date += " after big bang";
				}
				else {
					date += " ago";
				}
			}
			return date;
		},
		svg_jobs: function(item) {
			$("#svg_canvas line").remove();
			$(".timeline .map_item").each(function(){
				if(!$(this).hasClass("hidden")) {
					var offset = $(this).parent().offset();
					var top = offset.top;
					var offset_own = $(this).offset();
					var left = offset_own.left;
					var svg = $(this).children("svg");

					// calculate the svg line directions
					var meter_width = $("#meter").width();

					var item_time = new BigNumber($(this).attr("secs"));
					var item_time_diff = item_time.subtract(Meter.min_time);
					var total_meter_time = Meter.max_time.subtract(Meter.min_time);

					var current_y = parseFloat(item_time_diff.multiply(meter_width).divide(total_meter_time)).toFixed(4);
					var meter_beginning = (Thoe.width-meter_width)/2;
					var current_y_add = parseInt(current_y)+parseInt(meter_beginning);
					

					var x1=left+$(this).width()/2;
					var y1=top;

					var x2=current_y_add;
					// var y2=Thoe.height-top-Meter.meter_height-Thoe.line_height/2+$(this).height()/2;
					var y2 = Thoe.height-Meter.meter_height;

					var svg = document.getElementsByTagName('svg_canvas')[0]; //Get svg element
					var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
					// newLine.setAttribute('id','line2');
					newLine.setAttribute('x1',x1);
					newLine.setAttribute('y1',y1);
					newLine.setAttribute('x2',x2);
					newLine.setAttribute('y2',y2);
					newLine.setAttribute("stroke", "#eee")
					$("#svg_canvas").append(newLine);
				}
				
				
			});
			
		},
		set_date : function() {
			
		}
	}
	
	$(window).resize(function() {
	  Thoe.width = $(window).width();
	  Thoe.height = $(window).height();
	  $("#timeline_0").css("top",Thoe.height/2);
	  Thoe.svg_jobs();
	});
	
	$(document).ready(function(){
		Thoe.construct_page();
	});

})(jQuery);










