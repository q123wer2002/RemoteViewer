define([
	'angularAMD'
], function(angularAMD){
	
	function ngEnter(){
		var ENTER_KEY = 13;
		return function(scope, element, attrs) {
			element.bind("keydown keypress", function(event) {
				if(event.which === ENTER_KEY) {
					scope.$apply(function(){
						scope.$eval(attrs.ngEnter);
					});

					event.preventDefault();
				}
			});
		};
	}

	return ngEnter;
});