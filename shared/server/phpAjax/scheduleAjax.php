<?php
include_once "../database/initSetting.php";

if( isset($_POST) && isset($_POST['method']) ){
	$post = $_POST;
}else{
	echo "not defined";
	exit;
}

$method = $post['method'];

switch($method){
	case "SaveSchedule":

		$param = array(
			"scheduleTime"	=> $post['B64_scheduleTime'],
			"shiftSchedule" => $post['B64_schedule'],
		);

		$nFID = $post['fid'];
		$aryResult = array();
		$nErrorCode = GetDBData('SaveShiftSchedule', $nFID, $param, $aryResult );
		ErrorLog( $nErrorCode );


		$result = array(
			"result"=> "success", 
			"data"	=> $aryResult,
		);

		print_r( json_encode($result) );
	break;
	case "LoadSchedule":

		$fid = ( isset($post['fid']) == true ) ? $post['fid'] : 0;

		//get fid from cncid
		if( $fid === 0 ){
			$nCNCID = $post['cncid'];
			$result_fid = array();
			$nErrorCode = GetDBData('cncGetFactoryID', $nCNCID, array(), $result_fid );

			$fid = $result_fid;
		}
		
		$nFID = $fid;
		$aryResult = array();
		$nErrorCode = GetDBData('GetShiftSchedule', $nFID, array(), $aryResult );

		$result = array(
			"result"=> "success", 
			"data"	=> $aryResult,
		);

		print_r( json_encode($result) );
	break;
}