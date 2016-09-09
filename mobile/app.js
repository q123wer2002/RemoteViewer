
//loading jquery
require([
	//lib
	'../shared/script/lib/jquery-1.9.1',
	
	//public
	'script/publicFunction',
], function(jquery, public){
	//do nothing
});


define([
	'angularAMD',
	'angular-route',
	
	//shared module
		//directive
		'../shared/script/module/directive/Enter',
		'../shared/script/module/directive/RightClick',
		'../shared/script/module/directive/DashboardData',

		//factory
		'../shared/script/module/factory/cfg-mgr',
		'../shared/script/module/factory/util-mgr',
		'../shared/script/module/factory/viewer-storage',
		'../shared/script/module/factory/frontend-adaptor',
		'../shared/script/module/factory/account-mgr',
		'../shared/script/module/factory/command-mgr',
		'../shared/script/module/factory/cncData-mgr',
		'../shared/script/module/factory/file-mgr',
		'../shared/script/module/factory/custom-mgr',

		//service


	//router
	'script/routeConfig',

], function ( 
	angularAMD,
	ngRoute,

	//shared module
		//directive
		ngEnter,
		ngRightClick,
		dashboardData,

		//factory
		cfgMgr,
		utilMgr,
		viewerStorage,
		frontendAdaptor,
		accountMgr,
		commandMgr,
		cncDataMgr,
		fileMgr,
		customMgr,

		//service

	//router
	config
) {

	var app = angular.module("SyntecRemoteWeb", ['ngRoute']);
	//import external module
	//route
	app.config(config);
	
	//directive
	app.directive( 'ngEnter' , ngEnter );
	app.directive( 'ngRightClick', ngRightClick );
	app.directive( 'dashboardData', dashboardData );
	
	//factory
	app.factory( 'cfgMgr', cfgMgr );
	app.factory( 'utilMgr', utilMgr );
	app.factory( 'viewerStorage', viewerStorage );
	app.factory( 'frontendAdaptor', frontendAdaptor );
	app.factory( 'accountMgr', accountMgr );
	app.factory( 'commandMgr', commandMgr );
	app.factory( 'cncDataMgr', cncDataMgr );
	app.factory( 'fileMgr', fileMgr );
	app.factory( 'customMgr', customMgr );
	
	//value
	app.value( "MODE", "MOBILE" );
	app.value( "PATH", { WEBPATH : "http://localhost:1234/RemoteViewer_AUTO850/mobile/", SHAREDPATH : "http://localhost:1234/RemoteViewer_AUTO850/shared/"} );
	app.value( "VIEWERVERSION", "Beta 2.0.1" );

	//service
	
	//main controller
	app.controller("MainController", function($scope, $routeParams, $interval, accountMgr, cfgMgr, utilMgr, customMgr, cncDataMgr, MODE, PATH, VIEWERVERSION ){

		$scope.szViewerVersion = VIEWERVERSION;
		$scope.isMobile = utilMgr.fnIsMobile();
		$scope.szCompanyLogoUrl = "";
		$scope.userName = "";
		var comapnyName = "";

		//dispose function
		$scope.fnDisposeData = function(){
			customMgr.fnDispose();
			cncDataMgr.fnDispose();
		}

		$scope.fnOpenLink = function( szPath ){
			//dispose first
			$scope.fnDisposeData();

			//hide menu
			$scope.fnHideLeftMenu();

			window.open( szPath, '_self');
		}

		$scope.fnIsLogin = function(){

			var nTimes = 0;
			var interval_isLogin = $interval(function(){

				var isLogin = accountMgr.fnIsLogin(MODE);
				if( isLogin == true ){
					$interval.cancel(interval_isLogin);
				}

				if( nTimes > 2 ){

					$interval.cancel(interval_isLogin);
					
					if( comapnyName.length != 0 ){
						window.open('../#/' + comapnyName , '_self');
						return;
					}
					
					window.open('../#/' , '_self');
				}

				nTimes++;
	
			},300);

		}

		$scope.fnShowLeftMenu = function()
        {
            $scope.bgBlackDisplay = "block";
            $scope.leftMenuleftPx = "0px";
        }
        $scope.fnHideLeftMenu = function()
        {
            $scope.bgBlackDisplay = "none";
            $scope.leftMenuleftPx = "-100%";
        }

		$scope.fnShowTOPHtml = function(){

			return PATH['WEBPATH'] + "view/mobile/top.html";
		}

		$scope.fnShowComapnyLogo = function(){
			utilMgr.fnGetComapnyLogo(function(response){
				if( typeof response.data == "undefined" || response.data.length == 0 ){
					$scope.szCompanyLogoUrl = "images/syntec_white.png";
				}else{
					$scope.szCompanyLogoUrl = "data:image/PNG;base64," + response.data;
				}
			});
		}
		
		$scope.fnCNCStatusColorStyle = function(cncStatus){
			return cfgMgr.view.fnStatusColor(cncStatus);
		}

		$scope.fnCNCStatusName = function(cncStatus, language){
			if( typeof cncStatus == "undefined" || cncStatus == "" ){
				return cfgMgr.view.statusName['OTHER'][language];
			}

			return cfgMgr.view.statusName[cncStatus][language];
		}

		$scope.fnLogout = function(){
			this.fnGetResult = function(response){
				if( response.result != "success" ){
					return;
				}

				comapnyName = response.data;
				if( comapnyName.length != 0 ){
					window.open('../#/' + comapnyName , '_self');
					return;
				}
				
				window.open('../#/' , '_self');
			}

			accountMgr.fnLogout( this.fnGetResult, MODE );
		}


	});

	app.filter('round', function() {
		return function(input) {
			return Math.round(input*100)/100;
		};
	});


	return angularAMD.bootstrap(app);
});
