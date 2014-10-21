function plot(params){
	$('body').append(params.chart_selector);
	$.getScript(params.d3_script, function( data, textStatus, jqxhr ) {
	  
	});
}