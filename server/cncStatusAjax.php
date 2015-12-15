<?php
include_once "../include/createObj.php";

//get POSt data
$post = $_POST;

$method = $post['method'];

switch( $method ){

	case 'initCncOverview':
		$gid = $post['gid'];
		
		//sql to get cnc status from DB
		$sql_initCncOverview = "SELECT * FROM cnc WHERE CNCGroup=".$gid.";";
		$SyntecObj->resultArray['initCnc'] = array();
		$SyntecObj->SQLQuery('resultArray','initCnc',$sql_initCncOverview);

		//adjust array
		$initCncOverview = array();
		if( !empty($SyntecObj->resultArray['initCnc']) ){
			$i = 0;
			while ( !empty($SyntecObj->resultArray['initCnc'][$i]) ){
				$initCncOverview[] = $SyntecObj->resultArray['initCnc'][$i];
				$i++;
			}
		}

		//release space
		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );

		//return result
		$result = array( "result" => "success", "data" => $initCncOverview );
		echo json_encode( $result );

	break;

	case 'updateCncStatus':
		$cncid = $post['cncid'];

		//sql to get cncstatus
		$sql_getCncStatus="SELECT * FROM cnc_status WHERE cnc_id=".$cncid."";
		$SyntecObj->resultArray['getCncStatus'] = array();
		$SyntecObj->SQLQuery('resultArray','getCncStatus',$sql_getCncStatus);

		//adjust array
		$cncStatus = array();
		if( !empty($SyntecObj->resultArray['getCncStatus']) ){
			$cncStatus = $SyntecObj->resultArray['getCncStatus'][0];
		}

		//release space
		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );

		//return result
		$result = array( "result" => "success", "data" => $cncStatus );
		echo json_encode( $result );
	
	break;

	case 'initCncDetail':
		$cncid = $post['cncid'];

		//sql to get cncstatus
		$sql_getCncInfo="SELECT * FROM cnc WHERE CNC_id=".$cncid."";
		$SyntecObj->resultArray['getCncInfo'] = array();
		$SyntecObj->SQLQuery('resultArray','getCncInfo',$sql_getCncInfo);

		//sql to get cnc usetime
		$sql_getCncUseTime="SELECT * FROM cnc_time WHERE cnc_id=".$cncid."";
		$SyntecObj->resultArray['getCncUseTime'] = array();
		$SyntecObj->SQLQuery('resultArray','getCncUseTime',$sql_getCncUseTime);

		//adjust array
		$initCncDetail = array();
		if( !empty($SyntecObj->resultArray['getCncInfo']) ){
			$initCncDetail['cncInfo'] = $SyntecObj->resultArray['getCncInfo'][0];
		}
		if( !empty($SyntecObj->resultArray['getCncUseTime']) ){
			$initCncDetail['cncTime'] = $SyntecObj->resultArray['getCncUseTime'][0];
		}

		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );

		//return result
		$result = array( "result" => "success", "data" => $initCncDetail );
		echo json_encode( $result );

	break;

	case'updateStatusLightNSysTime':
		$cncid = $post['cncid'];

		//sql to get cnc status and alarm (alarm not yet)
		$sql_getStatusNAlarm = "SELECT cnc_status.Status, cnc_status.Alarm, cnc_status.update_time FROM cnc_status 
								WHERE cnc_status.cnc_id=".$cncid."";
		$SyntecObj->resultArray['getStatusNAlarm'] = array();
		$SyntecObj->SQLQuery('resultArray','getStatusNAlarm',$sql_getStatusNAlarm);

		//sql to get system time
		$sql_getCncSysTime = "SELECT TimeCurrent FROM cnc_time WHERE cnc_id=".$cncid."";
		$SyntecObj->resultArray['getCncSysTime'] = array();
		$SyntecObj->SQLQuery('resultArray','getCncSysTime',$sql_getCncSysTime);

		//adjust array
		$cncStatusNAlarmNSystime = array();
		if( !empty($SyntecObj->resultArray['getStatusNAlarm']) ){
			$cncStatusNAlarmNSystime['statusNalarm'] = $SyntecObj->resultArray['getStatusNAlarm'][0];
		}

		if( !empty($SyntecObj->resultArray['getCncSysTime']) ){
			$cncStatusNAlarmNSystime['systime'] = $SyntecObj->resultArray['getCncSysTime'][0];
		}

		//check alarm or not
		if( !empty($cncStatusNAlarmNSystime) ){
			if( $cncStatusNAlarmNSystime['statusNalarm']['Alarm'] == "ALARM" ){
				$sql_getCurAlm = "SELECT almMsg FROM cnc_alarm WHERE cnc_id=".$cncid." ORDER BY almTime DESC LIMIT 0,1;";
				$SyntecObj->resultArray['getCurAlm'] = array();
				$SyntecObj->SQLQuery('resultArray','getCurAlm',$sql_getCurAlm);

				if( !empty($SyntecObj->resultArray['getCurAlm']) ){
					$cncStatusNAlarmNSystime['statusNalarm']['currentAlarm'] = $SyntecObj->resultArray['getCurAlm'][0]['almMsg'];
				}
			}
		}

		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );

		//return result
		$result = array( "result" => "success", "data" => $cncStatusNAlarmNSystime );
		echo json_encode( $result );

	break;

	case 'updateCncAlarm':
		$cncid = $post['cncid'];

		//sql to get cncAlarm
		$sql_getCncAlarm="SELECT almMsg, almTime, update_time FROM cnc_alarm WHERE cnc_id=".$cncid." ORDER BY almTime DESC ;";
		$SyntecObj->resultArray['getCncAlarm'] = array();
		$SyntecObj->SQLQuery('resultArray','getCncAlarm',$sql_getCncAlarm);

		//adjust array
		$cncAlarm = array();
		if( !empty($SyntecObj->resultArray['getCncAlarm']) ){
			$cncAlarm = $SyntecObj->resultArray['getCncAlarm'];
		}

		//release space
		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );

		//return result
		$result = array( "result" => "success", "data" => $cncAlarm );
		echo json_encode( $result );

	break;

	case 'updateCncRecord':
		$cncid = $post['cncid'];

		//sql to get cncRecord
		$sql_getCncRecord="SELECT * FROM cnc_record WHERE cnc_id=".$cncid;
		$SyntecObj->resultArray['getCncRecord'] = array();
		$SyntecObj->SQLQuery('resultArray','getCncRecord',$sql_getCncRecord);

		//adjust array
		$cncRecord = array();
		if( !empty($SyntecObj->resultArray['getCncRecord']) ){
			$cncRecord = $SyntecObj->resultArray['getCncRecord'][0];
		}

		//release space
		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );

		//return result
		$result = array( "result" => "success", "data" => $cncRecord );
		echo json_encode( $result );

	break;

	default:
	break;
}

?>