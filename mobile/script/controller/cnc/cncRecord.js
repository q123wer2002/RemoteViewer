define([

], function () {
	function cncRecord($scope,$http,$interval,$timeout,$rootScope){
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
			lastwork_time		:	0, 
			update_time			:	"2015/15/15 00:00:00",
		};

		$scope.setRecodParam = function( unitKey )
		{
			chosedColor = { "bg":"#16BA03", "font":"#ffffff" };
			tabClick( $scope.recodUnits, unitKey, chosedColor);
			$scope.curtRecodUnit = unitKey;
			$scope.getCurrentHisData();
		}

		Void_mappingRecord = function( data )
		{
			//Debug(data);
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

		$scope.exportExcel = function()
		{
			var html = '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8;" /><title>Excel</title>';
			html += '';
			html += document.getElementById('div_excel').outerHTML + '';
			//console.log(html);
			window.open('data:application/vnd.ms-excel,' + encodeURIComponent(html));
		}
	}

	return cncRecord;
});