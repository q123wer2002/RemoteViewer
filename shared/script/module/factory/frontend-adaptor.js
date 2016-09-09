define([
	'angularAMD'
],function( angularAMD ){
	return function frontendAdaptor( $q, $http, PATH ){
			
			var frontendAdaptor = [];

			frontendAdaptor.m_objServerFileInfo = {
				ACCOUNT		: "phpAjax/accountAjax.php",
				CNCDATA		: "phpAjax/cncDataAjax.php",
				COMMAND		: "phpAjax/CommandAjax.php",
				DASHBOARD	: "phpAjax/dashboardAjax.php",
				LAYOUT		: "phpAjax/layoutSettingAjax.php",
				SCHEDULE	: "phpAjax/scheduleAjax.php",
				SLIDER		: "phpAjax/sliderSettingAjax.php",
				FILEMANAGER : "module/fileManager.php",
				IPCAM		: "phpAjax/IPCamAjax.php",
			};

			frontendAdaptor.fnGetResponse = function( szAdaptorServerKey, szMethod ,objInput, fnResponse, isDebugMode ){

				if( typeof frontendAdaptor.m_objServerFileInfo[szAdaptorServerKey] == "undefined" ){
					if( isDebugMode == true ){
						console.log("Server No File");
					}
					return;
				}

				var szServerFile = frontendAdaptor.m_objServerFileInfo[szAdaptorServerKey];
				var objMethod = {"method":szMethod};
				$http({
					method:'POST',
					url: PATH['SHAREDPATH'] + 'server/' + szServerFile,
					data: $.param( angular.extend(objMethod, objInput) ),
					headers: {'Content-type': 'application/x-www-form-urlencoded'},
				}).
				success(function(response, status){
					
					if( isDebugMode == true ){
						console.log(response);
						console.log(status);
					}

					fnResponse(response);
				}).
				error(function(json){
					console.warn( "error" + json );
				});
			}

			frontendAdaptor.fnPromiseData = function( szAdaptorServerKey, szMethod ,objInput ){
	
				if( typeof frontendAdaptor.m_objServerFileInfo[szAdaptorServerKey] == "undefined" ){
					return "Server No File";
				}

				var deferred = $q.defer();

				var szServerFile = frontendAdaptor.m_objServerFileInfo[szAdaptorServerKey];
				var objMethod = {"method":szMethod};
				$http({
					method:'POST',
					url: PATH['SHAREDPATH'] + 'server/' + szServerFile,
					data: $.param( angular.extend(objMethod, objInput) ),
					headers: {'Content-type': 'application/x-www-form-urlencoded'},
				}).
				success(function(response, status){
					deferred.resolve(response);
				}).
				error(function(json){
					deferred.reject("error");
				});

				return deferred.promise;
			}

			frontendAdaptor.fnUploadFile = function( fileInfo, fnResponse, isDebugMode ){
				$http({
					method:'POST',
					url: PATH['SHAREDPATH'] + 'server/' + frontendAdaptor.m_objServerFileInfo['FILEMANAGER'],
					data: fileInfo,
					headers: {'Content-type': undefined},
				}).
				success(function(response, status){
					
					if( isDebugMode == true ){
						console.log(response);
					}

					fnResponse(response);
				}).
				error(function(json){
					console.warn( "error" + json );
				});
			}

			frontendAdaptor.fnDownloadFile = function( szMethod, downloadFileName, objFileInfo ){
				
				var downloadUrl = PATH['SHAREDPATH'] + 'server/' + frontendAdaptor.m_objServerFileInfo['FILEMANAGER'] + '?method=Download';
				
				//set dbapi
				downloadUrl += '&DBAPI=' + szMethod;

				//set file name
				downloadUrl += '&fileName=' + downloadFileName;
				
				//set param1
				downloadUrl += '&param1=' + objFileInfo['param1'];

				//set param2
				downloadUrl += '&param2=' + objFileInfo['param2'];
				
				//open link to download file
				//window.open( downloadUrl ,'_new');
				jQuery('<a></a>', {
					"href": downloadUrl,
					"style":"display:none",
				}).appendTo("body")[0].click();
			}
		
		return frontendAdaptor;
	}
});
