SyntecRemoteWeb.controller('cncOOE',['$scope','$http', '$interval','$timeout', function SyntecRemote($scope,$http,$interval,$timeout){

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

}]);