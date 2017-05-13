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
		language: "en",
		app_path : "app/views/nodes?display_id=page_1",
		colors : ["#a39cb8","#bf3faa","#8cbfd9","#8bae85","#8bd8e3","#ba9cca","#d07777","#c99be3","#c5ab3d","#ecdd83","#7d89df","#ecaae2","#557979","#9c7375"],
		timelines : [],
		node_details : [],
//		number_of_timelines : this.timelines.length,
		construct_page : function()
		{
			
			Thoe.max_items_on_a_line = Math.floor((this.width-this.left_padding)/this.item_width);
			if(document.domain=="localhost") {
				Thoe.service_url = "http://localhost/thoe_services/";
			}
			
			var options = {
				url: function(phrase) {
					return Thoe.service_url+"app/views/tags?display_id=page&language="+Thoe.language+"&name=" + phrase;
				},
				// url: Thoe.service_url+"app/views/tags?display_id=page&name="+$("#search_tag").val(),

				dataType: "xml",
				xmlElementName: "item",

				getValue: function(element) {
					return $(element).find("taxonomy_term_data_name").text();
				},

				list: {
					match: {
						enabled: true
					},
					onClickEvent: function() {
						Thoe.refresh_line();
					}
				}
			};

			$("#search_tag").easyAutocomplete(options);
			
			$("#search_tag").on('keyup', function (e) {
			    if (e.keyCode == 13) {
			    	Thoe.refresh_line();
			    }
			});
			var filter = {language: Thoe.language};
			Thoe.get_line(filter);
			var ndw_left = (Thoe.width -  $("#node_details_wrapper").width())/2;
			$("#node_details_wrapper").css("left",ndw_left);
			
			var search_left = (Thoe.width -  $("#search").width())/2;
			$("#search").css("left",search_left);
			
			$(".close").css("left",ndw_left);
		},
		get_line : function(filters) {
		  $.get( Thoe.service_url + Thoe.app_path, filters )
	      .done(function( data ) {
	    	var json_data = xmlToJson(data);
			var sorted = Thoe.rearrange_items(json_data);
	        Thoe.timelines.push(sorted);
			Meter.construct();
			Thoe.render();
			
			$("#main_wrapper").height(Thoe.height);
			$('#main_wrapper').on('mousewheel', function(event) {
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
		  Thoe.language = $("#lang_select option:selected").val();
		  var filters = "&field_tis_value[min]="+Meter.min_time+"&field_tis_value[max]="+Meter.max_time+"&language="+Thoe.language;
  		  if($("#search_tag").val()!="") {
			filters += "&field_free_tagging_tid="+$("#search_tag").val();
		  }
		  $(".timeline").remove();
		  $("#svg_canvas line").remove();
		  $.get( Thoe.service_url + Thoe.app_path + filters )
	      .done(function( data ) {
	    	var json_data = xmlToJson(data);
			var sorted = Thoe.rearrange_items(json_data);
			// console.log("refresh line");
			Thoe.timelines = [];
	        Thoe.timelines.push(sorted);
			// Meter.construct();
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
		rearrange_items : function(timeline) {
			if(Array.isArray(timeline.result.item)) {
				// console.log(timeline.result);
				var byDate = timeline.result.item.slice(0,Thoe.max_items_on_a_line);
				
				byDate.sort(function(a,b) {
					var c = new BigNumber(a.time_in_seconds["#text"]);
					var d = new BigNumber(b.time_in_seconds["#text"]);
					return c.subtract(d);
				    // return d.compare(c);
				});
				
				var sorted = {result:{item:byDate}};
				return sorted;
			}
			else {
				var item_pack = timeline.result.item;
				var result = {result:{item:[item_pack]}};
				return result;
			}
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
		  var absolute_total_items = (total_items>Thoe.max_items_on_a_line) ? Thoe.max_items_on_a_line : total_items;
		  
		  var i = 0;
		  timeline.forEach(function(item, key) { // create items on the timeline
    		// var hidden = (i<total_items) ? "" : "hidden";

			var item_html = "<div id='map_"+index+"_item_"+i+"' num='"+i+"' class='map_item'></div>";
   			new_map.append(item_html);
   			var new_item = $("#map_"+index+"_item_"+i);
   			new_item.css("top",(-1)*(Thoe.item_width-Thoe.line_height)/2); // todo: fix this to meet the relative height from top
   			new_item.css("width",Thoe.item_width);
   			new_item.css("height",Thoe.item_height);
   			var empty_space = (Thoe.width - Thoe.left_padding - Thoe.item_width*absolute_total_items)/absolute_total_items;
   			var one_item_absolute_width = empty_space + Thoe.item_width;
   			new_item.css("left",one_item_absolute_width*i*1+Thoe.left_padding);
			
			
			if(item.image["#text"]==undefined) {
				item.image["#text"] = "";
			}
			
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
			
			var admin_links = "<div class='admin_links'><a target='_blank' href = '" +Thoe.service_url + "/node/"+ +item.nid["#text"]  + "/edit'>Edit</a> | <a target='_blank' href = '" +Thoe.service_url + "/thoe/delete/"+ +item.nid["#text"]  + "'>Delete</a></div>";
			var books_html = item.book["#text"];
			var videos_html = item.video_reference["#text"];
			
			books_html = (books_html==undefined) ? "": books_html;
			videos_html = (videos_html==undefined) ? "": videos_html;
			
			var tags = "<div class='tags'>"+item.free_tagging["#text"]+"</div>";
			var node_details = "<div class='first_details_wrapper'>"+admin_links+"<div class='date_in_details'>"+date + "</div>" + "<div class='node_title_in_details'>"+item.node_title["#text"] + " </div>" + item.body["#text"] +"</div>"+ books_html + videos_html + tags;
			Thoe.node_details[i] = node_details;
			i++;
   			
			$(".node_title").each(function(){
				var text = $(this).text();
				var new_text = text.substring(0,56);
				var rest = text.substring(56,150);
				var final_text = new_text + "<div class='text_rest'>"+rest+"</div>";
				$(this).html(final_text);
			});
			
			$(".map_item").mouseover(function(){
				$(this).find(".text_rest").show();
			});
			
			$(".map_item").mouseout(function(){
				$(this).find(".text_rest").hide();
			});
			
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
				else if(item.agoafter["#text"]=="ago") {
					date += " ago";
				}
				else {
					var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
					var full_date = (item.month["#text"]>0) ? monthNames[item.month["#text"]-1] + " ": "";
					full_date = (item.day["#text"]>0) ? full_date + item.day["#text"] + ", " : "";
					date = full_date + item.year["#text"]
					if(item.ad_bc["#text"]=="BC") {
						date = date + " BC"; 
					}
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










