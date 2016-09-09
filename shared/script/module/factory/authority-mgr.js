define([
	'angularAMD'
],function( angularAMD ){
	return function authorityMgr(featureMgr,frontendAdaptor){
		var authorityMgr = [];

		var aryAuthorityList = [
			{AUTHORITY_TEMPLATE_ID:0, TEMPLATE_NAME:"預設權限", AUTHORITY:{
				DISPLAYBOARD:{
					PAGE:["DISPLAY","SLIDERSETTING","LAYOUTSETTING","LOGOSETTING"],
				},
				WEB:{
					PAGE:["CNC","SHIFTSETTING","LAYOUTSETTING","LOGOSETTING","IPCAMREGISTER","IPCAMSTEAM"],
					CNCFEATURE:{
						OOE:["DAY","MONTH","YEAR","AVG"],
						RECORD:["CURRENTRECORD","HISTORYRECORD"],
						ALARM:["CURRENTALM","HISTORYALM","ANALYALARM"],
					},
				},
				MOBILE:{
					PAGE:[],
					CNCFEATURE:{
						OOE:[],
						RECORD:[],
						ALARM:[],
					},
				},
			}},
			{AUTHORITY_TEMPLATE_ID:1, TEMPLATE_NAME:"基層員工", AUTHORITY:{
				DISPLAYBOARD:{
					PAGE:["DISPLAY","SLIDERSETTING"],
				},
				WEB:{
					PAGE:["CNC","IPCAMSTEAM","LOGOSETTING"],
					CNCFEATURE:{
						OOE:["DAY"],
						ALARM:["CURRENTALM"],
					},
				},
			}},
		];

		var m_objMyAuthority = {

		};

		authorityMgr.fnInitAuthority = function( szMode )
		{
			//mode : "EDIT", "USE"
			if( szMode == "EDIT" ){
				m_fnReadAllAuthority();
				return;
			}

			if( szMode == "USE" ){
				m_fnGetMyAuthority();
				return;
			}

			console.warn("ERROR MODE");
			return;
		}

		//use authority
			//get my authority
			m_fnGetMyAuthority = function(){}	
			//check my authority
			//param : object
			authorityMgr.fnIsOwnAuthority = function(){}

		//edit authority, need to import feature first
			//Create authority template
			authorityMgr.fnNewAuthority = function()
			{
				var objNewAuthority = {
					AUTHORITY_TEMPLATE_ID : 0,
					TEMPLATE_NAME : "",
					AUTHORITY: {
						WEB : {
							PAGE : [],
							CNCFEATURE : {},
						},
						DISPLAYBOARD : {
							PAGE : [],
						},
						MOBILE : {
							PAGE : [],
							CNCFEATURE : {},
						},
					},
				};

				return objNewAuthority;
			}

			//Read authority template
			m_fnReadAllAuthority = function(){}

			//Save authoority template
			authorityMgr.fnSaveAuthority = function(){}

			//Delete authority template
			authorityMgr.fnDeleteAuthority = function(){}

			//Get all authority feature
			authorityMgr.fnGetAuthorityList = function( szViewMode )
			{
				var objAuthorityItem = {
					PAGE : featureMgr.fnGetAllPage(szViewMode),
					CNCFEATURE : featureMgr.fnGetAllFeature(szViewMode),
				};

				return objAuthorityItem;
			}

		return authorityMgr;
	}
});
