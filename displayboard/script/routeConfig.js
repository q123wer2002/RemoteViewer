define([
	'angularAMD'
], function( angularAMD ){
	function config($routeProvider){
		$routeProvider
		.when("/", angularAMD.route({
			templateUrl: 'view/web/content/dashboard.html',
			controller: 'SyntecDashboard',
			controllerUrl: 'script/controller/dashboard'
		}))
		.when("/factory/:factory_id", angularAMD.route({
			templateUrl: 'view/web/content/manufacturersDispBoard.html',
			controller: 'SyntecManuDispBoard',
			controllerUrl: 'script/controller/manufacturersDispBoard'
		}))
		.when("/sliderSetting/factory/:factory_id", angularAMD.route({
			templateUrl: 'view/web/content/sliderSetting.html',
			controller: 'SyntecSliderSet',
			controllerUrl: 'script/controller/sliderSetting'
		}))
		.when("/layoutSetting", angularAMD.route({
			templateUrl: 'view/web/content/layoutSetting.html',
			controller: 'SyntecLayoutSet',
			controllerUrl: 'script/controller/layoutSetting'
		}))
		.when("/logoSetting", angularAMD.route({
			templateUrl: 'view/web/content/logoSetting.html',
			controller: 'SyntecLogoSet',
			controllerUrl: 'script/controller/logoSetting'
		}));
	}

	config.$inject = ['$routeProvider'];

	return config;
});