define(['../../app'], function (app) {
	app.controller('SyntecDashboard',function($scope,$interval,$timeout,PATH,cfgMgr,cncDataMgr,frontendAdaptor,customMgr){

		//view
			$scope.ENUMViewType = {
				listView:0,
				bigView:1,
			};
			$scope.viewType = $scope.ENUMViewType['listView'];

			$scope.AutoResizeWidth = function( factoryObj )
			{
				var monitorWidth = $(document).width();

				if( factoryObj.groups.length < 2 || monitorWidth < 2048 ){
					//one factory
					return {'width':'1024px', 'display':'block', 'margin':'auto', 'margin-bottom':'50px'};
				}

				//more than one factory
				var marginLeft = (monitorWidth%1024) / ((monitorWidth/1024)+1);
				return {'width':'1024px', 'display':'inline-block', 'margin-left':(marginLeft-5)+"px"};
			}

			$scope.ChangeViewType = function( nEnumViewType )
			{
				$scope.viewType = nEnumViewType;
			}
			$scope.FindGroupCNCs = function( aryGroupCNCList )
			{
				var tmpCNCList = [];
				for( var i=0; i<aryGroupCNCList.length; i++ ){
					for(var j=0; j<$scope.cncData.length; j++ ){
						if( aryGroupCNCList[i] == $scope.cncData[j]['nCNCID'] ){
							tmpCNCList.push($scope.cncData[j]);
						}
					}
				}
				return tmpCNCList;
			}

			$scope.ViewTypeBGColor = function( nEnumViewType )
			{
				if( $scope.viewType == nEnumViewType ){
					return {"border-bottom":"1px solid rgba(0,0,0,1)"};
				}

				return {"border-bottom":"1px solid #ffffff"};
			}
			$scope.ViewLayouyBGColor = function( layoutObj )
			{
				if( layoutObj['name'] == $scope.selectedLayout ){
					return {"border-bottom":"1px solid rgba(0,0,0,1)"};
				}

				return {"border-bottom":"1px solid #ffffff"};
			}
			$scope.objCubeStyle = function( viewObj )
			{
				switch( viewObj['big_view_size'] ){
					case "1*1":
						return {'width':'45%', 'height':'30px'};
					break;
					case "1*2":
						return {'width':'45%', 'height':'68px'};
					break;
					case "2*1":
						return {'width':'92%', 'height':'30px'};
					break;
					case "2*2":
						return {'width':'92%', 'height':'68px'};
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

			$scope.isShow = function( cnc, viewObj )
			{
				var data = GetCncData( cnc, viewObj );
				
				if( viewObj['viewer_data_name'] == "filePic" ){
					return true;
				}

				if( typeof data == "undefined" || data.length == 0 ){
					return false;
				}

				return true;
			}
			$scope.ShowHTMLObj = function( cnc, viewObj )
			{
				var data = GetCncData( cnc, viewObj );

				switch( viewObj['viewer_data_name'] ){
					case "nOOE":
						return ( data == "" ) ? 0 : (Math.round(data*100)/100);
					break;
					case "dateAgentTime":
						return changeDateToTime( data );
					break;
					case "szStatus":
						return $scope.fnCNCStatusName(data,'cht');
					break;
					case "filePic":
						return "";
					break;
					default:
						return data;
					break;
				}
			}
			$scope.ShowIMGSrc = function( cnc, viewObj )
			{
				var data = GetCncData( cnc, viewObj );

				if( typeof data == "undefined" || data == "" || data == "undefined" ){
					return "images/cncs/cnc.jpg";
				}

				return "data:image/PNG;base64," + data;
			}
			GetCncData = function( cnc, viewObj )
			{
				if( typeof viewObj['viewer_data_name'] == "undefined" ){
					return "";
				}

				if( viewObj['viewer_data_name'] == "CustomerComponent" ){
					var cncData = cnc['aryData'][ "cuz_" + viewObj['name'] ];
					if( typeof cncData == "undefined" ){
						return "";
					}
					return cncData['value'];
				}

				var cncData = cnc['aryData'][viewObj['viewer_data_name']];
				if( typeof cncData == "undefined" ){
					return "";
				}
				return cncData['value'];
			}
		//var data
			$scope.factories = [];
			$scope.cncs = [];
			$scope.cncData = [];
			
			$scope.listViewTitle = {};
			$scope.selectedLayout = "";
			$scope.layoutList = [];
		//init function
			var MappingNickname = [];
			$scope.InitData = function()
			{
				InitDashBoardData();
				customMgr.fnInitCustomManager(["DASHBOARD","NICKNAME"]);
				customMgr.fnFetchCustomData(0,function(response){
					if( response.result != "success"){
						return;
					}

					//get structure
					$scope.layoutList = customMgr.fnGetCustomData("DASHBOARD");
					MappingNickname = customMgr.fnGetCustomData("NICKNAME");

					//set layout stucture
					$scope.SetLayout( 0, $scope.layoutList[0] );
				});
			}
			InitDashBoardData = function()
			{
				this.fnGetResult = function(response){
					if(response.result == "error"){
						return;
					}

					if( typeof response.data == "undefined" ){
						return;
					}

					CreateDashboardObj( response.data );
				}

				var initDashboardObj = { "device":"web" };
				frontendAdaptor.fnGetResponse( 'DASHBOARD', 'initDashboardData', initDashboardObj, this.fnGetResult, false );
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
						
						//only push cnc id into group
						tmpGroupOnj['cncs'].push( initDashboardObj[i].cncs[j]['cnc_id'] );
						
						//insert into cncs to manage
						$scope.cncs.push( initDashboardObj[i].cncs[j]['cnc_id'] );
					}

					//check and insert into factoryObj
					var nFIndex = GetFactoryIndex(initDashboardObj[i].fName, $scope.factories);
					if( nFIndex == -1 ){
						//means new factory
						var tmpFactoryObj = {"factoryName":initDashboardObj[i].fName, "fid":initDashboardObj[i].fid, "groups":[]};
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
		//layout component setting
			$scope.SetLayout = function( nLayoutIndex, layoutObj )
			{
				if( $scope.selectedLayout == layoutObj['name'] ){
					return;
				}

				//show to viewer
				$scope.nLayoutIndex = nLayoutIndex;
				$scope.selectedLayout = layoutObj['name'];
				$scope.listViewTitle = layoutObj['web']['listView'];

				//set layout component name into nickname
				SetLayoutComponentNickname(layoutObj);

				var aryAllDataSource = GetLayoutCncSource( 'web', layoutObj );

				//default
				cncDataMgr.fnDispose();

				//ready to get cnc data
				cncDataMgr.fnInitConstruct( $scope.cncs, aryAllDataSource['normal'], aryAllDataSource['customization'], function(response){
					cncDataMgr.fnStartFetching();
					$scope.cncData = cncDataMgr.fnGetCncDataPersistently();
				});
			}
			SetLayoutComponentNickname = function( layoutObj )
			{
				//foreach component in layout listview and bigview to translate name into nickname
				//listview first
				for( var key in layoutObj['web']['listView'] ){
					for( var i=0; i<MappingNickname.length; i++ ){
						if( layoutObj['web']['listView'][key].name === MappingNickname[i].componentName ){
							layoutObj['web']['listView'][key].nickname = MappingNickname[i].nickname;
						}
					}
				}

				//bigview
				for( var LocationKey in layoutObj['web']['bigView'] ){
					for( var subKey in layoutObj['web']['bigView'][LocationKey] ){
						for( var i=0; i<MappingNickname.length; i++ ){
							//isExist
							if( Object.keys(layoutObj['web']['bigView'][LocationKey][subKey]).length == 0 ){
								continue;
							}

							if( layoutObj['web']['bigView'][LocationKey][subKey].name === MappingNickname[i].componentName ){
								layoutObj['web']['bigView'][LocationKey][subKey].nickname = MappingNickname[i].nickname;
							}
						}
					}
				}
			}
			GetLayoutCncSource = function( device, layoutObj )
			{
				var aryAllDataSource = [];
				var aryDataSource = [];
				var aryCuzComponent = [];

				//get from listview
				for( var key in layoutObj[device]['listView'] ){
					
					var szSource = layoutObj[device]['listView'][key]["name"];
					var szType = layoutObj[device]['listView'][key]["viewer_data_name"];

					if( typeof szSource == "undefined" ){
						continue;
					}

					//get customer component first
					if( (szType == "CustomerComponent") && (aryCuzComponent.indexOf(szSource) == -1) ){
						//add into customer array
						aryCuzComponent.push( "cuz_" + szSource);
						continue;
					}

					//get source
					if( (szSource == "") || (aryDataSource.indexOf(szSource) != -1) || (szType == "CustomerComponent") ){
						//already added
						continue;
					}

					aryDataSource.push( szType );
				}

				//get form big view
				for( var key in layoutObj[device]['bigView'] ){
					for( var subKey in layoutObj[device]['bigView'][key] ){

						var szSource = layoutObj[device]['bigView'][key][subKey]["name"];
						var szType = layoutObj[device]['bigView'][key][subKey]["viewer_data_name"];

						if( typeof szSource == "undefined" ){
							continue;
						}

						//get customer component first
						if( (szType == "CustomerComponent") && (aryCuzComponent.indexOf(szSource) == -1) ){
							//add into customer array
							aryCuzComponent.push( "cuz_" + szSource);
							continue;
						}

						if( (szSource == "") || (aryDataSource.indexOf(szSource) != -1) || (szType == "CustomerComponent") ){
							//already added
							continue;
						}

						aryDataSource.push( szType );
					}
				}

				aryAllDataSource['customization'] = aryCuzComponent;
				aryAllDataSource['normal'] = aryDataSource;
				return aryAllDataSource;
			}
		//export excel
			$scope.exportExcelAll = function( group )
			{
				this.fnGetResult = function(response){
					var tableIDs = [];
					var sheetNames = [];
					for(var key in response.data){
						//parse record into table
						var record = LoadRecordFile( response.data[key] );
						var header = LoadRecordFileHeader( response.data[key] );
						var table = CreateRecordTable( header, record, "table"+key );
						
						if( typeof header == "undefined"){
							continue;
						}
						
						//append table into group
						jQuery( ".groupListDiv" ).append( table );

						//add tables info
						tableIDs.push("table"+key);
						sheetNames.push(key);
					}

					//export tables into excel
					tablesToExcel( tableIDs, sheetNames, group.groupName+".xls", 'Excel' );
				}

				var ExportObj = { "cncs":group.cncs };
				frontendAdaptor.fnGetResponse( 'DASHBOARD', 'GetRecordStr', ExportObj, this.fnGetResult, false );
			}
			CreateRecordTable = function( headerAry, recordAry, tableID )
			{
				if( typeof headerAry == "undefined" ){
					return;
				}

				var header = "";
				for( var i=0; i<headerAry.length; i++ ){
					
					if( typeof headerAry[i]['nameTW'] == "undefined" ){
						header = header + "<td> </td>";
						continue;
					}

					header = header + "<td>" + headerAry[i]['nameTW'] + "</td>";
				}
				var tableHeader = "<tr>" + header + "</tr>";

				var tableBody = "";
				for(var i=0; i<recordAry.length; i++ ){
					var body = "<td>" + (i+1) + "</td>";
					for( var j=1; j<headerAry.length; j++ ){

						if( typeof recordAry[i][headerAry[j]['nameENG']] == "undefined" ){
							body = body + "<td> </td>";
							continue;
						}

						body = body + "<td>" + recordAry[i][headerAry[j]['nameENG']] + "</td>";
					}
					tableBody = tableBody + "<tr>" + body + "</tr>";
				}

				var tableHtml = "<table id='" + tableID + "' style='display:none'>" + tableHeader + tableBody + "</table>";

				return tableHtml;
			}
	});
});