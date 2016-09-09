define([
	'../../app',
	'../../../shared/script/lib/highcharts',

	//sub controller
	'../controller/cnc/cncOOE',
	'../controller/cnc/cncRecord',
	'../controller/cnc/cncAlarm',
	'../controller/cnc/cncDiagnosis',

], function ( app, highcharts, cncOOE, cncRecord, cncAlarm, cncDiagnosis, cncFileTransfer, cncOffset ) {
	app.controller('cncControl', function($scope,$http,$interval,$timeout,$rootScope,$routeParams,accountMgr,frontendAdaptor,commandMgr,cncDataMgr){
		
		$scope.cncID = $routeParams.cnc_id;
		$scope.AutoFixBackWidth = function()
		{
			var monitorWidht = $(document).width();

			if( monitorWidht > 1024 ){
				var width = (monitorWidht-1200)/5;
				return {'width':width+'px'};
			}

			return {};
		}

		//loading var, and page show var
		var isHisDataLoading = false;
		var currentHisPage	= "";

		$scope.tabHisClick = function( tabName, tabData )
		{
			$scope.scrollBarWith = tabData.width;
			$scope.scrollBarLeft = tabData.left;
			$scope.scrollBarBG = tabData.bgColor;
			currentHisPage = tabName;
			$scope.showDataHtml = "view/mobile/content/cnc/" + tabName + ".html";

			//cancel other interval
			for( var profileName in $scope.cncFunctions ){
				if( tabName == profileName ){
					continue;
				}
				$interval.cancel($scope.cncFunctions[profileName]['Interval']);
			}
		}

		$scope.objCncInfos = {
			IP 			:	"IP位置",
			Machine		:	"型號",
			MachineType	:	"機型",
			Version		:	"版本",
			SerialNo	:	"序號",
			RestDay		:	"保固剩餘天數",
		};
		$scope.cncFunctionGroups = [
			{"FGID":1, "name":"生產紀錄", "background":"#39D1DB", "icon":"", "width":"", "heigth":"", "isAuthority":false },
			{"FGID":2, "name":"異常診斷", "background":"#FF9A72", "icon":"", "width":"", "heigth":"", "isAuthority":false },
			{"FGID":3, "name":"遠程操作", "background":"#C09494", "icon":"", "width":"", "heigth":"", "isAuthority":false },
		];
		$scope.cncFunctions = {
			HisOOE		:	{"FGID":1, "name":"稼動率", "icon":"images/cncs/OOE.png", "width":80, "left":"", "bgColor":"#111d6d", "isShow":true, "Interval":"", "AgentVersion":"1.0.1"},
			HisRecord	:	{"FGID":1, "name":"加工記錄", "icon":"images/cncs/record.png", "width":90, "left":"", "bgColor":"#16BA03", "isShow":true, "Interval":"", "AgentVersion":"1.0.1"},
			HisAlarm	:	{"FGID":2, "name":"警報", "icon":"images/cncs/alarm.png", "width":70, "left":"", "bgColor":"#FF4545", "isShow":true, "Interval":"", "AgentVersion":"1.0.1"},
			Diagnosis	:	{"FGID":2, "name":"診斷資訊", "icon":"images/cncs/diagnosis.png", "width":95, "left":"", "bgColor":"#FF781B", "isShow":true, "Interval":"", "AgentVersion":"1.0.3"},
			FileTransfer:	{"FGID":3, "name":"檔案上下載", "icon":"images/cncs/transfer.png", "width":105, "left":"", "bgColor":"#62000F", "isShow":true, "Interval":"", "AgentVersion":"1.0.2"},
			Offset		:	{"FGID":3, "name":"刀補磨耗", "icon":"images/cncs/offset.png", "width":85, "left":"", "bgColor":"#7F7F7F", "isShow":true, "Interval":"", "AgentVersion":"1.0.2"},
		};

		$scope.cncHisAlarms = [];
		$scope.cncHisRecords = [];
		$scope.cncHisOOEs = [];

		$scope.InitCNCPage = function()
		{
			//default show first item
			InitCNCFunctionGroup();
			$scope.ShowFunctionGroupItem( $scope.cncFunctionGroups[0] );
			$scope.GetCncData();
		}
		$scope.GetGroupName = function()
		{
			for( var i=0; i<$scope.cncFunctionGroups.length; i++ ){
				if( $scope.cncFunctionGroups[i]['FGID'] == $scope.cncFunctions[currentHisPage]['FGID'] ){
					return;
				}
			}
		}
		$scope.StyleOfSelectedGroup = function( functionGroupObj )
		{
			//console.log( $scope.currentFunGroup );
			switch( functionGroupObj['name'] ) {
				case "生產紀錄":
					return {'border-bottom':'2px solid #1212FF', 'width':'90%'};
				break;
				case "異常診斷":
					return {'border-bottom':'2px solid #FF2626', 'width':'90%'};
				break;
				case "遠程操作":
					return {'border-bottom':'2px solid #696969', 'width':'90%'};
				break;
				default:
				break;
			}
		}
		$scope.fnInitCncDataForMobile = function()
		{
			for( var key in $scope.cncFunctions ){
				$scope.cncFunctions[key]['isShow'] = false;
			}

			$scope.cncFunctions["HisOOE"]['isShow'] = true;
			$scope.cncFunctions["HisRecord"]['isShow'] = true;
			$scope.cncFunctions["HisAlarm"]['isShow'] = true;
		}
		//function group
			$scope.ShowFunctionGroupItem = function( functionGroupObj )
			{
				if( typeof functionGroupObj['FGID'] == "undefined" ){
					return;
				}

				$scope.currentFunGroup = functionGroupObj;

				//default close all profile 
				for( profileName in $scope.cncFunctions ){
					ResetFunctionItems();
				}

				//show group items
				for( profileName in $scope.cncFunctions ){
					if( $scope.cncFunctions[profileName]['FGID'] == functionGroupObj['FGID'] ){
						$scope.cncFunctions[profileName].isShow = true;
					}
				}

				//set items
				InitCNCProfileTabList();
			}
			ResetFunctionItems = function()
			{
				for( profileName in $scope.cncFunctions ){
					$scope.cncFunctions[ profileName ].left = "";

					if( typeof $scope.cncFunctions[ profileName ].width == "number" ){
						continue;
					}

					if(  $scope.cncFunctions[ profileName ].width.indexOf("px") != -1 ){
						var width = $scope.cncFunctions[ profileName ].width.split("px");
						$scope.cncFunctions[ profileName ].width = parseInt(width[0]);
					}
				}
			}
			InitCNCProfileTabList = function()
			{
				var szFirstProfileName = "";
				var leftFGID_1 = 0, leftFGID_2 = 342, leftFGID_3 = 684;
				for( profileName in $scope.cncFunctions ){

					if( (profileName == "Offset") && ($scope.ShowCncData('cncInfo','MachineType') != "Lathe") && ($scope.ShowCncData('cncInfo','MachineType') != "Mill") ){
						//only mill and lathe need offset
						$scope.cncFunctions[profileName].isShow = false;
						continue;
					}

					if( leftFGID_1 == 0 ){
						szFirstProfileName = profileName;
						//show page
						currentHisPage = profileName;
						//set scroll bar color
						$scope.scrollBarBG = $scope.cncFunctions[ profileName ].bgColor;

						//set the default histroy page
						$scope.showDataHtml = "templates/" + $scope.viewDevice + "/content/cnc/" + profileName + ".html";
					}

					//set the scrollbar's path
					//set the scrollbar's path
					switch( $scope.cncFunctions[ profileName ].FGID ){
						case 1:
							$scope.cncFunctions[ profileName ].left = leftFGID_1 + "px";
							leftFGID_1 = leftFGID_1 + $scope.cncFunctions[ profileName ].width + 10;
							$scope.cncFunctions[ profileName ].width = $scope.cncFunctions[ profileName ].width + "px";
						break;
						case 2:
							$scope.cncFunctions[ profileName ].left = leftFGID_2 + "px";
							leftFGID_2 = leftFGID_2 + $scope.cncFunctions[ profileName ].width + 10;
							$scope.cncFunctions[ profileName ].width = $scope.cncFunctions[ profileName ].width + "px";
						break;
						case 3:
							$scope.cncFunctions[ profileName ].left = leftFGID_3 + "px";
							leftFGID_3 = leftFGID_3 + $scope.cncFunctions[ profileName ].width + 10;
							$scope.cncFunctions[ profileName ].width = $scope.cncFunctions[ profileName ].width + "px";
						break;
						default:
						break;
					}
				}

				$scope.tabHisClick( szFirstProfileName, $scope.cncFunctions[szFirstProfileName] );
			}
			InitCNCFunctionGroup = function()
			{
				var nWidth = jQuery(".menuDiv").width();
				var nHeight = 50;//jQuery(".menuDiv").height()-30;//title
				var nNumOfGroup = $scope.cncFunctionGroups.length;

				switch( nNumOfGroup ){
					case 3:
						for( var i=0; i<nNumOfGroup; i++ ){
							$scope.cncFunctionGroups[i].width = ((nWidth/3)) + "px";
							$scope.cncFunctionGroups[i].height = nHeight + "px";
						}
					break;
				}
			}
		//Get cnc Data
			$scope.GetCncData = function()
			{
				var aryDataList = [ "szName", "nGroupID", "filePic", "cncInfo", "szSerialNo", "szGroupName", "szFactoryName", "dateAgentTime"];
				cncDataMgr.fnDispose();
				cncDataMgr.fnInitConstruct( [$scope.cncID], aryDataList, [], function(response){
					cncDataMgr.fnStartFetching();
					$scope.cncData = cncDataMgr.fnGetCncDataPersistently();
				});
			}
			$scope.ShowCncData = function( szDataName, szSubDataName )
			{
				var cncData = $scope.cncData;

				if( typeof cncData == "undefined" || cncData == null ){
					return "";
				}

				if( szDataName == "cncStatus" ){
					return cncData[0]['cncStatus'];
				}

				if( typeof cncData[0]['aryData'][szDataName] == "undefined" || cncData[0]['aryData'][szDataName]['value'].length == 0 ){
					if( szDataName == "filePic" ){
						return "images/cncs/cnc.jpg";
					}
					return "";
				}

				switch( szDataName ){
					case "filePic":
						return "data:image/PNG;base64," + cncData[0]['aryData'][szDataName]['value'];
					break;
					case "dateAgentTime":
						return changeDateToTime(cncData[0]['aryData']['dateAgentTime']['value']);
					break;
					case "cncInfo":
						return cncData[0]['aryData'][szDataName]['value'][szSubDataName];
					break;
					default:
						return cncData[0]['aryData'][szDataName]['value'];
					break;
				}
			}

		$scope.getCurrentHisData = function( hisDataParam ) //hisDataParam is type of JSON
		{
			if(typeof hisDataParam == "undefined"){
				hisDataParam = "init";
			}

			this.fnGetResult = function(response){
				if(response.result == "success"){
					//Debug( response.data );
					if( currentHisPage == "HisOOE" ){
						response.data.ooeParam = hisDataParam;
					}

					Void_paddingHisData( response.data );
				}
			}

			var HisDataObj = { "cncID":$scope.cncID, "HistoryDataName":currentHisPage, "HistoryDataParam":hisDataParam };
			frontendAdaptor.fnGetResponse( 'CNCDATA', 'getHisData', HisDataObj, this.fnGetResult, false );
		}

		Void_paddingHisData = function( data )
		{
			//Debug(data);
			switch( currentHisPage ){
				case "HisOOE":
					if( $scope.allDateRecordAry.length == 0 && data != "" ){
						
						if( typeof data.OOE.hisRecordFile == "undefined" ){
							break;
						}

						//crete record title(publicFunction)
						if( $scope.recordHeader.length == 0 ){
							//publicFunction.js
							$scope.recordHeader = LoadRecordFileHeader( data.OOE.hisRecordFile );
							//Debug($scope.recordHeader);
						}

						//crete record body(publicFunction)
						if( $scope.hisWork.length == 0 ){
							//publicFunction.js
							$scope.hisWork = LoadRecordFile( data.OOE.hisRecordFile );
						}

						//check shift array
						if( $scope.shiftTime.length == 0 ){
							LoadSchedule();
						}

						Void_findworkTimeOfEachDay("DAY");

						//delay 0.3s to set ooe, cuz need explain record first
						$timeout(function(){
							//init
							$scope.curtDataStart = 0;//$scope.allDateRecordAry.length;
							Void_setOOEAry( data.ooeParam );				
						},300);

						//mapping data
						//get from database
						$scope.workTimeStand	=	data.OOE.expectedWorkTime;
						$scope.R1011_allCycTime	=	data.OOE.totalCycTime;
						$scope.R1013_allOpenTime=	data.OOE.TimeOfOpening;
						$scope.avgHisOOE		=	(Math.round(($scope.R1011_allCycTime/$scope.R1013_allOpenTime)*10000)/100);
						break;
					}
				break;

				case "HisAlarm":
					Void_mappingAlm(data);
				break;

				case "HisRecord":
					Void_mappingRecord(data);
				break;

				default:
				break;
			}
		}

		//record array
		$scope.allDateRecordAry	=	[];
		$scope.recordHeader = [];
		$scope.hisWork = [];
		$scope.curtUnit = "DAYOOE";
		//read record function

			//get shcedule shift
			$scope.shiftTime = [];
			LoadSchedule = function() //init getData
			{
				this.fnGetResult = function(response){
					if( response.data == "" ){
						return;
					}

					$scope.shiftTime = JSON.parse(Base64.decode(response.data['shiftTime']));
					GetTimeFromJson( $scope.shiftTime );
				}

				var loadshiftScheduleObj = { "cncid":$scope.cncID };
				frontendAdaptor.fnGetResponse( 'SCHEDULE', 'LoadSchedule', loadshiftScheduleObj, this.fnGetResult, false );
			}
			GetTimeFromJson = function( JSON_shiftObj )
			{
				for( var i=0; i<JSON_shiftObj.length; i++ ){
					//get time from json
					var start = new Date( JSON_shiftObj[i]['StartTime'] );
					var end = new Date( JSON_shiftObj[i]['EndTime'] );

					//map back into time 
					JSON_shiftObj[i]['StartTime'] = start;
					JSON_shiftObj[i]['EndTime'] = end;
				}
			}

		    //parse record into each day
		    Void_findworkTimeOfEachDay = function( timeUnit )
			{
				//clear
				$scope.allDateRecordAry.length = 0;
				var todayDate = new Date();
				var processitem = 0;

				//($scope.allDateRecordAry.length < 10) && (processitem < $scope.hisWork.length)
				while( processitem < $scope.hisWork.length ){
					
					if( typeof $scope.hisWork[processitem].Col_StartDate == "undefined" || typeof $scope.hisWork[processitem].Col_StartTime == "undefined" ){
						break;
					}

					var tmpRecordAry = Void_analyzeRecord( $scope.hisWork[processitem], timeUnit );


					for(var i=tmpRecordAry.length-1; i>=0; i--){
						Void_insertRecordDate( tmpRecordAry[i], $scope.allDateRecordAry );
					}

					processitem++;
				}

				//Debug( $scope.allDateRecordAry );
			}

			Void_analyzeRecord = function( recorditem, timeUnit )
			{
				var secondOfTimeunit = TotalSecondOfTimeUnit( recorditem.Col_StartDate, timeUnit );

				var countOfCreate = 1;
				var tmpWorkAry=[];

				var startOfSecond = StartOfTimeUnitInSeconds( recorditem, timeUnit );
				
				var timeAry = recorditem.Col_TotalTime.split( ":" );
				timeAry[0] = parseInt(timeAry[0]); //hour
				timeAry[1] = parseInt(timeAry[1]); //minute
				timeAry[2] = parseInt(timeAry[2]); //second
				var workOfSecond = ( timeAry[0]*60 + timeAry[1] )*60 + timeAry[2];

				//var nThroughUnits = Math.ceil( (startOfSecond+workOfSecond)/secondOfTimeunit );
				var totalEndSecond = startOfSecond + workOfSecond;
				if( totalEndSecond > secondOfTimeunit ){
					
					var firtDayWork = secondOfTimeunit - startOfSecond;
					var lastWorkOfSecond = ((startOfSecond + workOfSecond - secondOfTimeunit)%secondOfTimeunit);

					//first day
					var recordObj = {"date":"", 'totalWorkTime':firtDayWork, "workDetail":[
						{"mainProg":recorditem.Col_ProgName, "workTime":firtDayWork, "startOfSecond":startOfSecond, "ocpyPercent":"100%"}
					]};
					tmpWorkAry.push( recordObj );

					//middle day
					var nFullWorkTimes = (workOfSecond - firtDayWork - lastWorkOfSecond)/secondOfTimeunit;
					for( var i=0; i<nFullWorkTimes; i++ ){
						var tmpWorkOfEachUnit = ( (totalEndSecond%secondOfTimeunit) != 0 ) ? (totalEndSecond%secondOfTimeunit) : secondOfTimeunit;
						var recordObj = {"date":"", 'totalWorkTime':secondOfTimeunit, "workDetail":[
							{"mainProg":recorditem.Col_ProgName, "workTime":secondOfTimeunit, "startOfSecond":0, "ocpyPercent":"100%"}
						]};
						tmpWorkAry.push( recordObj );
					}

					//last day
					var recordObj = {"date":"", 'totalWorkTime':lastWorkOfSecond, "workDetail":[
						{"mainProg":recorditem.Col_ProgName, "workTime":lastWorkOfSecond, "startOfSecond":0, "ocpyPercent":"100%"}
					]};
					tmpWorkAry.push( recordObj );

				}else{
					var recordObj = {"date":"", 'totalWorkTime':workOfSecond, "workDetail":[
						{"mainProg":recorditem.Col_ProgName, "workTime":workOfSecond, "startOfSecond":startOfSecond, "ocpyPercent":"100%"}
					]};
					tmpWorkAry.push( recordObj );
				}

				//give date to each item in tmpWorkAry
				var nTmpWorkAryLength = tmpWorkAry.length;
				for( var i=nTmpWorkAryLength-1; i>=0; i-- ){
					
					var startDate = new Date( recorditem.Col_StartDate );

					if( timeUnit == "DAY" ){
						startDate.setDate( startDate.getDate()+i );
						tmpWorkAry[i].date = parseInt(startDate.getMonth())+1 + "/" + startDate.getDate() + "/" + startDate.getFullYear();
					}else if( timeUnit == "MONTH" ){
						startDate.setMonth( startDate.getMonth()+i );
						tmpWorkAry[i].date = startDate.getFullYear() + "-" + (parseInt(startDate.getMonth())+1);
					}else if( timeUnit == "YEAR" ){
						startDate.setYear( startDate.getFullYear()+i );
						tmpWorkAry[i].date = startDate.getFullYear();
					}
				}
				return tmpWorkAry;
			}
			Void_insertRecordDate = function( recordObj, recordAry )
			{
				//Debug(recordObj);
				var isAlreadyExit = false;

				if( recordAry.length != 0 ){
					for( var j=0; j<recordAry.length; j++ ){
						if( recordAry[j].date == recordObj.date ){
							//
							recordAry[j].totalWorkTime += recordObj.totalWorkTime;
							recordAry[j].workDetail.push( recordObj.workDetail[0] );
							
							//
							for(var k=0; k<recordAry[j].workDetail.length; k++){
								recordAry[j].workDetail[k].ocpyPercent = (Math.round( (recordAry[j].workDetail[k].workTime / recordAry[j].totalWorkTime )*10000)/100) + "%";
							}

							isAlreadyExit = true;
							break;
						}
					}
				}

				if( isAlreadyExit == false ){
					recordAry.push( recordObj );
				}
			}

		//debug function
			$scope.ShowDebugDoor = function()
			{
				$scope.isOpenDebugDoor = true;
			}
			$scope.CloseDoor = function()
			{
				$scope.szDebugDoor = "";
				$scope.isOpenDebugDoor = false;
				$scope.isEnterDoor = false;
			}
			$scope.checkEnterDebug = function()
			{
				if( $scope.szDebugDoor == "520" ){
					$scope.isEnterDoor = true;
				}
			}
			$scope.DoCommand = function( command )
			{	
				this.fnGetResult = function(response){
					//Debug( json );
					if( command != "DEBUGUPLOAD"){
						return;
					}

					//listen file
					$scope.isListening = false;
					$scope.listenDebugFile = $interval(function(){
						
						if( $scope.isListening == true ){
							return;
						}
						DOWNLOADDEBUG();

					}, 1000);
				}

				var cmd = GetCommandFromCmdList( command );
				var commandObj = { "cncID":$scope.cncID, "command":cmd, "param":["",""] };

				frontendAdaptor.fnGetResponse( 'COMMAND', 'Command', commandObj, this.fnGetResult, false );
			}
			DOWNLOADDEBUG = function()
			{
				$scope.isListening = true;

				this.fnGetResult = function(response){
					if( response.data == "" ){
						$scope.isListening = false;
						return;
					}

					//stop listening
					$interval.cancel($scope.listenDebugFile);
					
					//means upload ok
					jQuery('<a></a>', {
						"download": $scope.cncID + "_Debug_LOG",
						"href": "data:," + encodeURIComponent(response.data),
						"style":"display:none",
					}).appendTo("body")[0].click();
				}

				var commandObj = { "cncID":$scope.cncID };
				frontendAdaptor.fnGetResponse( 'COMMAND', 'GetDebugLog', commandObj, this.fnGetResult, false );
			}

		//dobule check authority
		$rootScope.isAuthorityWrite = false;
		$rootScope.isShowAuthority = false;
		$scope.DoubleCheckPwd = function( szReWritePwd )
		{
			if( szReWritePwd == "" ){
				return;
			}

			this.fnGetResult = function(response){
				if( response.isSamePwd == false ){
					return;
				}

				$rootScope.isAuthorityWrite = true;
				$rootScope.isShowAuthority = false;
			}

			accountMgr.fnDoubleCheckPwd( szReWritePwd, this.fnGetResult );
		}
	});

	//add sub controller
	app.controller( 'cncOOE', cncOOE );
	app.controller( 'cncRecord', cncRecord );
	app.controller( 'cncAlarm', cncAlarm );
	app.controller( 'cncDiagnosis', cncDiagnosis );

});
