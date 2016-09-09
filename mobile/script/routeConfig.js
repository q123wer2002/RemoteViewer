define([
	'angularAMD'
], function( angularAMD ){
	function config($routeProvider){
		//is mobile device
		$routeProvider
		.when("/", angularAMD.route({
			templateUrl: 'view/mobile/content/dashboard.html',
			controller: 'SyntecDashboard',
			controllerUrl: 'script/controller/dashboard'
		}))
		.when("/cnc/:cnc_id", angularAMD.route({
			templateUrl: 'view/mobile/content/cnc.html',
			controller: 'cncControl',
			controllerUrl: 'script/controller/cnc'
		}))
		.when("/userSetting", angularAMD.route({
			templateUrl: 'view/mobile/content/settingPage.html',
			controller: 'SyntecSetting',
			controllerUrl: 'script/controller/setting'
		}))
		.otherwise({redirectTo: "/"});
	}

	config.$inject = ['$routeProvider'];

	return config;
});