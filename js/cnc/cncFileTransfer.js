SyntecRemoteWeb.controller('cncFileTransfer',['$scope','$http', '$interval','$timeout', function SyntecRemote($scope,$http,$interval,$timeout){

	$scope.cncProfiles['FileTransfer']['Interval'] = $interval(function(){
		
		if( $scope.fileTransCmd['isGettingData'] == false || $scope.nListenResultTimes == $scope.nMaxWaitTime ){
			
			//timeout or cannot get data
			StopListeningResult();
			$scope.nListenResultTimes = 0;

			return;
		}

		ListenCommandResult();
		$scope.nListenResultTimes ++;

	},1000);


	$scope.curtFileUnit = "NcFile";
	$scope.FileUnits = {
		NcFile		: { "name":"加工檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":"" },
		//Ladder		: { "name":"Ladder檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":".lad" },
		//Param		: { "name":"參數檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":".param" },
		//Macro		: { "name":"Macro檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":"" },
	};

	$scope.fileList = [];
	$scope.fileTransCmd = {
		"uniID"			: "",
		"Command"		: "",
		"Param"			: [],
		"SelectedFile"	: {},
		"isGettingData"	: false,
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
		
		var szCmd = GetCommandFromCmdList( unitKey );
		CreateCommand( szCmd );
	}
	CreateCommand = function( szCommand )
	{
		$scope.fileTransCmd['uniID'] = "";
		$scope.fileTransCmd['Command'] = szCommand;
		$scope.fileTransCmd['SelectedFile'] = {};
		$scope.fileTransCmd['isGettingData'] = false;

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
			return {"opacity":"0"};
		}

		return {"opacity":"1"};
	}

	StartListeningResult = function()
	{
		//start
		$scope.fileTransCmd['isGettingData'] = true;
	}
	StopListeningResult = function()
	{
		//stop
		$scope.fileTransCmd['isGettingData'] = false;
	}

	$scope.RefreshNcList = function()
	{
		//default
		$scope.fileList = [];
		$scope.fileTransCmd['Param'] = [];
		
		//Get file list
		CreateCommand( GetCommandFromCmdList("NcFile") );
	}
	$scope.OpenUploadFileDialog = function()
	{
		//open file
		jQuery("#fileupload").click();
	}
	$scope.DownloadFile = function()
	{
		//show to viewer
		$scope.FileHint = "準備下載";

		$scope.fileTransCmd['Command'] = GetCommandFromCmdList("DownloadNcFile");
		$scope.fileTransCmd['Param'] = [];
		$scope.fileTransCmd['Param'].push( $scope.fileTransCmd['SelectedFile']['name'] );
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

		var commandObj = {"method":"Command", "cncID":$scope.cncID, "command":$scope.fileTransCmd['Command'], "param":$scope.fileTransCmd['Param'] };
		$http({
			method:'POST',
			url:'server/CommandAjax.php',
			data: $.param(commandObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			Debug(json);
			if( json.result == "error" ){
				Debug(json);
			}

			$scope.fileTransCmd['uniID'] = json.data.uniID;
			StartListeningResult();
			//ParserCommandResult();
		}).
		error(function(json){
			console.warn(json);
		});
	}
	ListenCommandResult = function()
	{
		//mutex
		StopListeningResult();
		//end mutex

		//show_ncfile_dir no result
		if( $scope.fileTransCmd['Command'] == GetCommandFromCmdList("NcFile") ){
			ParserCommandResult(null);
			return;
		}

		var commandObj = {"method":"GetCommandResult", "cncID":$scope.cncID, "uniID":$scope.fileTransCmd['uniID'] };
		$http({
			method:'POST',
			url:'server/CommandAjax.php',
			data: $.param(commandObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			Debug(json);

			if( json.data == "" ){
				//empty, try again
				StartListeningResult();
				return;
			}

			if( json.result == "error" ){
				Debug(json);
			}

			ParserCommandResult( json.data);
		}).
		error(function(json){
			console.warn(json);
		});
	}
	ParserCommandResult = function( resultData )
	{
		if( $scope.fileTransCmd['uniID'] == "" ){
			return;
		}

		switch( $scope.fileTransCmd['Command'] ){
			case GetCommandFromCmdList("NcFile"):
				GetNcFileList();
			break;
			case GetCommandFromCmdList("UploadNcFile"):

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
			case GetCommandFromCmdList("DownloadNcFile"):
				
				if( resultData.param1 == "file downloading..." ){
					//show to viewer
					$scope.FileHint = "抓取檔案中..";

					//try again
					StartListeningResult();
					break;
				}
				
				if( resultData.param1 == "file download fail" ){
					//show to viewer, end
					$scope.FileHint = "檔案抓取失敗";
					break;
				}

				//param1 = "file download success"
				$scope.FileHint = "即將開始下載";
				DownloadFile();
			break;
		}
	}

	GetNcFileList = function()
	{
		var fileListObj = {"method":"GetNcFileList", "cncID":$scope.cncID };

		$http({
			method:'POST',
			url:'server/CommandAjax.php',
			data: $.param(fileListObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			Debug(json);

			if( json.data == "" ){
				StartListeningResult();
				return;
			}

			if( json.result == "error" ){
				Debug(json);
			}

			MappingNcFileList(json.data);
		}).
		error(function(json){
			console.warn(json);
		});
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

		var file = files[0];   
		var data = new FormData();

		//append another info
		data.append( "cncID", $scope.cncID );
		data.append( "method", "UploadFile");

		//append file
		data.append( "file", file);

		//show to viewer
		$scope.FileHint = "檔案即將上傳";

		$http({
			method:'POST',
			url:'server/CommandAjax.php',
			data: data,
			headers: {'Content-type': undefined},
		}).
		success(function(json){
			Debug(json);

			//clear file input
			document.getElementById("fileupload").value = "";

			//show to viewer
			$scope.FileHint = "上傳中..";

			//push file obj
			var fileObj = {"name":json.data.name, "size":json.data.size, "date":json.data.upload_time};
			$scope.fileList.push( fileObj );

			//command to agent
			$scope.fileTransCmd['Command'] = GetCommandFromCmdList("UploadNcFile");
			$scope.fileTransCmd['Param'] = [];
			$scope.fileTransCmd['Param'].push(json.data.name); //add filename
			$scope.fileTransCmd['Param'].push("");
			DoCommand();
		}).
		error(function(json){
			console.warn(json);
		});
	}
	DownloadFile = function()
	{
		var downloadObj = {"method":"DownloadFile", "cncID":$scope.cncID, "fileName":$scope.fileTransCmd['SelectedFile']['name'] };
		$http({
			method:'POST',
			url:'server/CommandAjax.php',
			data: $.param(downloadObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			Debug(json);
			if( json.result == "error" ){
				Debug(json);
			}

			if( json.data == "" ){
				$scope.FileHint = "下載失敗";
				return;
			}

			//show to viewer
			$scope.FileHint = "下載完成";

			//var fileContent = Base64.decode(json.data.file);
			jQuery('<a></a>', {
				"download": json.data.name,
				"href": "data:," + encodeURIComponent(json.data.file),
				"style":"display:none",
			}).appendTo("body")[0].click();
			
		}).
		error(function(json){
			console.warn(json);
		});
	}


}]);