define([
	'angularAMD'
],function( angularAMD ){
	return function commandMgr( frontendAdaptor ){
			
		var aryCommandMgr = [];

		aryCommandMgr.m_ObjCmdList = {
			CMD             : "Command",
			CMD_RESULT      : "GetCommandResult",
			GET_DIAG_DATA   : "GetDiagnosisData",
			GET_NCFILE_LIST : "GetNcFileList",
			UPLOAD_FILE     : "UploadFile",
			DOWNLOAD_NCFILE : "DownloadNCFile",
			DOWNLOAD_LADDER : "DownloadLadFile",
			GET_OFFSET_DATA : "GetOffsetData",
			SET_OFFSET_DATA : "WriteOffsetData",
			GET_DEBUG_LOG   : "GetDebugLog",
		};
		aryCommandMgr.m_szUniID;

		aryCommandMgr.fnGetCommand = function( szCmdHint ){
			switch( szCmdHint ){
				//debugmode
					case "DEBUGON":
						return "DEBUG_ON";
					break;
					case "DEBUGOFF":
						return "DEBUG_OFF";
					break;
					case "DEBUGUPLOAD":
						return "DEBUG_UPLOAD";
					break;
				//diagnosis
					case "R_Bit":
						return "Read_R";
					break;
					case "I_Bit":
						return "Read_I";
					break;
					case "O_Bit":
						return "Read_O";
					break;
					case "C_Bit":
						return "Read_C";
					break;
					case "S_Bit":
						return "Read_S";
					break;
					case "A_Bit":
						return "Read_A";
					break;
					case "Debug_Var":
						return "Read_D";
					break;
					case "Param":
						return "Read_P";
					break;
				//fileTransfer
					case "NcFile":
						return "Show_nc_dir";
					break;
					case "UploadNcFile":
						return "Upload_nc_file";
					break;
					case "DownloadNcFile":
						return "Download_nc_file";
					break;
					case "DownloadLadFile":
						return "Download_ladder";
					break;
					case "Param":
						return;
					break;
					case "Macro":
						return;
					break;
				//offset
					case "ShowOffset":
						return "Read_tooloffset";
					break;
					case "WriteOffset":
						return "Write_tooloffset";
					break;
			}
		}

		aryCommandMgr.fnSendCommand = function( szCmdMethod, objInput, fnResponse, isDebugMode, isWaitCmdResult ){
			this.fnGetResult = function(response){
				if( isWaitCmdResult == true ){
					//wait for command result
					//need command uni code
					aryCommandMgr.m_szUniID = response.data.uniID;
					aryCommandMgr.fnKeepListenCmdResult( fnResponse, isDebugMode);
				}else{
					//do not need command result
					fnResponse(response);
				}
			}

			//combine method
			if( typeof aryCommandMgr.m_ObjCmdList[szCmdMethod] == "undefined" ){
				return;
			}
			var szMethod = aryCommandMgr.m_ObjCmdList[szCmdMethod];

			//send command
			frontendAdaptor.fnGetResponse( 'COMMAND', szMethod, objInput, this.fnGetResult, isDebugMode );
		}

		aryCommandMgr.fnKeepListenCmdResult = function( fnResponse, isDebugMode ){
			//every 1000ms to get result once
			m_fnListenCommandResult(function(response){
				if( response.result === 0 ){
					//send response back
					fnResponse(response);
				}
			}, isDebugMode );
		}

		m_fnListenCommandResult = function( fnRespose, isDebugMode ){

			this.fnGetResult = function(response){
				if( response.result === 0 ){
					fnRespose(response);	
					return;
				}
				
				//get no data, and get again
				m_fnListenCommandResult( fnRespose, isDebugMode );
			}

			//create method
			var szMethod = aryCommandMgr.m_ObjCmdList["CMD_RESULT"];

			//send command
			frontendAdaptor.fnGetResponse( 'COMMAND', szMethod, {"uniID":aryCommandMgr.m_szUniID}, this.fnGetResult, isDebugMode );
		}

		return aryCommandMgr;
	}
});
