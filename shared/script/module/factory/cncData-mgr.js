define([
	'angularAMD'
],function( angularAMD ){
	return function cncDataMgr( $interval, frontendAdaptor ){

		var cncDataMgr = [];
		
		//default
		var m_interval_timer = null;
		cncDataMgr.m_nDataCluster = 0;
		cncDataMgr.m_isInitDone = false;
		cncDataMgr.m_isModify = false;
		cncDataMgr.m_isFetching = false;
		cncDataMgr.m_aryCncs = [];
		cncDataMgr.m_aryOnlyFetchCncList = [];

		//all cnc can use function
		cncDataMgr.fnGetCNCDataList = function( objParam, fnResponse ){
			
			this.fnGetResult = function(response){
				fnResponse(response);
			}

			var nFID = ( typeof objParam['nFID'] != "undefined" ) ? objParam['nFID'] : -1;
			var cnc_id = ( typeof objParam['cnc_id'] != "undefined" ) ? objParam['cnc_id'] : -1;

			var objParam = {};
			if( nFID != -1 ){
				objParam = {"nFID":nFID};
			}else if( cnc_id != -1 ){
				objParam = {"cnc_id":cnc_id};
			}

			frontendAdaptor.fnGetResponse( "LAYOUT", "initUseComponentList", objParam, this.fnGetResult, false );
		}

		//custom function list
		cncDataMgr.fnGetCNCCustomDataList = function( fnResponse ){
			
			this.fnGetResult = function(response){
				
				if( response.result != "success" || typeof response.data == "undefined" || response.data.length == 0 ){
					fnResponse(response);
					return;
				}

				//return array
				var aryCustomData = [];

				//start processing
				var x2js = new X2JS();
				for( var i=0; i<response.data.length; i++ ){
					//convert routine file from xml
					var objRoutine = x2js.xml_str2json( response.data[i]['routine'].split("<?xml version=\"1.0\" encoding=\"UTF-8\"?>").pop() );
					
					if( typeof objRoutine['RoutineFile']['Routine'] == "undefined" ){
						continue;
					}
					
					if( Array.isArray(objRoutine['RoutineFile']['Routine']) == false ){
						//means this routine only one routine	
						var szCustomerData = m_fnGetCustomComponentFromRoutine( objRoutine['RoutineFile']['Name'], objRoutine['RoutineFile']['Routine'] );
						
						if( szCustomerData.length == 0 ){
							continue;
						}

						aryCustomData.push(szCustomerData);
						continue;
					}

					for( var j=0; j<objRoutine['RoutineFile']['Routine'].length; j++ ){
						var szCustomerData = m_fnGetCustomComponentFromRoutine( objRoutine['RoutineFile']['Name'], objRoutine['RoutineFile']['Routine'][j] );
						
						if( szCustomerData.length == 0 ){
							continue;
						}

						aryCustomData.push(szCustomerData);
					}
				}

				var objResult = {
					"result" : "success",
					"data"	: aryCustomData,
				};

				//retrun data to caller
				fnResponse(objResult);
			}

			frontendAdaptor.fnGetResponse( "LAYOUT", "intiMyCustomComponent", {}, this.fnGetResult, false );
		}
		m_fnGetCustomComponentFromRoutine = function( szRoutineName, objRoutine ){
			var aryConditions = [
				{"fieldName":"Condition", "value":"每次"},
				{"fieldName":"Action", "value":"取得R值"},
			];

			var szCustomData = "";
			var isCuzComponent = true;
			for( var k=0; k<aryConditions.length; k++ ){
				if( objRoutine[aryConditions[k]['fieldName']] != aryConditions[k]['value']){
					isCuzComponent = false;
					break;
				}
			}

			if( isCuzComponent == true ){
				szCustomData = szRoutineName + "(R" + objRoutine["ActionParam1"] + ")";
			}

			return szCustomData;
		}

		//init
		//aryCncList => example:[235,214,235,12,54] (cnc_id) 
		//aryDataOfViewerName => example:["szName", "szIP"] from server/database/functionList.php
		//aryDataOfCustom => example:["cuz_routine(R1000)", "cuz_GG(R500)"]
		cncDataMgr.fnInitConstruct = function( aryCncList, aryDataOfViewerName, aryDataOfCustom, fnResponse ){
			if( typeof aryCncList == "undefined" || aryCncList.length == 0 ){
				return;
			}

			if( typeof aryDataOfViewerName == "undefined" || aryDataOfViewerName.length == 0 ){
				return;
			}
			
			this.fnGetResult = function(response){
				if( response.result == "success" ){
					//mapping cnc data
					//foreach cnc to create object
					for( var i=0; i<aryCncList.length; i++ ){
						//init cnc objext
						var objCncData = { "nCNCID":aryCncList[i], "aryData":{}, "isFetching":false };
						
						//foreach viewer data to add into cnc data
						for( var viewerName in response.data ){
							objCncData.aryData[viewerName] = response.data[viewerName];
						}

						//add into local list
						cncDataMgr.m_aryCncs.push(objCncData);

						//start processing custom data
						if( typeof aryDataOfCustom != "undefined" && aryDataOfCustom.length != 0 ){
							cncDataMgr.fnAddCustomDataIntoCnc( aryCncList[i], aryDataOfCustom );	
						}
					}

					cncDataMgr.m_isInitDone = true;
				}
				fnResponse(response);
			}

			var objApi = { "dataOfViewer":aryDataOfViewerName };
			frontendAdaptor.fnGetResponse( "CNCDATA", "GetCncDataAPIFromViewerName", objApi, this.fnGetResult, false );
		}

		//add extra data into special cnc
		cncDataMgr.fnAddDataIntoCnc = function( nCNCID, aryDataList, fnResponse ){
			if( cncDataMgr.m_isInitDone == false ){
				return false;
			}

			//add extra data
			this.fnGetResult = function(response){
				if( response.result == "success" ){
					//mapping cnc data
					//foreach cnc to create object
					for( var i=0; i<cncDataMgr.m_aryCncs.length; i++ ){

						//find special cnc
						if( cncDataMgr.m_aryCncs[i]['nCNCID'] == nCNCID ){
							//foreach viewer data to add into cnc data
							for( var viewerName in response.data ){
								//find special cnc
								cncDataMgr.m_aryCncs[i]['aryData'][viewerName] = response.data[viewerName];
							}
						}
					}

					//modifying
					cncDataMgr.m_isModify = true;
				}
				fnResponse(response);
			}

			var objApi = { "dataOfViewer":aryDataList };
			frontendAdaptor.fnGetResponse( "CNCDATA", "GetCncDataAPIFromViewerName", objApi, this.fnGetResult, false );
		}

		//add extra data into special cnc
		cncDataMgr.fnAddCustomDataIntoCnc = function( nCNCID, aryCustomData ){
			if( cncDataMgr.m_aryCncs.length == 0 ){
				return;
			}

			for( var i=0; i<cncDataMgr.m_aryCncs.length; i++ ){
				if( cncDataMgr.m_aryCncs[i]['nCNCID'] == nCNCID ){
					for( var j=0; j<aryCustomData.length; j++ ){
						cncDataMgr.m_aryCncs[i]['aryData'][aryCustomData[j]] = new Object();
						cncDataMgr.m_aryCncs[i]['aryData'][aryCustomData[j]]['api'] = aryCustomData[j];
						cncDataMgr.m_aryCncs[i]['aryData'][aryCustomData[j]]['isUpdating'] = true;
						cncDataMgr.m_aryCncs[i]['aryData'][aryCustomData[j]]['value'] = '';
					}
				}
			}

			//modifying
			cncDataMgr.m_isModify = true;
		}

		//start fetch and save into local storage
		cncDataMgr.fnStartFetching = function(){
			//need init first
			if( cncDataMgr.m_isInitDone == false ){
				return;
			}

			var aryCncFetchList = [];

			//set fetch cnc data
			aryCncFetchList = m_fnArrangeFetchingList();

			//start fetching
			m_interval_timer = $interval( function(){
				//get cnc data dynamic
				if( cncDataMgr.m_isFetching == false && cncDataMgr.m_isModify == true ){
					//add
					aryCncFetchList = m_fnArrangeFetchingList( cncDataMgr.m_aryOnlyFetchCncList );

					//modification is already add
					cncDataMgr.m_isModify = false;	
				}

				m_fnFetchingData( aryCncFetchList );
			}, 1000 );
		}

		//start fetch and save into local storage
		cncDataMgr.fnStopFetching = function(){
			if( cncDataMgr.m_isFetching == false ){
				return;
			}
			
			cncDataMgr.m_isFetching = false;
			$interval.cancel(m_interval_timer);
		}

		//start fetch and save into local storage
		cncDataMgr.fnDispose = function(){
			//clear interval
			$interval.cancel(m_interval_timer);
			
			//set all var to default
			m_interval_timer = null;
			cncDataMgr.m_isInitDone = false;
			cncDataMgr.m_isModify = false;
			cncDataMgr.m_isFetching = false;
			cncDataMgr.m_aryCncs = [];
			cncDataMgr.m_aryOnlyFetchCncList = [];

			cncDataMgr.m_nDataCluster++;
		}

		//limit cnc to fetch data
		cncDataMgr.fnLimitFetchingCnc = function( aryOnlyFetchCncList ){

			cncDataMgr.m_aryOnlyFetchCncList = aryOnlyFetchCncList;

			//modifying
			cncDataMgr.m_isModify = true;
		}

		//call correct cnc to get data
		cncDataMgr.fnGetCncDataPersistently = function( aryCncList ){
			if( cncDataMgr.m_isInitDone == false ){
				return;
			}

			//no set need list, return all cncs
			if( typeof aryCncList == "undefined" || aryCncList.length == 0 ){
				return cncDataMgr.m_aryCncs;
			}

			var cncList = [];

			for( var i=0; i<cncDataMgr.m_aryCncs.length; i++ ){
				if( aryCncList.indexOf(cncDataMgr.m_aryCncs[i]['nCNCID']) != -1 ){
					cncList.push( cncDataMgr.m_aryCncs[i] );
				}
			}

			return cncList;
		}

		//arrange cnc list
		m_fnArrangeFetchingList = function( aryOnlyFetchCncList ){
			//default
			var aryResult = [];

			//start arranging
			if( typeof aryOnlyFetchCncList != "undefined" && aryOnlyFetchCncList.length != 0 ){
				//if set fetching cnc id, only fetch those cncs
				for( var i=0; i<cncDataMgr.m_aryCncs.length; i++ ){
					if( aryOnlyFetchCncList.indexOf(cncDataMgr.m_aryCncs[i]['nCNCID']) != -1 ){
						aryResult.push( { "cnc":cncDataMgr.m_aryCncs[i], "cncIndex":i, "dataCluster":cncDataMgr.m_nDataCluster } );
					}
				}
			}else{
				//fetch all cncs
				for( var i=0; i<cncDataMgr.m_aryCncs.length; i++ ){
					aryResult.push( { "cnc":cncDataMgr.m_aryCncs[i], "cncIndex":i, "dataCluster":cncDataMgr.m_nDataCluster } );
				}
			}

			return aryResult;
		}

		//get cnc data
		m_fnFetchingData = function( aryCncFetchList ){
			this.fnGetResponse = function(response){
				
				if( (response.result == "success") && (response.data.dataCluster == cncDataMgr.m_nDataCluster) ){
					var index = response.data['cncIndex'];
					cncDataMgr.m_aryCncs[index]['aryData'] = response.data['aryData'];
					cncDataMgr.m_aryCncs[index]['cncStatus'] = response.data['cncStatus'];
					cncDataMgr.m_aryCncs[index].isFetching = false;
				}

				//flag to control		
				cncDataMgr.m_isFetching = false;
			}

			//flag to control
			cncDataMgr.m_isFetching = true;
			
			//fetching data every time
			for( var i=0; i<aryCncFetchList.length; i++ ){
				
				if( aryCncFetchList[i]['cnc'].isFetching == true ){
					continue;
				}

				//set flag
				aryCncFetchList[i]['cnc'].isFetching = true;

				//go fetching data
				frontendAdaptor.fnGetResponse('CNCDATA', 'GettingCNCDataByUpdate', aryCncFetchList[i], this.fnGetResponse, false );
			}
		}

		return cncDataMgr;
	}
});
