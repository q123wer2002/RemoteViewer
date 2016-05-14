
SyntecRemoteWeb.controller('factoryControl',['$scope','$http', '$interval', function SyntecRemote($scope,$http,$interval){
	
	var ENUM_VisitPage = {
		factoryOverview : 1,
		factoryList : 2,
	};//console.log($scope.ENUM_VisitPage);

	//updating function here
	$interval(function(){
		if( isFirstLoad == false && isloading == false ){
			$scope.Void_initFactoryData();
		}
	}, 2000);

	var visitPage = 0;
	var isFirstLoad = true;
	var isloading = false;
	var userShowFacList = [];
	var userShowGopList = [];
	var userShowFacUpdatingList = [];
	var userShowGopUpdatingList = [];

	$scope.factoryTab_click = function( fID )
	{
		$scope.curtfID = fID;

		for(var i=0; i<$scope.factories.length; i++){
			if($scope.factories[i].fID == $scope.curtfID){
				$scope.factories[i].bgColor = "#8A99FD";
			}else{
				$scope.factories[i].bgColor = "#ffffff";
			}
		}

		//console.log($scope.factories);
	}

	$scope.curtfID = 0;
	$scope.factories=[];
	$scope.groups=[];

	Void_checkVisitPage = function()
	{
		visitPage = ENUM_VisitPage.factoryOverview;

		//use userShowList to indentify visit page
		for(var i=0; i<$scope.groupList.length; i++){
			if( $scope.userShowList.indexOf( $scope.groupList[i] ) != -1 ){
				//means user wanna to show the group information
				//need to insert factory info mapping group
				if( $scope.userShowList.indexOf( "fID" ) == -1 ){
					$scope.userShowList.push( "fID" );
				}
				if( $scope.userShowList.indexOf( "fName" ) == -1 ){
					$scope.userShowList.push( "fName" );
				}

				//this to get fID in group
				userShowGopList.push( "Group_fID" );
				
				visitPage = ENUM_VisitPage.factoryList;
				break;
			}
		}
	}

	$scope.Void_initFactoryData = function()
	{
		//protect
		if( $scope.userShowList == null || $scope.userShowList.length == 0 ){
			return;
		}

		//loading boolean value
		isloading = true;
		if( isFirstLoad ){
			$scope.factories.push({});
			
			//find init data
			findUpdatingList( $scope.userShowList, $scope.factoryList, userShowFacList );
			findUpdatingList( $scope.userShowList, $scope.groupList, userShowGopList );

			//find updating data
			findUpdatingList( $scope.userShowList, $scope.updateFacList, userShowFacUpdatingList );
			findUpdatingList( $scope.userShowList, $scope.updateGopList, userShowGopUpdatingList );
			
			//create object to request
			var initFactoryObj={"method":"getFactoryData", "factoryList":userShowFacList, "groupList":userShowGopList };
			//console.log(userShowGopList);
		}else{

			//create object to request
			var initFactoryObj={"method":"getFactoryData", "factoryList":userShowFacUpdatingList, "groupList":userShowGopUpdatingList };
		}

		//check visited page
		if( visitPage == 0 ){
			Void_checkVisitPage();
		}

		
		$http({
			method:'POST',
			url:'server/factoryDataAjax.php',
			data: $.param(initFactoryObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			//console.log(json);
			if(json.result == "success"){
				if( isFirstLoad == true ){
					//clear the shadow
					$scope.factories.splice(0,1);

					//console.log(json.data);
					//create array
					Void_initData( json.data );
				}
				else if( isFirstLoad == false ){
					//console.log(json.data);
					Void_updatingData (json.data);
				}
			}
		}).
		error(function(json){
			console.warn(json);
		});
	}

	Ary_createStatusOfCnc = function( StatusOfCncData )
	{
		//only for Operation Index
		//console.log($scope.userMode);
		var statusBar = [ "START", "READY", "ALARM", "OFFLINE", "AGENTOFF" ];

		if( $scope.userMode == "Operation" ){
			var cncs = [];

			for(var i=0; i<StatusOfCncData.length; i++){
				
				var cncID = ( StatusOfCncData[i].cnc_id != null ) ? StatusOfCncData[i].cnc_id : "";
				var cncName = ( StatusOfCncData[i].cncName != "" ) ? StatusOfCncData[i].cncName : "控制器名稱";
				var cncMainProg = ( (StatusOfCncData[i].main_prog != null) && (StatusOfCncData[i].main_prog != "") ) ? StatusOfCncData[i].main_prog : "主程式";

				//check alarm
				if( StatusOfCncData[i].status != "AGENTOFF" && StatusOfCncData[i].status != "OFFLINE" && StatusOfCncData[i].alarm == "ALARM" ){
					var cncObj = { "cncID":cncID, "cncName":cncName, "cncMainProg": cncMainProg, "cncStatus":"ALARM", "isElseStatus":false  };
				}else if( statusBar.indexOf( StatusOfCncData[i].status ) == -1 ){
					var cncObj = { "cncID":cncID, "cncName":cncName, "cncMainProg": cncMainProg, "cncStatus":StatusOfCncData[i].status, "isElseStatus":true };
				}else{
					var cncObj = { "cncID":cncID, "cncName":cncName, "cncMainProg": cncMainProg, "cncStatus":StatusOfCncData[i].status, "isElseStatus":false };
				}

				cncs.push( cncObj );
			}
			//console.log(cncs);
			return cncs;
		}

		var statusObj = {
			START   : { num:0, width:'' },
			READY   : { num:0, width:'' },
			ALARM   : { num:0, width:'' },
			OFFLINE : { num:0, width:'' },
			ELSE 	: { num:0, width:'' },
			AGENTOFF: { num:0, width:'' },
		};
		var totalNum = 0;

		for(var i=0; i<StatusOfCncData.length; i++){
			
			totalNum++;

			//check alarm
			if( StatusOfCncData[i].status != "AGENTOFF" && StatusOfCncData[i].status != "OFFLINE" && StatusOfCncData[i].alarm == "ALARM" ){
				statusObj[ "ALARM" ].num++;
			}else if( statusBar.indexOf( StatusOfCncData[i].status ) == -1 ){
				statusObj[ "ELSE" ].num++;
			}else{
				statusObj[ StatusOfCncData[i].status ].num++;
			}

		}

		//calculate the width of each status
		angular.forEach( statusObj, function( status ){
			status.width = Math.round((status.num/totalNum)*1000)/10 + '%';
		});

		return statusObj;
	}
	
	Void_initData = function( data )
	{
		//protect this function
		//factory
		if( data.factory == null || data.factory.length == 0 ){
			return;
		}

		for(var i=0; i<data.factory.length; i++){
			//create factory Object
			var factoryObj = {};
			for(var j=0; j<userShowFacList.length; j++){

				if( userShowFacList[j] == "fStatusOfCnc" ){
					//end explain, push all data into array
					factoryObj[ "fStatusOfCnc" ] = Ary_createStatusOfCnc( data.factory[i].fStatusOfCnc );
					continue;
				}

				factoryObj[ userShowFacList[j] ] = data.factory[i][ userShowFacList[j] ];
			}
			//push into factory array
			$scope.factories.push( factoryObj );
		}

		if( data.group == null || data.group.length == 0 ){
			return;
		}
		for(var i=0; i<data.group.length; i++){

			var group = {};

			for(var j=0; j<userShowGopList.length; j++){
				
				if( userShowGopList[j] == "gStatusOfCnc" ){
					//end explain, push all data into array
					group["gStatusOfCnc"] = Ary_createStatusOfCnc( data.group[i].gStatusOfCnc );
					continue;
				}

				group[ userShowGopList[j] ] = data.group[i][ userShowGopList[j] ];
			}
			//push into factory array
			$scope.groups.push( group );
			//console.log($scope.groups);
		}

		isFirstLoad = false;
		isloading = false;

		$scope.factoryTab_click($scope.curtfID);
	}
	Void_updatingData = function( data )
	{
		//console.log(data);
		//protected this function
		if( data.factory == null || data.factory.length == 0 ){
			return;
		}

		for(var i=0; i<$scope.factories.length; i++){
			for(var j=0; j<userShowFacUpdatingList.length; j++){
				
				if(userShowFacUpdatingList[j] == "fStatusOfCnc"){
					//clear odd fStatusOfCnc
					delete $scope.factories[i]["fStatusOfCnc"];

					//end explain, push all data into array
					$scope.factories[i]["fStatusOfCnc"] = Ary_createStatusOfCnc( data.factory[i].fStatusOfCnc );
					continue;
				}

				$scope.factories[i][ userShowFacUpdatingList[j] ] = data.factory[i][ userShowFacUpdatingList[j] ];
			}
		}

		if( visitPage == 2 ){
			//means group data
			if( data.group == null || data.group.length == 0 ){
				return;
			}

			for(var i=0; i<$scope.groups.length; i++){
				for(var j=0; j<userShowGopUpdatingList.length; j++){
					
					if( userShowGopUpdatingList[j] == "gStatusOfCnc" ){
						//clear odd fStatusOfCnc
						delete $scope.groups[i]["gStatusOfCnc"];

						//end explain, push all data into array
						$scope.groups[i]["gStatusOfCnc"] = Ary_createStatusOfCnc( data.group[i].gStatusOfCnc );
						continue;
					}

					$scope.groups[i][ userShowGopUpdatingList[j] ] = data.group[i][ userShowGopUpdatingList[j] ];
				}
			}

		}

		isloading = false;
	}

}]);
