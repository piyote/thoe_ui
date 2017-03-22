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
		app_path : "app/views/nodes?display_id=page_1",
		colors : ["#a39cb8","#bf3faa","#8cbfd9","#8bae85","#8bd8e3","#ba9cca","#d07777","#c99be3","#c5ab3d","#ecdd83","#7d89df","#ecaae2","#557979","#9c7375"],
		timelines : [],
//		number_of_timelines : this.timelines.length,
		construct_page : function()
		{
			Thoe.get_line();
			Thoe.max_items_on_a_line = Math.floor((this.width-this.left_padding)/this.item_width);
		},
		get_line : function(filters) {
		  $.get( Thoe.service_url + Thoe.app_path, filters )
	      .done(function( data ) {
	    	var json_data = xmlToJson(data);
	        Thoe.timelines.push(json_data);
	        Thoe.render();
	      });
		},
		render : function() {
		  var nodes = [];
		  Thoe.timelines.forEach(function(timeline, index) {
			Thoe.set_timeline(timeline.result.item,index);
		  });
		  
		  $("#timeline_0").css("top",(Thoe.height-Thoe.line_height)/2);
		  $("#timeline_0").css("height",Thoe.line_height);
		},
		set_timeline : function(timeline, index) { // create timeline for each line
		  var timeline_html = "<div class='timeline' id='timeline_"+index+"'></div>";
		  $("#map").append(timeline_html);
		  
		  var rand_color_index = Math.floor(Math.random() * Thoe.colors.length);
		  var rand_color = Thoe.colors[rand_color_index];
		  Thoe.colors.splice(rand_color_index,1);
		  var new_map = $("#timeline_"+index);
		  new_map.css("background-color",rand_color);
		  
		  var total_items = timeline.length;
		  total_items = (total_items>Thoe.max_items_on_a_line) ? Thoe.max_items_on_a_line : total_items;
		  
		  var i = 0;
		  timeline.forEach(function(item, key) { // create items on the timeline
    		if (i<total_items) {
    			var item_html = "<div id='map_"+index+"_item_"+key+"' class='map_item'></div>";
    			new_map.append(item_html);
    			var new_item = $("#map_"+index+"_item_"+key);
    			new_item.css("top",(-1)*(Thoe.item_width-Thoe.line_height)/2); // todo: fix this to meet the relative height from top
    			new_item.css("width",Thoe.item_width);
    			new_item.css("height",Thoe.item_height);
    			var empty_space = (Thoe.width - Thoe.left_padding - Thoe.item_width*total_items)/total_items;
    			var one_item_absolute_width = empty_space + Thoe.item_width;
    			new_item.css("left",one_item_absolute_width*key+Thoe.left_padding);
    			i++;
    		}
		  });
		}
	}
	
	$(window).resize(function() {
	  Thoe.width = $(window).width();
	  Thoe.height = $(window).height();
	  $("#timeline_0").css("top",Thoe.height/2);
	});
	
	Thoe.construct_page();
	

})(jQuery);










