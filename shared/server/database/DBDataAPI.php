<?php

// Notice: Donot print debug message in this file !! (this will cause json format fail)
function GetDBData( $szDBAPIName, $nCategoryID, $aryParam , &$aryResultAry )
{
	require "DBSchema.php";
	$ErrorCode = array(
		//minus means error
		//zero means normal finish
		//positive means pass
		"Empty"			=>	-4,
		"ZeroData"		=>	-3,
		"NoData"		=>	-2,
		"ServerBusy"	=>	-1,
		"Success"		=>	0,
		"NeedDoSome"	=>	1,
	);

	//init
	$errorCode = $ErrorCode['Success'];
	$aryResultAry = '';

	switch( $szDBAPIName )
	{
	//sys_related
		case "myFIDnGID":
			$companyID = $nCategoryID;

			$sqlTmp = "SELECT {$FACTORY['NAME']} as fName, {$FACTORY['ID']} as fid, {$GROUP['NAME']} as gName, {$GROUP['ID']} as gid FROM {$FACTORY['TABLE']} LEFT JOIN {$GROUP['TABLE']} ON {$FACTORY['ID']}={$GROUP['FACTORYID']} WHERE {$FACTORY['COMPANYID']}={$companyID} GROUP BY {$GROUP['ID']};";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}/*else{
				$aryResultAry = $aryResultAry[0];
			}*/
		break;
		case "DownloadAgentFile":
			$sqlTmp = "SELECT {$AGENTVERSION['AGENTFILE']} as file, {$AGENTVERSION['DESCRIPTION']} as description FROM {$AGENTVERSION['TABLE']} WHERE {$AGENTVERSION['AGENTVERSION']}='{$aryParam['param1']}' AND {$AGENTVERSION['APIVERSION']}='{$aryParam['param2']}';";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0];
			}
		break;
	//sys_command
		case "DeleteAllOldCmdByWid":
			if( empty($_SESSION['companyInfo']['oldWid']) == true ){
				break;
			}

			foreach( $_SESSION['companyInfo']['oldWid'] as $key => $value ){
				$result = array();
				GetDBData( "DeleteOldCmdByWid", 0, array("oldUniID"=>$value), $result );
				GetDBData( "DeleteOldCNCVerByWid", 0, array("oldUniID"=>$value), $result );
			}
		break;
		case "DeleteOldCmdByWid":
			//$nCNCID = $nCategoryID;

			$sqlTmp = "DELETE FROM {$CNCCOMMAND['TABLE']} WHERE {$CNCCOMMAND['WID']}='{$aryParam['oldUniID']}'";
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
			$aryResultAry = $sqlTmp;
		break;
		case "DeleteOldCNCVerByWid":
			$sqlTmp = "DELETE FROM {$CNCVARIABLE['TABLE']} WHERE {$CNCVARIABLE['WID']}='{$aryParam['oldUniID']}'";
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
			$aryResultAry = $sqlTmp;
		break;
		case "Command":
			$nCNCID = $nCategoryID;

			$sqlTmp = "INSERT INTO {$CNCCOMMAND['TABLE']} ( {$CNCCOMMAND['WID']}, {$CNCCOMMAND['CNCID']}, {$CNCCOMMAND['COMMAND']}, {$CNCCOMMAND['PARAMETER1']}, {$CNCCOMMAND['PARAMETER2']}, {$CNCCOMMAND['WEBTIME']} ) VALUES ( '{$aryParam['uniID']}', '{$nCNCID}', '{$aryParam['command']}', '{$aryParam['cmdParam'][0]}', '{$aryParam['cmdParam'][1]}', '{$aryParam['webTime']}' )";
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
			//$aryResultAry = $sqlTmp;
		break;
		case "GetCommandResult":
			$sqlTmp = "SELECT {$CNCCOMMANDRESULT['PARAMETER1']} as param1, {$CNCCOMMANDRESULT['PARAMETER2']} as param2, {$CNCCOMMANDRESULT['AGENTTIME']} as agent_time FROM {$CNCCOMMANDRESULT['TABLE']} WHERE {$CNCCOMMANDRESULT['WID']}='{$aryParam['uniID']}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0];
			}
		break;
		case "GetCNCVar":
			$nCNCID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCVARIABLE['NO']} as no, {$CNCVARIABLE['VALUE']} as value, {$CNCVARIABLE['AGENTTIME']} as agent_time FROM {$CNCVARIABLE['TABLE']} WHERE {$CNCVARIABLE['CNCID']}='{$nCNCID}' AND {$CNCVARIABLE['WID']}='{$aryParam['uniID']}' AND {$CNCVARIABLE['TYPE']}='{$aryParam['type']}' AND ({$CNCVARIABLE['NO']} >= {$aryParam['start']}) AND ({$CNCVARIABLE['NO']} <= {$aryParam['end']})";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;
		case "GetCNCNcFileList":
			$nCNCID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCNCDIR['NCNAMELIST']} as name, {$CNCNCDIR['NCSIZELIST']} as size, {$CNCNCDIR['NCDATELIST']} as date FROM {$CNCNCDIR['TABLE']} WHERE {$CNCNCDIR['CNCID']}='{$nCNCID}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0];
			}
		break;
		case "UploadNcFile":
			$nCNCID = $nCategoryID;
			$sqlTmp = "INSERT INTO {$CNCNCFILES['TABLE']} ( {$CNCNCFILES['CNCID']}, {$CNCNCFILES['NAME']}, {$CNCNCFILES['FILE']}, {$CNCNCFILES['FILEUPLOADTIME']} ) VALUES ( '{$nCNCID}', '{$aryParam['name']}', '{$aryParam['file']}', '{$aryParam['upload_time']}') ON DUPLICATE KEY UPDATE {$CNCNCFILES['FILE']}='{$aryParam['file']}', {$CNCNCFILES['FILEUPLOADTIME']}='{$aryParam['upload_time']}'";
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
		break;
		case "DownloadNcFile":
			$nCNCID = $aryParam['param1'];
			$sqlTmp = "SELECT {$CNCNCFILES['NAME']} as name, {$CNCNCFILES['FILE']} as file, {$CNCNCFILES['FILEUPLOADTIME']} as upload_time FROM {$CNCNCFILES['TABLE']} WHERE {$CNCNCFILES['CNCID']}='{$nCNCID}' AND {$CNCNCFILES['NAME']}='{$aryParam['param2']}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0];
			}
		break;
		case "DownloadLadFile":
			$nCNCID = $aryParam['param1'];
			$sqlTmp = "SELECT {$CNCLADFILES['NAME']} as name, {$CNCLADFILES['FILE']} as file, {$CNCLADFILES['FILEUPLOADTIME']} as upload_time FROM {$CNCLADFILES['TABLE']} WHERE {$CNCLADFILES['CNCID']}='{$nCNCID}' AND {$CNCLADFILES['NAME']}='{$aryParam['param2']}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0];
			}
		break;
		case "GetOffsetData":
			$nCNCID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCOFFSET['NO']} as no, {$CNCOFFSET['VALUE']} as value FROM {$CNCOFFSET['TABLE']} WHERE {$CNCOFFSET['CNCID']}={$nCNCID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;
		case "WriteOffsetData":
			$nCNCID = $nCategoryID;

			$sqlTmp = "UPDATE {$CNCOFFSET['TABLE']} SET {$CNCOFFSET['VALUE']}='{$aryParam['value']}', {$CNCOFFSET['UPDATETIME']}='{$aryParam['update_time']}' WHERE {$CNCOFFSET['CNCID']}='{$nCNCID}' AND {$CNCOFFSET['NO']}='{$aryParam['no']}'";
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
		break;
		case "GetDebugLog":
			$nCNCID = $nCategoryID;

			$sqlTmp = "SELECT {$AGENTDEBUGINFO['LOG']} as log FROM {$AGENTDEBUGINFO['TABLE']} WHERE {$AGENTDEBUGINFO['CNCID']}={$nCNCID} AND {$AGENTDEBUGINFO['TIMESTAMP']}='{$aryParam['szTime']}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['log'];
			}
		break;
	//company
		case "initAuthority":
			$sqlTmp = "SELECT {$COMPANY['IMG']} as img, {$COMPANY['SMALLLOGO']} as small_logo FROM {$COMPANY['TABLE']} WHERE {$COMPANY['NAME']}='{$aryParam['comapny_name']}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0];
			}
		break;
		case "GetAllFactoryInfo":
			$nCID = $nCategoryID;
			$sqlTmp = "SELECT {$FACTORY['ALL']} FROM {$FACTORY['TABLE']} WHERE {$FACTORY['COMPANYID']}='{$nCID}';";
			
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;
		case "UploadCompanyLogo":
			$nCID = $nCategoryID;
			$sqlTmp = "UPDATE {$COMPANY['TABLE']} SET {$COMPANY['SMALLLOGO']}='{$aryParam['logoImage']}' WHERE {$COMPANY['ID']}='{$nCID}'";
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
		break;
		case "GetCompanyLogo":
			$nCID = $nCategoryID;
			$sqlTmp = "SELECT {$COMPANY['SMALLLOGO']} as small_logo FROM {$COMPANY['TABLE']} WHERE {$COMPANY['ID']}={$nCID};";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['small_logo'];
			}
		break;
	//company_user & authority
	//factory
		case "fID":
			$nFID = $nCategoryID;
			$aryResultAry = $nFID;
		break;

		case "fName":
			$nFID = $nCategoryID;

			$sqlTmp = "SELECT {$FACTORY['NAME']} as name FROM {$FACTORY['TABLE']} WHERE {$FACTORY['ID']}={$nFID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['name'];
			}
		break;

		case "fTotalCNC":
			$nFID = $nCategoryID;

			$sqlTmp = "SELECT COUNT({$CNCSTATUS['CNCID']}) as fTotalCNC FROM {$CNC['TABLE']} LEFT JOIN {$CNCSTATUS['TABLE']} ON {$CNCSTATUS['CNCID']}={$CNC['ID']} WHERE {$CNC['GROUPID']} IN (SELECT {$GROUP['ID']} FROM {$GROUP['TABLE']} WHERE {$GROUP['FACTORYID']}={$nFID}) AND {$CNCSTATUS['CNCID']} != 'null'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['fTotalCNC'];
			}
		break;

		case "fOOE":
			$nFID = $nCategoryID;

			//Cuz excepted worktime is not exist here
			/*$aryTmparyResult = array();
			$nTmpErrorCode = GetDBData( "factoryExceptRecordTime", $nFID, array(), $aryTmparyResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $nTmpErrorCode;
				unset( $aryTmparyResult );
				unset( $nTmpErrorCode );
				break;
			}
			$F_exceptRecord = $aryTmparyResult;*/
			$F_exceptRecord = 86400;

			//get all cnc in this factory, to count all record time
			$aryTmparyResult = array();
			$nTmpErrorCode = GetDBData( "CncListFromF", $nFID, array(), $aryTmparyResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $nTmpErrorCode;
				unset( $aryTmparyResult );
				unset( $nTmpErrorCode );
				break;
			}
			$cncList = $aryTmparyResult;

			$summaryRecord = 0;
			foreach( $cncList as $cncKey => $cncValue ){
				
				$aryTmparyResult = array();
				$nTmpErrorCode = GetDBData( "cncLastWorkTime", $cncValue['cnc_id'], array(), $aryTmparyResult );
				if( $nTmpErrorCode !== $ErrorCode['Success'] ){
					//means user doesn't set this
					$errorCode = $nTmpErrorCode;
					unset( $aryTmparyResult );
					unset( $nTmpErrorCode );
					break;
				}
   
				$cncPreWorkTime = $aryTmparyResult;
				$summaryRecord = $cncPreWorkTime + $summaryRecord;
			}

			if( $errorCode === 0 ){
				$avgPreWorkTime = $summaryRecord / sizeof($cncList);
				$aryResultAry = ($avgPreWorkTime/$F_exceptRecord)*100;
			}
			
			unset( $F_exceptRecord );
			unset( $cncList );
			unset( $summaryRecord );
		break;

		case "fStatusOfCnc":
			$nFID = $nCategoryID;

			//check offline cnc first
			$aryTmparyResult = array();
			$nTmpErrorCode = GetDBData( "fAEGNTOFFOfCnc", $nFID, array(), $aryTmparyResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;

				unset( $aryTmparyResult );
				unset( $nTmpErrorCode );
				break;
			}

			//sql to get cnc status
			$sqlTmp = "SELECT {$CNCSTATUS['ALL']} FROM {$CNC['TABLE']} LEFT JOIN {$CNCSTATUS['TABLE']} ON {$CNCSTATUS['CNCID']}={$CNC['ID']} WHERE {$CNC['GROUPID']} IN (SELECT {$GROUP['ID']} FROM {$GROUP['TABLE']} WHERE {$GROUP['FACTORYID']}={$nFID}) AND {$CNCSTATUS['CNCID']} != 'null';";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;

		case "fAEGNTOFFOfCnc":
			$nFID = $nCategoryID;

			//sql to get time diff over 5 minutes
			$sqlTmp = "SELECT {$CNCSTATUS['ALL']} FROM cnc LEFT JOIN {$CNCSTATUS['TABLE']} ON {$CNCSTATUS['CNCID']}={$CNC['ID']} LEFT JOIN {$CNCTIME['TABLE']} ON {$CNCTIME['CNCID']}={$CNC['ID']} WHERE {$CNC['GROUPID']} IN (SELECT {$GROUP['ID']} FROM {$GROUP['TABLE']} WHERE {$GROUP['FACTORYID']}={$nFID}) AND timestampdiff( minute, {$CNCTIME['AGENTTIME']}, now() ) > 5 AND {$CNCSTATUS['STATUS']} != 'AGENTOFF';";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == true ){
				foreach ($aryResultAry as $key => $value) {
					//update status into offline
					$sql_updateToOffline = "UPDATE {$CNCSTATUS['TABLE']} SET {$CNCSTATUS['STATUS']} = 'AGENTOFF'  WHERE {$CNCSTATUS['CNCID']}={$value['cnc_id']}";
					DoNonQueryComd( $sql_updateToOffline );
				}
			}
		break;

		case "CncListFromF":
			$nFID = $nCategoryID;

			//sql to get cnc list from {$FACTORY['TABLE']}
			$sqlTmp = "SELECT {$CNC['ID']}, {$CNC['NAME']}  FROM {$GROUP['TABLE']} LEFT JOIN {$CNC['TABLE']} ON {$CNC['GROUPID']}={$GROUP['ID']} WHERE {$GROUP['FACTORYID']}={$nFID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;

		case "factoryExceptRecordTime":
			$nFID = $nCategoryID;

			$sqlTmp = "SELECT {$FACTORY['EXPEXTWORKTIME']} as expected_work_time FROM {$FACTORY['TABLE']} WHERE {$FACTORY['ID']}={$nFID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}elseif( $aryResultAry[0]['expected_work_time'] <= 0){
				$aryResultAry = 0;
				$errorCode = $szDBAPIName.$ErrorCode['Empty'];
			}else{
				$aryResultAry = $aryResultAry[0]['expected_work_time'];
			}
		break;
	//factory shift schedule
		case "SaveShiftSchedule":
			$nFID = $nCategoryID;
			$sqlTmp = "INSERT INTO {$FACTORYSHIFTSCHEDULE['TABLE']} ( {$FACTORYSHIFTSCHEDULE['FACTORYID']}, {$FACTORYSHIFTSCHEDULE['SCHEDULETIME']}, {$FACTORYSHIFTSCHEDULE['SHIFTSCHEDULE']}, {$FACTORYSHIFTSCHEDULE['UPDATETIME']}) VALUES ( '{$nFID}', '{$aryParam['scheduleTime']}', '{$aryParam['shiftSchedule']}', CURRENT_TIMESTAMP ) ON DUPLICATE KEY UPDATE {$FACTORYSHIFTSCHEDULE['SCHEDULETIME']}='{$aryParam['scheduleTime']}', {$FACTORYSHIFTSCHEDULE['SHIFTSCHEDULE']}='{$aryParam['shiftSchedule']}', {$FACTORYSHIFTSCHEDULE['UPDATETIME']}=CURRENT_TIMESTAMP";
			$aryResultAry = $sqlTmp;
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
		break;
		case "GetShiftSchedule":
			$nFID = $nCategoryID;
			$sqlTmp = "SELECT {$FACTORYSHIFTSCHEDULE['SCHEDULETIME']} as shiftTime, {$FACTORYSHIFTSCHEDULE['SHIFTSCHEDULE']} as shiftS FROM {$FACTORYSHIFTSCHEDULE['TABLE']} WHERE {$FACTORYSHIFTSCHEDULE['FACTORYID']}='{$nFID}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['ServerBusy'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0];
			}
		break;
	//IPCam
		case "GetAllGroup":
			$nFID = $nCategoryID;
			$sqlTmp = "SELECT {$GROUP['ALL']} FROM {$GROUP['TABLE']} WHERE {$GROUP['FACTORYID']}={$nFID};";
			
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;
		case "IPCamUpload":
			$nGID = $nCategoryID;
			$sqlTmp = "INSERT INTO {$IPCAM['TABLE']} ( {$IPCAM['IPCAMNAME']}, {$IPCAM['GROUPID']}, {$IPCAM['IPCAMRTSP']} ) VALUES ('{$aryParam['ipcam_name']}', '{$nGID}', '{$aryParam['ipcam_rtsp_url']}')";
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
			$aryResultAry = mysql_insert_id();
		break;
		case "GetAllIpcam":
			$nGID = $nCategoryID;
			$sqlTmp = "SELECT {$IPCAM['ALL']} FROM {$IPCAM['TABLE']} WHERE {$IPCAM['GROUPID']}={$nGID};";
			
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;
		case "IPCamUpdate":
			$nIPCamID = $nCategoryID;
			$sqlTmp = "UPDATE {$IPCAM['TABLE']} SET {$IPCAM['IPCAMNAME']} = '{$aryParam['ipcam_name']}', {$IPCAM['IPCAMRTSP']} = '{$aryParam['ipcam_rtsp_url']}' WHERE {$IPCAM['IPCAMID']}={$nIPCamID};";
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
		break;
		case "IPCamDelete":
			$nIPCamID = $nCategoryID;
			$sqlTmp = "DELETE FROM {$IPCAM['TABLE']} WHERE {$IPCAM['IPCAMID']}={$nIPCamID};";
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
		break;
	//group
		case "Group_fID":
			$nGID = $nCategoryID;

			$sqlTmp = "SELECT {$GROUP['FACTORYID']} as fID FROM {$GROUP['TABLE']} WHERE {$GROUP['ID']}={$nGID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['ServerBusy'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['fID'];
			}
		break;

		case "FnG_info":
			$nGID = $nCategoryID;

			$sqlTmp = "SELECT {$FACTORY['ID']} as fID, {$FACTORY['NAME']} as fName, {$GROUP['NAME']} as gName, {$CNC['ID']} as cncList FROM {$GROUP['TABLE']} LEFT JOIN {$FACTORY['TABLE']} ON {$GROUP['FACTORYID']}={$FACTORY['ID']} LEFT JOIN {$CNC['TABLE']} ON {$CNC['GROUPID']}={$GROUP['ID']} WHERE {$GROUP['ID']}={$nGID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['ServerBusy'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;

		case "gID":
			$nGID = $nCategoryID;
			$aryResultAry = $nGID;
		break;

		case "gName":
			$nGID = $nCategoryID;

			$sqlTmp = "SELECT {$GROUP['NAME']} as gName FROM {$GROUP['TABLE']} WHERE {$GROUP['ID']}={$nGID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['ServerBusy'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['gName'];
			}
		break;

		case "gTotalCNC":
			$nGID = $nCategoryID;
			
			$sqlTmp = "SELECT COUNT({$CNC['ID']}) as gTotalCNC FROM {$CNC['TABLE']} LEFT JOIN {$GROUP['TABLE']} ON {$CNC['GROUPID']} = {$GROUP['ID']} LEFT JOIN {$CNCSTATUS['TABLE']} ON {$CNC['ID']} = {$CNCSTATUS['CNCID']} WHERE {$GROUP['ID']}={$nGID} AND {$CNCSTATUS['CNCID']} != 'null' ;";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['gTotalCNC'];
			}
		break;

		case "gOOE":
			$nGID = $nCategoryID;

			//excepted time is not exist here
			/*$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "GroupExceptRecordTime", $nGID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $nTmpErrorCode;
				unset( $aryTmpResult );
				unset( $nTmpErrorCode );
				break;
			}
			$exceptRecord = $aryTmpResult;*/
			$exceptRecord = 86400;

			//get all cnc in this factory, to count all record time
			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "CncListFromG", $nGID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $nTmpErrorCode;
				unset( $aryTmpResult );
				unset( $nTmpErrorCode );
				break;
			}
			$cncList = $aryTmpResult;

			$summaryRecord = 0;
			foreach( $cncList as $cncKey => $cncValue ){
				
				$aryTmpResult = array();
				$nTmpErrorCode = GetDBData( "cncLastWorkTime", $cncValue['cnc_id'], array(), $aryTmpResult );
				if( $nTmpErrorCode !== $ErrorCode['Success'] ){
					//means user doesn't set this
					$errorCode = $nTmpErrorCode;
					unset( $aryTmpResult );
					unset( $nTmpErrorCode );
					break;
				}

				$cncPreWorkTime = $aryTmpResult;
				$summaryRecord = $cncPreWorkTime + $summaryRecord;
			}

			if( $errorCode === 0 ){
				$avgPreWorkTime = $summaryRecord / sizeof($cncList);
				$aryResultAry = ($avgPreWorkTime/$exceptRecord)*100;
			}
			
			unset( $exceptRecord );
			unset( $cncList );
			unset( $summaryRecord );
		break;

		case "gIPCAM":
			$nGID = $nCategoryID;							
			$aryResultAry = false;
		break;

		case "gStatusOfCnc":
			$nGID = $nCategoryID;

			//check offline cnc first
			$aryTmparyResult = array();
			$nTmpErrorCode = GetDBData( "gAGENTOFFOfCnc", $nGID, array(), $aryTmparyResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;

				unset( $aryTmparyResult );
				unset( $nTmpErrorCode );
				break;
			}

			//sql to get cnc status
			$sqlTmp = "SELECT {$CNCSTATUS['ALL']}, {$CNC['NAME']} as cncName FROM {$CNC['TABLE']} LEFT JOIN {$CNCSTATUS['TABLE']} ON {$CNCSTATUS['CNCID']}={$CNC['ID']} WHERE {$CNC['GROUPID']} = {$nGID} AND {$CNCSTATUS['CNCID']} != 'null';";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;
		
		case "gAGENTOFFOfCnc":
			$nGID = $nCategoryID;

			//sql to get time diff over 5 minutes
			$sqlTmp = "SELECT {$CNCSTATUS['ALL']} FROM {$CNC['TABLE']} LEFT JOIN {$CNCSTATUS['TABLE']} ON {$CNCSTATUS['CNCID']}={$CNC['ID']} LEFT JOIN {$CNCTIME['TABLE']} ON {$CNCTIME['CNCID']}={$CNC['ID']} WHERE {$CNC['GROUPID']}={$nGID} AND timestampdiff( minute, {$CNCTIME['AGENTTIME']}, now() ) > 5 AND {$CNCSTATUS['STATUS']} != 'AGENTOFF';";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == true ){
				foreach ($aryResultAry as $key => $value) {
					//update status into offline
					$sql_updateToOffline = "UPDATE {$CNCSTATUS['TABLE']} SET {$CNCSTATUS['STATUS']} = 'OFFLINE'  WHERE {$CNCSTATUS['CNCID']}={$value['cnc_id']}";
					DoNonQueryComd( $sql_updateToOffline );
				}
			}
		break;

		case "GroupExceptRecordTime":
			$nGID = $nCategoryID;

			$sqlTmp = "SELECT {$FACTORY['EXPEXTWORKTIME']} as expected_work_time FROM {$GROUP['TABLE']} LEFT JOIN {$FACTORY['TABLE']} ON {$GROUP['FACTORYID']}={$FACTORY['ID']} WHERE {$GROUP['ID']}={$nGID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['expected_work_time'];
			}
		break;

		case "CncListFromG":
			$nGID = $nCategoryID;

			//sql to get cnc list from {$FACTORY['TABLE']}
			$sqlTmp = "SELECT {$CNC['ID']} as cnc_id FROM {$GROUP['TABLE']} LEFT JOIN {$CNC['TABLE']} ON {$CNC['GROUPID']}={$GROUP['ID']} WHERE {$GROUP['ID']}={$nGID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;
	//cnc routine
		//cnc table
		case "cncID":
			$nCncID = $nCategoryID;
			$aryResultAry = $nCncID;
		break;

		case "cncIP":
			$nCncID = $nCategoryID;
			$sqlTmp = "SELECT {$CNC['IP']} as IP FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['IP'];
			}
		break;

		case "cncMachine":
			$nCncID = $nCategoryID;
			$sqlTmp = "SELECT {$CNC['MACHINE']} as Machine FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['Machine'];
			}
		break;

		case "cncMachineType":
			$nCncID = $nCategoryID;
			$sqlTmp = "SELECT {$CNC['MACHINETYPE']} as MachineType FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['MachineType'];
			}
		break;

		case "cncVersion":
			$nCncID = $nCategoryID;
			$sqlTmp = "SELECT {$CNC['VERSION']} as Version FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['Version'];
			}
		break;

		case "cncSerialNo":
			$nCncID = $nCategoryID;
			$sqlTmp = "SELECT {$CNC['SERIALNO']} as SerialNo FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['SerialNo'];
			}
		break;

		case "cncGetGroupID":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNC['GROUPID']} as nGID FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['nGID'];
			}
		break;

		case "cncGetGroupName":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$GROUP['NAME']} as szGName FROM {$CNC['TABLE']} LEFT JOIN {$GROUP['TABLE']} ON {$GROUP['ID']}={$CNC['GROUPID']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['szGName'];
			}
		break;

		case "cncGetFactoryID":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$GROUP['FACTORYID']} as nFID FROM {$CNC['TABLE']} LEFT JOIN {$GROUP['TABLE']} ON {$GROUP['ID']}={$CNC['GROUPID']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['nFID'];
			}
		break;

		case "cncGetFactoryName":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$FACTORY['NAME']} as szFName FROM {$GROUP['TABLE']} LEFT JOIN {$FACTORY['TABLE']} ON {$FACTORY['ID']}={$GROUP['FACTORYID']} WHERE {$GROUP['ID']} = (SELECT {$CNC['GROUPID']} FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}) ";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['szFName'];
			}
		break;

		case "cncName":
			$nCncID = $nCategoryID;			
			$sqlTmp = "SELECT {$CNC['NAME']} FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['name'];
			}
		break;

		case "cncPic":
			$nCncID = $nCategoryID;		
			$sqlTmp = "SELECT {$CNC['IMG']} as img FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = base64_encode( $aryResultAry[0]['img'] );
			}
		break;
		//end cnc table
		//cnc status table
		case "cncStatus":
			$nCncID = $nCategoryID;

			//get offline cnc first
			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "AGENTOFFCnc", $nCncID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;

				unset( $aryTmpResult );
				unset( $nTmpErrorCode );
				break;
			}

			//sql to get status
			$sqlTmp = "SELECT CASE {$CNCSTATUS['STATUS']} WHEN 'AGENTOFF' THEN 'AGENTOFF' WHEN 'OFFLINE' THEN 'OFFLINE' ELSE (CASE {$CNCSTATUS['ALARM']} WHEN 'ALARM' THEN 'ALARM' ELSE {$CNCSTATUS['STATUS']} END) END as Status FROM {$CNCSTATUS['TABLE']} WHERE {$CNCSTATUS['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['Status'];
			}
		break;

		case "cncMode":
			$nCncID = $nCategoryID;					
			
			$sqlTmp = "SELECT {$CNCSTATUS['MODE']} as mode FROM {$CNCSTATUS['TABLE']} WHERE {$CNCSTATUS['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['mode'];
			}
		break;

		case "cncAlarm":
			$nCncID = $nCategoryID;					
			
			$sqlTmp = "SELECT {$CNCSTATUS['ALARM']} as alarm FROM {$CNCSTATUS['TABLE']} WHERE {$CNCSTATUS['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['alarm'];
			}
		break;

		case "cncEMG":
			$nCncID = $nCategoryID;					
			
			$sqlTmp = "SELECT {$CNCSTATUS['EMG']} as emg FROM {$CNCSTATUS['TABLE']} WHERE {$CNCSTATUS['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['emg'];
			}
		break;

		case "AGENTOFFCnc":
			$nCncID = $nCategoryID;

			//sql to get offline cnc, differ 5 minutes
			$sqlTmp = "SELECT {$CNCSTATUS['ALL']} FROM {$CNCSTATUS['TABLE']} LEFT JOIN {$CNCTIME['TABLE']} ON {$CNCSTATUS['CNCID']}={$CNCTIME['CNCID']} WHERE {$CNCSTATUS['STATUS']} != 'AGENTOFF' AND {$CNCSTATUS['CNCID']}={$nCncID} AND timestampdiff( minute, {$CNCTIME['AGENTTIME']}, now() ) > 5;";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == true ){
				foreach($aryResultAry as $subKey => $subValue) {
					//update status into offline
					$sql_updateToOffline = "UPDATE {$CNCSTATUS['TABLE']} SET {$CNCSTATUS['STATUS']} = 'AGENTOFF'  WHERE {$CNCSTATUS['CNCID']}={$subValue['cnc_id']}";
					DoNonQueryComd( $sql_updateToOffline, $szDBAPIName );
				}				
			}
		break;

		case "cncMainProg":
			$nCncID = $nCategoryID;						
			
			$sqlTmp = "SELECT {$CNCSTATUS['MAINPROG']} as main_prog FROM {$CNCSTATUS['TABLE']} WHERE {$CNCSTATUS['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['main_prog'];
			}
		break;

		case "cncCurProg":
			$nCncID = $nCategoryID;					
			
			$sqlTmp = "SELECT {$CNCSTATUS['CURPROG']} as cruProg FROM {$CNCSTATUS['TABLE']} WHERE {$CNCSTATUS['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['cruProg'];
			}
		break;
		//end status table
		//record table
		case "cncPowerOnTime":
			$nCncID = $nCategoryID;
			
			$sqlTmp = "SELECT {$CNCRECORD['POWERONTIME']} as powerOnTime FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['powerOnTime'];
			}
		break;

		case "cncCycleTime":
			$nCncID = $nCategoryID;
			
			$sqlTmp = "SELECT {$CNCRECORD['CYCLETIME']} as cycleTime FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['cycleTime'];
			}
		break;

		case "cncTotalCycleTime":
			$nCncID = $nCategoryID;
			
			$sqlTmp = "SELECT {$CNCRECORD['TOTALCYCLETIME']} as totalCycleTime FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['totalCycleTime'];
			}
		break;

		case "cncPartCount":
			$nCncID = $nCategoryID;
			
			$sqlTmp = "SELECT {$CNCRECORD['PARTCOUNT']} as partCount FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['partCount'];
			}
		break;

		case "cncRequirePartCount":
			$nCncID = $nCategoryID;
			
			$sqlTmp = "SELECT {$CNCRECORD['REQUIRECOUNT']} as requirePartCount FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['requirePartCount'];
			}
		break;

		case "cncTotalCount":
			$nCncID = $nCategoryID;
			
			$sqlTmp = "SELECT {$CNCRECORD['TOTALCOUNT']} as totalCount FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['totalCount'];
			}
		break;

		case "cncLastWorkTime":
			$nCncID = $nCategoryID;

			//sql to get record
			$sqlTmp = "SELECT {$CNCRECORD['LASTWORKTIME']} as lastwork_time FROM {$CNCRECORD['TABLE']} WHERE timestampdiff( second, {$CNCRECORD['WORKFILEUPDATETIME']}, now() ) < 86400 AND {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				//means cncLastWorkTime have no data, need to explore record file				
				$aryTmparyResult = array();
				$nTmpErrorCode = GetDBData( "cncWorkFile", $nCncID, array(), $aryTmparyResult );
				if( $nTmpErrorCode !== $ErrorCode['Success'] ){
					$errorCode = $nTmpErrorCode;
					
					unset( $aryTmparyResult );
					unset( $nTmpErrorCode );
					break;
				}
				$recordPlaintext = $aryTmparyResult;
				$recordAry = analyzRecord( $recordPlaintext );
				$lastwork_time = findLastRecordTime( $recordAry, 1 );

				//write this time into db
				$today = new DateTime();
				$todateDateTime = $today->setTime(0,0,0);

				$sql_updatelastwork_time = "UPDATE {$CNCRECORD['TABLE']} SET {$CNCRECORD['LASTWORKTIME']}='{$lastwork_time}', {$CNCRECORD['WORKFILEUPDATETIME']}='{$todateDateTime->format('Y-m-d H:i:s')}' WHERE {$CNCRECORD['CNCID']}={$nCncID}";
				DoNonQueryComd( $sql_updatelastwork_time, $szDBAPIName );

				$aryResultAry = $lastwork_time;
			}else{
				$aryResultAry = $aryResultAry[0]['lastwork_time'];
			}
		break;

		case "cncWorkFile":
			$nCncID = $nCategoryID;

			//sql to get record file
			$sqlTmp = "SELECT {$CNCRECORD['WORKFILE']} as workfile FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}elseif( $aryResultAry[0]['workfile'] === "" ){
				$aryResultAry = "";
				$errorCode = $szDBAPIName.$ErrorCode['Empty'];
			}else{
				$aryResultAry = $aryResultAry[0]['workfile'];
			}
		break;
		//end record table
		//time table
		case "cncTimeStatus":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCTIME['TIMESTATUS']} as tmieStatus FROM {$CNCTIME['TABLE']} WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['tmieStatus'];
			}
		break;

		case "cncTimeStart":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCTIME['TIMESTART']} as timeStart FROM {$CNCTIME['TABLE']} WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['timeStart'];
			}
		break;

		case "cncTimeExpire":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCTIME['TIMEEXPIRE']} as timeExpire FROM {$CNCTIME['TABLE']} WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['timeExpire'];
			}
		break;

		case "cncTimeRemain":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCTIME['TIMEREMAIN']} as timeRemain FROM {$CNCTIME['TABLE']} WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['timeRemain'];
			}
		break;

		case "cncTimeCurrent":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCTIME['TIMECURRENT']} as timeCurrent FROM {$CNCTIME['TABLE']} WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['timeCurrent'];
			}
		break;

		case "cncTimeOfOpening":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCTIME['TIMEOFOPENING']} as TimeOfOpening FROM {$CNCTIME['TABLE']} WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}elseif( $aryResultAry[0]['TimeOfOpening'] == 0 ){
				$aryResultAry = 0;
				$errorCode = $szDBAPIName.$ErrorCode['ZeroData'];
			}else{
				$aryResultAry = $aryResultAry[0]['TimeOfOpening'];
			}
		break;

		case "cncRestDay":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT  CASE {$CNCTIME['TIMESTATUS']} WHEN 'DT_NoTimeLimit' THEN 'NoLimit' ELSE {$CNCTIME['TIMEREMAIN']} END as RestDay FROM {$CNCTIME['TABLE']}  WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['RestDay'];
			}
		break;

		case "cncProcess":
			$nCncID = $nCategoryID;
			
			$sqlTmp = "SELECT ROUND(( {$CNCRECORD['PARTCOUNT']}/{$CNCRECORD['REQUIRECOUNT']})*100, 2) as cncProcess FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$tmpProcess = $aryResultAry[0]['cncProcess'];
				
				if( $tmpProcess > 100 ){
					$tmpProcess = 100;
				}

				if( $tmpProcess == 0 ){
					$aryResultAry = "0%";
				}

				$aryResultAry = $tmpProcess."%";
			}
		break;

		case "cncPartProcess":
			$nCncID = $nCategoryID;

			$tmparyResultAry = array();
			$tmpErrorCode = GetDBData( "cncPartCount", $nCncID, array(), $tmparyResultAry );
			if( $tmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $tmpErrorCode;
				unset( $tmparyResultAry );
				unset( $tmpErrorCode );
				break;
			}
			$nPartCount = $tmparyResultAry;

			$tmparyResultAry = array();
			$tmpErrorCode = GetDBData( "cncRequirePartCount", $nCncID, array(), $tmparyResultAry );
			if( $tmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $tmpErrorCode;
				unset( $tmparyResultAry );
				unset( $tmpErrorCode );
				break;
			}
			$nRequirePartCount = $tmparyResultAry;

			$aryResultAry = $nPartCount."/".$nRequirePartCount;
		break;

		case "cncRestTime":
		//TODO:Rest Time to Process
			$nCncID = $nCategoryID;						
			$aryResultAry = "35mins";
		break;

		case "cncUpdateTime":
			$nCncID = $nCategoryID;
				
			$sqlTmp = "SELECT {$CNCTIME['AGENTTIME']} as update_time FROM {$CNCTIME['TABLE']} WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['update_time'];
			}
		break;
		//end time table

		case "cncInfo":
			$nCncID = $nCategoryID;

			//machine as Machine, machine_type as MachineType, version as Version, serial_no as SerialNo
			//ip as IP, machine as Machine, machine_type as MachineType, version as Version, serial_no as SerialNo, RESTDAY
			$cncInfoList = "{$CNC['IP']} as IP, {$CNC['MACHINE']} as Machine, {$CNC['MACHINETYPE']} as MachineType, {$CNC['VERSION']} as Version, {$CNC['SERIALNO']} as SerialNo";

			$sqlTmp = "SELECT ".$cncInfoList." FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0];
			}

			//get restTime
			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "cncRestDay", $nCncID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;
				
				//unset( $aryTmpResult );
				unset( $nTmpErrorCode );
			}
			$aryResultAry['RestDay'] = $aryTmpResult;
		break;

		case "cncOOE":
			$nCncID = $nCategoryID;

			//excepted time is not exist here
			/*$tmparyResultAry = array();
			$tmpErrorCode = GetDBData( "cncExceptRecordTime", $nCncID, array(), $tmparyResultAry );
			if( $tmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $tmpErrorCode;
				unset( $tmparyResultAry );
				unset( $tmpErrorCode );
				break;
			}
			$exceptRecord = $tmparyResultAry;*/
			$exceptRecord = 86400;

				
			$tmparyResultAry = array();
			$tmpErrorCode = GetDBData( "cncLastWorkTime", $nCncID, array(), $tmparyResultAry );
			if( $tmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $tmpErrorCode;
				unset( $tmparyResultAry );
				unset( $tmpErrorCode );
				break;
			}
			$cncPreWorkTime = $tmparyResultAry;

			if( $errorCode === 0 ){
				$aryResultAry = ($cncPreWorkTime/$exceptRecord)*100;
			}
			
			unset( $exceptRecord );
			unset( $summaryRecord );
		break;

		case "cncHisOOE":
			$nCncID = $nCategoryID;

			//get opentime
			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "cncTimeOfOpening", $nCncID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;
				
				//unset( $aryTmpResult );
				unset( $nTmpErrorCode );
			}
			$aryResultAry['OOE']['TimeOfOpening'] = $aryTmpResult;

			//get total cyctime
			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "cncTotalCycleTime", $nCncID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;
				
				//unset( $aryTmpResult );
				unset( $nTmpErrorCode );
			}
			$aryResultAry['OOE']['totalCycTime'] = $aryTmpResult;

			//open the record file
			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "cncWorkFile", $nCncID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;
				
				//unset( $aryTmpResult );
				unset( $nTmpErrorCode );
			}
			$aryResultAry['OOE']['hisRecordFile'] = $aryTmpResult;


			//get factory set worktime
			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "cncExceptRecordTime", $nCncID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;
				
				unset( $aryTmpResult );
				unset( $nTmpErrorCode );
				break;
			}
			$aryResultAry['OOE']['expectedWorkTime'] = $aryTmpResult;
		break;

		case "cncCurtAlm":
			$nCncID = $nCategoryID;
			$sqlTmp = "SELECT {$CNCALARM['ALL']} FROM {$CNCALARM['TABLE']} WHERE {$CNCALARM['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;

		case "cncHisAlm":
			$nCncID = $nCategoryID;
			$sqlTmp = "SELECT {$CNCALARMHISTORY['ALARMHISFILE']} FROM {$CNCALARMHISTORY['TABLE']} WHERE {$CNCALARMHISTORY['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['alarm_history'];
			}
		break;

		case "cncHisAlarm":
			$nCncID = $nCategoryID;

			if( $aryParam['unit'] == "curtAlm" ){
				//get current alarm
				$aryTmpResult = array();
				$nTmpErrorCode = GetDBData( "cncCurtAlm", $nCncID, array(), $aryTmpResult );
				if( $nTmpErrorCode !== $ErrorCode['Success'] ){
					$errorCode = $nTmpErrorCode;
					
					//unset( $aryTmpResult );
					unset( $nTmpErrorCode );
				}
				$aryResultAry['curtAlm'] = $aryTmpResult;
			}

			//get history alm
			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "cncHisAlm", $nCncID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;
				
				//unset( $aryTmpResult );
				unset( $nTmpErrorCode );
			}
			$aryResultAry['hisAlm'] = $aryTmpResult;
		break;

		case "cncHisRecord":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCSTATUS['MAINPROG']} as MainProg, {$CNCRECORD['ALL']} FROM {$CNCSTATUS['TABLE']} LEFT JOIN {$CNCRECORD['TABLE']} ON {$CNCRECORD['CNCID']}={$CNCSTATUS['CNCID']} WHERE {$CNCSTATUS['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry['Record'] = $aryResultAry[0];
			}
		break;

		case "cncExceptRecordTime":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$FACTORY['EXPEXTWORKTIME']} as expected_work_time FROM {$GROUP['TABLE']} LEFT JOIN {$FACTORY['TABLE']} ON {$GROUP['FACTORYID']}={$FACTORY['ID']} WHERE {$GROUP['ID']}= (SELECT {$CNC['GROUPID']} FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID});";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}elseif( $aryResultAry[0]['expected_work_time'] <= 0 ){
				$aryResultAry = 0;
				$errorCode = $szDBAPIName.$ErrorCode['ZeroData'];
			}else{
				$aryResultAry = $aryResultAry[0]['expected_work_time'];
			}
		break;
		//cnc_agent_version
		case "cncAgentVersion":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCAGENTVERSION['AGENTVERSION']} as agent_version, {$CNCAGENTVERSION['APIVERSION']} as api_version FROM {$CNCAGENTVERSION['TABLE']} WHERE {$CNCAGENTVERSION['CNCID']}= {$nCncID};";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0];
			}
		break;
		//end cnc_agent_version
	//layout
		case "GetDefaultLayout":
			$sqlTmp = "SELECT {$SYSDEFAULTLAYOUT['NAME']} as name, {$SYSDEFAULTLAYOUT['FILE']} as file FROM {$SYSDEFAULTLAYOUT['TABLE']} WHERE {$SYSDEFAULTLAYOUT['DEVICE']}='{$aryParam['device']}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;
		case "GetMyLayout":
			$nCID = $nCategoryID;
			$sqlTmp = "SELECT {$COMPANYLAYOUT['ALL']} FROM {$COMPANYLAYOUT['TABLE']} WHERE {$COMPANYLAYOUT['COMPANYID']}={$nCID} AND {$COMPANYLAYOUT['LAYOUTDEVICE']}='{$aryParam['device']}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );
		break;
		case "SaveLayout":
			$nCID = $nCategoryID;
			$sqlTmp = "INSERT INTO {$COMPANYLAYOUT['TABLE']} ( {$COMPANYLAYOUT['COMPANYID']}, {$COMPANYLAYOUT['LAYOUTDEVICE']}, {$COMPANYLAYOUT['LAYOUTNAME']}, {$COMPANYLAYOUT['LAYOUTFILE']}, {$COMPANYLAYOUT['UPDATETIME']}) VALUES ( '{$nCID}', '{$aryParam['device']}', '{$aryParam['layoutName']}', '{$aryParam['layoutFile']}', CURRENT_TIMESTAMP ) ON DUPLICATE KEY UPDATE {$COMPANYLAYOUT['LAYOUTFILE']}='{$aryParam['layoutFile']}', {$COMPANYLAYOUT['UPDATETIME']}=CURRENT_TIMESTAMP";
			$aryResultAry = $sqlTmp;
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
		break;
		case "GetLayoutComponentFromRoutine":
			$nCID = $nCategoryID;
			$sqlTmp = "SELECT {$CNCROUTINE['ROUTINE']} as routine, {$CNCROUTINE['NAME']} as name FROM {$CNCROUTINE['TABLE']} WHERE {$CNCROUTINE['COMPANYID']}='{$nCID}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}
		break;
		case "DeleteLayout":
			$nCID = $nCategoryID;
			$sqlTmp = "DELETE FROM {$COMPANYLAYOUT['TABLE']} WHERE {$COMPANYLAYOUT['LAYOUTNAME']}='{$aryParam['layoutName']}' AND {$COMPANYLAYOUT['COMPANYID']}='{$nCID}' AND {$COMPANYLAYOUT['LAYOUTDEVICE']}='{$aryParam['device']}'";
			$aryResultAry = $sqlTmp;
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
		break;
		case "GetDashboardItemsNicknames":
			$nCID = $nCategoryID;
			$sqlTmp = "SELECT {$COMPANYDASHBOARDITEMNAMES['ITEMNAMES']} as itemNames FROM {$COMPANYDASHBOARDITEMNAMES['TABLE']} WHERE {$COMPANYDASHBOARDITEMNAMES['COMPANYID']}='{$nCID}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['itemNames'];
			}
		break;
		case "SaveDashboardItemsNicknames":
			$nCID = $nCategoryID;
			$sqlTmp = "INSERT INTO {$COMPANYDASHBOARDITEMNAMES['TABLE']} ( {$COMPANYDASHBOARDITEMNAMES['COMPANYID']}, {$COMPANYDASHBOARDITEMNAMES['ITEMNAMES']}, {$COMPANYDASHBOARDITEMNAMES['UPDATETIME']}) VALUES ( '{$nCID}', '{$aryParam['nicknames']}', CURRENT_TIMESTAMP ) ON DUPLICATE KEY UPDATE {$COMPANYDASHBOARDITEMNAMES['ITEMNAMES']}='{$aryParam['nicknames']}', {$COMPANYDASHBOARDITEMNAMES['UPDATETIME']}=CURRENT_TIMESTAMP";
			$aryResultAry = $sqlTmp;
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
		break;
	//slider setting
		case "GetSliderSetting":
			$nFID = $nCategoryID;
			$sqlTmp = "SELECT {$FACTORYSLIDERSETTING['SLIDERSETTING']} as sliderSetting FROM {$FACTORYSLIDERSETTING['TABLE']} WHERE {$FACTORYSLIDERSETTING['FACTORYID']}={$nFID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );
			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['sliderSetting'];
			}
		break;
		case "SaveSliderSetting":
			$nFID = $nCategoryID;
			$sqlTmp = "INSERT INTO {$FACTORYSLIDERSETTING['TABLE']} ( {$FACTORYSLIDERSETTING['FACTORYID']}, {$FACTORYSLIDERSETTING['SLIDERSETTING']}, {$FACTORYSLIDERSETTING['UPDATETIME']}) VALUES ( '{$nFID}', '{$aryParam['sliderSetting']}', CURRENT_TIMESTAMP ) ON DUPLICATE KEY UPDATE {$FACTORYSLIDERSETTING['SLIDERSETTING']}='{$aryParam['sliderSetting']}', {$FACTORYSLIDERSETTING['UPDATETIME']}=CURRENT_TIMESTAMP";
			$aryResultAry = $sqlTmp;
			DoNonQueryComd( $sqlTmp, $szDBAPIName );
		break;
	//customization diagnosis value
		case "GetCustomerDiagnosisValue":
			$nCNCID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCVARIABLE['VALUE']} as value, {$CNCVARIABLE['AGENTTIME']} as agent_time FROM {$CNCVARIABLE['TABLE']} WHERE {$CNCVARIABLE['CNCID']}='{$nCNCID}' AND {$CNCVARIABLE['WID']}='0' AND {$CNCVARIABLE['TYPE']}='{$aryParam['type']}' AND {$CNCVARIABLE['NO']}='{$aryParam['no']}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['value'];
			}
		break;
		case "GetParamSchema":
			$nCNCID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCPARAMSCHEMA['PARAMSCHEMA']} as ParamSchema FROM {$CNCPARAMSCHEMA['TABLE']} WHERE {$CNCPARAMSCHEMA['CNCID']}='{$nCNCID}'";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
				$errorCode = $nCategoryID.$errorCode;
			}else{
				$aryResultAry = $aryResultAry[0]['ParamSchema'];
			}
		break;
	}

	unset( $sqlTmp );
	return $errorCode;
}

function isDoSQLCmd( $szSQLCmd, $szDBAPIName, &$aryResult )
{
	$isSuccess = false;

	$DBConnector = new RemoteModule();
	$DBConnector->SQLQuery( $szDBAPIName, $szSQLCmd );

	if( empty($DBConnector->resultArray[$szDBAPIName]) == false ){
		$isSuccess = true;
		$aryResult = $DBConnector->resultArray[$szDBAPIName];
	}

	unset( $DBConnector->resultArray[$szDBAPIName] );
	unset( $DBConnector );

	return $isSuccess;
}

function DoNonQueryComd( $szSQLCmd, $szDBAPIName )
{
	$DBConnector = new RemoteModule();
	$DBConnector->SQLUpdate( $szSQLCmd );
	unset( $DBConnector );
}

function analyzRecord( $recordPlaintext )
{
	$tmpRecordAry = array();

	$tmpAry = split( "<Cycle Name=\"CycleEdit\">", $recordPlaintext );				
	for($i=1; $i<sizeof($tmpAry); $i++){

		$record = array();
		$tmpAry2 = split( "</Cycle>", $tmpAry[$i] );
		$tmpAry3 = split( "Value=\"", $tmpAry2[0] );

		for($j=1; $j<sizeof($tmpAry3); $j++){
			$tmpAry4 = split( "\"/>", $tmpAry3[$j] );
			array_push( $record, $tmpAry4[0] );
		}
		
		if( empty( $record[3] ) == true ){
			continue;
		}

		$tmpRecordAry[$i-1]["ProgName"]		= ( empty($record[0]) == false ) ? $record[0] : "";
		$tmpRecordAry[$i-1]["StartDate"]	= ( empty($record[1]) == false ) ? $record[1] : "";
		$tmpRecordAry[$i-1]["StartTime"]	= ( empty($record[2]) == false ) ? $record[2] : "";
		$tmpRecordAry[$i-1]["TotalTime"]	= ( empty($record[3]) == false ) ? $record[3] : "";
		$tmpRecordAry[$i-1]["PartCount"]	= ( empty($record[4]) == false ) ? $record[4] : "";
		$tmpRecordAry[$i-1]["comment"]		= ( empty($record[5]) == false ) ? $record[5] : "";
	}

	return $tmpRecordAry;
}

function findLastRecordTime( $recordArray, $nIntervalToday )
{
	//$timeThreshold = 1*10*60; //10 min
	if( sizeof($recordArray) == 0 ){
		return 0;
	}
	
	$workTime = 0; //second

	for($i=0; $i<sizeof($recordArray); $i++){
		
		$recordWorkTime = standRecordTime( $nIntervalToday, $recordArray[$i]["StartDate"], $recordArray[$i]['StartTime'], $recordArray[$i]['TotalTime'] );

		if( $recordWorkTime == -1 ){
			break;
		}

		$workTime = $workTime + $recordWorkTime;

	}

	return $workTime;
}

function standRecordTime( $nIntervalToday, $startDate, $startTime, $worktime )
{
	//conpute the diff day
	$compareDate = new DateTime( $startDate );
	$todayDate = new DateTime();
	$standardDate = $todayDate->modify('-'.$nIntervalToday.' day')->setTime(0,0,0);
	$interval = $standardDate ->diff($compareDate);

	//startime into seconds
	if(strpos( $startTime, "AM" ) == true){
		$tmpTimeAry = split( " AM", $startTime );
		$timeAry = split( ":", $tmpTimeAry[0] );
	}else{
		$tmpTimeAry = split( " PM", $startTime );
		$timeAry = split( ":", $tmpTimeAry[0] );
		$timeAry[0] = ( $timeAry[0] == 12 ) ? $timeAry[0] : ($timeAry[0]+12);
	}
	$startSecond = $timeAry[0]*60*60 + $timeAry[1]*60;

	//total cycle time
	$duryAry = split( ":", $worktime );
	$durySecond = $duryAry[0]*60*60 + $duryAry[1]*60 + $duryAry[2];

	$compareSeconds = 86400*($interval->format('%a'));
	if( $interval->format('%a') == 0 ){
		if( $startSecond+$durySecond > 86400 ){
			return (86400 - $startSecond);
		}else{
			return $durySecond;
		}
	}elseif( $startSecond+$durySecond > $compareSeconds ){
		return ($startSecond+$durySecond) - $compareSeconds;
	}else{
		return -1;
	}
}


?>