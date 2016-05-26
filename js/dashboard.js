
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
		$scope.SelectLayout = function( viewType )
		{
			for( var i=0; i<$scope.layoutList.length; i++ ){
				if( $scope.layoutList[i].name == $scope.selectedLayout ){
					return $scope.layoutList[i]['web'][viewType];
				}
			}
		}

		$scope.ShowHTMLObj = function( cnc, viewObj )
		{
			var lastIndex = viewObj.length - 1;
			var data = cnc['data'][GetENGFromTranslate(viewObj[0])];

			if( typeof data == "undefined"){
				return "";
			}

			if( data == "" ){
				return "";
			}

			if( viewObj[lastIndex] === 'dateAgentTime' ){
				return changeDateToTime( data );
			}

			if( viewObj[lastIndex].includes('szStatus') == true ){
				return data;
			}else if( viewObj[lastIndex].includes('sz') == true || viewObj[lastIndex].includes('n') == true ){
				return data;
			}else if( viewObj[lastIndex].includes('filePic') == true ){
				return "";
			}else{
				//Debug(data);
			}
		}
		$scope.ShowIMGSrc = function( cnc, viewObj )
		{
			var data = cnc['data'][GetENGFromTranslate(viewObj[0])];

			if( data == "" ){
				return "images/cncs/cnc.jpg";
			}

			return "data:image/PNG;base64," + data;
		}

	//data
	$scope.factories = [];
	$scope.cncs = [];
	
	$scope.listViewTitle = {};
	$scope.selectedLayout = "";
	$scope.layoutList = [];
	$scope.translateObj = [];


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
			//Debug(json);
			if(json.result == "error"){
				Debug(json);
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

				if( initDashboardObj[i].cncs[j]['cnc_id'] == null){
					continue;
				}

				//create cnc obj
				var cnc = { nCNCID:initDashboardObj[i].cncs[j]['cnc_id'], cncStatus:"", data:{}, isElseStatus:false, isLoading:false};
				
				//only push cnc id into group
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

		//Debug( $scope.factories );
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
		Debug($scope.layoutList[0]);
		//GetLayoutCncSource( $scope.layoutList[0], initDashboardObj );
	}

	$scope.SetLayout = function( layoutObj )
	{
		if( $scope.selectedLayout == layoutObj['name'] ){
			return;
		}

		$scope.isCreateDone = false;
		$scope.isInitDone = false;

		//show to viewer
		$scope.selectedLayout = layoutObj['name'];
		$scope.listViewTitle = layoutObj['web']['listView'];

		var aryDataSource = GetLayoutCncSource( 'web', layoutObj );

		//create translate
		CreateTranslateObj( "source", aryDataSource );

		var UpdatingCNCObj = { "method":"TranslateDataSource", "cncID":$scope.cncs[0]['nCNCID'], "dataSource":aryDataSource };
		$http({
			method:'POST',
			url:'server/dashboardAjax.php',
			data: $.param(UpdatingCNCObj),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			//Debug(json);

			//set cnc data source
			var isSetCNCData = SetCNCData( json.data );

			//create translate
			CreateTranslateObj( "data", json.data );

			$scope.isCreateDone = true;
			$scope.isInitDone = true;
		}).
		error(function(json){
			console.warn(json);
		});
	}
	GetLayoutCncSource = function( device, layoutObj )
	{
		var aryDataSource = [];

		//get from listview
		for( var key in layoutObj[device]['listView'] ){
			
			var szSource = layoutObj[device]['listView'][key][0];
			if( (szSource == "") || (aryDataSource.indexOf(szSource) != -1) ){
				continue;
			}

			aryDataSource.push( szSource );
		}

		//get form big view
		for( var key in layoutObj[device]['bigView'] ){
			for( var subKey in layoutObj[device]['bigView'][key] ){

				var szSource = layoutObj[device]['bigView'][key][subKey][0];

				if( (szSource == "") || (aryDataSource.indexOf(szSource) != -1) ){
					continue;
				}

				aryDataSource.push( szSource );
			}
		}

		//console.log(aryDataSource);
		return aryDataSource
	}
	SetCNCData = function( dataSource )
	{
		for( var i=0; i<$scope.cncs.length; i++ ){
			for( var j=0; j<dataSource.length; j++ ){
				$scope.cncs[i]['data'][dataSource[j]] = "";
			}
		}
		return true;
	}
	CreateTranslateObj = function( cmd, aryData )
	{
		if( cmd == "source" ){
			//empty
			$scope.translateObj = [];

			for( var i=0; i<aryData.length; i++ ){
				$scope.translateObj[i] = new Object();
				$scope.translateObj[i]['TW'] = aryData[i];
			}
		}

		if( cmd == "data" ){
			for( var i=0; i<aryData.length; i++ ){
				$scope.translateObj[i]['ENG'] = aryData[i];
			}
		}
	}
	GetENGFromTranslate = function( szChinese )
	{
		for(var i=0; i<$scope.translateObj.length; i++ ){
			if( $scope.translateObj[i]['TW'] == szChinese ){
				return $scope.translateObj[i]['ENG'];
			}
		}
	}

	UpdatingCNCData = function()
	{
		for(var i=0; i<$scope.cncs.length; i++ ){

			if( typeof $scope.cncs[i]['nCNCID'] == "undefined" ){
				continue;
			}

			if( $scope.cncs[i].isLoading == true ){
				continue;
			}

			$scope.cncs[i].isLoading = true;

			var UpdatingCNCObj = { "method":"UpdatingCNCData", "cnc":$scope.cncs[i], "cncIndex":i };
			$http({
				method:'POST',
				url:'server/dashboardAjax.php',
				data: $.param(UpdatingCNCObj),
				headers: {'Content-type': 'application/x-www-form-urlencoded'},
			}).
			success(function(json){
				Debug(json);

				if(json.result == "error"){
					Debug(json);
					return;
				}

				MappingCNCData( json.data.cncIndex, json.data );
			}).
			error(function(json){
				console.warn(json);
			});
		}
	}
	MappingCNCData = function( cncIndex, cncData )
	{
		//Debug(cncData);
		var statusBar = [ "START", "READY", "ALARM", "OFFLINE", "AGENTOFF" ];

		if( parseInt($scope.cncs[cncIndex]['nCNCID']) != parseInt(cncData['nCNCID']) ){
			//means cnc error
			return;
		}

		//put data into array
		$scope.cncs[cncIndex] = cncData;
		
		//status
		if( statusBar.indexOf($scope.cncs[cncIndex]['cncStatus']) == -1 ){
			$scope.cncs[cncIndex].isElseStatus = true;
		}else{
			$scope.cncs[cncIndex].isElseStatus = false;
		}

		//loading set
		$scope.cncs[cncIndex].isLoading = false;
	}

}]);