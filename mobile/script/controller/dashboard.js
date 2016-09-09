define(['../../app'], function (app) {
	app.controller('SyntecDashboard',function($scope,$interval,$timeout,PATH,cfgMgr,cncDataMgr,frontendAdaptor){
		//view
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
			$scope.fnShowTitle = function( dataKey )
			{
				var dataType = "";
				switch(dataKey){
					case "szName":
						dataType += "名稱";
					break;
					case "szMode":
						dataType += "模式";
					break;
					case "szMainProg":
						dataType += "程式";
					break;
					case "szProcess":
						dataType += "加工進度";
					break;
				}

				return dataType;				
			}
			$scope.fnShowValue = function( cncData )
			{
				if( cncData['value'].length == 0 ){
					return "x";
				}

				return cncData['value'];
			}
		//var data
			var isInitDone = false;
			var interval_GetCncData;
			var aryCncDataForMobile = {
				normal : ["szName","szMode","szMainProg","szProcess"], //viewer_data
				custom : [], //default null
			};

			$scope.factories = [];
			$scope.cncs = [];
			$scope.cncData = [];
		//init function
			$scope.InitData = function()
			{
				InitDashBoardData();

				//interval
				interval_GetCncData = $interval(function(){
					if( isInitDone == false ){
						return;
					}

					//use cncDataMgr module to get data
					//default
					cncDataMgr.fnDispose();

					//ready to get cnc data
					cncDataMgr.fnInitConstruct( $scope.cncs, aryCncDataForMobile['normal'], aryCncDataForMobile['custom'], function(response){
						cncDataMgr.fnStartFetching();
						$scope.cncData = cncDataMgr.fnGetCncDataPersistently();
					});

					//destory this interval
					$interval.cancel(interval_GetCncData);
				}, 1000);
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

				//flag
				isInitDone = true;
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
	});
});