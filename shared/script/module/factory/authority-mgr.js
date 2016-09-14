define([
	'angularAMD'
],function( angularAMD ){
	return function authorityMgr(featureMgr,frontendAdaptor){
		var authorityMgr = [];

		var m_aryAuthorityList = [
			{AUTHORITY_TEMPLATE_ID:0, TEMPLATE_NAME:"預設權限", AUTHORITY:{
				WEB:{
					PAGE:["CNC","SHIFTSETTING","LAYOUTSETTING","LOGOSETTING","IPCAMREGISTER","IPCAMSTEAM"],
					CNCFEATURE:{
						OOE:["OOE_DAY","OOE_MONTH","OOE_YEAR","OOE_AVG"],
						RECORD:["RECORD_CURRENT","RECORD_HISTORY"],
						ALARM:["ALM_CURRENT","ALM_HISTORY","ALM_ANALY"],
					},
				},
				DISPLAYBOARD:{
					PAGE:["DISPLAY","SLIDERSETTING","LAYOUTSETTING","LOGOSETTING"],
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
				WEB:{
					PAGE:["CNC","IPCAMSTEAM","LOGOSETTING"],
					CNCFEATURE:{
						OOE:["OOE_DAY"],
						ALARM:["ALM_CURRENT"],
					},
				},
				DISPLAYBOARD:{
					PAGE:["DISPLAY","SLIDERSETTING"],
				},
			}},
		];

		var m_objMyAuthority = {};

		authorityMgr.fnInitAuthority = function( szMode )
		{
			//mode : "EDIT", "USE"
			if( szMode == "EDIT" ){
				return m_fnReadAllAuthority();
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
			m_fnReadAllAuthority = function()
			{
				//TODO: init db authority
				return m_aryAuthorityList;
			}

			//Save authoority template
			authorityMgr.fnSaveAuthority = function( objAuthorityBox )
			{
				//TODO:save into db
				var isFindAuthority = false;
				for( var i=0; i<m_aryAuthorityList.length; i++ ){
					if( m_aryAuthorityList[i]['AUTHORITY_TEMPLATE_ID'] == objAuthorityBox['AUTHORITY_TEMPLATE_ID'] ){
						m_aryAuthorityList[i]['TEMPLATE_NAME'] = objAuthorityBox['TEMPLATE_NAME'];
						m_aryAuthorityList[i]['AUTHORITY'] = objAuthorityBox['AUTHORITY'];
						isFindAuthority = true;
						break;
					}
				}

				if( isFindAuthority == true ){
					return;
				}

				m_aryAuthorityList.push(objAuthorityBox);
			}

			//Delete authority template
			authorityMgr.fnDeleteAuthority = function( objAuthorityBox )
			{
				var isFindAuthority = false;
				for( var i=0; i<m_aryAuthorityList.length; i++ ){
					if( m_aryAuthorityList[i]['AUTHORITY_TEMPLATE_ID'] == objAuthorityBox['AUTHORITY_TEMPLATE_ID'] ){
						m_aryAuthorityList[i]['TEMPLATE_NAME'] = objAuthorityBox['TEMPLATE_NAME'];
						m_aryAuthorityList[i]['AUTHORITY'] = objAuthorityBox['AUTHORITY'];
						isFindAuthority = true;
						break;
					}
				}
			}

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
