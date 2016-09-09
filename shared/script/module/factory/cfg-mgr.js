define([
	'angularAMD'
],function( angularAMD ){
	function cfgMgr(){
		// root data
		var cfgMgr = [];
		cfgMgr.view = [];

		// cnc status color
		cfgMgr.view.statusStyle = {
			START   : {name:'加工', color: '#B4FF93'},
			READY   : {name:'就緒', color: '#FFEB9E'},
			ALARM   : {name:'警報', color: '#FFAEAD'},
			OFFLINE : {name:'斷線Cnc', color: '#d8d8d6'},
			AGENTOFF: {name:'斷線Agent', color: '#E4D0B0'},
			ELSE    : {name:'其他', color: "#FDE48D"},
		}

		//displayMode Colum color
		cfgMgr.view.formStyle = {
			ODD   : {color: '#EBEBEB'},
			EVEN   : {color: '#F7F7F7'},
		}

		// TODO: this function amy be moved to language module (langMgr)
		cfgMgr.view.statusName = {
			START : { en:"START", cht:"加工", cn:"..." },
			READY : { en:"READY", cht:"就緒", cn:"..." },
			NOTREADY : { en:"NOTREADY", cht:"未就緒", cn:"..." },
			FEEDHOLD : { en:"FEEDHOLD", cht:"暫停", cn:"..." },
			ALARM : { en:"ALARM", cht:"警報", cn:"..." },
			OFFLINE : { en:"OFFLINE", cht:"斷線Cnc", cn:"..." },
			AGENTOFF : { en:"AGENTOFF", cht:"斷線Agent", cn:"..." },
			OTHER : { en:"***", cht:"***", cn:"***" },
		}

		cfgMgr.view.fnStatusColor = function( cncStatus )
		{
			if( typeof cncStatus == "undefined" || cncStatus == "" ){
				return "#fff";
			}

			for( var status in cfgMgr.view.statusStyle ){
				if( status === cncStatus ){
					return cfgMgr.view.statusStyle[status].color;
				}
			}

			return cfgMgr.view.statusStyle['READY'].color;
		}

		//
		// Web config
		//
		return cfgMgr;
	}

	return cfgMgr;
});
