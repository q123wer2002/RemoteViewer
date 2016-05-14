
SyntecRemoteWeb.controller('groupControl',['$scope','$http', '$interval', function SyntecRemote($scope,$http,$interval){

	//updating function here
	$interval(function(){
		if( isFirstLoad == false ){
			Void_updateCNCData();
		}
	},2000);

	$scope.fID = 0; 
	$scope.factoryName = "";
	$scope.groupName = "";
	$scope.groupIPCAM = false;

	var isFirstLoad = true;
	var userShowCncList = [];
	var userShowUpdatingList = [];

	var statusBar = [ "START", "READY", "ALARM", "OFFLINE", "AGENTOFF" ];
	$scope.cncs = [];

	$scope.Void_initCNCData = function()
	{
		//protect
		if( $scope.userShowList == null || $scope.userShowList.length == 0 ){
			return;
		}

		//loading boolean value
		if( isFirstLoad ){
			//get init data
			findUpdatingList( $scope.userShowList, $scope.cncList, userShowCncList );

			//get updating list
			findUpdatingList( $scope.userShowList, $scope.updateCncList, userShowUpdatingList );
		}

		//create object to request
		var initData = {"method":"getCNCData_current", "gID":$scope.GID, "cncDataList":userShowCncList };
		$http({
			method:'POST',
			url:'server/groupDataAjax.php',
			data: $.param(initData),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			//console.log(json);
			if(json.result == "success"){
				if( isFirstLoad == true ){
					jQuery('.cncOverView').css({'display':'block'});

					//create array
					Void_initData( json.data );
				}
			}
		}).
		error(function(json){
			console.warn(json);
		});
	}

	Void_initData = function( data )
	{
		//protect this function
		$scope.fID = data.fID;
		$scope.factoryName = data.fName;
		$scope.groupName = data.gName;

		//factory
		if( data.cncData == null || data.cncData.length == 0 ){
			return;
		}

		for(var i=0; i<data.cncData.length; i++){
			//create factory Object
			var cnc = {};

			for(var j=0; j<$scope.userShowList.length; j++){
				//cncPic
				//cncProcess
				//cncRestTime, cncUpdateTime
				if( $scope.userShowList[j] == "cncPic" ){
					if( data.cncData[i][$scope.userShowList[j]] == "" ){
						cnc[ $scope.userShowList[j] ] = "images/cncs/cnc.jpg";
					}else{
						cnc[ $scope.userShowList[j] ] = "data:image/PNG;base64," + data.cncData[i][ $scope.userShowList[j] ];
					}
					continue;	
				}

				//update time
				if( $scope.userShowList[j] == "cncUpdateTime" ){
					cnc[ $scope.userShowList[j] ] = changeDateToTime( data.cncData[i][$scope.userShowList[j]] );
					continue;
				}

				//status
				cnc['isElseStatus'] = false;
				if( statusBar.indexOf(data.cncData[i].cncStatus) == -1 ){
					cnc['isElseStatus'] = true;
					//data.cncData[i].cncStatus = "ELSE";
				}

				cnc[ $scope.userShowList[j] ] = data.cncData[i][ $scope.userShowList[j] ];
			}

			cnc[ 'isloading' ] = false; 
			//push into factory array
			$scope.cncs.push( cnc );
		}

		isFirstLoad = false;
	}

	Void_updateCNCData = function()
	{
		for( key in $scope.cncs ){
			
			if( $scope.cncs[key]['isloading'] == true ){
				continue;
			}

			$scope.cncs[key]['isloading'] = true;

			var updateObj = { "method":"getCNCData_update", "cncKey":key, "cncID":$scope.cncs[key].cncID, "DataList":userShowUpdatingList };
			$http({
				method:'POST',
				url:'server/groupDataAjax.php',
				data: $.param(updateObj),
				headers: {'Content-type': 'application/x-www-form-urlencoded'},
			}).
			success(function(json){
				//console.log(json);
				if(json.result == "success"){
					Void_updateData( json.data );
				}
			}).
			error(function(json){
				console.warn(json);
			});
		
		}
	}

	Void_updateData = function( data )
	{
		//console.log(data);
		if( $scope.cncs[data.cncKey].cncID == data.cncID ){
			for(var j=0; j<userShowUpdatingList.length; j++){
				
				if( userShowUpdatingList[j] == "cncUpdateTime" ){
					$scope.cncs[data.cncKey][ userShowUpdatingList[j] ] = changeDateToTime( data[userShowUpdatingList[j]] );
					continue;
				}

				//status
				data.isElseStatus = false;
				if( statusBar.indexOf(data.cncStatus) == -1 ){
					data.isElseStatus = true;
				}

				$scope.cncs[data.cncKey][ userShowUpdatingList[j] ] = data[ userShowUpdatingList[j] ];
			}
		}

		$scope.cncs[data.cncKey]['isloading'] = false;
	}

}]);

