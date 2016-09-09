define([
	'angularAMD'
], function( angularAMD ){
	function config($routeProvider){
		$routeProvider
		.when("/", angularAMD.route({
			templateUrl: 'login.html',
			controller: 'MainController',
			controllerUrl: ''
		}))
		.when("/:companyName", angularAMD.route({
			templateUrl: 'login.html',
			controller: 'MainController',
			controllerUrl: ''
		}))
		.otherwise({redirectTo: "/"});
	}

	config.$inject = ['$routeProvider'];

	return config;
});