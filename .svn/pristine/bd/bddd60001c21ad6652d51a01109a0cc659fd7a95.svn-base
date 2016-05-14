
SyntecRemoteWeb.controller('cncControl',['$scope','$http', '$interval','$timeout', function SyntecRemote($scope,$http,$interval,$timeout){

	//updating function here
	$interval(function(){
		if( isFirstLoad == false && isloading == false ){
			$scope.getCncData();
			//Void_setOOEAry( 0, 0 );
		}
	}, 2000);

	//loading var, and page show var
	var isFirstLoad				=	true;
	var isloading				=	false;
	var isHisDataLoading		=	false;
	var userShowCncList			=	[];
	var userShowUpdatingList	=	[];
	var currentHisPage			=	"";
	var statusBar = [ "START", "READY", "ALARM", "OFFLINE", "AGENTOFF" ];

	$scope.tabHisClick = function(tabName,tabData)
	{
		$scope.scrollBarWith = tabData.width;
		$scope.scrollBarLeft = tabData.left;
		$scope.scrollBarBG = tabData.bgColor;
		currentHisPage = tabName;
		$scope.showDataHtml = "templates/" + $scope.viewDevice + "/content/cnc/" + tabName + ".html";
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
	$scope.cncHisDatas = {
		HisOOE		:	{"name":"稼動率", "icon":"images/cncs/OOE.png", "width":80, "left":"", "bgColor":"#111d6d", "isShow":false},
		HisAlarm	:	{"name":"警報", "icon":"images/cncs/alarm.png", "width":70, "left":"", "bgColor":"#FF4545", "isShow":false},
		HisRecord	:	{"name":"加工記錄", "icon":"images/cncs/record.png", "width":90, "left":"", "bgColor":"#16BA03", "isShow":false},
	};
	$scope.cncHisAlarms = [];
	$scope.cncHisRecords = [];
	$scope.cncHisOOEs = [];

	Void_initCNCHisTabList = function()
	{
		var left = 0;
		for( hisName in $scope.cncHisDatas ){
			if( $scope.userShowList.indexOf( "cnc" + hisName ) != -1 ){
				
				if( left == 0 ){
					//show page
					currentHisPage = hisName;
					//set scroll bar color
					$scope.scrollBarBG = $scope.cncHisDatas[ hisName ].bgColor;

					//set the default histroy page
					$scope.showDataHtml = "templates/" + $scope.viewDevice + "/content/cnc/" + hisName + ".html";
				}

				//set the scrollbar's path
				$scope.cncHisDatas[ hisName ].left = left + "px";
				left = left + $scope.cncHisDatas[ hisName ].width + 10;
				$scope.cncHisDatas[ hisName ].width = $scope.cncHisDatas[ hisName ].width + "px";
				
				//set the tabPage show or not
				$scope.cncHisDatas[ hisName ].isShow = true;
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
			
			Void_initCNCHisTabList();
			
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

	//OOE
		$scope.OOEUnits = {
			DAYOOE		: { "name":"天稼動率", "bgColor":"#111d6d", "fontColor":"#ffffff", "dataPoint":0, "dataShowRule":[{ 'startPoint':0, 'preTimeUnit':1 },] },
			MONTHOOE	: { "name":"月稼動率", "bgColor":"#111d6d", "fontColor":"#ffffff", "dataPoint":0, "dataShowRule":[{ 'startPoint':0, 'preTimeUnit':0 },] },
			YEAROOE		: { "name":"年稼動率", "bgColor":"#111d6d", "fontColor":"#ffffff", "dataPoint":0, "dataShowRule":[{ 'startPoint':0, 'preTimeUnit':0 },] },
			AVGHisOOE	: { "name":"總平均", "bgColor":"#111d6d", "fontColor":"#ffffff", },
		};

		$scope.ENUM_getTypes = {
			changeUnit 		: 1,	//means change unit, get Data
			previousData	: 2,
			backData		: 3,
		};

		//init
		$scope.curtUnit			=	"DAYOOE";
		$scope.showDataLength	=	10;

		//record array
		$scope.allDateRecordAry	=	[];

		$scope.setOOEParam = function( UnitKey, GetDataType )
		{
			chosedColor = { "bg":"#111d6d", "font":"#ffffff" };
			tabClick( $scope.OOEUnits, UnitKey, chosedColor);
			
			if( UnitKey == "AVGHisOOE" ){
				$scope.curtUnit = UnitKey;
				return;
			}

			if( $scope.curtUnit == UnitKey ){
				if( GetDataType == $scope.ENUM_getTypes['backData'] ){
					$scope.OOEUnits[UnitKey].dataPoint--;
				}
				else if( GetDataType == $scope.ENUM_getTypes['previousData'] ){
					$scope.OOEUnits[UnitKey].dataPoint++;
				}
			}else{
				$scope.curtUnit = UnitKey;
				var timeUnit = UnitKey.split('OOE');
				Void_findworkTimeOfEachDay( timeUnit[0] );
			}

			//ooe param
			ooeParam = {
				unit		:	UnitKey,
				getType		:	GetDataType,
			};//console.log(ooeParam);

			//show the chart
			$scope.getCurrentHisData( ooeParam );
		}

		Void_setOOEAry = function( param )
		{
			//console.log( $scope.allDateRecordAry );
			var unitName = param.unit;
			var datePoint = $scope.OOEUnits[unitName].dataPoint;
			var curtStart = $scope.OOEUnits[unitName].dataShowRule[datePoint].startPoint;
			var preTimeUnit = $scope.OOEUnits[unitName].dataShowRule[datePoint].preTimeUnit;
			var timeUnit = param.unit.split('OOE');

			//set ooe array
			var OOEDate			=	[];
			var OOE				=	[];
			var OOECycleTime	=	[];
			//var OOEAlarmTime	=	[5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6, 3.9];
			//var OOEIdleTime	=	[5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6, 3.9];
			//var OOEOffTime	=	[5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6, 3.9];

			//console.log( $scope.allDateRecordAry );
			while( (OOEDate.length != 10) && (curtStart != ($scope.allDateRecordAry.length)) ){
			//for(var gg=0; gg<30; gg++){
				var standardDate = new Date();
				// 1/1/2016, 2016-1, 2016
				if( timeUnit[0] == "DAY" ){
					//set standard date to compare
					standardDate.setDate( standardDate.getDate()-preTimeUnit );
					var tmpDate = (standardDate.getMonth() + 1) + '/' + standardDate.getDate() + '/' +  standardDate.getFullYear();
					var days = 1;
				}else if( timeUnit[0] == "MONTH" ){
					//set standard date to compare
					var beforeSetYear = standardDate.getFullYear();
					var beforeSetMonth = standardDate.getMonth();
					standardDate.setMonth( standardDate.getMonth()-preTimeUnit );
					var afterSetYear = standardDate.getFullYear();
					var afterSetMonth = standardDate.getMonth();
					 

					var tmpDate = ( (beforeSetMonth == afterSetMonth) && (beforeSetYear == afterSetYear) && (preTimeUnit != 0) ) ? (standardDate.getFullYear()+"-"+standardDate.getMonth()) : (standardDate.getFullYear()+"-"+(parseInt(standardDate.getMonth())+1));
					var days = 30;
				}else if( timeUnit[0] == "YEAR" ){
					//set standard date to compare
					standardDate.setFullYear( standardDate.getFullYear()-preTimeUnit );
					var tmpDate = standardDate.getFullYear();
					var days = 365;
				}
				
				//console.log(tmpDate);
				//console.log(preTimeUnit);
				//console.log( standardDate.getMonth() );
				//console.log($scope.allDateRecordAry[ curtStart ].date);

				//check does the date is the same
				if( $scope.allDateRecordAry[ curtStart ].date == tmpDate ){

					OOEDate.push( $scope.allDateRecordAry[ curtStart ].date );	
					OOECycleTime.push( (Math.round($scope.allDateRecordAry[ curtStart ].totalWorkTime/days)) );
					OOE.push( (Math.round( ($scope.allDateRecordAry[ curtStart ].totalWorkTime/($scope.workTimeStand*days))*10000 )/100) );
					
					curtStart++;

				}else{
					//console.log(OOEDate);
					OOEDate.push( tmpDate );
					OOECycleTime.push( 0 );
					OOE.push( 0 );

					if( OOEDate.length == 10 ){
						continue;
					}

					var i = OOEDate.length-2;
					if( OOECycleTime[i] == 0 ){
						//console.log(OOEDate[i]);
						
						try{
							var tmp = OOEDate[i].split('~');
							OOEDate[i] = ( typeof tmp[1] != "undefined" ) ? (OOEDate[i+1] + "~" + tmp[1]) : (OOEDate[i+1] + "~" + OOEDate[i]);
						}
						catch(e){
							//console.log(e);
						}
						
						OOEDate.pop();
						OOECycleTime.pop();
						OOE.pop();
					}
				}

				preTimeUnit++;
			}

			//put two params into array
			if( typeof $scope.OOEUnits[unitName].dataShowRule[datePoint+1] == 'undefined' ){
				$scope.OOEUnits[unitName].dataShowRule.push( { 'startPoint':curtStart, 'preTimeUnit':preTimeUnit } );
			}//console.log( $scope.allDateRecordAry.length );
			
			//reverse array to correct position
			OOEDate.reverse();
			OOE.reverse();
			OOECycleTime.reverse();
			//console.log(OOEDate);

			//show the chart
			jQuery('#DAYOOEDiv').css({'display':'block'});
			Void_showOOE( OOEDate, OOE, OOECycleTime);
		}

		Void_showOOE = function( OOEDate, OOE, OOECycleTime )
		{
			//OOE chart
			jQuery('.OOEChart').highcharts({ 
				chart	:	{ zoomType: 'xy' },
				title	:	{ text: '稼動率圖表' },
				xAxis	:	[{
					categories: OOEDate,
					crosshair: true,
					labels: {
						staggerLines: 2
					}
				}],
			    yAxis: [{ // Primary yAxis
			        type: 'linear',
			        labels: {
			            format: '{value}%',
			            style: { color: Highcharts.getOptions().colors[1] },
			        },
			        title: {
			            text: '稼動率',
			            style: { color: Highcharts.getOptions().colors[1] },
			        },
			        max : 100,
			        min : 0,
			    }, { // Secondary yAxis
			        type: 'linear',
			        title: {
			            text: '時間',
			            style: { color: Highcharts.getOptions().colors[0] },
			        },
			        labels: {
			            format: '{value}s',
			            style: { color: Highcharts.getOptions().colors[0] },
			        },
			        max : 87000,
			        opposite: true,
			    }],
			    tooltip: {
			        shared: true
			    },
			    legend: {
			        layout: 'horizontal',
			        align: 'center',
			        x: 0,
			        verticalAlign: 'top',
			        y: 25,
			        floating: true,
			        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
			    },
			    series: [{
			        name: '稼動率',
			        type: 'line',
			        data: OOE,
			        color: '#111d6d',
			        zIndex: 2,
					tooltip: {
					    valueSuffix: ' %'
					}
			    },{
			        name: '加工時間',
			        type: 'column',
			        yAxis: 1,
			        data: OOECycleTime,
			        color: '#8af779',
			        tooltip: {
			            valueSuffix: ' s'
			        }

			    },/*{
			        name: '警報時間',
			        type: 'column',
			        yAxis: 1,
			        data: OOEAlarmTime,
			        color: '#ef6262',
			        tooltip: {
			            valueSuffix: ' hr'
			        }

			    },{
			        name: '閒置時間',
			        type: 'column',
			        yAxis: 1,
			        data: OOEIdleTime,
			        color: '#fff770',
			        tooltip: {
			            valueSuffix: ' hr'
			        }

			    },{
			        name: '關機時間',
			        type: 'column',
			        yAxis: 1,
			        data: OOEOffTime,
			        color: '#bfbfbd',
			        tooltip: {
			            valueSuffix: ' hr'
			        }

			    }*/]
			});
		}
	//Alarm
		$scope.curtAlmUnit = "curtAlm";
		$scope.alarmUnit = {
			curtAlm		: { "name":"現存警報", "bgColor":"#FF4545", "fontColor":"#ffffff", "display":true},
			hisAlm 		: { "name":"歷史警報", "bgColor":"#ffffff", "fontColor":"#FF4545", "display":true},
			anlyzAlm 	: { "name":"警報統計", "bgColor":"#ffffff", "fontColor":"#FF4545", "display":true},
		};

		var ENUM_almClass = [
			"Compiler",
			"Coordinate",
			"Macro",
			"Motion",
			"Operation",
			"MLC",
			"MLCHint",
			"Spindle",
			"MSG",
			"Servo",
			"Drv_YASKAWA",
			"Drv_SYNTEC",
		];

		$scope.curtAlm  = [];
		$scope.hisAlm 	 = [];
		$scope.anlyzAlm = {
			moduleTimes 	: {},
			almContentTimes : {},
			analyzeRange 	: {},
		};

		$scope.setAlmParam = function( unitKey )
		{
			chosedColor = { "bg":"#FF4545", "font":"#ffffff" };
			tabClick( $scope.alarmUnit, unitKey, chosedColor);
			$scope.curtAlmUnit = unitKey;

			var almParam = {
				unit : unitKey,
			};

			//get data and show ui
			$scope.getCurrentHisData( almParam );
		}

		Void_mappingAlm = function( data )
		{
			if( $scope.curtAlmUnit == "curtAlm" ){
				//clear array
				$scope.curtAlm.length = 0;
				//console.log(data);
				for( key in data.curtAlm ){
					var alarm = data.curtAlm[key].alarm_msg.split("  ");
					var alarmObj = {'module':alarm[0], 'no':alarm[1], 'content':alarm[2], 'time':changeDateToTime(data.curtAlm[key].alarm_time)};
					$scope.curtAlm.push( alarmObj );
				}

				return;
			}

			if( ($scope.curtAlmUnit != "curtAlm") && ($scope.hisAlm.length == 0) ){
				//clear array
				//$scope.hisAlm.length = 0;
				//console.log( escape(atob(data.hisAlm)) );
				var hisAlarmData = data.hisAlm.split('\n');//atob( data.hisAlm ).split('\n');

				//console.log(hisAlarmData[2]);
				
				for( var i=0; i<hisAlarmData.length-1; i++ ){

					var alarm = hisAlarmData[i].split("  ");
					var almObj = alarm[2].split('	');
					
					var alarmObj = {'module':alarm[0], 'no':alarm[1], 'content':almObj[0], 'time':almObj[1] };
					$scope.hisAlm.push( alarmObj );
				}

				//reverse array in order to let data order by time
				$scope.hisAlm.reverse();
			}

			//console.log( $scope.hisAlm );

			if( $scope.curtAlmUnit == "anlyzAlm" ){
				Void_analyzeHisAlm();
			}
		}

		Void_analyzeHisAlm = function()
		{
			var almModule 	= {};
			var almContent 	= {};
			var startDate 	= new Date('9000/12/31 14:52:10'); //default
			var endDate 	= new Date('1900/01/01 00:00:00'); //default

			for( var i=0; i<$scope.hisAlm.length; i++ ){
				//module first
				if( typeof almModule[ $scope.hisAlm[i].module ] == "undefined" ){
					//this is new module
					almModule[ $scope.hisAlm[i].module ] = 1;
				}else{
					//this module is already been here
					almModule[ $scope.hisAlm[i].module ]++;
				}

				//content
				if( typeof almContent[ $scope.hisAlm[i].content ] == "undefined" ){
					//this is new module
					almContent[ $scope.hisAlm[i].content ] = 1;
				}else{
					//this module is already been here
					almContent[ $scope.hisAlm[i].content ]++;
				}
			
				//alarm time
				var almData = new Date($scope.hisAlm[i].time);
				if( almData > endDate ){ endDate = almData; }
				if( almData < startDate ){ startDate = almData; }
			}

			//put into array
			$scope.anlyzAlm['moduleTimes'] = almModule;
			$scope.anlyzAlm['almContentTimes'] = almContent;
			$scope.anlyzAlm['analyzeRange'] = {startDate:startDate, endDate:endDate};

			//console.log($scope.anlyzAlm);
			Void_almModuleChart();
			Void_almContentChart();
		}

		Void_almModuleChart = function()
		{
			var moduleName  = [];
			var moduleTimes = [];

			for( key in $scope.anlyzAlm['moduleTimes'] ){
				moduleName.push( key );
				moduleTimes.push( Math.round( ($scope.anlyzAlm['moduleTimes'][key]/$scope.hisAlm.length)*100 ) );
			}

			jQuery('.moduleChart').highcharts({
		        chart: { type:'column' },
		        title: { text: '警報模組' },
				xAxis: [{
					categories: moduleName,
					crosshair: true
				}],
		        yAxis: [{ // Primary yAxis
		        	labels: {
		            	format: '{value}%',
		            	style: { color: Highcharts.getOptions().colors[1] },
		            },
		            title: {
		            	text: '出現頻率',
		                style: { color: Highcharts.getOptions().colors[1] },
		            },
		        }],
		        series: [{
		            name: '出現頻率',
		            data: moduleTimes,
		            color: '#FF4545',
		            zIndex: 2,
		            tooltip: {
					    valueSuffix: ' %'
					}
		        }]
		    });
		}

		Void_almContentChart = function()
		{
			var contentName  = [];
			var contentTimes = [];

			for( key in $scope.anlyzAlm['almContentTimes'] ){
				contentName.push( key );
				contentTimes.push( Math.round( ($scope.anlyzAlm['almContentTimes'][key]/$scope.hisAlm.length)*100 ) );
			}

			jQuery('.contentChart').highcharts({
		        chart: { type:'bar' },
		        title: { text: '警報內容' },
				xAxis: [{
					categories: contentName,
					crosshair: true
				}],
		        yAxis: [{ // Primary yAxis
		        	labels: {
		            	format: '{value}%',
		            	style: { color: Highcharts.getOptions().colors[1] },
		            },
		            title: {
		            	text: '出現頻率',
		                style: { color: Highcharts.getOptions().colors[1] },
		            },
		        }],
		        series: [{
		            name: '出現頻率',
		            data: contentTimes,
		            color: '#FF4545',
		            zIndex: 2,
		            tooltip: {
					    valueSuffix: ' %'
					}
		        }]
		    });
		}
	//Record
		$scope.curtRecodUnit = "curtWork";
		$scope.recodUnits = {
			curtWork	: { "name":"目前加工", "bgColor":"#16BA03", "fontColor":"#ffffff" },
			hisWork		: { "name":"加工紀錄", "bgColor":"#ffffff", "fontColor":"#16BA03" },
		};

		$scope.curtWork = {
			MainProg			:	"",
			partcount			:	0,
			require_partcount	:	0,
			cycletime			:	0,
			total_cycletime		:	0,
			cycleStartDate		:	"",
			total_partcount		:	0,
			lastwork_time		: 0, 
			update_time			:	"2015/15/15 00:00:00",
		};
		$scope.hisWork = [];

		$scope.setRecodParam = function( unitKey )
		{
			chosedColor = { "bg":"#16BA03", "font":"#ffffff" };
			tabClick( $scope.recodUnits, unitKey, chosedColor);
			$scope.curtRecodUnit = unitKey;
			$scope.getCurrentHisData();
		}

		Void_mappingRecord = function( data )
		{
			//console.log(data);
			if(typeof data.Record == "undefined" ){
				return;
			}

			for( key in data.Record ){
				$scope.curtWork[ key ] = data.Record[ key ];
			}

			$scope.curtWork['update_time'] 	=  changeDateToTime( $scope.curtWork['update_time'] );
			$scope.curtWork['restTime'] 	=  Math.round(($scope.curtWork['require_partcount']-$scope.curtWork['partcount']) * ($scope.curtWork['total_cycletime']/$scope.curtWork['total_partcount']));
			$scope.curtWork['progress']		=  (Math.round(($scope.curtWork['partcount'] / $scope.curtWork['require_partcount'] )*10000)/100) + "%";
			if( $scope.curtWork['progress'] > 100 ){
				$scope.curtWork['progress'] = 100;
			}
			//Void_loadRecordFile();
		}

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

SyntecRemoteWeb.filter('changeToTime', function() {
	return function( inputSecond ) {
		var hour	= Math.floor( inputSecond/3600 );

		inputSecond = inputSecond - hour*3600;
		
		var min		= Math.floor( inputSecond/60 );
		var sec		= inputSecond%60;

		if( hour != 0 ){
			return hour + "小時" + min + "分" + sec + "秒";
		}
		
		if( min != 0 ){
			return min + "分" + sec + "秒";
		}

		if( sec == 0 ){
			return "尚未設定";
		}

		return sec + "秒";
	};
});


_utf8_decode = function (utftext)
{
	var string = "";
	var i = 0;
	var c = c1 = c2 = 0;

	while ( i < utftext.length ) {
		c = utftext.charCodeAt(i);

		if (c < 128) {
			string += String.fromCharCode(c);
			i++;
		}
		else if((c > 191) && (c < 224)) {
		    c2 = utftext.charCodeAt(i+1);
		    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
		    i += 2;
		}
		else {
		    c2 = utftext.charCodeAt(i+1);
		    c3 = utftext.charCodeAt(i+2);
		    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
		    i += 3;
		}
	}
	return string;
	}

decode = function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }
    output = _utf8_decode(output);
    return output;
}

function base64_decode(data) {
  //  discuss at: http://phpjs.org/functions/base64_decode/
  // original by: Tyler Akins (http://rumkin.com)
  // improved by: Thunder.m
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //    input by: Aman Gupta
  //    input by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: Onno Marsman
  // bugfixed by: Pellentesque Malesuada
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
  //   returns 1: 'Kevin van Zonneveld'
  //   example 2: base64_decode('YQ===');
  //   returns 2: 'a'

  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    dec = '',
    tmp_arr = [];

  if (!data) {
    return data;
  }

  data += '';

  do { // unpack four hexets into three octets using index points in b64
    h1 = b64.indexOf(data.charAt(i++));
    h2 = b64.indexOf(data.charAt(i++));
    h3 = b64.indexOf(data.charAt(i++));
    h4 = b64.indexOf(data.charAt(i++));

    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

    o1 = bits >> 16 & 0xff;
    o2 = bits >> 8 & 0xff;
    o3 = bits & 0xff;

    if (h3 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1);
    } else if (h4 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1, o2);
    } else {
      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
    }
  } while (i < data.length);

  dec = tmp_arr.join('');

  return dec.replace(/\0+$/, '');
}