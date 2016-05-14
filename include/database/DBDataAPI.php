<?php

include_once __dir__."/../../include/controlSetting.php";

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
	
	$RemoteAjax = new RemoteModule();

	//init
	$errorCode = $ErrorCode['Success'];
	$aryResultAry = '';

	switch( $szDBAPIName )
	{
	//sys_related
		case "myFIDnGID":
			$companyID = $nCategoryID;

			$sqlTmp = "SELECT {$FACTORY['ID']}, {$GROUP['ID']} as gid FROM {$FACTORY['TABLE']} LEFT JOIN {$GROUP['TABLE']} ON {$FACTORY['ID']}={$GROUP['FACTORYID']} WHERE {$FACTORY['COMPANYID']}={$companyID} GROUP BY {$GROUP['ID']};";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}else{
				$aryResultAry = $aryResultAry[0];
			}
		break;
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
			}else{
				$aryResultAry = $aryResultAry[0]['fTotalCNC'];
			}
		break;

		case "fOOE":
			$nFID = $nCategoryID;

			$aryTmparyResult = array();
			$nTmpErrorCode = GetDBData( "factoryExceptRecordTime", $nFID, array(), $aryTmparyResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $nTmpErrorCode;
				unset( $aryTmparyResult );
				unset( $nTmpErrorCode );
				break;
			}
			$F_exceptRecord = $aryTmparyResult;

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
				$nTmpErrorCode = GetDBData( "cncPreRecordTime", $cncValue['cnc_id'], array(), $aryTmparyResult );
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
			$sqlTmp = "SELECT {$CNC['ALL']} FROM {$GROUP['TABLE']} LEFT JOIN {$CNC['TABLE']} ON {$CNC['GROUPID']}={$GROUP['ID']} WHERE {$GROUP['FACTORYID']}={$nFID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}
		break;

		case "factoryExceptRecordTime":
			$nFID = $nCategoryID;

			$sqlTmp = "SELECT {$FACTORY['EXPEXTWORKTIME']} as expected_work_time FROM {$FACTORY['TABLE']} WHERE {$FACTORY['ID']}={$nFID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}elseif( $aryResultAry[0]['expected_work_time'] <= 0){
				$aryResultAry = 0;
				$errorCode = $szDBAPIName.$ErrorCode['Empty'];
			}else{
				$aryResultAry = $aryResultAry[0]['expected_work_time'];
			}
		break;
		
	//group
		case "Group_fID":
			$nGID = $nCategoryID;

			$sqlTmp = "SELECT {$GROUP['FACTORYID']} as fID FROM {$GROUP['TABLE']} WHERE {$GROUP['ID']}={$nGID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['ServerBusy'];
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
			}else{
				$aryResultAry = $aryResultAry[0]['gTotalCNC'];
			}
		break;

		case "gOOE":
			$nGID = $nCategoryID;

			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "GroupExceptRecordTime", $nGID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $nTmpErrorCode;
				unset( $aryTmpResult );
				unset( $nTmpErrorCode );
				break;
			}
			$exceptRecord = $aryTmpResult;

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
				$nTmpErrorCode = GetDBData( "cncPreRecordTime", $cncValue['cnc_id'], array(), $aryTmpResult );
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
			}else{
				$aryResultAry = $aryResultAry[0]['expected_work_time'];
			}
		break;

		case "CncListFromG":
			$nGID = $nCategoryID;

			//sql to get cnc list from {$FACTORY['TABLE']}
			$sqlTmp = "SELECT {$CNC['ALL']} FROM {$GROUP['TABLE']} LEFT JOIN {$CNC['TABLE']} ON {$CNC['GROUPID']}={$GROUP['ID']} WHERE {$GROUP['ID']}={$nGID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}
		break;

	//cnc related
		case "cncID":
			$nCncID = $nCategoryID;
			$aryResultAry = $nCncID;
		break;

		case "cncGetGroupID":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNC['GROUPID']} as nGID FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}else{
				$aryResultAry = $aryResultAry[0]['nGID'];
			}
		break;

		case "cncName":
			$nCncID = $nCategoryID;			
			$sqlTmp = "SELECT {$CNC['NAME']} FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
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
			}else{
				$aryResultAry = base64_encode( $aryResultAry[0]['img'] );
			}
		break;

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
			}else{
				$aryResultAry = $aryResultAry[0]['Status'];
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
			}else{
				$aryResultAry = $aryResultAry[0]['main_prog'];
			}
		break;

		case "cncOOE":
			$nCncID = $nCategoryID;

			$tmparyResultAry = array();
			$tmpErrorCode = GetDBData( "CncExceptRecordTime", $nCncID, array(), $tmparyResultAry );
			if( $tmpErrorCode !== $ErrorCode['Success'] ){
				//means user doesn't set this
				$errorCode = $tmpErrorCode;
				unset( $tmparyResultAry );
				unset( $tmpErrorCode );
				break;
			}
			$exceptRecord = $tmparyResultAry;
				
			$tmparyResultAry = array();
			$tmpErrorCode = GetDBData( "cncPreRecordTime", $nCncID, array(), $tmparyResultAry );
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
			unset( $cncList );
			unset( $summaryRecord );
		break;

		case "cncMode":
			$nCncID = $nCategoryID;					
			
			$sqlTmp = "SELECT {$CNCSTATUS['MODE']} as mode FROM {$CNCSTATUS['TABLE']} WHERE {$CNCSTATUS['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}else{
				$aryResultAry = $aryResultAry[0]['mode'];
			}
		break;

		case "cncProcess":
			$nCncID = $nCategoryID;
			
			$sqlTmp = "SELECT ROUND(( {$CNCRECORD['PARTCOUNT']}/{$CNCRECORD['REQUIRECOUNT']})*100, 2) as cncProcess FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}else{
				$tmpProcess = $aryResultAry[0]['cncProcess'];
				if( $tmpProcess > 100 ){
					$tmpProcess = 100;
				}
				$aryResultAry = $tmpProcess."%";
			}
		break;

		case "cncRestTime":
			$nCncID = $nCategoryID;						
			$aryResultAry = "35mins";
		break;

		case "cncUpdateTime":
			$nCncID = $nCategoryID;
				
			$sqlTmp = "SELECT {$CNCTIME['AGENTTIME']} as update_time FROM {$CNCTIME['TABLE']} WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}else{
				$aryResultAry = $aryResultAry[0]['update_time'];
			}
		break;

		case "cncInfo":
			$nCncID = $nCategoryID;

			//machine as Machine, machine_type as MachineType, version as Version, serial_no as SerialNo
			//ip as IP, machine as Machine, machine_type as MachineType, version as Version, serial_no as SerialNo, RESTDAY
			$cncInfoList = "{$CNC['IP']} as IP, {$CNC['MACHINE']} as Machine, {$CNC['MACHINETYPE']} as MachineType, {$CNC['VERSION']} as Version, {$CNC['SERIALNO']} as SerialNo";

			$sqlTmp = "SELECT ".$cncInfoList." FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
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

		case "cncIP":
			$nCncID = $nCategoryID;
			$sqlTmp = "SELECT {$CNC['IP']} as IP FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
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
			}else{
				$aryResultAry = $aryResultAry[0]['SerialNo'];
			}
		break;

		case "cncRestDay":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT  CASE {$CNCTIME['TIMESTATUS']} WHEN 'DT_NoTimeLimit' THEN 'NoLimit' ELSE {$CNCTIME['TIMEREMAIN']} END as RestDay FROM {$CNCTIME['TABLE']}  WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}else{
				$aryResultAry = $aryResultAry[0]['RestDay'];
			}
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
			$nTmpErrorCode = GetDBData( "cncTotalCycTime", $nCncID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;
				
				//unset( $aryTmpResult );
				unset( $nTmpErrorCode );
			}
			$aryResultAry['OOE']['totalCycTime'] = $aryTmpResult;

			//open the record file
			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "openRecordFile", $nCncID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;
				
				//unset( $aryTmpResult );
				unset( $nTmpErrorCode );
			}
			$aryResultAry['OOE']['hisRecordFile'] = $aryTmpResult;


			//get factory set worktime
			$aryTmpResult = array();
			$nTmpErrorCode = GetDBData( "CncExceptRecordTime", $nCncID, array(), $aryTmpResult );
			if( $nTmpErrorCode !== $ErrorCode['Success'] ){
				$errorCode = $nTmpErrorCode;
				
				unset( $aryTmpResult );
				unset( $nTmpErrorCode );
				break;
			}
			$aryResultAry['OOE']['expectedWorkTime'] = $aryTmpResult;
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

		case "cncCurtAlm":
			$nCncID = $nCategoryID;
			$sqlTmp = "SELECT {$CNCALARM['ALL']} FROM {$CNCALARM['TABLE']} WHERE {$CNCALARM['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}
		break;

		case "cncHisAlm":
			$nCncID = $nCategoryID;
			$sqlTmp = "SELECT {$CNCALARMHISTORY['ALARMHISFILE']} FROM {$CNCALARMHISTORY['TABLE']} WHERE {$CNCALARMHISTORY['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}else{
				$aryResultAry = $aryResultAry[0]['alarm_history'];
			}
		break;

		case "cncHisRecord":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCSTATUS['MAINPROG']} as MainProg, {$CNCRECORD['ALL']} FROM {$CNCSTATUS['TABLE']} LEFT JOIN {$CNCRECORD['TABLE']} ON {$CNCRECORD['CNCID']}={$CNCSTATUS['CNCID']} WHERE {$CNCSTATUS['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}else{
				$aryResultAry['Record'] = $aryResultAry[0];
			}
		break;

		case "cncPreRecordTime":
			$nCncID = $nCategoryID;

			//sql to get record
			$sqlTmp = "SELECT {$CNCRECORD['LASTWORKTIME']} as lastwork_time FROM {$CNCRECORD['TABLE']} WHERE timestampdiff( second, {$CNCRECORD['WORKFILEUPDATETIME']}, now() ) < 86400 AND {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				//means cncPreRecordTime have no data, need to explore record file
				$aryTmparyResult = array();
				$nTmpErrorCode = GetDBData( "openRecordFile", $nCncID, array(), $aryTmparyResult );
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

				$sql_updatelastwork_time = "UPDATE {$CNCRECORD['TABLE']} SET {$CNCRECORD['LASTWORKTIME']} = '{$lastwork_time}', {$CNCRECORD['WORKFILEUPDATETIME']}= {$todateDateTime->format('Y-m-d H:i:s')} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
				DoNonQueryComd( $sql_updatelastwork_time, $szDBAPIName );

				$aryResultAry = $lastwork_time;
				//$errorCode = $ErrorCode['NeedDoSome'];
			}else{
				$aryResultAry = $aryResultAry[0]['lastwork_time'];
			}
		break;

		case "openRecordFile":
			$nCncID = $nCategoryID;

			//sql to get record file
			$sqlTmp = "SELECT {$CNCRECORD['WORKFILE']} as workfile FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}elseif( $aryResultAry[0]['workfile'] === "" ){
				$aryResultAry = "";
				$errorCode = $szDBAPIName.$ErrorCode['Empty'];
			}else{
				$aryResultAry = $aryResultAry[0]['workfile'];
			}
		break;

		case "CncExceptRecordTime":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$FACTORY['EXPEXTWORKTIME']} as expected_work_time FROM {$GROUP['TABLE']} LEFT JOIN {$FACTORY['TABLE']} ON {$GROUP['FACTORYID']}={$FACTORY['ID']} WHERE {$GROUP['ID']}= (SELECT {$CNC['GROUPID']} FROM {$CNC['TABLE']} WHERE {$CNC['ID']}={$nCncID});";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}elseif( $aryResultAry[0]['expected_work_time'] <= 0 ){
				$aryResultAry = 0;
				$errorCode = $szDBAPIName.$ErrorCode['ZeroData'];
			}else{
				$aryResultAry = $aryResultAry[0]['expected_work_time'];
			}
		break;

		case "cncTimeOfOpening":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCTIME['TIMEOFOPENING']} as TimeOfOpening FROM {$CNCTIME['TABLE']} WHERE {$CNCTIME['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}elseif( $aryResultAry[0]['TimeOfOpening'] == 0 ){
				$aryResultAry = 0;
				$errorCode = $szDBAPIName.$ErrorCode['ZeroData'];
			}else{
				$aryResultAry = $aryResultAry[0]['TimeOfOpening'];
			}
		break;

		case "cncTotalCycTime":
			$nCncID = $nCategoryID;

			$sqlTmp = "SELECT {$CNCRECORD['TOTALCYCLETIME']} as total_cycletime FROM {$CNCRECORD['TABLE']} WHERE {$CNCRECORD['CNCID']}={$nCncID}";
			$isSuccess = isDoSQLCmd( $sqlTmp, $szDBAPIName, $aryResultAry );

			if( $isSuccess == false ){
				$errorCode = $szDBAPIName.$ErrorCode['NoData'];
			}else{
				$aryResultAry = $aryResultAry[0]['total_cycletime'];
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