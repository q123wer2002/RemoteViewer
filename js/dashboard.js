
SyntecRemoteWeb.controller('SyntecDashboard',['$scope','$http', '$interval', '$timeout',function SyntecRemote($scope,$http,$interval,$timeout){
	
	//timer tick
		$scope.isCreateDone = false;
		$scope.isInitDone = false;
		$scope.clock = "loading clock..."; // initialise the time variable
		$interval(function(){
			$scope.clock = Date.now();

			if( $scope.isCreateDone == false ){
				return;
			}

			if( $scope.isInitDone == false ){
				return;
			}

			UpdatingCNCData();

		},1000);

	//view
		$scope.AutoResizeWidth = function( factoryObj )
		{
			var monitorWidht = $(document).width();

			if( factoryObj.groups.length < 2 || monitorWidht < 2048 ){
				//one factory
				return {'width':'1024px', 'display':'block', 'margin':'auto', 'margin-bottom':'50px'};
			}

			//more than one factory
			var marginLeft = (monitorWidht%1024) / ((monitorWidht/1024)+1);
			return {'width':'1024px', 'display':'inline-block', 'margin-left':(marginLeft-5)+"px"};
		}
		$scope.ENUMViewType = {
			listView:0,
			bigView:1,
		};
		$scope.viewType = $scope.ENUMViewType['listView'];
		$scope.ChangeViewType = function( nEnumViewType )
		{
			$scope.viewType = nEnumViewType;
		}
		$scope.ViewTypeBGColor = function( nEnumViewType )
		{
			if( $scope.viewType == nEnumViewType ){
				return "#eeeeee";
			}

			return "rgba(0,0,0,0.7)";
		}
		$scope.ViewLayouyBGColor = function( layoutObj )
		{
			if( layoutObj['name'] == $scope.selectedLayout ){
				return "#eeeeee";
			}
			return "rgba(0,0,0,0.7)";
		}
		$scope.FindGroupCNCs = function( aryGroupCNCList )
		{
			var tmpCNCList = [];
			for( var i=0; i<aryGroupCNCList.length; i++ ){
				for(var j=0; j<$scope.cncs.length; j++ ){
					if( aryGroupCNCList[i] == $scope.cncs[j]['nCNCID'] ){
						tmpCNCList.push($scope.cncs[j]);
					}
				}
			}
			return tmpCNCList;
		}
		$scope.SetLayout = function( layoutObj )
		{
			if( $scope.selectedLayout == layoutObj['name'] ){
				return;
			}

			$scope.isCreateDone = false;
			$scope.isInitDone = false;

			$scope.selectedLayout = layoutObj['name'];
			for( var i=0; i<$scope.cncs.length; i++ ){
				AdjustCNCDataByLayout( layoutObj, $scope.cncs[i] );
			}

			$scope.isCreateDone = true;
			$scope.isInitDone = true;
		}
		$scope.objCubeStyle = function( viewObj )
		{
			switch( viewObj[1] ){
				case "1*1":
					return {'width':'45%', 'height':'40px'};
				break;
				case "1*2":
					return {'width':'45%', 'height':'90px'};
				break;
				case "2*1":
					return {'width':'92%', 'height':'40px'};
				break;
				case "2*2":
					return {'width':'92%', 'height':'90px'};
				break;
			}
		}
		$scope.ShowHTMLObj = function( viewObject )
		{
			
			var lastIndex = viewObject.length - 1;
			if( typeof viewObject[0] == "undefined"){
				return "";
			}

			if( viewObject[0] == "" ){
				return "";
			}

			if( viewObject[lastIndex] === 'dateAgentTime' ){
				return changeDateToTime( viewObject[0] );
			}

			if( viewObject[lastIndex].includes('szStatus') == true ){
				return $scope.cncStatusName(viewObject[0]);
			}else if( viewObject[lastIndex].includes('sz') == true || viewObject[lastIndex].includes('n') == true ){
				return viewObject[0];
			}else if( viewObject[lastIndex].includes('filePic') == true ){
				return "";
			}else{
				//console.log(viewObject[0]);
			}
		}
		$scope.ShowIMGSrc = function( viewObject )
		{
			if( viewObject[0] == "" || viewObject[0] == "圖片" ){
				return "images/cncs/cnc.jpg";
			}

			return "data:image/PNG;base64," + viewObject[0];
		}

	//data
	$scope.factories = [];
	$scope.cncs = [];
	$scope.listViewTitle = [];
	$scope.selectedLayout = "";
	$scope.layoutList = [];

	$scope.InitDashBoardData = function()
	{
		var initDashboardObj = { "method":"initDashboardData", "device":"web" };
		$http({
			method:'POST',
			url:'server/dashboardAjax.php',
			data: $.param(initDashboardObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			//console.log(json);
			if(json.result == "error"){
				//console.log(json);
			}
			CreateDashboardObj( json.data );
			CreateLayoutObj( json.layoutData );
		}).
		error(function(json){
			console.warn(json);
		});
	}
	CreateDashboardObj = function( initDashboardObj )
	{
		for( var i=0; i<initDashboardObj.length; i++ ){
			//group object
			var tmpGroupOnj = {"groupName":initDashboardObj[i].gName, "cncs":[]};
			
			//create cnc object
			for( var j=0; j<initDashboardObj[i].cncs.length; j++ ){
				var cnc = { nCNCID:initDashboardObj[i].cncs[j]['cnc_id'], cncStatus:"", isElseStatus:false, isLoading:false};
				tmpGroupOnj['cncs'].push( initDashboardObj[i].cncs[j]['cnc_id'] );
				
				//insert into cncs to manage
				$scope.cncs.push( cnc );
			}

			//check and insert into factoryObj
			var nFIndex = GetFactoryIndex(initDashboardObj[i].fName, $scope.factories);
			if( nFIndex == -1 ){
				//means new factory
				var tmpFactoryObj = {"factoryName":initDashboardObj[i].fName, "groups":[]};
				tmpFactoryObj['groups'].push( tmpGroupOnj );
				$scope.factories.push( tmpFactoryObj );
				
				continue;
			}

			$scope.factories[nFIndex]['groups'].push( tmpGroupOnj );
		}

		//console.log( $scope.factories );
	}
	GetFactoryIndex = function( factoryName, aryFactory )
	{
		for( var i=0; i<aryFactory.length; i++ ){
			if( aryFactory[i].factoryName == factoryName ){
				return i;
			}
		}
		return -1;
	}
	CreateLayoutObj = function( aryLayoutObj )
	{
		for( var i=0; i<aryLayoutObj.length; i++ ){
			var layout = b64DataToLayoutJSON( 'web', aryLayoutObj[i].file );
			$scope.layoutList.push( layout );
		}

		$scope.SetLayout( $scope.layoutList[0] );
		//AdjustCNCDataByLayout( $scope.layoutList[0], initDashboardObj );
	}
	AdjustCNCDataByLayout = function( layoutObj, cnc )
	{
		//select layout
		$scope.selectedLayout = layoutObj['name'];
		cnc['listView'] = new Object();
		cnc['bigView'] = new Object();

		cnc['listView'] = layoutObj['web']['listView'];
		cnc['bigView'] = layoutObj['web']['bigView'];

		//UpdatingCNCData( cnc );

		$scope.listViewTitle = layoutObj['web']['listView'];
	}
	UpdatingCNCData = function()
	{
		for(var i=0; i<$scope.cncs.length; i++ ){
			
			if( typeof $scope.cncs[i]['nCNCID'] == "undefined" ){
				return;
			}

			if( $scope.cncs[i].isLoading == true ){
				continue;
			}

			$scope.cncs[i].isLoading = true;

			var UpdatingCNCObj = { "method":"updatingCNCData", "cnc":$scope.cncs[i] };
			$http({
				method:'POST',
				url:'server/dashboardAjax.php',
				data: $.param(UpdatingCNCObj),
				headers: {'Content-type': 'application/x-www-form-urlencoded'},
			}).
			success(function(json){
				//console.log(json);
				if(json.result == "error"){
					//console.log(json);
				}
				MappingCNCData( json.data );
			}).
			error(function(json){
				console.warn(json);
			});
		}
	}
	MappingCNCData = function( cncData )
	{
		//console.log(cncData);
		var statusBar = [ "START", "READY", "ALARM", "OFFLINE", "AGENTOFF" ];
		for( var i=0; i<$scope.cncs.length; i++ ){
			if( $scope.cncs[i]['nCNCID'] == cncData['nCNCID'] ){
				$scope.cncs[i] = cncData;
				//sattus
				if( statusBar.indexOf($scope.cncs[i]['cncStatus']) == -1 ){
					$scope.cncs[i].isElseStatus = true;
				}else{
					$scope.cncs[i].isElseStatus = false;
				}

				$scope.cncs[i].isLoading = false;
				break;
			}
		}
	}

}]);