SyntecRemoteWeb.controller('cncAlarm',['$scope','$http', '$interval','$timeout', function SyntecRemote($scope,$http,$interval,$timeout){

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

}]);