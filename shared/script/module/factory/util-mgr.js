define([
	'angularAMD'
],function( angularAMD ){
	return function utilMgr( cfgMgr, frontendAdaptor ){
		
		var utilMgr = [];
		utilMgr.view = [];

		utilMgr.view.cncBGColor = function( cnc ){
			if( cnc.cncStatus == "" ){
				return;
			}
			
			if( cnc.isElseStatus == false ){
				return cfgMgr.view.statusStyle[cnc.cncStatus].color;
			}

			return  cfgMgr.view.statusStyle['ELSE'].color;
		}

		// TODO this function amy be moved to language module (langMgr)
		utilMgr.view.namemapping = function(table,key,lang){
			if( szString == "" || key == "" || lang == "" ){
				return "***";
			}

			var szString = cfgMgr.view[table][key][lang];
			return szString;
		}

		utilMgr.fnGetComapnyLogo = function( fnResponse ){
			frontendAdaptor.fnGetResponse( 'ACCOUNT', 'GetComapnyLogo', {}, function(response){
				fnResponse(response);
			}, false );
		}

		//device
		utilMgr.fnIsMobile = function(){
			var mobiles = [
				"iphone", "mobile", //
			];

			var webViews = [
				"ipad",
			];

			var userNavigator = navigator.userAgent.toLowerCase();
			var isMobile = false;
			//check ipad direct to web view
			for( var j=0; j<webViews.length; j++ ){
				if( userNavigator.indexOf(webViews[j]) != -1 ){
					isMobile = false;
					return isMobile;
				}
			}

			for( var i=0; i<mobiles.length; i++ ){
				if( userNavigator.indexOf(mobiles[i]) != -1 ){
					isMobile = true;
					break;
				}
			}

			return isMobile;
		}

		return utilMgr;
	}
});