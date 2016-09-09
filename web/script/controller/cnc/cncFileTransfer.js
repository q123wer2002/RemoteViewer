define([

], function () {
	function cncFileTransfer($scope,$http,$interval,$timeout,$rootScope,frontendAdaptor,commandMgr,fileMgr){


		$scope.curtFileUnit = "NcFile";
		$scope.FileUnits = {
			NcFile		: { "name":"加工檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":"" },
			Ladder		: { "name":"Ladder檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":".lad" },
			//Param		: { "name":"參數檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":".param" },
			//Macro		: { "name":"Macro檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":"" },
		};

		$scope.fileList = [];
		$scope.fileTransCmd = {
			"uniID"			: "",
			"Command"		: "",
			"Param"			: [],
			"SelectedFile"	: {},
		};
		$scope.uploadFile = {
			"fileType"		: "",
			"name"			: "",
			"file"			: "",
			"size"			: "",
			"progress"		: "",
			"isUploading"	: false,
		};
		$scope.FileHint = "";
		$scope.nListenResultTimes = 0;

		$scope.setFileParam = function( unitKey )
		{
			chosedColor = { "bg":"#62000F", "font":"#ffffff" };
			tabClick( $scope.FileUnits, unitKey, chosedColor);
			$scope.curtFileUnit = unitKey;
			
			//check agent version
			var isCorrectVersion = $scope.fnCheckAgentVersion( "FILE", unitKey );
			if( typeof isCorrectVersion == "string" || isCorrectVersion === false ){
				//not allow
				$rootScope.szSupportVersion['AGENT'] = isCorrectVersion;
				return;
			}

			var szCmd = commandMgr.fnGetCommand( unitKey );

			// protect undefined case
			if( typeof szCmd == "undefined" ){
				return;
			}
			CreateCommand( szCmd );
		}
		CreateCommand = function( szCommand )
		{
			$scope.fileTransCmd['uniID'] = "";
			$scope.fileTransCmd['Command'] = szCommand;
			$scope.fileTransCmd['SelectedFile'] = {};

			DoCommand();
		}
		$scope.SelectFile = function( file )
		{
			//selectFile
			$scope.fileTransCmd['SelectedFile'] = file;
		}
		$scope.SelectFileStyle = function( file )
		{
			if( $scope.fileTransCmd['SelectedFile'].name == file.name ){
				return {"background":"#BDBDBD"};
			}
		}
		$scope.isSelectedFile = function()
		{
			var objLength = Object.keys($scope.fileTransCmd['SelectedFile']).length;
			if( objLength === 0 ){
				return false;
			}

			return true;
		}
		$scope.HintStyle = function()
		{
			if( $scope.FileHint == "" ){
				//set default init
				jQuery('#infoBG').css('display','block');
				return {"opacity":"0"};
			}

			return {"opacity":"1"};
		}

		$scope.fnIsShowPage = function( isUnitPage, szShowPage )
		{
			if( $rootScope.szSupportVersion['AGENT'] != "-1" ){
				if( isUnitPage == true ){
					return false;
				}

				return true;
			}

			if( $scope.curtFileUnit == szShowPage ){
				return true;
			}

			return false;
		}

		$scope.RefreshNcList = function()
		{
			//default
			$scope.fileList = [];
			$scope.fileTransCmd['Param'] = [];
			
			//Get file list
			CreateCommand( commandMgr.fnGetCommand("NcFile") );
		}
		$scope.OpenUploadFileDialog = function()
		{
			if( $rootScope.isAuthorityWrite == false ){
				$rootScope.isShowAuthority = true;
				return;
			}
			
			//open file
			jQuery("#fileupload").click();
		}
		$scope.DownloadNCFile = function()
		{
			if( $rootScope.isAuthorityWrite == false ){
				$rootScope.isShowAuthority = true;
				return;
			}

			//show to viewer
			$scope.FileHint = "準備下載";

			$scope.fileTransCmd['Command'] = commandMgr.fnGetCommand("DownloadNcFile");
			$scope.fileTransCmd['Param'] = [];
			$scope.fileTransCmd['Param'].push( $scope.fileTransCmd['SelectedFile']['name'] );
			$scope.fileTransCmd['Param'].push( "" );
			DoCommand();
			//DownloadFile();
		}
		$scope.DownloadLadFile = function()
		{
			//show to viewer
			$scope.FileHint = "準備下載";

			$scope.fileTransCmd['Command'] = commandMgr.fnGetCommand("DownloadLadFile");
			$scope.fileTransCmd['Param'] = [];
			$scope.fileTransCmd['Param'].push( "cnc.lad" );
			$scope.fileTransCmd['Param'].push( "" );
			DoCommand();
			//DownloadFile();
		}
		DoCommand = function()
		{
			if( $scope.fileTransCmd['Param'].length == 0 ){
				$scope.fileTransCmd['Param'].push("");
				$scope.fileTransCmd['Param'].push("");
			}

			var isWaitCmdResult = ( $scope.fileTransCmd['Command'] == commandMgr.fnGetCommand("NcFile") ) ? false : true;
			var commandObj = { "cncID":$scope.cncID, "command":$scope.fileTransCmd['Command'], "param":$scope.fileTransCmd['Param'] };
			
			//start send command
			commandMgr.fnSendCommand( "CMD", commandObj, function(response){
				ParserCommandResult( response.data );
			}, false, isWaitCmdResult );
		}
		// Get Command Result from Server, which send from Client => Server.
		ParserCommandResult = function( resultData )
		{
			switch( $scope.fileTransCmd['Command'] ){
				case commandMgr.fnGetCommand("NcFile"):
					GetNcFileList();
				break;
				case commandMgr.fnGetCommand("UploadNcFile"):

					if( resultData.param1 == "file uploading..." ){
						//show to viewer
						$scope.FileHint = "上傳中...";

						//try again
						StartListeningResult();
						break;
					}
					
					if( resultData.param1 == "file uploading fail" ){
						//show to viewer, end
						$scope.FileHint = "檔案上傳失敗";
						break;
					}

					//param1 = "file uploading success"
					$scope.FileHint = "檔案上傳完成";
				break;
				case commandMgr.fnGetCommand("DownloadNcFile"):
					
					if( resultData.param1 == "file downloading..." ){
						//show to viewer
						$scope.FileHint = "抓取檔案中..";

						commandMgr.fnKeepListenCmdResult( function(response){
							ParserCommandResult(response);
						}, true);

						break;
					}
					
					if( resultData.param1 == "file download fail" ){
						//show to viewer, end
						$scope.FileHint = "檔案抓取失敗";
						break;
					}

					//param1 = "file download success"
					$scope.FileHint = "即將開始下載";
					DownloadNCFile();
				break;
				case commandMgr.fnGetCommand("DownloadLadFile"):

					if( resultData.param1 == "file downloading..." ){
						//show to viewer
						$scope.FileHint = "抓取檔案中..";

						//try again
						commandMgr.fnKeepListenCmdResult( function(response){
							ParserCommandResult(response);
						}, true);
						break;
					}
					
					if( resultData.param1 == "file download fail" ){
						//show to viewer, end
						$scope.FileHint = "檔案抓取失敗";
						break;
					}

					//param1 = "file download success"
					$scope.FileHint = "即將開始下載";
					DownloadLadFile();
				break;
			}
		}

		GetNcFileList = function()
		{
			this.fnGetResult = function(response){
				MappingNcFileList(response.data);
			}

			var fileListObj = { "cncID":$scope.cncID };
			commandMgr.fnSendCommand( "GET_NCFILE_LIST", fileListObj, this.fnGetResult, false, false );
		}
		MappingNcFileList = function( fileList )
		{
			if( typeof fileList == "undefinded" ){
				return;
			}

			if( Object.keys(fileList).length == 0 ){
				return;
			}

			var fileDate = fileList['date'].split(";");
			var fileName = fileList['name'].split(";");
			var fileSize = fileList['size'].split(";");

			$scope.fileList = [];
			for( var i=0; i<(fileName.length-1); i++ ){
				var fileObj = {"name":fileName[i], "size":fileSize[i], "date":fileDate[i]};
				$scope.fileList.push(fileObj);
			}
		}

		$scope.UploadFile = function( files )
		{
			if( files.length == 0 ){
				return;
			}

			//show to viewer
			$scope.FileHint = "檔案即將上傳";

			var file = files[0];

			fileMgr.fnUploadFile( $scope.cncID, file, "NcFile", function(response){
				//clear file input
				document.getElementById("fileupload").value = "";

				//show to viewer
				$scope.FileHint = "上傳中..";

				//push file obj
				var fileObj = {"name":response.data.name, "size":response.data.size, "date":response.data.upload_time};
				$scope.fileList.push( fileObj );

				//command to agent
				$scope.fileTransCmd['Command'] = commandMgr.fnGetCommand("UploadNcFile");
				$scope.fileTransCmd['Param'] = [];
				$scope.fileTransCmd['Param'].push(response.data.name); //add filename
				$scope.fileTransCmd['Param'].push("");
				DoCommand();
			});
		}
		DownloadNCFile = function()
		{
			fileMgr.fnDownloadFile( {'nCNCID':$scope.cncID, 'szFileName':$scope.fileTransCmd['SelectedFile']['name'] }, "NcFile" );
			$scope.FileHint = "下載完成";
		}

		DownloadLadFile = function()
		{
			fileMgr.fnDownloadFile( {'nCNCID':$scope.cncID, 'szFileName':"cnc.lad" }, "Ladder" );
			$scope.FileHint = "下載完成";
		}
	}

	return cncFileTransfer;
});