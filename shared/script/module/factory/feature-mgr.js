define([
	'angularAMD'
],function( angularAMD ){
	return function featureMgr(){
		
		var featureMgr = [];
		
		//PAGE OBJECT
		var m_objAllPage = {
			DISPLAY 		: {ROUTE:"factory"},
			SLIDERSETTING 	: {ROUTE:"sliderSetting"},
			LAYOUTSETTING 	: {ROUTE:"layoutSetting"},
			LOGOSETTING 	: {ROUTE:"logoSetting"},
			DISPLAY 		: {ROUTE:"factory"},
			CNC 			: {ROUTE:"cnc"},
			SHIFTSETTING 	: {ROUTE:"shiftSetting"},
			IPCAMREGISTER 	: {ROUTE:"IPCamRegister"},
			IPCAMSTEAM 		: {ROUTE:"IPCamStreaming"},
			CNC 			: {ROUTE:"cnc"},
			USERSETTING 	: {ROUTE:"userSetting"},
		};
		//CNCFEATURE OBJECT
		var m_objAllCncFeature = {
			//function
			//OOE
				OOE 					: { ROUTE:"cncOOE", PARENT:null},
				OOE_DAY 				: { ROUTE:"DAYOOE", PARENT:"OOE"},
				OOE_MONTH 				: { ROUTE:"MONTHOOE", PARENT:"OOE"},
				OOE_YEAR 				: { ROUTE:"YEAROOE", PARENT:"OOE"},
				OOE_AVG 				: { ROUTE:"AVGHisOOE", PARENT:"OOE"},
			//RECORD
				RECORD 					: { ROUTE:"cncRECORD", PARENT:null},
				RECORD_CURRENT 			: { ROUTE:"curtWork", PARENT:"RECORD"},
				RECORD_HISTORY 			: { ROUTE:"hisWork", PARENT:"RECORD"},
			//ALARM
				ALARM 					: { ROUTE:"cncALARM", PARENT:null},
				ALM_CURRENT 			: { ROUTE:"curtAlm", PARENT:"ALARM"},
				ALM_HISTORY 			: { ROUTE:"hisAlm", PARENT:"ALARM"},
				ALM_ANALY 				: { ROUTE:"anlyzAlm", PARENT:"ALARM"},
			//DIAGNOSIS
				DIAGNOSIS 				: { ROUTE:"cncDIAGNOSIS", PARENT:null},
				DIAGNOSIS_R 			: { ROUTE:"R_Bit", PARENT:"DIAGNOSIS"},
				DIAGNOSIS_I 			: { ROUTE:"I_Bit", PARENT:"DIAGNOSIS"},
				DIAGNOSIS_O 			: { ROUTE:"O_Bit", PARENT:"DIAGNOSIS"},
				DIAGNOSIS_C 			: { ROUTE:"C_Bit", PARENT:"DIAGNOSIS"},
				DIAGNOSIS_S 			: { ROUTE:"S_Bit", PARENT:"DIAGNOSIS"},
				DIAGNOSIS_A 			: { ROUTE:"A_Bit", PARENT:"DIAGNOSIS"},
				DIAGNOSIS_DEBUG 		: { ROUTE:"Debug_Var", PARENT:"DIAGNOSIS"},
				DIAGNOSIS_PARAM 		: { ROUTE:"Param", PARENT:"DIAGNOSIS"},
			//FILE
				FILE 					: { ROUTE:"cncFILE", PARENT:null},
				FILE_NCFILE 			: { ROUTE:"NcFile", PARENT:"FILE"},
				FILE_NCFILE_UPLOAD 		: { ROUTE:"Ncfile_upload", PARENT:"FILE_NCFILE"},
				FILE_NCFILE_DOWNLOAD 	: { ROUTE:"Ncfile_download", PARENT:"FILE_NCFILE"},
				FILE_LADDER 			: { ROUTE:"Ladder", PARENT:"FILE"},
			//OFFSET
				OFFSET 					: { ROUTE:"cncOFFSET", PARENT:null},
		};

		//DISPLAYBOARD(object name)
			var m_DISPLAYBOARD_allPage = ["DISPLAY","SLIDERSETTING","LAYOUTSETTING","LOGOSETTING","DISPLAY"];
		//WEB
			var m_WEB_allPage = ["CNC","SHIFTSETTING","LAYOUTSETTING","LOGOSETTING","IPCAMREGISTER","IPCAMSTEAM"];
			var m_WEB_CNC_allFeature = [
				//OOE
				"OOE","OOE_DAY","OOE_MONTH","OOE_YEAR","OOE_AVG",
				//RECORD
				"RECORD","RECORD_CURRENT","RECORD_HISTORY",
				//ALARM
				"ALARM","ALM_CURRENT","ALM_HISTORY","ALM_ANALY",
				//DIAGNOSIS
				"DIAGNOSIS","DIAGNOSIS_R","DIAGNOSIS_I","DIAGNOSIS_O","DIAGNOSIS_C","DIAGNOSIS_S","DIAGNOSIS_A","DIAGNOSIS_DEBUG","DIAGNOSIS_PARAM",
				//FILE
				"FILE","FILE_NCFILE","FILE_NCFILE_UPLOAD","FILE_NCFILE_DOWNLOAD","FILE_LADDER",
				//OFFSET
				"OFFSET",
			];
		//MOBILE
			var m_MOBILE_allPage = ["CNC","USERSETTING"];
			var m_MOBILE_CNC_allFeature = [
				//OOE
				"OOE","OOE_DAY","OOE_MONTH","OOE_YEAR","OOE_AVG",
				//RECORD
				"RECORD","RECORD_CURRENT","RECORD_HISTORY",
				//ALARM
				"ALARM","ALM_CURRENT","ALM_HISTORY","ALM_ANALY",
			];
		var objTranslate = {
			//MODE
				WEB : "網站",
				DISPLAYBOARD : "車間看板",
				MOBILE : "手機",
			//PAGE
				DISPLAY : "車間看板",
				SLIDERSETTING : "設定車間看板",
				LAYOUTSETTING : "客製樣表",
				LOGOSETTING : "LOGO設定",
				SHIFTSETTING : "班別設定",
				IPCAMREGISTER : "IP Cam設定",
				IPCAMSTEAM : "觀看 IP Cam",
				USERSETTING : "使用者設定",
				CNC : "控制器頁面",
			//CNCFEATURE
			//OOE
				OOE : "稼動率類",
				OOE_DAY : '天稼動率',
				OOE_MONTH : '月稼動率',
				OOE_YEAR : '年稼動率',
				OOE_AVG : '總平均稼動率',
			//RECORD
				RECORD : "加工紀錄類",
				RECORD_CURRENT : '目前加工紀錄',
				RECORD_HISTORY : '歷史加工紀錄',
			//ALARM
				ALARM : "警報類",
				ALM_CURRENT : '目前警報',
				ALM_HISTORY : '歷史警報',
				ALM_ANALY : '警報統計',
			//DIAGNOSIS
				DIAGNOSIS : "診斷類",
				DIAGNOSIS_R : 'R值',
				DIAGNOSIS_I : 'I值',
				DIAGNOSIS_O : 'O值',
				DIAGNOSIS_C : 'C值',
				DIAGNOSIS_S : 'S值',
				DIAGNOSIS_A : 'A值',
				DIAGNOSIS_DEBUG : 'Debug值',
				DIAGNOSIS_PARAM : '參數值',
			//FILE
				FILE : "檔案上下傳類",
				FILE_NCFILE : '加工檔',
				FILE_NCFILE_UPLOAD : "上傳加工檔",
				FILE_NCFILE_DOWNLOAD : "下載加工檔",
				FILE_LADDER : 'Ladder檔',
			//OFFSET
				OFFSET : "刀補磨耗類",
		};

		//init
		featureMgr.objFeatureOverview = {
			DISPLAYBOARD : { PAGE:m_DISPLAYBOARD_allPage },
			WEB : { PAGE:m_WEB_allPage, CNCFeature:m_WEB_CNC_allFeature },
			MOBILE : { PAGE:m_MOBILE_allPage, CNCFeature:m_MOBILE_CNC_allFeature },
		};

		featureMgr.fnGetAllFeature = function( szViewMode ){
			if( szViewMode == "DISPLAYBOARD" ){
				return null;
			}

			//create hierarchy
			var objModeFeature = {};
			var aryFeatureOverview = featureMgr.objFeatureOverview[szViewMode]['CNCFeature'];
			for( var i=0; i<aryFeatureOverview.length; i++ ){
				//mapping data into
				//level one
				var objFeature = m_objAllCncFeature[aryFeatureOverview[i]];
				if( objFeature['PARENT'] == null ){
					//father
					objModeFeature[aryFeatureOverview[i]] = new Object();
					continue;
				}

				//level two
				if( typeof objModeFeature[objFeature['PARENT']] != "undefined" ){
					objModeFeature[objFeature['PARENT']][aryFeatureOverview[i]] = new Object();
					continue;
				}

				//level three
				var objFatherFeature = m_objAllCncFeature[objFeature['PARENT']];
				if( typeof objModeFeature[objFatherFeature['PARENT']][objFeature['PARENT']] != "undefined" ){
					objModeFeature[objFatherFeature['PARENT']][objFeature['PARENT']][aryFeatureOverview[i]] = new Object();
				}
			}

			return objModeFeature;
		}

		m_fnIsExistObject = function( szKey, object ){
			if( JOSN.stringify(object).indexOf(szKey) == -1 ){
				return false;
			}

			return true;
		}

		featureMgr.fnGetAllPage = function( szViewMode ){
			var objModePage = {};
			var aryPageOverview = featureMgr.objFeatureOverview[szViewMode]['PAGE'];
			for( var i=0; i<aryPageOverview.length; i++ ){
				objModePage[aryPageOverview[i]] = new Object();
			}

			return objModePage;
		}

		featureMgr.fnGetPageKey = function( szViewMode, szRouterName ){
			var objAllPage = featureMgr.objFeatureOverview[szViewMode]['PAGE'];

			for( var szPageKey in objAllPage ){
				if( objAllPage[szPageKey] == szRouterName ){
					return szPageKey;
				}
			}

			return null;
		}

		featureMgr.fnGetFeatureKey = function( szViewMode, szFeatureClass, szFeature ){
			//not support display board
			if( szViewMode == "DISPLAYBOARD" ){
				return null;
			}

			var objFeature = featureMgr.objFeatureOverview[szViewMode]['CNCFeature'];

			//no this feature class
			if( typeof objFeature[szFeatureClass] == "undefined" ){
				return null;
			}

			if( Object.getOwnPropertyNames(objFeature[szFeatureClass]).length == 0 ){
				return szFeatureClass;
			}

			//find feature
			for( var szFeatureKey in objFeature[szFeatureClass] ){
				if( objFeature[szFeatureClass][szFeatureKey] == szFeature ){
					return szFeatureKey;
				}
			}

			//not find this feature in feature class
			return null;
		}

		//TODO langMgr
		featureMgr.fnTranslate = function( szKey ){
			return objTranslate[szKey];			
		}

		return featureMgr;
	}
});
