function plot(params){
	$('body').append($('<div id="'+params.chart_id+'">'+params.chart_id+'</div>'));
	$.getScript(params.d3_script, function( data, textStatus, jqxhr ) {
	  
	});
}