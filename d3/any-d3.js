function plot(params){
	$('body').append($('<div id="'+params.chart_id+'">'+params.d3_script+'</div>'));
	$.ajaxSetup({async:false});
	$.getScript(params.d3_script);
}