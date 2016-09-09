define([

], function () {
	function cncDiagnosis($scope,$http,$interval,$timeout,$rootScope,frontendAdaptor,commandMgr){

		$scope.curtDiagUnit = "R_Bit";
		$scope.diagUnits = {
			R_Bit		: { "name":"R 值", "bgColor":"#ffffff", "fontColor":"#FF6800", "maxNo":65535 },
			I_Bit		: { "name":"I 值", "bgColor":"#ffffff", "fontColor":"#FF6800", "maxNo":65535 },
			O_Bit		: { "name":"O 值", "bgColor":"#ffffff", "fontColor":"#FF6800", "maxNo":65535 },
			C_Bit		: { "name":"C 值", "bgColor":"#ffffff", "fontColor":"#FF6800", "maxNo":65535 },
			S_Bit		: { "name":"S 值", "bgColor":"#ffffff", "fontColor":"#FF6800", "maxNo":65535 },
			A_Bit		: { "name":"A 值", "bgColor":"#ffffff", "fontColor":"#FF6800", "maxNo":65535 },
			Debug_Var	: { "name":"Debug值", "bgColor":"#ffffff", "fontColor":"#FF6800", "maxNo":65535 },
			Param		: { "name":"參數值", "bgColor":"#ffffff", "fontColor":"#FF6800", "maxNo":65535 },
		};

		//$scope.editedValue = 0;
		$scope.diagnosisData = [];
		$scope.diagnosisCmd = {};

		//param area
			var isDoneParamSchema = false;
			var nShowParamNumber = 10;
			$scope.paramRange = {
				"START"	: { "nArrayIndex":0, "nParamIndex":0 },
				"END"	: { "nArrayIndex":0, "nParamIndex":0 },
			};
			$scope.ParamSchema = [];

		//default function
			$scope.initDiagnosis = function()
			{
				GetParamSchema();
				$scope.setDiagParam($scope.curtDiagUnit);
			}
			$scope.setDiagParam = function( unitKey )
			{
				chosedColor = { "bg":"#FF6800", "font":"#ffffff" };
				tabClick( $scope.diagUnits, unitKey, chosedColor);
				$scope.curtDiagUnit = unitKey;

				if( $scope.GetDiagnosisGroup() == "ParamGroup" ){
					//progressing
					if( isDoneParamSchema == false ){
						//$scope.setDiagParam( "R_Bit" );
					}

					//for parameters
					var szCmd = commandMgr.fnGetCommand( unitKey );
					CreateCommand(szCmd, $scope.paramRange['START']['nParamIndex'], $scope.paramRange['END']['nParamIndex']);
					return;
				}

				var szCmd = commandMgr.fnGetCommand( unitKey );
				CreateCommand(szCmd, 0, 99);
			}
		 	CreateCommand = function( szCommand, nStart, nEnd )
		 	{
		 		$scope.diagnosisCmd['uniID'] = "";
		 		$scope.diagnosisCmd['Command'] = szCommand;
		 		$scope.diagnosisCmd['Start'] = nStart;
		 		$scope.diagnosisCmd['End'] = nEnd;
		 		$scope.diagnosisCmd['UpdateTime'] = "";
				$scope.diagnosisData = [];
				DoCommand();
		 	}
	 	//show view
			$scope.ShowTitle = function( nColumnIndex, nRowIndex )
			{
				if( nColumnIndex == -1 ){
					return ( (nRowIndex) < 0 ) ? "-" : (nRowIndex);
				}

				if( nRowIndex == -1 ){
					return ( (nColumnIndex) < 0 ) ? "-" : (nColumnIndex);
				}
			}
			$scope.StyleOfTitle = function( nColumnIndex, nRowIndex )
			{
				if( nRowIndex == -1 ){
					return {'background':"#FF6800", "width":"100%", "color":"#000", "font-size":"18px"};
				}

				if( nColumnIndex == -1 ){
					return {'background':"#FF6800", "width":"100%", "color":"#000", "font-size":"18px"};
				}
			}
			$scope.ShowDiagTens = function()
			{
				var aryTens = [ "-1" ]; // default
				var ten = Math.floor($scope.diagnosisCmd['End']/100);
				ten = ten*100;
				for( var i=0; i<10; i++ ){
					var index = ten + (i*10);
					if( index > $scope.diagUnits[$scope.curtDiagUnit]['maxNo'] ){
						break;
					}
					aryTens.push(index);
				}

				return aryTens;
			}
			$scope.StyleOfIOCSAbit = function( nTens, nDigits )
			{
				var value = $scope.MappingDataIntoTable( nTens, nDigits );
				
				if( value == "" ){
					return {};
				}

				if( value == "FF" ){
					return {"color":"red", "font-weight":"700"};
				}

				if( value.length > 8 ) {
					return {"font-size":"13px"};
				}

				return {"font-size":"18px"};

			}
			$scope.MappingDataIntoTable = function( nTens, nDigits )
			{
				if( $scope.diagnosisData.length == 0 ){
					return "";
				}

				if( nTens == -1 || nDigits == -1 ){
					return "";
				}

				var nNo = nTens + nDigits;
				for( var i=0; i<$scope.diagnosisData.length; i++ ){
					if( $scope.diagnosisData[i].no == nNo ){
						return $scope.diagnosisData[i].value;
					}
				}
			}
			$scope.MappingDataIntoParam = function( nParamIndex )
			{
				if( $scope.diagnosisData.length == 0 ){
					return "";
				}

				if( nParamIndex < 0 ){
					return "";
				}

				for( var i=0; i<$scope.diagnosisData.length; i++ ){
					if( $scope.diagnosisData[i].no == nParamIndex ){
						return $scope.diagnosisData[i].value;
					}
				}
			}
			$scope.GetDiagnosisGroup = function()
			{
				//group is assigned by view in cnc
				var NormalDiagnosisGroup = [ "R_Bit", "Debug_Var" ];
				var ParamGroup = [ "Param" ];
				var IOCSAGroup = [ "I_Bit", "O_Bit", "C_Bit", "S_Bit", "A_Bit" ];

				if( NormalDiagnosisGroup.indexOf($scope.curtDiagUnit) != -1 ){
					return "NormalDiagnosisGroup";
				}else if( ParamGroup.indexOf($scope.curtDiagUnit) != -1 ){
					return "ParamGroup";
				}else if( IOCSAGroup.indexOf($scope.curtDiagUnit) != -1 ){
					return "IOCSAGroup";
				}else{
					//default
					return "NormalDiagnosisGroup";
				}
			}
			$scope.GetParamSchema = function()
			{
				var tmpParamSchema = [];
				for( var i=$scope.paramRange['START']['nArrayIndex']; i<=$scope.paramRange['END']['nArrayIndex']; i++ ){
					
					if( i >= $scope.ParamSchema.length ){
						break;
					}

					tmpParamSchema.push( $scope.ParamSchema[i] );
				}

				return tmpParamSchema;
			}
		//edit data
			$scope.DbClickToEditValue = function( nTens, nDigits )
			{
				$scope.edit = true;
				$scope.cloneData = $scope.diagnosisData;
				Debug($scope.editedValue);
			}
			$scope.EditDiagData = function( nTens, nDigits )
			{
				if( typeof $scope.editedValue == "undefined" ){
					return;
				}

				Debug( $scope.editedValue );

				var nNo = nTens + nDigits;
				for( var i=0; i<$scope.diagnosisData.length; i++ ){
					if( $scope.diagnosisData[i].no == nNo ){
						$scope.diagnosisData[i].value = $scope.editedValue;
					}
				}
			}
		//find one value
			$scope.FindSpecificNo = function()
			{
				if( $scope.nDiagNo == "" ){
					return;
				}

				if( $scope.nDiagNo == null || $scope.nDiagNo < 0 ){
					return;
				}

				try {

					//
					if( $scope.GetDiagnosisGroup() == "ParamGroup" ){
						//for parameters
						var nFindIndex = $scope.nDiagNo;
						
						//get the indexRange
						var nStartArrayIndex = 0;
						for( var i=0; i<$scope.ParamSchema.length; i=i+nShowParamNumber ){
							if( $scope.ParamSchema[ i+(nShowParamNumber-1) ]['index'] >= nFindIndex ){
								nStartArrayIndex = i;
								break;
							}
						}

						$scope.paramRange['START']['nArrayIndex'] = nStartArrayIndex;
						$scope.paramRange['END']['nArrayIndex'] = nStartArrayIndex + (nShowParamNumber-1);
						var newStart = $scope.ParamSchema[ $scope.paramRange['START']['nArrayIndex'] ]['index'];
						var newEnd = $scope.ParamSchema[ $scope.paramRange['END']['nArrayIndex'] ]['index'];
						var command = $scope.diagnosisCmd['Command'];

						if( newStart == $scope.diagnosisCmd['Start'] ){
							return;
						}
						
						CreateCommand(command, newStart, newEnd);
						return;
					}

					//show red color
					var nTens = Math.floor(parseInt($scope.nDiagNo)/10);
					nTens = nTens *10;
					var nDigits = $scope.nDiagNo - nTens;

					var number = Math.floor(parseInt($scope.nDiagNo)/100);
					
					var command = $scope.diagnosisCmd['Command'];
					var newStart = (number*100);
					var newEnd = (number*100) + 99;

					if( newStart == $scope.diagnosisCmd['Start'] ){
						return;
					}
					
					CreateCommand(command, newStart, newEnd);
				}
				catch(err) {
					return;
				}
			}
			$scope.SpecificNoStyle = function( nTens, nDigits )
			{
				if( $scope.diagnosisData.length == 0 ){
					return;
				}

				if( nTens === -1 || nDigits === -1 ){
					return;
				}

				var nNo = nTens + nDigits;

				if( $scope.nDiagNo === nNo ){
					//Debug($scope.nDiagNo);
					return {'background':'#FF4A51', 'color':'#ffffff'};
				}
			}
			$scope.StyleOfSelectedParam = function( nParamIndex )
			{
				//console.log(nParamIndex);
				if( $scope.diagnosisData.length == 0 ){
					return;
				}

				nParamIndex = parseInt( nParamIndex );
				if( $scope.nDiagNo === nParamIndex ){
					//Debug($scope.nDiagNo);
					return {'background':'#FF4A51', 'color':'#ffffff'};
				}
			}
		//btn click page
			$scope.isExistPrePage = function()
			{
				if( $scope.GetDiagnosisGroup() == "ParamGroup" ){
					//for parameters
					if( $scope.diagnosisCmd['Start'] == 1 ){
						return false;
					}
					return true;
				}

				if( $scope.diagnosisCmd['Start'] == 0 ){
					return false;
				}
				return true;
			}
			$scope.isExistNextPage = function()
			{
				//for ParamGroup
				if( $scope.GetDiagnosisGroup() == "ParamGroup" ){
					if( $scope.paramRange['END']['nArrayIndex'] >= $scope.ParamSchema.length ){
						return false;
					}
				}

				if( $scope.diagnosisCmd['End'] < $scope.diagUnits[$scope.curtDiagUnit]['maxNo'] ){
					return true;
				}

				return false;
			}
			$scope.PrePage = function()
			{
				if( $scope.GetDiagnosisGroup() == "ParamGroup" ){
					//for parameters
					$scope.paramRange['START']['nArrayIndex'] -= nShowParamNumber;
					$scope.paramRange['END']['nArrayIndex'] -= nShowParamNumber;
					var newStart = $scope.ParamSchema[ $scope.paramRange['START']['nArrayIndex'] ]['index'];
					var newEnd = $scope.ParamSchema[ $scope.paramRange['END']['nArrayIndex'] ]['index'];
					CreateCommand(command, newStart, newEnd);
					return;
				}

				var command = $scope.diagnosisCmd['Command'];
				var newStart = $scope.diagnosisCmd['Start'] - 100;
				var newEnd = $scope.diagnosisCmd['End'] - 100;
				CreateCommand(command, newStart, newEnd);
			}
			$scope.NextPage = function()
			{
				if( $scope.GetDiagnosisGroup() == "ParamGroup" ){
					//for parameters
					try{
						var command = $scope.diagnosisCmd['Command'];
						$scope.paramRange['START']['nArrayIndex'] += nShowParamNumber;
						$scope.paramRange['END']['nArrayIndex'] += nShowParamNumber;
						var newStart = $scope.ParamSchema[ $scope.paramRange['START']['nArrayIndex'] ]['index'];
						var newEnd = $scope.ParamSchema[ $scope.paramRange['END']['nArrayIndex'] ]['index'];
						CreateCommand(command, newStart, newEnd);
						
					}catch(e){
						//console.log(e);
					}

					return;
				}

				var command = $scope.diagnosisCmd['Command'];
				var newStart = $scope.diagnosisCmd['Start'] + 100;
				var newEnd = $scope.diagnosisCmd['End'] + 100;
				CreateCommand(command, newStart, newEnd);
			}
		

		//database connect
			DoCommand = function()
			{
				if( $scope.diagnosisCmd['End'] > $scope.diagUnits[$scope.curtDiagUnit]['maxNo'] ){
					$scope.diagnosisCmd['End'] = $scope.diagUnits[$scope.curtDiagUnit]['maxNo'];
				}

				var param = [];
				param.push($scope.diagnosisCmd['Start']);
				param.push($scope.diagnosisCmd['End']);


				this.fnGetResult = function(response){
					//Debug( response );
					if( response.result == "error" ){
						//Debug( response );
					}


					//get new uniID
					$scope.diagnosisCmd['uniID'] = response.data.uniID;

					//start getting diagnosis data
					GetDiagnosisData();
				}

				var commandObj = { "cncID":$scope.cncID, "command":$scope.diagnosisCmd['Command'], "param":param };
				commandMgr.fnSendCommand( "CMD", commandObj, this.fnGetResult, false, false );
			}
			GetDiagnosisData = function()
			{
				//no uni id, cannot get data
				if( $scope.diagnosisCmd['uniID'] == "" ){
					return;
				}

				this.fnGetResult = function(response){
					if( response.uniID != $scope.diagnosisCmd['uniID'] ){
						GetDiagnosisData();
						return;
					}

					var isMappingDone = MappingDataFromDBIntoAry(response.data);
					if( isMappingDone == true ){
						//get data
						GetDiagnosisData();
					}
				}

				//set flag
				var commandObj = { "cncID":$scope.cncID, "commandParam":$scope.diagnosisCmd };
				commandMgr.fnSendCommand( "GET_DIAG_DATA", commandObj, this.fnGetResult, false, false );
			}
			MappingDataFromDBIntoAry = function( diagnosisData )
			{
				if( diagnosisData.length == 0 ){
					return true;
				}

				$scope.diagnosisData = [];

				var lastUpdatingTime = new Date(diagnosisData[0]['agent_time']);

				for(var i=0; i<diagnosisData.length; i++ ){
					
					var update_time = new Date(diagnosisData[i]['agent_time']);
					if( update_time - lastUpdatingTime > 0 ){
						lastUpdatingTime = update_time;
					}

					var diagObj = {"no":diagnosisData[i]['no'], "value":diagnosisData[i]['value']};
					$scope.diagnosisData.push(diagObj);
				}

				$scope.diagnosisCmd['UpdateTime'] = changeDateToTime(lastUpdatingTime);

				return true;
			}
			GetParamSchema = function()
			{
				this.fnGetResult = function(response){
					//Debug( response );
					if( response.result == "error" ){
						//Debug( response );
					}

					if( typeof response.data == "undefined" || response.data.length == 0 ){
						return;
					}

					MappingParamSchema( response.data );
				}

				var commandObj = { "cncID":$scope.cncID };
				frontendAdaptor.fnGetResponse( 'CNCDATA', "GetParamSchema", commandObj, this.fnGetResult, false );
			}
			MappingParamSchema = function( XMLParamSchema )
			{
				if( XMLParamSchema.length == 0 ){
					return;
				}

				var jsonRule = {
					Parent		: "<Param>",
					Child		: [ "index", "context", "bound" ],
				};

				//get param schema
				$scope.ParamSchema = ParseXML2Json( XMLParamSchema, jsonRule );
				
				//caulate start and end index
				$scope.paramRange['START']['nArrayIndex'] = 0;
				$scope.paramRange['END']['nArrayIndex'] = 9;
				$scope.paramRange['START']['nParamIndex'] = $scope.ParamSchema[0]['index'];
				$scope.paramRange['END']['nParamIndex'] = $scope.ParamSchema[9]['index'];

				//progress done
				isDoneParamSchema = true;
			}

	}

	return cncDiagnosis;
});