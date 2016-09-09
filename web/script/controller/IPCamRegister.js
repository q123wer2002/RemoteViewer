define( [
	'../../app'
], function( app ) {
	app.controller( 'SyntecIPCamSet', function( $scope, frontendAdaptor ) {
		$scope.factoryID = -1;
		$scope.factories = [];
		$scope.groupList = [];
		$scope.ipcamList = [];

		$scope.objSelectedGroup = {};
		//page init
			$scope.Initialization = function()
			{
				GetAllFactory();
			}
			//init get factory list
				GetAllFactory = function()
				{
					this.fnGetResult = function(response){
						if( typeof response.data == "undefined" || response.data == "" ){
							return;
						}

						for( var i=0; i<response.data.length; i++ ){
							var factoryObj = { "factory_id":response.data[i].factory_id, "factory_name":response.data[i].name };
							$scope.factories.push( factoryObj );
						}

						//only one factory, auto click in
						if( $scope.factories.length == 1 ){
							$scope.fnSelectFactory( $scope.factories[0] );
						}
					}
					frontendAdaptor.fnGetResponse( 'SLIDER', "GetAllFactory", {}, this.fnGetResult, false );
				}
		//select factory
			$scope.fnSelectFactory = function( factory )
			{
				//init factory object
				$scope.factoryID = factory.factory_id;
			}
		//group list init
			$scope.InitializeGroupList = function()
			{
			 	this.fnGetResult = function(response){
					if( typeof response.data == "undefined" || response.data == "" ){
						return;
					}

					for( var i=0; i<response.data.length; i++ ){
						var groupObj = { "group_id":response.data[i].cnc_group_id, "group_name":response.data[i].name };
						$scope.groupList.push( groupObj );
					}
				}
				var objGetGroupList = { "f_id":$scope.factoryID };
				frontendAdaptor.fnGetResponse( 'IPCAM', "GetAllGroup", objGetGroupList, this.fnGetResult, false );
			}
		//register ip cam
			$scope.ipcam = {"name":"", "rtsp_url":""};
			//record selected group's id
				$scope.fnSelectGroup = function(objGroup)
				{
					$scope.objSelectedGroup = objGroup;

					//reset the ipcamList to NULL (in order to clear the ipcamList in other group)
					InitializeIpcamList();
				}
			//add IPcam name & rtsp_url to MySQL
				$scope.fnAddIPcam = function()
				{
					var objIpcamInfo = {"ipcam_id":0, "name":$scope.ipcam.name, "group":$scope.objSelectedGroup.group_id, "rtsp_url":$scope.ipcam.rtsp_url, "isEditing":false};

					//check does this ipcam exist
					for( var i=0; i<$scope.ipcamList.length; i++ ){
						if( fnIsExistCamera(objIpcamInfo,$scope.ipcamList[i],false) == true ){
							//TODO: not to use alert alarm user
							alert("已經加入列表囉");
							return;
						}
					}

					this.fnGetResult = function(response){
						if( response.result != "success" ){
							return;
						}
						
						//add camera into list
						var objIPCAM = {"ipcam_id":response.data.ipcam_id, "name":response.data.ipcam_name, "group":$scope.objSelectedGroup.group_id, "rtsp_url":response.data.ipcam_rtsp_url, "isEditing":false};
						$scope.ipcamList.push( objIPCAM );

						//set to default
						$scope.ipcam.name = "";
						$scope.ipcam.rtsp_url = "";
					}

					
					frontendAdaptor.fnGetResponse( 'IPCAM', "IPCamUpload", objIpcamInfo, this.fnGetResult, false );
				}
				fnIsExistCamera = function( objCamera1, objCamera2, isCompareID )
				{
					//user json to compare
					var objTmp1 = objCamera1;
					var objTmp2 = objCamera2;

					if( isCompareID == false ){
						delete objTmp1['ipcam_id'];
						delete objTmp2['ipcam_id'];


						var jsonObjCamera1 = JSON.stringify(objTmp1);
						var jsonObjCamera2 = JSON.stringify(objTmp2);

						if( jsonObjCamera1 == jsonObjCamera2 ){
							return true;
						}

						return false;
					}

					if( objTmp1.ipcam_id == objTmp2.ipcam_id ){
						return true;
					}

					return false;
				}
		//ipcam list init
			InitializeIpcamList = function()
			{
				$scope.ipcamList = [];

				this.fnGetResult = function(response){
					if( typeof response.data == "undefined" || response.data == "" ){
						return;
					}

					for( var i=0; i<response.data.length; i++ ){
						var ipcamObj = { "ipcam_id":response.data[i].camera_id, "name":response.data[i].camera_name, "group":$scope.objSelectedGroup.group_id, "rtsp_url":response.data[i].camera_rtsp_url, "isEditing":false };
						$scope.ipcamList.push( ipcamObj );
					}
				}
				var g_id = { "g_id":$scope.objSelectedGroup.group_id };
				frontendAdaptor.fnGetResponse( 'IPCAM', "GetIPCamInfo", g_id, this.fnGetResult, false );
			}
		//ipcam editing
			//start editing camera
				$scope.fnEditCamera = function(camera)
				{
					camera.isEditing = true;
				}
			//save camera info after editing
				$scope.fnSaveCamera = function(camera)
				{

					this.fnGetResult = function(response){
						if( response.result != "success" ){
							return;
						}

						//end edit
						camera.isEditing = false;
					}

					frontendAdaptor.fnGetResponse( 'IPCAM', "IPCamUpdate", camera, this.fnGetResult, false );
				}
			//remove camera
				$scope.fnRemoveCamera = function(camera)
				{
					this.fnGetResult = function(response){
						if( response.result != "success" ){
							return;
						}

						//delete camer form list
						for( var i=0; i<$scope.ipcamList.length; i++ ){
							if( fnIsExistCamera(camera,$scope.ipcamList[i],true) == true ){
								$scope.ipcamList.splice(i,1);
								break;
							}
						}
					}
					frontendAdaptor.fnGetResponse( 'IPCAM', "IPCamDelete", camera, this.fnGetResult, false );
				}
	} );
} );