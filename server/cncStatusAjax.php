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

		//adjust array
		$cncInfo = array();
		if( !empty($SyntecObj->resultArray['getCncInfo']) ){
			$cncInfo = $SyntecObj->resultArray['getCncInfo'][0];
		}

		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );

		//return result
		$result = array( "result" => "success", "data" => $cncInfo );
		echo json_encode( $result );

	break;

	case'updateStatusLight':
		$cncid = $post['cncid'];

		//sql to get cnc status and alarm (alarm not yet)
		$sql_getStatusNAlarm = "SELECT cnc_status.Status, cnc_status.Alarm FROM cnc_status 
								WHERE cnc_status.cnc_id=".$cncid."";
		$SyntecObj->resultArray['getStatusNAlarm'] = array();
		$SyntecObj->SQLQuery('resultArray','getStatusNAlarm',$sql_getStatusNAlarm);

		//adjust array
		$cncStatusNAlarm = array();
		if( !empty($SyntecObj->resultArray['getStatusNAlarm']) ){
			$cncStatusNAlarm = $SyntecObj->resultArray['getStatusNAlarm'][0];
		}

		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );

		//return result
		$result = array( "result" => "success", "data" => $cncStatusNAlarm );
		echo json_encode( $result );

	break;

	default:
	break;
}

?>