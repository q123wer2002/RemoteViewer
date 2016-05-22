SyntecRemoteWeb.controller('cncFileTransfer',['$scope','$http', '$interval','$timeout', function SyntecRemote($scope,$http,$interval,$timeout){

	$scope.cncProfiles['FileTransfer']['Interval'] = $interval(function(){
		
		//
	},1000);


	$scope.curtFileUnit = "NcFile";
	$scope.FileUnits = {
		NcFile		: { "name":"加工檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":"" },
		Ladder		: { "name":"Ladder檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":".lad" },
		Param		: { "name":"參數檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":".param" },
		Macro		: { "name":"Macro檔", "bgColor":"#ffffff", "fontColor":"#62000F", "acceptFile":"" },
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

	$scope.RefreshNcList = function()
	{
		//Get file list
		CreateCommand( GetCommandFromCmdList("NcFile") );
	}
	$scope.OpenUploadFileDialog = function()
	{
		//open file
		jQuery("#fileupload").click();
	}
	$scope.UploadFile = function( files )
	{
		if( files.length == 0 ){
			return;
		}

		var file = files[0];
		var reader = new FileReader();

		reader.onprogress = function(event) {
			if(event.lengthComputable) {
				//console.log( event );
				$scope.uploadFile['progress'] = "檔案上傳中..";
			}
		};

		reader.onloadend = function(event) {
			var contents = event.target.result,
			error    = event.target.error;

			if (error != null) {
				console.error("File could not be read! Code " + error.code);
			}else {
				$scope.uploadFile['name'] = file.name;
				$scope.uploadFile['file'] = Base64.encode(contents);
				$scope.uploadFile['size'] = file.size;
				$scope.uploadFile['isUploading'] = true;
				UploadFileToDB();
			}
		};

		reader.readAsText( file, 'ISO-8859-4' );
	}
	$scope.DownloadFile = function()
	{
		$scope.fileTransCmd['Command'] = "Download_nc_file";
		$scope.fileTransCmd['Param'] = [];
		$scope.fileTransCmd['Param'].push( $scope.fileTransCmd['SelectedFile']['name'] );
		$scope.fileTransCmd['Param'].push( "" );
		//DoCommand();
		DownloadFile();
	}


	
	DoCommand = function()
	{
		if( $scope.fileTransCmd['Param'].length == 0 ){
			$scope.fileTransCmd['Param'].push("");
			$scope.fileTransCmd['Param'].push("");
		}
		var commandObj = {"method":"Command", "cncID":$scope.cncID, "command":$scope.fileTransCmd['Command'], "param":$scope.fileTransCmd['Param'] };
        //console.log(commandObj);
		$http({
			method:'POST',
			url:'server/CommandAjax.php',
			data: $.param(commandObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			console.log( json );
			if( json.result == "error" ){
				//console.log( json );
			}

			$scope.fileTransCmd['uniID'] = json.data.uniID;
			$scope.fileTransCmd['isGettingData'] = false;

			ParserCommandResult();
		}).
		error(function(json){
			console.warn(json);
		});
	}
	ParserCommandResult = function()
	{
		if( $scope.fileTransCmd['uniID'] == "" ){
			return;
		}

		switch( $scope.fileTransCmd['Command'] ){
			case GetCommandFromCmdList("NcFile"):
				GetNcFileList();
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
			//console.log( json );
			if( json.result == "error" ){
				//console.log( json );
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

		var fileDate = fileList['date'].split(";");
		var fileName = fileList['name'].split(";");
		var fileSize = fileList['size'].split(";");


		$scope.fileList = [];
		for( var i=0; i<fileName.length; i++ ){
			var fileObj = {"name":fileName[i], "size":fileSize[i], "date":fileDate[i]};
			$scope.fileList.push(fileObj);
		}
	}

	UploadFileToDB = function()
	{
		if( $scope.uploadFile['isUploading'] == false ){
			return;
		}
		$scope.uploadFile['progress'] = "存到雲端中..";
		$scope.uploadFile['fileType'] = $scope.curtFileUnit;

		var uploadObj = {"method":"UploadFile", "cncID":$scope.cncID, "file":$scope.uploadFile };
        //console.log(uploadObj);
		$http({
			method:'POST',
			url:'server/CommandAjax.php',
			data: $.param(uploadObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			console.log( json );
			if( json.result == "error" ){
				//console.log( json );
			}
			$scope.uploadFile['progress'] = "上傳即將完成..";
			$scope.fileTransCmd['Command'] = "Upload_nc_file";
			$scope.fileTransCmd['Param'] = [];
			$scope.fileTransCmd['Param'].push(json.data.name);
			$scope.fileTransCmd['Param'].push("");
			DoCommand();
			$scope.uploadFile['isUploading'] == false;
			$scope.uploadFile['progress'] = "";
		}).
		error(function(json){
			console.warn(json);
		});
	}
	DownloadFile = function()
	{
		var downloadObj = {"method":"DownloadFile", "cncID":$scope.cncID, "fileName":"fileName.txt" };
        //console.log(downloadObj);
		$http({
			method:'POST',
			url:'server/CommandAjax.php',
			data: $.param(downloadObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			console.log( json );
			if( json.result == "error" ){
				//console.log( json );
			}
			var fileContent = Base64.decode(json.data.file);
			jQuery('<a></a>', {
				"download": json.data.name,
				"href": "data:," + fileContent,
				"style":"display:none",
			}).appendTo("body")[0].click();
		}).
		error(function(json){
			console.warn(json);
		});
	}


}]);