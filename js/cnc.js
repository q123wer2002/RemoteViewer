
SyntecRemoteWeb.controller('cncControl',['$scope','$http', '$interval','$timeout', function SyntecRemote($scope,$http,$interval,$timeout){

	//updating function here
	$interval(function(){
		if( isFirstLoad == false && isloading == false ){
			$scope.getCncData();
			//Void_setOOEAry( 0, 0 );
		}
	}, 1000);

	//loading var, and page show var
	var isFirstLoad				=	true;
	var isloading				=	false;
	var isHisDataLoading		=	false;
	var userShowCncList			=	[];
	var userShowUpdatingList	=	[];
	var currentHisPage			=	"";
	var statusBar = [ "START", "READY", "ALARM", "OFFLINE", "AGENTOFF" ];

	$scope.tabHisClick = function( tabName,tabData )
	{
		$scope.scrollBarWith = tabData.width;
		$scope.scrollBarLeft = tabData.left;
		$scope.scrollBarBG = tabData.bgColor;
		currentHisPage = tabName;
		$scope.showDataHtml = "templates/" + $scope.viewDevice + "/content/cnc/" + tabName + ".html";

		//cancel other interval
		for( var profileName in $scope.cncProfiles ){
			if( tabName == profileName ){
				continue;
			}
			$interval.cancel($scope.cncProfiles[profileName]['Interval']);
		}
	}

	//factory and group info
	$scope.factoryName = "";
	$scope.groupName = "";
	$scope.groupIPCAM = false;

	$scope.cnc = {
		cncName : "",
		cncStatus : "",
		cncPic : "",
		updateTime : "",
		isElseStatus : false,
	};
	$scope.cncInfos = {
		IP 			:	{"name":"IP位置", "data":""},
		Machine		:	{"name":"型號", "data":""},
		MachineType	:	{"name":"機型", "data":""},
		Version		:	{"name":"版本", "data":""},
		SerialNo	:	{"name":"序號", "data":""},
		RestDay		:	{"name":"保固剩餘天數", "data":""},
	};
	$scope.cncProfiles = {
		//HisOOE		:	{"name":"稼動率", "icon":"images/cncs/OOE.png", "width":80, "left":"", "bgColor":"#111d6d", "isShow":false, "Interval":""},
		//HisAlarm	:	{"name":"警報", "icon":"images/cncs/alarm.png", "width":70, "left":"", "bgColor":"#FF4545", "isShow":false, "Interval":""},
		//HisRecord	:	{"name":"加工記錄", "icon":"images/cncs/record.png", "width":90, "left":"", "bgColor":"#16BA03", "isShow":false, "Interval":""},
		//Diagnosis	:	{"name":"診斷資訊", "icon":"images/cncs/diagnosis.png", "width":95, "left":"", "bgColor":"#FF781B", "isShow":false, "Interval":""},
		FileTransfer:	{"name":"檔案上下載", "icon":"images/cncs/transfer.png", "width":105, "left":"", "bgColor":"#62000F", "isShow":false, "Interval":""},
	};

	$scope.cncHisAlarms = [];
	$scope.cncHisRecords = [];
	$scope.cncHisOOEs = [];

	InitCNCProfileTabList = function()
	{
		var left = 0;
		for( profileName in $scope.cncProfiles ){
			if( $scope.userShowList.indexOf( "cnc" + profileName ) != -1 ){
				
				if( left == 0 ){
					//show page
					currentHisPage = profileName;
					//set scroll bar color
					$scope.scrollBarBG = $scope.cncProfiles[ profileName ].bgColor;

					//set the default histroy page
					$scope.showDataHtml = "templates/" + $scope.viewDevice + "/content/cnc/" + profileName + ".html";
				}

				//set the scrollbar's path
				$scope.cncProfiles[ profileName ].left = left + "px";
				left = left + $scope.cncProfiles[ profileName ].width + 10;
				$scope.cncProfiles[ profileName ].width = $scope.cncProfiles[ profileName ].width + "px";
				
				//set the tabPage show or not
				$scope.cncProfiles[ profileName ].isShow = true;
			}
		}
	}

	$scope.getCncData = function()
	{
		//protect
		if( $scope.userShowList == null || $scope.userShowList.length == 0 ){
			return;
		}

		//loading boolean value
		isloading = true;
		if( isFirstLoad ){
			//get init data
			findUpdatingList( $scope.userShowList, $scope.cncList, userShowCncList );

			//get updating list
			findUpdatingList( $scope.userShowList, $scope.updateCncList, userShowUpdatingList );
			
			InitCNCProfileTabList();
			
			//create object to request
			var initData = {"method":"initCncData", "gID":$scope.gID, "cncID":$scope.cncID, "DataList":userShowCncList };
		}else{
			//create object to request
			var initData = {"method":"initCncData", "gID":$scope.gID, "cncID":$scope.cncID, "DataList":userShowUpdatingList };			
		}

		
		$http({
			method:'POST',
			url:'server/cncDataAjax.php',
			data: $.param(initData),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			//console.log(json);
			if(json.result == "success"){

				//first loading
				if( isFirstLoad == true ){
					$scope.factoryName 	= json.data.fName;
					$scope.groupName 	= json.data.gName;
					$scope.cnc.cncName 	= json.data.cncData.cncName;
					//check picture
					if( json.data.cncData.cncPic == "" ){
						$scope.cnc.cncPic 	= "images/cncs/cnc.jpg";	
					}else{
						$scope.cnc.cncPic	= "data:image/PNG;base64," + json.data.cncData.cncPic;
					}
					Void_initInfoData( json.data.cncData.cncInfo );
					isFirstLoad = false;
				}

				//updating data
				$scope.cnc.cncStatus = json.data.cncData.cncStatus;
				if( statusBar.indexOf(json.data.cncData.cncStatus) == -1 ){
					$scope.cnc.isElseStatus = true;
				}

				$scope.groupIPCAM 	= false;
				$scope.cnc.updateTime = changeDateToTime(json.data.cncData.cncUpdateTime);
				isloading = false;

			}
		}).
		error(function(json){
			console.warn(json);
		});
	}

	Void_initInfoData = function( infoData )
	{
		for( infoName in $scope.cncInfos ){
			if( infoName == "RestDay" ){
				if( infoData[infoName] == "NoLimit" ){
					$scope.cncInfos[infoName].data = "無限制";
				}
				else{
					//need to change the time unit
				}
				continue;
			}
			$scope.cncInfos[infoName].data = infoData[infoName];
		}
	}


	$scope.getCurrentHisData = function( hisDataParam ) //hisDataParam is type of JSON
	{
		if(typeof hisDataParam == "undefined"){
			hisDataParam = "init";
		}

		if( currentHisPage == "HisOOE" && $scope.allDateRecordAry.length != 0 ){
			//means already loading cyc file
			Void_setOOEAry( hisDataParam );
			return;
		}

		var HisDataObj = {"method":"getHisData", "cncID":$scope.cncID, "HistoryDataName":currentHisPage, "HistoryDataParam":hisDataParam };
        //console.log(HisDataObj);
		$http({
			method:'POST',
			url:'server/cncDataAjax.php',
			data: $.param(HisDataObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			//console.log( json );
			if(json.result == "success"){
				//console.log( json.data );
				if( currentHisPage == "HisOOE" ){
					json.data.ooeParam = hisDataParam;
				}

				Void_paddingHisData( json.data );
			}
		}).
		error(function(json){
			console.warn(json);
		});
	}

	Void_paddingHisData = function( data )
	{
		//console.log(data);
		switch( currentHisPage ){
			case "HisOOE":
				if( $scope.allDateRecordAry.length == 0 && data != "" ){
					
					if( typeof data.OOE.hisRecordFile == "undefined" ){
						break;
					}
					
					Void_loadRecordFile( data.OOE.hisRecordFile );

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
				Void_mappingAlm( data );
			break;

			case "HisRecord":
				Void_mappingRecord(data);
			break;

			default:
			break;
		}

		scrollToButtom();
	}

	//record array
	$scope.allDateRecordAry	=	[];
	$scope.hisWork = [];
	//read record function
		Void_loadRecordFile = function( recordPlaintext )
	    {
	    	if( $scope.hisWork.length == 0 ){

				var tmpAry = recordPlaintext.split("<Cycle Name=\"CycleEdit\">");
				
				for(var i=1; i<tmpAry.length; i++){

					var record = [];
					var tmpAry2 = tmpAry[i].split("</Cycle>");
					var tmpAry3 = tmpAry2[0].split("Value=\"");
					for(var j=1; j<tmpAry3.length; j++){
						var tmpAry4 = tmpAry3[j].split("\"/>");
						record[j-1] = tmpAry4[0];
					}

					var recordObj = { "ProgName":record[0], "StartDate":record[1], "StartTime":record[2], "TotalTime":record[3], "PartCount":record[4], "comment":record[5] };
					$scope.hisWork.push( recordObj );
				}
				//console.log($scope.hisWork);

				Void_findworkTimeOfEachDay( "DAY" );
			}
	    }
	    Void_findworkTimeOfEachDay = function( timeUnit )
		{
			//var recordAry = [];
			//clear
			$scope.allDateRecordAry.length = 0;
			var todayDate = new Date();
			var processitem = 0;
			
			//($scope.allDateRecordAry.length < 10) && (processitem < $scope.hisWork.length)
			while( processitem < $scope.hisWork.length ){
				
				if( typeof $scope.hisWork[processitem].StartDate == "undefined" ){
					break;
				}

				var tmpRecordAry = Void_analyzeRecord( $scope.hisWork[processitem], timeUnit );

				for(var i=tmpRecordAry.length-1; i>=0; i--){
					Void_insertRecordDate( tmpRecordAry[i], $scope.allDateRecordAry );
				}

				processitem++;
			}

			//console.log( $scope.allDateRecordAry );
		}

		Void_analyzeRecord = function( recorditem, timeUnit )
		{
			var secondOfTimeunit = computeSecondsOfTimeunit( recorditem.StartDate, timeUnit );

			var countOfCreate = 1;
			var tmpWorkAry=[];

			var startOfSecond = computeRestSecondOfDay( recorditem, timeUnit );
			
			var timeAry = recorditem.TotalTime.split( ":" );
			timeAry[0] = parseInt(timeAry[0]); //hour
			timeAry[1] = parseInt(timeAry[1]); //minute
			timeAry[2] = parseInt(timeAry[2]); //second
			var workOfSecond = ( timeAry[0]*60 + timeAry[1] )*60 + timeAry[2];

			//var nThroughUnits = Math.ceil( (startOfSecond+workOfSecond)/secondOfTimeunit );
			var totalEndSecond = startOfSecond + workOfSecond;
			if( totalEndSecond > secondOfTimeunit ){
				
				while( totalEndSecond > secondOfTimeunit ){
					var tmpWorkOfEachUnit = ( (totalEndSecond%secondOfTimeunit) != 0 ) ? (totalEndSecond%secondOfTimeunit) : secondOfTimeunit;
					var recordObj = {"date":"", 'totalWorkTime':tmpWorkOfEachUnit, "wordDetail":[
						{"mainProg":recorditem.ProgName, "workTime":tmpWorkOfEachUnit, "ocpyPercent":"100%"}
					]};
					tmpWorkAry.push( recordObj );
					//rest time
					totalEndSecond = totalEndSecond - tmpWorkOfEachUnit;
				}
				var restWorkOfSecond = secondOfTimeunit - startOfSecond;
				var recordObj = {"date":"", 'totalWorkTime':restWorkOfSecond, "wordDetail":[
					{"mainProg":recorditem.ProgName, "workTime":restWorkOfSecond, "ocpyPercent":"100%"}
				]};
				tmpWorkAry.push( recordObj );
			}else{
				var recordObj = {"date":"", 'totalWorkTime':workOfSecond, "wordDetail":[
					{"mainProg":recorditem.ProgName, "workTime":workOfSecond, "ocpyPercent":"100%"}
				]};
				tmpWorkAry.push( recordObj );
			}

			//give date to each item in tmpWorkAry
			var nTmpWorkAryLength = tmpWorkAry.length;
			for( var i=nTmpWorkAryLength-1; i>=0; i-- ){
				
				var startDate = new Date( recorditem.StartDate );

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
			//console.log(recordObj);
			var isAlreadyExit = false;

			if( recordAry.length != 0 ){
				for( var j=0; j<recordAry.length; j++ ){
					if( recordAry[j].date == recordObj.date ){
						//
						recordAry[j].totalWorkTime += recordObj.totalWorkTime;
						recordAry[j].wordDetail.push( recordObj.wordDetail[0] );
						
						//
						for(var k=0; k<recordAry[j].wordDetail.length; k++){
							recordAry[j].wordDetail[k].ocpyPercent = (Math.round( (recordAry[j].wordDetail[k].workTime / recordAry[j].totalWorkTime )*10000)/100) + "%";
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

}]);
