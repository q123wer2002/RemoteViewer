define([
	'angularAMD'
],function( angularAMD ){
	return function customMgr( $interval, cncDataMgr, frontendAdaptor ){

		//only privode custom layout structure, Create Read Updata Delete
		
		var customMgr = [];
		customMgr.DASHBOARD = [];
		customMgr.DISPLAYBOARD = [];
		customMgr.NICKNAME = [];
		customMgr.COMPONENT = [];

		var m_isInitDone = false;
		var m_aryUserDefinedData = {
			"Name" : [],
			"Function" : [],
		};
		//DASHBOARD
			var m_objDAHSBOARD_structure = {
				name : "",
				web : {
					listView : { "com1":{}, "com2":{}, "com3":{}, "com4":{}, "com5":{}, "com6":{}, "com7":{}, "com8":{}, "com9":{}, "com10":{}, },
					bigView : {
						top : {},
						mid : {},
						bot : {},
						out : {},
					},
				},
			};
			m_fnDASHBOARDInit = function(){
				customMgr.m_objCustomeType['DASHBOARD']['structure'] = m_objDAHSBOARD_structure;
			}
			m_fnGetDASHBOARDData = function(objCatrgoryID){
				this.fnGetResult = function(response){
					if( response.result != "success" ){
						return;
					}
					
					//mapping to dashboard data
					for( var key in response.data ){
						//insert layout from databse into layout list
						//new xml to json class
						var x2js = new X2JS();

						//convert xml into json string
						var jsonObj = x2js.xml_str2json( Base64.decode(response.data[key].file) );
						
						//convert json string into json
						var layout = JSON.parse(jsonObj['LayoutSetting']);
						
						//add layout into myLayoutList
						customMgr.m_objCustomeType['DASHBOARD']['data'].push(layout);
					}

					//set init done
					customMgr.m_objCustomeType['DASHBOARD']['isInitDone'] = true;
				}
				frontendAdaptor.fnGetResponse( 'LAYOUT', "initMyLayout", {"device":"web"}, this.fnGetResult, false );
			}
			m_fnSaveDASHBOARDData = function(objCatrgoryID,szDASHBOARDName,objDASHBOARDData,fnResponse){
				//json into json format
				var layoutJsonRemoveHashkey = {
					//in order to remove $$hashkey
					LayoutSetting : angular.toJson(objDASHBOARDData),
				};

				//new json into xml classs
				var xmljson = new X2JS();

				//convert json into xml string
				var xmlString = xmljson.json2xml_str(layoutJsonRemoveHashkey);

				//Base64 encode xml string
				var szB64XMLLayout = Base64.encode(xmlString);
				
				//start insert database
				this.fnGetResult = function(response){
					//Debug(json);
					if( response.result != "success"){
						return;
					}

					fnResponse(response);
				}

				var initUseListObj = { "layoutDevice":"web", 'layoutName': szDASHBOARDName, 'b64Layout':szB64XMLLayout };
				frontendAdaptor.fnGetResponse( 'LAYOUT', "saveLayout", initUseListObj, this.fnGetResult, true );
			}
			m_fnDeleteDASHBOARDData = function(objCatrgoryID,szDataName,fnResponse){
				this.fnGetResult = function(response){
					//Debug(response);
					if( response.result != "success"){
						return;
					}

					fnResponse(response);
				}

				var objDeleteLayout = { 'device':"web", 'layoutName': szDataName };
				frontendAdaptor.fnGetResponse( 'LAYOUT', "deleteLayout", objDeleteLayout, this.fnGetResult, false );
			}
		//DISPLAYBOARD
			var m_objDISPLAYBOARD_structure = {
				"customer_area"	: [], 
				"marquee"		: {text:"",},
				"jump_second"	: 5, //5 second
				"layout_index"	: 0, //default
			};
			var m_nDISPLAYBOARDMaxArea = 6;
			var m_objDISPLAYBOARD_CncStructure = {
				"type"			: "cnc_data",
				"fun_type"		: "",
				"cnc_id"		: 0,
				"name"			: "",
				"nickname"		: "",
				"db_schema"		: "",
				"viewer_data_name": "",
				"value"			: "",
			};
			var m_objDISPLAYBOARD_TextStructure = {
				"type"		: "plaintext",
				"title"		: "",
				"content"	: "",
			};
			var m_objDISPLAYBOARD_MarqueeStructure = {
				text	: "跑馬燈設定(雙點擊編輯)",
				isEdit	: false,
			};
			customMgr.DISPLAYBOARD.fnGetCncStructure = function(){
				return  m_objDISPLAYBOARD_CncStructure;
			}
			customMgr.DISPLAYBOARD.fnGetTextStructure = function(){
				return  m_objDISPLAYBOARD_TextStructure;
			}
			customMgr.DISPLAYBOARD.fnGetMarqueeStructure = function(){
				return  m_objDISPLAYBOARD_MarqueeStructure;
			}
			m_fnDISPLAYBOARDInit = function(){
				customMgr.m_objCustomeType['DASHBOARD']['structure'] = m_objDISPLAYBOARD_structure;
			}
			m_fnGetDISPLAYBOARDData = function(objCatrgoryID){
				this.fnGetResult = function(response){
					if( typeof response.data == "undefined" || response.data == "" ){
						customMgr.m_objCustomeType['DISPLAYBOARD']['data'] = {};

						//set init done
						customMgr.m_objCustomeType['DISPLAYBOARD']['isInitDone'] = true;
						return;
					}

					//decode slider setting
					var sliderSetting = JSON.parse(Base64.decode(response.data));
					customMgr.m_objCustomeType['DISPLAYBOARD']['data'] = sliderSetting;

					//set init done
					customMgr.m_objCustomeType['DISPLAYBOARD']['isInitDone'] = true;
				}
				frontendAdaptor.fnGetResponse( 'SLIDER', "loadSliderSetting", objCatrgoryID, this.fnGetResult, false );
			}
			m_fnSaveDISPLAYBOARDData = function(objCatrgoryID,szDASHBOARDName,objDASHBOARDData,fnResponse){
				var slider_jsonString = JSON.stringify( objDASHBOARDData );
				var objB64JSONString = {"b64SliderSetting":Base64.encode(slider_jsonString)};

				this.fnGetResult = function(response){
					//Debug(response);
					fnResponse(response);
				}

				var sliderObj= $.extend(objCatrgoryID,objB64JSONString);
				frontendAdaptor.fnGetResponse( 'SLIDER', "saveSliderSetting", sliderObj, this.fnGetResult, false );
			}
		//NICKNAME
			m_fnGetNICKNAMEData = function(objCatrgoryID){
				this.fnGetResult = function(response){
					if( response.result != "success" || typeof response.data == "undefined" || response.data.length == 0 ){
						customMgr.m_objCustomeType['NICKNAME']['data'] = [];

						//set init done
						customMgr.m_objCustomeType['NICKNAME']['isInitDone'] = true;
						return;
					}

					//get json format data
					customMgr.m_objCustomeType['NICKNAME']['data'] = JSON.parse(Base64.decode(response.data));

					//set init done
					customMgr.m_objCustomeType['NICKNAME']['isInitDone'] = true;
				}
				frontendAdaptor.fnGetResponse( 'LAYOUT', "initComponentNickname", {"device":"web"}, this.fnGetResult, false );
			}
			m_fnSaveNICKNAMEData = function(objCatrgoryID,szDASHBOARDName,objDASHBOARDData,fnResponse){
				this.fnGetResult = function(response){
					//Debug(response);
					fnResponse(response);
				}

				//mapping josn into string, and encode it
				var szBase64Nicknames = Base64.encode(JSON.stringify(objDASHBOARDData));
				
				var SaveNicknameObj = { "b64Nicknames":szBase64Nicknames };
				frontendAdaptor.fnGetResponse( 'LAYOUT', "saveLayoutComponentNickname", SaveNicknameObj, this.fnGetResult, false );
			}
			m_fnMappingNickname = function(){
				//DASHBOARD
				//DISPLAYBOARD
				//COMPONENT
			}
		//COMPONENT
			var m_objCOMPONENT_structure = {
				"name"				: "",
				"nickname"			: "",	//for rename
				"db_schema"			: "",	//for agent to get data
				"viewer_data_name"	: "",	//for viewer to find this data
				"value"				: "",	//for get data use
				"big_view_size"		: "",	//for show layout
				"isRenameMode"		: false,//for show layout
			};
			m_fnCOMPONENTInit = function(){
				customMgr.m_objCustomeType['COMPONENT']['structure'] = m_objCOMPONENT_structure;
			}
			m_fnGetCOMPONENTData = function(objCatrgoryID){
				
				this.fnGetResult = function(response){
					if( response.result != "success" || typeof response.data == "undefined" || response.data.length == 0 ){
						return;
					}

					//to get custom data
					cncDataMgr.fnGetCNCCustomDataList(function(response){
						if( response.result != "success" || typeof response.data == "undefined" || response.data.length == 0 ){
							customMgr.m_objCustomeType['COMPONENT']['data']['custom'] = [];

							//set init done
							customMgr.m_objCustomeType['COMPONENT']['isInitDone'] = true;
							return;
						}

						//input response data into data
						customMgr.m_objCustomeType['COMPONENT']['data']['custom'] = m_fnUnifyCOMPONENTStructure( "custom", response.data );

						//set init done
						customMgr.m_objCustomeType['COMPONENT']['isInitDone'] = true;
					});

					//input response data into data
					customMgr.m_objCustomeType['COMPONENT']['data']['normal'] = m_fnUnifyCOMPONENTStructure( "normal", response.data );
				}

				cncDataMgr.fnGetCNCDataList(objCatrgoryID,this.fnGetResult);
			}
			m_fnUnifyCOMPONENTStructure = function( szTypeOfComponent, aryComponentData ){
				var aryUnifiedComponent = [];
				
				if( szTypeOfComponent == "normal" ){
					for(var i=0; i<aryComponentData.length; i++ ){
						//component name, bigView size, DB schema, prefix name, nickname
						var canUseObj = {
							"name"			: aryComponentData[i].funDetail[0],
							"nickname"		: "",//for rename
							"db_schema"		: aryComponentData[i].funDetail[5],//for agent to get data
							"viewer_data_name"	: aryComponentData[i].funName,//for viewer to find this data
							"value"			: "",//for get data use
							"big_view_size"	: aryComponentData[i].funDetail[1]["web"],//for show layout
							"isRenameMode"	: false,
						};
						aryUnifiedComponent.push(canUseObj);
					}
				}else if( szTypeOfComponent == "custom" ){
					for( var i=0; i<aryComponentData.length; i++ ){
						var canUseObj = {
							"name"			: aryComponentData[i],
							"nickname"		: "",
							"db_schema"		: "CustomerRoutine",
							"viewer_data_name"	:"CustomerComponent",
							"value"			: "",//for get data use
							"bigViewSize"	: "1*1",
							"isRenameMode"	: false,
						};
						aryUnifiedComponent.push(canUseObj);
					}
				}

				return aryUnifiedComponent;
			}

		//init function ["DASHBOARD","NICKNAME","COMPONENT"] or ["DISPLAYBOARD","NICKNAME","COMPONENT"]
		customMgr.fnInitCustomManager = function( aryCustomObjName ){
			//set default first
			m_fnDefaultCustomManager();

			//loop to check exist or not, and se default structure
			for( var i=0; i<aryCustomObjName.length; i++ ){
				var isExist = m_fnIsExistCustomObj(aryCustomObjName[i]);
				if( isExist == false ){
					return;
				}

				//exist, start to set structure
				var szObjName = aryCustomObjName[i];

				//init function
				customMgr.m_objCustomeType[szObjName]['functions']['INIT']();
				
				//
				m_aryUserDefinedData['Name'].push(szObjName);
				m_aryUserDefinedData['Function'].push( customMgr.m_objCustomeType[szObjName]['functions']['FETCH'] );
			}

			//flag
			m_isInitDone = true;
		}

		//fetch data
		customMgr.fnFetchCustomData = function( objCatrgoryID , fnResponse ){
			
			//do fetching
			var nFunctionIndex = 0;
			while( nFunctionIndex != m_aryUserDefinedData['Function'].length ){
				m_aryUserDefinedData['Function'][nFunctionIndex](objCatrgoryID);

				//next function
				nFunctionIndex++;
			}

			var isEnterInterval = false;
			var interval_waitMpaaingData = $interval(function(){
				
				//only one process can enter this area
				if( isEnterInterval == true ){
					return;
				}

				//enter
				isEnterInterval = true;

				//check all init done
				for( var i=0; i<m_aryUserDefinedData['Name'].length; i++ ){
					if( customMgr.m_objCustomeType[ m_aryUserDefinedData["Name"][i] ]['isInitDone'] === false ){
						fnResponse({"result":"fail"});
						
						//release
						isEnterInterval = false;
						return;
					}
				}

				//mapping nickname into dashboard, displayboard, component
				

				//retrun and destory interval
				fnResponse({"result":"success"});
				$interval.cancel(interval_waitMpaaingData);
			},500);
		}

		//C retrun default structure
		customMgr.fnGetDefaultStructure = function( szCustomObjName ){
			var szFunCode = "C";

			//for check
			if( m_fnIsPassCheckFirst(szCustomObjName,szFunCode) == false ){
				return;
			}

			return customMgr.m_objCustomeType[szCustomObjName]['structure'];
		}

		//R return array[], user set all data, objCatrgoryID maybe campany id or factory id
		customMgr.fnGetCustomData = function( szCustomObjName ){
			var szFunCode = "R";

			//for check
			if( m_fnIsPassCheckFirst(szCustomObjName,szFunCode) == false ){
				return;
			}

			return customMgr.m_objCustomeType[szCustomObjName]['data'];
		}

		//U save(update) user set data, objCatrgoryID maybe campany id or factory id
		customMgr.fnSaveCustomData = function( objCatrgoryID, szCustomObjName, szDataName, objData, fnResponse ){
			var szFunCode = "U";

			//for check
			if( m_fnIsPassCheckFirst(szCustomObjName,szFunCode) == false ){
				return;
			}

			//do function
			customMgr.m_objCustomeType[szCustomObjName]['functions']["SAVE"](objCatrgoryID,szDataName,objData,fnResponse);
		}

		//D delete, objCatrgoryID maybe campany id or factory id
		customMgr.fnDeleteCustomData = function( objCatrgoryID, szCustomObjName, szDataName, fnResponse ){
			var szFunCode = "D";

			//for check
			if( m_fnIsPassCheckFirst(szCustomObjName,szFunCode) == false ){
				return;
			}

			//do function
			customMgr.m_objCustomeType[szCustomObjName]['functions']["DELETE"](objCatrgoryID,szDataName,fnResponse);
		}

		//S special functions
		customMgr.fnSpecialCaseFunction = function( objCatrgoryID, szCustomObjName, szSpecialFunctionName, fnResponse ){
			var szFunCode = "S";

			//for check
			if( m_fnIsPassCheckFirst(szCustomObjName,szFunCode) == false ){
				return;
			}

			//do function
			customMgr.m_objCustomeType[szCustomObjName]['functions'][szSpecialFunctionName](fnResponse);
		}

		//dispose
		customMgr.fnDispose = function(){
			//set default
			m_fnDefaultCustomManager();
		}

		//set default
		m_fnDefaultCustomManager = function(){
			m_aryUserDefinedData = {
				"Name" : [],
				"Function" : [],
			};
			customMgr.m_objCustomeType = {
				DASHBOARD	: { "data":[], "structure":{}, "support":"CRUD", "isInitDone":false, "functions":{"INIT":m_fnDASHBOARDInit, "FETCH":m_fnGetDASHBOARDData, "SAVE":m_fnSaveDASHBOARDData, "DELETE":m_fnDeleteDASHBOARDData, } }, //structure
				DISPLAYBOARD: { "data":[], "structure":{}, "support":"CRUD", "isInitDone":false, "functions":{"INIT":m_fnDISPLAYBOARDInit, "FETCH":m_fnGetDISPLAYBOARDData, "SAVE":m_fnSaveDISPLAYBOARDData, "DELETE":function(){}, } }, //structure
				NICKNAME	: { "data":[], "support":"RU", "isInitDone":false, "functions":{"INIT":function(){}, "FETCH":m_fnGetNICKNAMEData, "SAVE":m_fnSaveNICKNAMEData, "DELETE":function(){}, } }, //data
				COMPONENT	: { "data":[], "structure":{}, "support":"CRU", "isInitDone":false, "functions":{"INIT":m_fnCOMPONENTInit, "FETCH":m_fnGetCOMPONENTData, "SAVE":function(){}, "DELETE":function(){}, } }, //data
			};
		}

		//for check
		m_fnIsPassCheckFirst = function( szCustomObjName, szFunCode ){
			if( m_fnIsExistCustomObj(szCustomObjName) == false || 
				m_fnIsSupport(szCustomObjName,szFunCode) == false || 
				m_isInitDone == false ){

				return false;
			}

			return true;
		}

		//confirm, does objCustom exist this custom obj
		m_fnIsExistCustomObj = function( szCustomObjName ){
			if( typeof szCustomObjName == "undefined" || szCustomObjName == "" ){
				return false;
			}

			if( typeof customMgr.m_objCustomeType[szCustomObjName] == "undefined" ){
				return false;
			}

			return true;
		}

		//confirm, does it support this function
		m_fnIsSupport = function( szCustomObjName, szFunCode ){
			if( customMgr.m_objCustomeType[szCustomObjName]['support'].indexOf(szFunCode) == -1 ){
				return false;
			}

			return true;
		}

		return customMgr;
	}
});
