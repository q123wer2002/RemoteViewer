define([
	'angularAMD'
], function( angularAMD ){
	function config($routeProvider){
		//is mobile device
		$routeProvider
		.when("/", angularAMD.route({
			templateUrl: 'view/web/content/dashboard.html',
			controller: 'SyntecDashboard',
			controllerUrl: 'script/controller/dashboard'
		}))
		.when("/cnc/:cnc_id", angularAMD.route({
			templateUrl: 'view/web/content/cnc.html',
			controller: 'cncControl',
			controllerUrl: 'script/controller/cnc'
		}))
		.when("/shiftSetting", angularAMD.route({
			templateUrl: 'view/web/content/settingPage.html',
			controller: 'SyntecSetting',
			controllerUrl: 'script/controller/setting'
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
		}))
		.when("/IPCamRegister", angularAMD.route({
			templateUrl: 'view/web/content/IPCamRegister.html',
			controller: 'SyntecIPCamSet',
			controllerUrl: 'script/controller/IPCamRegister'
		}))
		.when("/IPCamStreaming/:factory_id", angularAMD.route({
			templateUrl: 'view/web/content/IPCamStreaming.html',
			controller: 'SyntecIPCamStream',
			controllerUrl: 'script/controller/IPCamStreaming'
		}))
		.when("/AuthorityManagement", angularAMD.route({
			templateUrl: 'view/web/content/authorityManagement.html',
			controller: 'SyntecAuthority',
			controllerUrl: 'script/controller/authoritySetting'
		}))
		.otherwise({redirectTo: "/"});
	}

	config.$inject = ['$routeProvider'];

	return config;
});