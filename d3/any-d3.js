function plot(params){
	$('body').append($('<div id="'+params.chart_selector+'"></div>'));
	$.getScript(params.d3_script, function( data, textStatus, jqxhr ) {
	  
	});
}