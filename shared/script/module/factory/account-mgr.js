define([
	'angularAMD'
],function( angularAMD ){
	return function accountMgr( viewerStorage, frontendAdaptor ){

		var accountMgr = [];

		accountMgr.objLoginMode = {
			"WEB" 			: "web",
			"DISPLAYBOARD" 	: "displayboard",
			"MOBILE"		: "mobile",
		};

		//login
		accountMgr.fnLogin = function( szAccount, szPwd, fnRsponse, szLoginModeKey ){

			this.fnGetResult = function(response){
				if( response.result == "success" ){
					//save user info into local storage
					var sotrageKey = accountMgr.objLoginMode[szLoginModeKey] + "_user";
					viewerStorage.fnPutData( sotrageKey, response.data );
				}

				fnRsponse(response);
			}

			if( typeof accountMgr.objLoginMode[szLoginModeKey] == "undefined" ){
				return "error mode";
			}

			var accountObject={ "user":szAccount,"pwd":szPwd };
			frontendAdaptor.fnGetResponse( 'ACCOUNT', "login", accountObject, this.fnGetResult, true );
		}

		//logout
		accountMgr.fnLogout = function( fnRsponse, szLoginModeKey ){

			this.fnGetResult = function(response){
				
				if( response.result == "success" ){
					var sotrageKey = accountMgr.objLoginMode[szLoginModeKey] + "_user";
					viewerStorage.fnRemoveData(sotrageKey);
				}

				fnRsponse(response);
			}

			if( typeof accountMgr.objLoginMode[szLoginModeKey] == "undefined" ){
				return "error mode";
			}

			frontendAdaptor.fnGetResponse( 'ACCOUNT', "logout", {}, this.fnGetResult, false );
		}

		//check is user login
		accountMgr.fnIsLogin = function( szLoginModeKey ){

			if( typeof accountMgr.objLoginMode[szLoginModeKey] == "undefined" ){
				return false;
			}

			var sotrageKey = accountMgr.objLoginMode[szLoginModeKey] + "_user";
			var userInfo = viewerStorage.fnGetData(sotrageKey);
			
			if( typeof userInfo == "undefined" || userInfo.length == 0 || typeof userInfo == "undefined" || userInfo.RemoteViewer == "" ){
				return false;
			}

			return true;
		}

		//get user name
		accountMgr.fnGetUserName = function( szLoginModeKey ){

			if( typeof accountMgr.objLoginMode[szLoginModeKey] == "undefined" ){
				return false;
			}

			var sotrageKey = accountMgr.objLoginMode[szLoginModeKey] + "_user";
			var userInfo = viewerStorage.fnGetData(sotrageKey);

			return userInfo['RemoteViewer']['user']['name'];
		}

		//change pwd
		accountMgr.fnChangePwd = function( szNewPwd, fnRsponse ){

			this.fnGetResult = function(response){
				
				if( response.result == "success" ){
					//TODO: does localstorage need to save new pwd ?
				}

				fnRsponse(response);
			}

			var changePwdObj = { "newPwd": szNewPwd };
			frontendAdaptor.fnGetResponse( 'ACCOUNT', "changePwd", changePwdObj, this.fnGetResult, false );
		}

		//pwd doble check
		accountMgr.fnDoubleCheckPwd = function( szPwd, fnRsponse ){

			this.fnGetResult = function(response){
				
				if( response.result == "success" ){
					
				}

				fnRsponse(response);
			}

			var pwdObj = { "pwd": szPwd };
			frontendAdaptor.fnGetResponse( 'ACCOUNT', "DoubleCheckPwd", pwdObj, this.fnGetResult, false );
		}

		//get account info
		accountMgr.fnGetAccountInfo = function( szComponyName, fnRsponse ){

			this.fnGetResult = function(response){
				fnRsponse(response);
			}

			var accountObject={ "companyName":szComponyName };
			frontendAdaptor.fnGetResponse( 'ACCOUNT', "initAuthority", accountObject, this.fnGetResult, false );
		}

		return accountMgr;
	}
});
