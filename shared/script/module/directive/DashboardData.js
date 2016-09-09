define([
	'angularAMD'
], function(angularAMD){
	
	function dashboardData( $interval, $timeout ){
		return{
			restrict: 'E',
			scope : {
				myCnc : "@cnc",
				myCncData : "=data",
				myDataType : "=type",
			},
			link : function(scope,element,attrs){

				var objOldValue = {};
				var nTimes = 0;

				this.fnShowObject = function( szDataType, objData, nTimes ){
					switch(szDataType){//use viewer_data_name to distingish
						case "cncCurtAlm":
							var almObj = objData[nTimes]['alarm_msg'].split('  ');
							return almObj[2];
						break;
					}
				}

				scope.$watchGroup(['myCncData','myDataType'],function(newValues){
					
					//only for object
					if( typeof newValues[0] == "object" ){

						//save data into local storage
						var isFindType = false;
						for( var key in objOldValue[scope.myCnc] ){
							if( objOldValue[scope.myCnc]['name'] == newValues[1]['viewer_data_name'] ){
								//this cnc is in local, and check data
								//use json to compare object
								if( JSON.stringify(objOldValue[scope.myCnc]['data']) === JSON.stringify(newValues[0]) ){
									//same data, to show data
									var times = objOldValue[scope.myCnc]['times']++;
									times = times%(Object.keys(newValues[0]).length);
									
									//set element and style
									var szAlmMsg = this.fnShowObject(objOldValue[scope.myCnc]['name'],objOldValue[scope.myCnc]['data'],times);
									var nFontSize = ( (25-szAlmMsg.length) < 18 ) ? 18 : (25-szAlmMsg.length);
									if( attrs.mode == "DASHBOARD" ){
										element.text( szAlmMsg );
									}else if( attrs.mode == "DISPLAYBOARD" ){
										element.html( "<span style='font-size:" + nFontSize + "px'>" + szAlmMsg + "<span>" );
									}
									
								}else{
									//not same data, to store new data
									objOldValue[scope.myCnc]['data'] = newValues[0];
								}
								
								isFindType = true;
								break;
							}
						}

						if( isFindType == false ){
							objOldValue[scope.myCnc] = {};
							objOldValue[scope.myCnc]['name'] = newValues[1]['viewer_data_name'];
							objOldValue[scope.myCnc]['data'] = newValues[0];
							objOldValue[scope.myCnc]['times'] = 0;
						}

						return;
					}

					//else, do this
					//set element and style
					var szMsg = newValues[0];
					var nFontSize = ( (25-szMsg.length) < 18 ) ? 18 : (25-szMsg.length);
					if( attrs.mode == "DASHBOARD" ){
						element.text( szMsg );
					}else if( attrs.mode == "DISPLAYBOARD" ){
						element.html( "<span style='font-size:" + nFontSize + "px'>" + szMsg + "<span>" );
					}
					
				});

			},
		};
	}

	return dashboardData;
});