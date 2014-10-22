function plot(params){
	if(typeof params.vars != 'undefined'){
		for (var key in params.vars) {
		  	if (params.vars.hasOwnProperty(key)) {
		  		window[key] = params.vars[key];
		  	}
		}
	}

	$('body').append($('<div id="'+params.chart_id+'"></div>'));
	$.getScript(params.d3_script);
}