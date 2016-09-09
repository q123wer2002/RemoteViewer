
//loading jquery
require([
	//lib
	'shared/script/lib/jquery-1.9.1',
	
], function(jquery){
	//do nothing
});


define([
	'angularAMD',
	'angular-route',
	
	//shared module
		//directive
		'shared/script/module/directive/Enter',
		'shared/script/module/directive/RightClick',

		//factory
		'shared/script/module/factory/cfg-mgr',
		'shared/script/module/factory/util-mgr',
		'shared/script/module/factory/viewer-storage',
		'shared/script/module/factory/frontend-adaptor',
		'shared/script/module/factory/account-mgr',

		//service


	//router
	'routeConfig',

], function ( 
	angularAMD,
	ngRoute,

	//shared module
		//directive
		ngEnter,
		ngRightClick,

		//factory
		cfgMgr,
		utilMgr,
		viewerStorage,
		frontendAdaptor,
		accountMgr,

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
	
	//factory
	app.factory( 'cfgMgr', cfgMgr );
	app.factory( 'utilMgr', utilMgr );
	app.factory( 'viewerStorage', viewerStorage );
	app.factory( 'frontendAdaptor', frontendAdaptor );
	app.factory( 'accountMgr', accountMgr );
	
	//value
	app.value( "PATH", { WEBPATH : "http://localhost:1234/RemoteViewer_AUTO850/", SHAREDPATH : "http://localhost:1234/RemoteViewer_AUTO850/shared/"} );
	app.value( "VIEWERVERSION", "Beta 1.0.1" );

	//service
	
	//main controller
	app.controller("MainController", function($scope, $routeParams, accountMgr, cfgMgr, utilMgr, PATH, VIEWERVERSION ){
		
		var isInitDone = false;
		$scope.isMobile = utilMgr.fnIsMobile();
		$scope.szComaponyName = $routeParams.companyName;
		$scope.WEBPATH = PATH['WEBPATH'];

		$scope.fnIsExistComapnyName = function(){
			if( typeof $scope.szComaponyName == "undefined" || $scope.szComaponyName.length == 0 ){
				return false;
			}

			return true;
		}
		
		$scope.szSelectedMdoe = "";
		$scope.fnSelectedMode = function(szMode){
			$scope.szSelectedMdoe = szMode;
		}
		$scope.fnSelectedModeStyle = function( szMode, controlObject ){
			if( typeof controlObject == "undefined" ){
				if( $scope.szSelectedMdoe == "" ){
					return {"width":"48%", "min-width":"330px"};
				}

				if( $scope.szSelectedMdoe == szMode ){
					return {"width":"52%",};
				}else{
					return {"width":"21%", "min-width":"330px", "-webkit-filter":"grayscale(100%)", "filter":"grayscale(100%)"};
				}
			}

			if( controlObject == "HINTPANEL" ){
				if( $scope.szSelectedMdoe == szMode ){
					return {"display":"none"};
				}else{
					return {"display":"block"};
				}
			}
		}
		$scope.fnShowImg = function(){
			if( isInitDone == false ){
				return "web/images/Syntec.png";
			}

			if( typeof $scope.comapnyInfo.small_logo == "undefined" || $scope.comapnyInfo.small_logo == "" ){
				return "web/images/Syntec.png";
			}

			return "data:image/PNG;base64," + $scope.comapnyInfo.small_logo;
		}

		//user info
			$scope.user = {
				MOBILE : {
					account : "",
					password : "",
					errorMsg : "",
				},
				WEB : {
					account : "",
					password : "",
					errorMsg : "",
				},
				DISPLAYBOARD : {
					account : "",
					password : "",
					errorMsg : "",
				},
				image : "",
			};

			$scope.fnInitCompanyAuthority = function(){
				accountMgr.fnGetAccountInfo($scope.szComaponyName,function(response){
					isInitDone = true;
					$scope.comapnyInfo = response.data;
				});
			}
		//login function
			$scope.errorMsg = "";
			fnIsValid = function( text )
			{
				var pattern = new RegExp("[~'!#$%^&*()-+=:]");  
		        
		        if( text != null || text != "" ){  
		            if( pattern.test( text ) ){    
		                return false;  
		            }else{
		            	return true;
		            }
		        }else{
		        	return false;
		        }
			}
			$scope.fnLogin = function( szMode )
			{
				//1. check empty	
				if( $scope.user[szMode].account == null || $scope.user[szMode].account == "" ){
					$scope.errorMsg = "帳號不能為空";
					return;
				}

				if( $scope.user[szMode].password == null || $scope.user[szMode].password == "" ){
					$scope.user[szMode]['errorMsg'] = "密碼不可以為空";
					return;
				}

				if( !fnIsValid( $scope.user[szMode].account ) ){
					//2. check sql injection
					$scope.user[szMode].account = "";
					$scope.user[szMode].password = "";
					$scope.user[szMode]['errorMsg'] = "帳號密碼包含非法字符"; 
					return;
				}

				if( typeof $scope.userMode == "undefined"){
					$scope.userMode = 2;
					//$scope.user[szMode]['errorMsg'] = "請選擇登入模式"; 
					//return;
				}

				//clear error message
				$scope.user[szMode]['errorMsg'] = "";

				//3. use frontend adaptor module to get data
				this.fnGetResult = function(response){
					console.log(response);
					switch( response.result ){
						case "noUser":
							$scope.user[szMode]['errorMsg'] = "無此帳號";
						break;

						case "errorPwd":
							$scope.user[szMode]['errorMsg'] = "密碼錯誤";
						break;

						case "success":
							//save user information
							window.open( $scope.WEBPATH + szMode , '_self');
							//$scope.user[szMode]['errorMsg'] = PATH['WEBPATH'] + szMode;
						break;
						
						default:
						break;
					}
				}
				accountMgr.fnLogin( $scope.user[szMode].account, $scope.user[szMode].password, this.fnGetResult, szMode );
			}
	});

	app.filter('round', function() {
		return function(input) {
			return Math.round(input*100)/100;
		};
	});


	return angularAMD.bootstrap(app);
});
