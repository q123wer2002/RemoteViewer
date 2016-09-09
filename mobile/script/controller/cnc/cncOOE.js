
define([

], function () {
	function cncOOE($scope,$http,$interval,$timeout,$rootScope,PATH){	
	//OOE
		$scope.WEBPATH = PATH['WEBPATH'];
		$scope.OOEUnits = {
			DAYOOE		: { "name":"天稼動率", "bgColor":"#111d6d", "fontColor":"#ffffff", "dataPoint":0, "dataShowRule":[{ 'startPoint':0, 'preTimeUnit':0 },] },
			MONTHOOE	: { "name":"月稼動率", "bgColor":"#111d6d", "fontColor":"#ffffff", "dataPoint":0, "dataShowRule":[{ 'startPoint':0, 'preTimeUnit':0 },] },
			YEAROOE		: { "name":"年稼動率", "bgColor":"#111d6d", "fontColor":"#ffffff", "dataPoint":0, "dataShowRule":[{ 'startPoint':0, 'preTimeUnit':0 },] },
			AVGHisOOE	: { "name":"總平均", "bgColor":"#111d6d", "fontColor":"#ffffff", },
		};

		$scope.ENUM_getTypes = {
			changeUnit 		: 1,	//means change unit, get Data
			previousData	: 2,
			backData		: 3,
			changeShift		: 4,
		};

		//init
		$scope.nSelectedShift = 0;
		$scope.showDataLength = 10;
		$scope.nMaxWaitTime = 500;

		$scope.setOOEParam = function( UnitKey, GetDataType, nSelectedShift )
		{
			chosedColor = { "bg":"#111d6d", "font":"#ffffff" };
			tabClick( $scope.OOEUnits, UnitKey, chosedColor);

			if( UnitKey == "AVGHisOOE" ){
				$scope.curtUnit = UnitKey;
				return;
			}

			switch( GetDataType ){
				case $scope.ENUM_getTypes['changeUnit']:
					$scope.curtUnit = UnitKey;
					var timeUnit = UnitKey.split('OOE');

					//parse to record file
					Void_findworkTimeOfEachDay( timeUnit[0] );
				break;

				case $scope.ENUM_getTypes['previousData']:
					$scope.OOEUnits[UnitKey].dataPoint++;
				break;

				case $scope.ENUM_getTypes['backData']:
					$scope.OOEUnits[UnitKey].dataPoint--;
				break;

				case $scope.ENUM_getTypes['changeShift']:
					$scope.nSelectedShift = nSelectedShift;
				break;
			}	

			//ooe param
			ooeParam = {
				unit			: UnitKey,
				getType			: GetDataType,
				selectedShift 	: nSelectedShift,
			};//Debug(ooeParam);

			//show the chart
			if( $scope.allDateRecordAry.length == 0 ){
				//get data from db
				$scope.getCurrentHisData( ooeParam );
				return;
			}
			
			Void_setOOEAry( ooeParam );
		}

		Void_setOOEAry = function( param )
		{
			//Debug(param);
			//shift information
			var selectedShift = param.selectedShift;
			var shift = $scope.shiftTime[ selectedShift-1 ];
			var shiftTimeInfo = GetShiftTimeStartNEnd( shift );

			
			//Debug( $scope.OOEUnits );
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

			//Debug( $scope.allDateRecordAry );
			while( (OOEDate.length != 10) && (curtStart != ($scope.allDateRecordAry.length)) ){
			//for(var gg=0; gg<30; gg++){
				var standardDate = new Date();
				// 1/1/2016, 2016-1, 2016
				switch( timeUnit[0] ){
					case "DAY":
						//set standard date to compare
						standardDate.setDate( standardDate.getDate()-preTimeUnit );
						var tmpDate = (standardDate.getMonth() + 1) + '/' + standardDate.getDate() + '/' +  standardDate.getFullYear();
						var days = 1;
					break;

					case "MONTH":
						//set standard date to compare
						var beforeSetYear = standardDate.getFullYear();
						var beforeSetMonth = standardDate.getMonth();
						standardDate.setMonth( standardDate.getMonth()-preTimeUnit );
						var afterSetYear = standardDate.getFullYear();
						var afterSetMonth = standardDate.getMonth();
						 

						var tmpDate = ( (beforeSetMonth == afterSetMonth) && (beforeSetYear == afterSetYear) && (preTimeUnit != 0) ) ? (standardDate.getFullYear()+"-"+standardDate.getMonth()) : (standardDate.getFullYear()+"-"+(parseInt(standardDate.getMonth())+1));
						var days = 30;
					break;

					case "YEAR":
						//set standard date to compare
						standardDate.setFullYear( standardDate.getFullYear()-preTimeUnit );
						var tmpDate = standardDate.getFullYear();
						var days = 365;
					break;
				}
				
				//Debug(tmpDate);
				//Debug(preTimeUnit);
				//Debug( standardDate.getMonth() );
				//Debug($scope.allDateRecordAry[ curtStart ].date);
				if( isValidDate( tmpDate, $scope.allDateRecordAry[ curtStart ].date ) == false ){
					curtStart++;
					continue;
					//break;
				}

				//check does the date is the same
				if( $scope.allDateRecordAry[ curtStart ].date == tmpDate ){

					var thisRecordItem = $scope.allDateRecordAry[ curtStart ];

					if( selectedShift == 0 ){
						//means during all time unit

						OOECycleTime.push( (Math.round(thisRecordItem.totalWorkTime/days)) );
						OOE.push( (Math.round( (thisRecordItem.totalWorkTime/($scope.workTimeStand*days))*10000 )/100) );
					}else{
						//get previous day
						var nextRecord = GetNextRecord( curtStart, tmpDate );

						//shift time
						var totalShiftCycleTIme = GetShiftCycleTime( thisRecordItem, nextRecord, shiftTimeInfo );
						
						OOECycleTime.push( (Math.round(totalShiftCycleTIme/days)) );
						OOE.push( (Math.round( (totalShiftCycleTIme/((shiftTimeInfo['DURING'])*days))*10000 )/100) );
					}

					OOEDate.push( $scope.allDateRecordAry[ curtStart ].date );	
					
					curtStart++;

				}else{
					//Debug(OOEDate);
					OOEDate.push( tmpDate );
					OOECycleTime.push( 0 );
					OOE.push( 0 );

					if( OOEDate.length == 10 ){
						continue;
					}

					var i = OOEDate.length-2;
					if( OOECycleTime[i] == 0 ){
						//Debug(OOEDate[i]);
						
						try{
							var tmp = OOEDate[i].split('~');
							OOEDate[i] = ( typeof tmp[1] != "undefined" ) ? (OOEDate[i+1] + "~" + tmp[1]) : (OOEDate[i+1] + "~" + OOEDate[i]);
						}
						catch(e){
							//Debug(e);
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
			}//Debug( $scope.allDateRecordAry.length );
			
			//reverse array to correct position
			OOEDate.reverse();
			OOE.reverse();
			OOECycleTime.reverse();
			//Debug(OOEDate);

			//calculate cycle time from second into hour
			for( var i=0; i<OOECycleTime.length; i++ ){
				OOECycleTime[i] = Math.round((OOECycleTime[i]/3600)*100)/100;
			}

			//show the chart
			jQuery('#DAYOOEDiv').css({'display':'block'});
			Void_showOOE( OOEDate, OOE, OOECycleTime);
		}
		isValidDate = function( szCompareDate, szStandardDate )
		{
			var CompareDate = new Date( szCompareDate );
			var StandardDate = new Date( szStandardDate );

			if( (CompareDate-StandardDate) < 0 ){
				return false;
			}

			return true;
		}
		GetShiftTimeStartNEnd = function( shift )
		{
			if( typeof shift == "undefined" ){
				return;
			}

			var timeInfo = {
				STARTTIME	: 0,
				ENDTIME		: 0,
			};

			var start = new Date( shift['StartTime'] );
			var end = new Date( shift['EndTime'] );

			timeInfo['STARTTIME'] = (start.getHours()*60+start.getMinutes())*60+start.getSeconds();
			timeInfo['ENDTIME'] = (end.getHours()*60+end.getMinutes())*60+end.getSeconds();
			timeInfo['DURING'] = ( timeInfo['STARTTIME'] < timeInfo['ENDTIME'] ) ? (timeInfo['ENDTIME']-timeInfo['STARTTIME']) : (timeInfo['STARTTIME']-timeInfo['ENDTIME']);

			return timeInfo;
		}
		GetNextRecord = function( todayIndex, todayDate )
		{
			var date = new Date(todayDate);
			date.setDate( date.getDate()+1 );
			var nextDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();

			if( typeof $scope.allDateRecordAry[todayIndex-1] == "undefined" ){
				return null;
			}

			if( $scope.allDateRecordAry[todayIndex-1]['date'] != nextDate ){
				return null;
			}

			return $scope.allDateRecordAry[todayIndex-1];
		}
		GetShiftCycleTime = function( todayRecord, nextRecord, shiftTimeInfo )
		{
			var cycleTime = 0;
			if( shiftTimeInfo['STARTTIME'] < shiftTimeInfo['ENDTIME'] ){
				//means not over a day
				for( var i=0; i<todayRecord.workDetail.length; i++ ){
					var recordStart = todayRecord.workDetail[i].startOfSecond;
					var recordEnd = recordStart+todayRecord.workDetail[i].workTime;

					//not in this shift
					if( recordStart > shiftTimeInfo['ENDTIME'] ){
						//overtime
						continue;
					}

					if( recordEnd < shiftTimeInfo['STARTTIME'] ){
						//not enough time
						continue;
					}

					//case 1 out-in
					if( (recordStart < shiftTimeInfo['STARTTIME']) && (recordEnd <= shiftTimeInfo['ENDTIME']) ){
						var subCycleTime = recordEnd - shiftTimeInfo['STARTTIME'];
					}
					//case 2, in-in
					else if( (shiftTimeInfo['STARTTIME'] <= recordStart ) && (recordEnd <= shiftTimeInfo['ENDTIME']) ){
						var subCycleTime = recordEnd - recordStart;
					}
					//case 3, in-out
					else if( (shiftTimeInfo['STARTTIME'] <= recordStart ) && (shiftTimeInfo['ENDTIME'] < recordEnd) ){
						var subCycleTime = shiftTimeInfo['ENDTIME'] - recordStart;
					}
					//case 4, out-out
					else if( (recordStart < shiftTimeInfo['STARTTIME']) && (shiftTimeInfo['ENDTIME'] < recordEnd ) ){
						var subCycleTime = shiftTimeInfo['ENDTIME'] - shiftTimeInfo['STARTTIME'];
					}
					//case 5, 

					cycleTime = cycleTime + subCycleTime;
				}
			}else{
				//means over a day
				var tmpShiftInfo = {
					"STARTTIME" : shiftTimeInfo['STARTTIME'],
					"ENDTIME" : 86400,
				};
				var todayCycle = GetShiftCycleTime( todayRecord, null, tmpShiftInfo);
				cycleTime = cycleTime + todayCycle;

				if( nextRecord != null ){
					var tmpShiftInfo = {
						"STARTTIME" : 0,
						"ENDTIME" : shiftTimeInfo['ENDTIME'],
					};
					var nextCycle = GetShiftCycleTime( nextRecord, null, tmpShiftInfo);
					cycleTime = cycleTime + nextCycle;
				}
			}
			

			return cycleTime;
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
			            format: '{value}hr',
			            style: { color: Highcharts.getOptions().colors[0] },
			        },
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
			            valueSuffix: ' hr'
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


		//shift function
		$scope.GetShiftTime = function( shift )
		{
			if( shift['StartTime'] == "" || shift['EndTime'] == "" ){
				return "";
			}

			var start = new Date( shift['StartTime'] );
			var end = new Date( shift['EndTime'] );
			
			shift['During'] = ( ((end-start)/3600000) < 0 ) ? ((end-start)/3600000) + 24 : ((end-start)/3600000);

			start = ("0" + start.getHours()).substr(-2) + ":" + ("0" + start.getMinutes()).substr(-2);
			end = ("0" + end.getHours()).substr(-2)+ ":" + ("0" + end.getMinutes()).substr(-2);

			return start + " - " + end;
		}
		$scope.StyleOfShift = function( nIndex )
		{
			if( $scope.nSelectedShift === nIndex ){
				return {"background":"#000000", "color":"#fff"};
			}

			return {"background":"#fff", "color":"#000"};
		}
	}

	return cncOOE;
});