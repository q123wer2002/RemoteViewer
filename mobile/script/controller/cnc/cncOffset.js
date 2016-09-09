define([

], function () {
	function cncOffset($scope,$http,$interval,$timeout,$rootScope,frontendAdaptor,commandMgr){


		var MachineType = $scope.ShowCncData( "cncInfo","MachineType" );
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
		};
		$scope.nStartIndex = 0;
		$scope.nShowLength = 10;
		$scope.isDoneInitData = false;
		
		$scope.hint = "";
		$scope.initOffset = function()
		{
			if( MachineType == "Mill" ){
				$scope.OffsetTitles = MillTitle;
			}else{
				$scope.OffsetTitles = LatheTitle;
			}
			var coffset_cmd = commandMgr.fnGetCommand("ShowOffset");
			CreateCommand(coffset_cmd);
		}
		CreateCommand = function( szCommand )
		{
			//set default command
			$scope.OffsetCmd['uniID'] = "";
			$scope.OffsetCmd['Command'] = szCommand;
			$scope.OffsetCmd['Param'] = [];
			$scope.OffsetCmd['SelectedNo'] = {};
			//do command
			DoCommand();
		}
		
		$scope.Edit = function( offsetObj )
		{
			if( $rootScope.isAuthorityWrite == false ){
				$rootScope.isShowAuthority = true;
				return;
			}

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
		$scope.GetOffsetRange = function()
		{
			if( $scope.isDoneInitData == false ){
				return;
			}

			var start = $scope.nStartIndex;
			var length = $scope.nShowLength;

			var data = [];
			for( var i=0; i<length; i++ ){
				//max
				if( start+i > $scope.OffsetData.length ){
					continue;
				}

				data.push( $scope.OffsetData[start+i] );
			}

			return data;
		}

		$scope.isExistPrePage = function()
		{
			if( $scope.nStartIndex == 0 ){
				return false;
			}
			return true;
		}
		$scope.isExistNextPage = function()
		{
			var nMaxOffsetLength = $scope.OffsetData.length;
			if( ($scope.nStartIndex + $scope.nShowLength) > nMaxOffsetLength ){
				return false;
			}
			return true;
		}
		$scope.PrePage = function()
		{
			//start - range
			$scope.nStartIndex = $scope.nStartIndex - $scope.nShowLength;
		}
		$scope.NextPage = function()
		{
			//start + range
			$scope.nStartIndex = $scope.nStartIndex + $scope.nShowLength;
		}
		//style
			$scope.HintStyle = function()
			{
				if( $scope.hint == "" ){
					return {"opacity":"0"};
				}

				return {"opacity":"1"};
			}
			$scope.StyleOfSpecialIndex = function( offsetData )
			{
				try{
					if( parseInt(offsetData.no) === $scope.nOffsetIndex ){
						return {'background':'#FF4A51', 'color':'#ffffff'};
					}
				}catch(err){
					return;
				}
			}
		//fund special tool
			$scope.FindSpecificNo = function()
			{
				if( $scope.nOffsetIndex == "" ){
					return;
				}

				if( $scope.nOffsetIndex == null ){
					return;
				}

				if( $scope.nOffsetIndex > ($scope.OffsetData.length-1) ){
					return;
				}

				try {
					//for parameters
					var nTens = Math.floor(parseInt($scope.nOffsetIndex)/10);
					nTens = nTens *10;
					var nDigits = $scope.nOffsetIndex - nTens;

					var newStart = ( nDigits == 0 ) ? (nTens-10) : nTens;

					if( newStart == $scope.nStartIndex ){
						return;
					}

					$scope.nStartIndex = newStart;
					
					return;
				}
				catch(err) {
					return;
				}
			}
		//db connect
			DoCommand = function()
			{
				if( $scope.OffsetCmd['Param'].length == 0 ){
					$scope.OffsetCmd['Param'].push("");
					$scope.OffsetCmd['Param'].push("");
				}


				this.fnGetResult = function(response){
					if( response.result == "error" ){
					}

					ParserCommandResult( response.data );
				}

				var commandObj = { "cncID":$scope.cncID, "command":$scope.OffsetCmd['Command'], "param":$scope.OffsetCmd['Param'] };
				commandMgr.fnSendCommand( "CMD", commandObj, this.fnGetResult, true, true );
			}
			ParserCommandResult = function( resultData )
			{
				switch( $scope.OffsetCmd['Command'] ){
					case commandMgr.fnGetCommand("ShowOffset"):
			
						if( resultData != "upload toolset success" ){
							$scope.hint = "讀取失敗，請重新整理";
							return;
						}

						GetOffsetData();
					break;
					case commandMgr.fnGetCommand("WriteOffset"):
						//show to viewer

						if( resultData != "write toolset success" ){
							$scope.hint = "寫入失敗，請重新整理";
							return;
						}

						$scope.hint = "儲存完成";
						//keep fetching offset data
						//CreateCommand( commandMgr.fnGetCommand("ShowOffset") );
					break;
				}
			}
		//save offsetData
		SaveOffsetData = function()
		{
			var vaules = "";
			
			//check mill or lathe
			if( MachineType == "Mill" ){
				for( var i=0; i<MillTitleENG.length; i++ ){
					vaules = vaules + $scope.OffsetCmd['SelectedNo'][MillTitleENG[i]] + ";";
				}
			}else{
				for( var i=0; i<LatheTitleENG.length; i++ ){
					vaules = vaules + $scope.OffsetCmd['SelectedNo'][LatheTitleENG[i]] + ";";
				}
			}

			this.fnGetResult = function(response){
			
				if( response.result == "error" ){
				}

				//success, command to agent
				$scope.OffsetCmd['Command'] = commandMgr.fnGetCommand("WriteOffset");
				$scope.OffsetCmd['Param'] = [];
				$scope.OffsetCmd['Param'].push( response.data.no ); //add tool no
				$scope.OffsetCmd['Param'].push("");
				DoCommand();
			}

			var commandObj = { "cncID":$scope.cncID, "no":$scope.OffsetCmd['SelectedNo']['no'], "value":vaules };
			commandMgr.fnSendCommand( "SET_OFFSET_DATA", commandObj, this.fnGetResult, false, false );
		}

		//offset setting
		GetOffsetData = function()
		{
			this.fnGetResult = function(response){
				MappingOffsetData( response.data );
			}

			var commandObj = { "cncID":$scope.cncID };
			commandMgr.fnSendCommand( "GET_OFFSET_DATA", commandObj, this.fnGetResult, false, false );
		}
		MappingOffsetData = function( cncOffsetData )
		{
			$scope.OffsetData = [];

			//check machine type
			if( MachineType == "Mill" ){
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
			$scope.isDoneInitData = true;
		}
		LatheOffsetDataMapping = function( cncOffsetData )
		{
			for( var i=0; i<cncOffsetData.length; i++ ){
				var offsetValue = cncOffsetData[i].value.split(";");
				//{"no":2, "wear_X":20.5, "wear_Z":20.1, "wear_A":30.5, "length_X":50, "length_Y":50, "length_A":50, "tool_nose_radius":50, "tool_nose_r_wear":50, "tool_nose":50, "isEdit":false},
				var latheObj = {"no":cncOffsetData[i].no, "wear_X":offsetValue[0], "wear_Z":offsetValue[1], "wear_A":offsetValue[2], "length_X":offsetValue[3], "length_Y":offsetValue[4], "length_A":offsetValue[5], "tool_nose_radius":offsetValue[6], "tool_nose_r_wear":offsetValue[7], "tool_nose":offsetValue[8], "isEdit":false};
				$scope.OffsetData.push( latheObj );
			}
			$scope.isDoneInitData = true;
		}

	}

	return cncOffset;
});