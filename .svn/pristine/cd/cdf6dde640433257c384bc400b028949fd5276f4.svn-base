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

	$scope.fileList = [
		{"name":"file1", "file":""},
		{"name":"file2", "file":""},
		{"name":"file3", "file":""},
		{"name":"file4", "file":""},
		{"name":"file5", "file":""},
		{"name":"file6", "file":""},
		{"name":"file7", "file":""},
		{"name":"file8", "file":""},
		{"name":"file9", "file":""},
	];

	$scope.fileTransCmd = {
		"uniID"			: "",
		"Command"		: "",
		"SelectedFile"	: {},
		"isGettingData"	: false,
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
		$scope.fileTransCmd['isGettingData'] = "";

		//DoCommand();
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

	$scope.GetFileList = function()
	{
		//Get file list
		CreateCommand( GetCommandFromCmdList($scope.curtFileUnit) );
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

		/*var r = new FileReader();
		r.readAsText(f);
		
		console.log( files[0] );*/

		var r = new FileReader();
		r.readAsText( files[0], 'ISO-8859-4' );
		r.onload = function( evt ){
			console.log( evt.target.result );
		}
		
	}
	$scope.DownloadFile = function()
	{

	}
	

	DoCommand = function()
	{
		var commandObj = {"method":"FileTransCommand", "cncID":$scope.cncID, "command":$scope.fileTransCmd };
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


			//get new uniID
			$scope.fileTransCmd['uniID'] = json.data.uniID;
			$scope.fileTransCmd['isGettingData'] = false;

		}).
		error(function(json){
			console.warn(json);
		});
	}

	MappingFile= function( data )
	{

	}


}]);