SyntecRemoteWeb.controller('cncOffset',['$scope','$http', '$interval','$timeout', function SyntecRemote($scope,$http,$interval,$timeout){

	$scope.cncProfiles['Offset']['Interval'] = $interval(function(){
		
		if( $scope.OffsetCmd['isGettingData'] == false || nListenResultTimes == 10 ){
			
			//timeout or cannot get data
			StopListeningResult();
			nListenResultTimes = 0;

			return;
		}

		ListenCommandResult();
		nListenResultTimes ++;

	},1000);

	var MillTitle = [ "刀號", "刀長幾何", "刀長磨耗", "刀徑幾何", "刀徑磨耗" ];
	var MillTitleENG = [ "radius_geom", "radius_wear", "length_geom", "length_wear" ];

	var LatheTitle = [ "刀號", "磨耗X", "磨耗Y", "磨耗Z", "刀長X", "刀長Y", "刀長Z", "刀尖半徑", "刀尖磨耗", "刀尖方向" ];
	var LatheTitleENG = [ "wear_X", "wear_Z", "wear_A", "length_X", "length_Y", "length_A", "tool_nose_radius", "tool_nose_r_wear", "tool_nose" ];
	
	$scope.OffsetTitles;

	$scope.OffsetData = [];
	$scope.OffsetCmd = {
		"uniID"			: "",
		"Command"		: "",
		"Param"			: [],
		"SelectedNo"	: {},
		"isGettingData"	: false,
	};
	var nListenResultTimes = 0;

	$scope.hint = "";
	$scope.initOffset = function()
	{
		if( $scope.cncInfos['MachineType']['data'] == "Mill" ){
			$scope.OffsetTitles = MillTitle;
		}else{
			$scope.OffsetTitles = LatheTitle;
		}
		var coffset_cmd = GetCommandFromCmdList("ShowOffset");
		CreateCommand(coffset_cmd);
	}
	CreateCommand = function( szCommand )
	{
		//set default command
		$scope.OffsetCmd['uniID'] = "";
		$scope.OffsetCmd['Command'] = szCommand;
		$scope.OffsetCmd['Param'] = [];
		$scope.OffsetCmd['SelectedNo'] = {};
		$scope.OffsetCmd['isGettingData'] = false;

		//do command
		DoCommand();
	}
	$scope.Edit = function( offsetObj )
	{
		offsetObj.isEdit = true;
		$scope.hint = "正在編輯第" + offsetObj.no + "把刀";

		//while editing, donot get data
		StopListeningResult();
	}
	$scope.Save = function( offsetObj )
	{
		//end edit
		offsetObj.isEdit = false;
		
		//select tool
		$scope.OffsetCmd['SelectedNo'] = offsetObj;

		//show to viewer
		$scope.hint = "儲存第" + offsetObj.no + "把刀設定";

		//save to db
		SaveOffsetData();
	}
	//style
	$scope.HintStyle = function()
	{
		if( $scope.hint == "" ){
			return {"opacity":"0"};
		}

		return {"opacity":"1"};
	}

	//interval setting
	StopListeningResult = function()
	{
		//stop listen db
		$scope.OffsetCmd['isGettingData'] = false;
	}
	StartListeningResult = function()
	{
		//listen db
		$scope.OffsetCmd['isGettingData'] = true;
	}

	//db connect
	DoCommand = function()
	{
		if( $scope.OffsetCmd['Param'].length == 0 ){
			$scope.OffsetCmd['Param'].push("");
			$scope.OffsetCmd['Param'].push("");
		}

		var commandObj = {"method":"Command", "cncID":$scope.cncID, "command":$scope.OffsetCmd['Command'], "param":$scope.OffsetCmd['Param'] };
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

			$scope.OffsetCmd['uniID'] = json.data.uniID;
			StartListeningResult();

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
		if( $scope.OffsetCmd['Command'] == GetCommandFromCmdList("ShowOffset") ){
			ParserCommandResult(null);
			return;
		}

		var commandObj = {"method":"GetCommandResult", "cncID":$scope.cncID, "uniID":$scope.OffsetCmd['uniID'] };
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

			ParserCommandResult( json.data );
		}).
		error(function(json){
			console.warn(json);
		});
	}
	ParserCommandResult = function( resultData )
	{
		if( $scope.OffsetCmd['uniID'] == "" ){
			return;
		}

		switch( $scope.OffsetCmd['Command'] ){
			case GetCommandFromCmdList("ShowOffset"):
				GetOffsetData();
			break;
			case GetCommandFromCmdList("WriteOffset"):
				//show to viewer
				$scope.hint = "儲存完成";

				//keep fetching offset data
				//CreateCommand( GetCommandFromCmdList("ShowOffset") );
			break;
		}
	}

	//save offsetData
	SaveOffsetData = function()
	{
		var vaules = "";
		
		//check mill or lathe
		if( $scope.cncInfos['MachineType']['data'] == "Mill" ){
			for( var i=0; i<MillTitleENG.length; i++ ){
				vaules = vaules + $scope.OffsetCmd['SelectedNo'][MillTitleENG[i]] + ";";
			}
		}else{
			for( var i=0; i<LatheTitleENG.length; i++ ){
				vaules = vaules + $scope.OffsetCmd['SelectedNo'][LatheTitleENG[i]] + ";";
			}
		}

		var commandObj = {"method":"WriteOffsetData", "cncID":$scope.cncID, "no":$scope.OffsetCmd['SelectedNo']['no'], "value":vaules };
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

			//success, command to agent
			$scope.OffsetCmd['Command'] = GetCommandFromCmdList("WriteOffset");
			$scope.OffsetCmd['Param'] = [];
			$scope.OffsetCmd['Param'].push( json.data.no ); //add tool no
			$scope.OffsetCmd['Param'].push("");
			DoCommand();
		}).
		error(function(json){
			console.warn(json);
		});
	}

	//offset setting
	GetOffsetData = function()
	{
		var commandObj = {"method":"GetOffsetData", "cncID":$scope.cncID };
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

			MappingOffsetData( json.data );
		}).
		error(function(json){
			console.warn(json);
		});
	}
	MappingOffsetData = function( cncOffsetData )
	{
		$scope.OffsetData = [];

		//check machine type
		if( $scope.cncInfos['MachineType']['data'] == "Mill" ){
			MillOffsetDataMapping( cncOffsetData );
		}else{
			LatheOffsetDataMapping( cncOffsetData );
		}

		//StartListeningResult();
	}
	MillOffsetDataMapping = function( cncOffsetData )
	{	
		for( var i=0; i<cncOffsetData.length; i++ ){
			var offsetValue = cncOffsetData[i].value.split(";");
			//{"no":2, "radius_geom":20.5, "radius_wear":20.1, "length_geom":30.5, "length_wear":50, "isEdit":false},
			var millObj = {"no":cncOffsetData[i].no, "radius_geom":offsetValue[0], "radius_wear":offsetValue[1], "length_geom":offsetValue[2], "length_wear":offsetValue[3], "isEdit":false};
			$scope.OffsetData.push( millObj );
		}
	}
	LatheOffsetDataMapping = function( cncOffsetData )
	{
		for( var i=0; i<cncOffsetData.length; i++ ){
			var offsetValue = cncOffsetData[i].value.split(";");
			//{"no":2, "wear_X":20.5, "wear_Z":20.1, "wear_A":30.5, "length_X":50, "length_Y":50, "length_A":50, "tool_nose_radius":50, "tool_nose_r_wear":50, "tool_nose":50, "isEdit":false},
			var latheObj = {"no":cncOffsetData[i].no, "wear_X":offsetValue[0], "wear_Z":offsetValue[1], "wear_A":offsetValue[2], "length_X":offsetValue[3], "length_Y":offsetValue[4], "length_A":offsetValue[5], "tool_nose_radius":offsetValue[6], "tool_nose_r_wear":offsetValue[7], "tool_nose":offsetValue[8], "isEdit":false};
			$scope.OffsetData.push( latheObj );
		}
	}

}]);