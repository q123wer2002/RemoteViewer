define([
	'angularAMD'
],function( angularAMD ){
	return function versionMgr(utilMgr,featureMgr){
		
		var versionMgr = [];

		var m_objAgentVersionFeature = {
			//no record before 1.0.2
			"1.0.2" : {
				OOE : ["DAY","MONTH","YEAR","AVG"],
				RECORD : ["CURRENTRECORD", "HISTORYRECORD"],
				ALARM : ["CURRENTALM","HISTORYALM","ANALYALARM"],
				DIAGNOSIS : ["R","I","O","C","S","A","DEBUG"],
				FILE : ["NCFILE"],
			},
			"1.0.3" : {
				DIAGNOSIS : ["PARAM"],
				FILE : ["LADDER"],
				OFFSET : []
			},
			//add new version table
		};

		versionMgr.fnIsAgentSupport = function( szViewMode, szAgentVersion, szFeatureClass, szFeature ){
			//check agent version first
			var isFindVersion = false;
			for( var szVersion in m_objAgentVersionFeature ){
				if( szVersion == szAgentVersion ){
					isFindVersion = true;
					break;
				}
			}

			//not find angent version
			if( isFindVersion == false ){
				console.error("no this agent version");
				return false;
			}

			//get this device all feature
			var szFeatureKey = featureMgr.fnGetFeatureKey(szViewMode,szFeatureClass,szFeature);

			//get support agent version
			var szSupportVersion = m_fnGetSupportAgentVersion(szFeatureClass,szFeatureKey);
			
			//not find
			if( szSupportVersion == "-1" ){
				return false;
			}

			//compare version
			//same, retur true
			if( m_fnIsNeedUpdataAgnet( szAgentVersion, szSupportVersion ) == false ){
				return true;
			}

			//not same, return support agent version
			return szSupportVersion;
		}
		
		m_fnGetSupportAgentVersion = function(szFeatureClass,szFeatureKey){
			var szSupportVersion = "-1"; //default

			//from 1.0.2 ~ to find this feature
			for( var szVersion in m_objAgentVersionFeature ){
				//check is exist this class
				if( typeof m_objAgentVersionFeature[szVersion][szFeatureClass] == "undefined" ){
					continue;
				}

				//if no sub feature, return this version
				if( (m_objAgentVersionFeature[szVersion][szFeatureClass].length == 0) && (szFeatureClass == szFeatureKey) ){
					szSupportVersion = szVersion;
				}

				//check is support this feature
				for( var i=0; i<m_objAgentVersionFeature[szVersion][szFeatureClass].length; i++ ){
					if( m_objAgentVersionFeature[szVersion][szFeatureClass][i] == szFeatureKey ){
						szSupportVersion = szVersion;
					}
				}
			}

			//return support version
			return szSupportVersion;
		}

		m_fnIsNeedUpdataAgnet = function( szCurrentVersion, szSupportVerison )
		{
			var aryCurtVersion = szCurrentVersion.split(".");
			var arySupVersion = szSupportVerison.split(".");

			//version length not same, means need to check
			if( aryCurtVersion.length != arySupVersion.length ){
				return true;
			}

			for( var i=0; i<aryCurtVersion.length; i++ ){
				//check each version number
				if( arySupVersion[i] > aryCurtVersion[i] ){
					//means support version is latest, need to update
					return true;
				}
			}

			//means do not update
			return false;
		}

		return versionMgr;
	}
});
