$.getScript('http://s3.amazonaws.com/js.knowtify.io/js/demo/sunburst.js', function( data, textStatus, jqxhr ) {
	  	});

function plot(params){
	$('body').append($('<div id="'+params.chart_id+'">'+params.d3_script+'</div>'));
	/*
	$.getScript(params.d3_script, function( data, textStatus, jqxhr ) {
	  
	});
	*/
	//http://s3.amazonaws.com/js.knowtify.io/js/demo/sunburst.js
	setTimeout(function(){
		$.getScript(params.d3_script, function( data, textStatus, jqxhr ) {
	  	});
	},500);
}