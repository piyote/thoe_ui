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

function stripHTML(dirtyString) {
  var container = document.createElement('div');
  var text = document.createTextNode(dirtyString);
  container.appendChild(text);
  return container.innerHTML; // innerHTML will be a xss safe string
}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year;
  return time;
}

(function ($) {
	$(document).ready(function(){
		// $("#main_wrapper").height(Thoe.height);
		// 		$('body').on('mousewheel', function(event) {
		// 		    Meter.scroll(event.deltaX, event.deltaY, event.deltaFactor,event.pageX,event.pageY);
		// 			event.preventDefault();
		// 		});
		
		$("#lang_select").change(function(){
			Thoe.language = $("#lang_select option:selected");
			Thoe.refresh_line();
		})
		
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
				case "1790_500_bc":
					var till = new BigNumber("-1790");
					Meter.min_time = till.multiply(Meter.seconds_in_a_year);
					var mill = new BigNumber("-500");
					Meter.max_time = mill.multiply(Meter.seconds_in_a_year);
					Meter.division_seconds = new BigNumber("10");
					break;
				case "500bc_0":
					var till = new BigNumber("-500");
					Meter.min_time = till.multiply(Meter.seconds_in_a_year);
					var mill = new BigNumber("0");
					Meter.max_time = mill.multiply(Meter.seconds_in_a_year);
					Meter.division_seconds = new BigNumber("10");
					break;
				case "1_500_ad":
					var till = new BigNumber("0");
					Meter.min_time = till.multiply(Meter.seconds_in_a_year);
					var mill = new BigNumber("500");
					Meter.max_time = mill.multiply(Meter.seconds_in_a_year);
					Meter.division_seconds = new BigNumber("10");
					break;
				case "500_1000_ad":
					var till = new BigNumber("500");
					Meter.min_time = till.multiply(Meter.seconds_in_a_year);
					var mill = new BigNumber("1000");
					Meter.max_time = mill.multiply(Meter.seconds_in_a_year);
					Meter.division_seconds = new BigNumber("10");
					break;
				case "1000_2017_ad":
					var till = new BigNumber("1000");
					Meter.min_time = till.multiply(Meter.seconds_in_a_year);
					var mill = new BigNumber("2017");
					Meter.max_time = mill.multiply(Meter.seconds_in_a_year);
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
		
		$("#map").on('click','.map_item',function(){
			$("#node_details_wrapper").show();
			$(".close").show();
			var num = $(this).attr("num");
			$("#node_details").html(Thoe.node_details[num]);
			$("#shade").show();
			
			var bg_img = $(this).find(".node_image").css("background-image");
			$("#shade_in").css("background-image",bg_img);
			
			$("#node_details .item-list ul li .node .content .field-type-datestamp").each(function(){
				var date = $(this).text();
				date = timeConverter(date);
				$(this).text(date);
			});
			
			$(".node-video").each(function(){
				var node_id = $(this).attr("id");
				var delete_split = node_id.split("-");
				var nid = delete_split[1];
				var delete_link = "<div class='delete' num='"+nid+"'>Delete</div>";
				$(this).append(delete_link);
			});
			
			var book_title = $(".node-book h2").text().substring(0,50) + "...";
			$(".node-book h2").html(book_title);
			
		});
		
		$("#node_details_wrapper").on('click','.delete',function(){
			var nid = $(this).attr("num");
			$.get( Thoe.service_url+"thoe/delete/"+nid )
			  .done(function( data ) {
			    console.log("node deleted");
			  });
		});
		
		$("#node_details_wrapper").on('click','.tags ul li',function(){
			$("#node_details").html("");
			$("#node_details_wrapper").hide();
			$(".close").hide();
			$("#shade").hide();
			
			$("#search_tag").val($(this).text());
			Thoe.refresh_line();
			
		});
		
		$("body").on('click','.close',function(){
			$("#node_details").html("");
			$("#node_details_wrapper").hide();
			$(".close").hide();
			$("#shade").hide();
		});	

		$(document).mouseup(function(e) {
		    var $container = $("#node_details_wrapper");

		    // if the target of the click isn't the container nor a descendant of the container
		    if (!$container.is(e.target) && $container.has(e.target).length === 0) {
		        $container.hide();
		        $(".close").hide();
				$("#shade").hide();
				$("#node_details").html("");
		    }
		});
		
	});
})(jQuery);













