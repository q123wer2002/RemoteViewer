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
	case "GetAllGroup":
		$nCID = $post['f_id'];
		$groupArray = array();
		$nErrorCode = GetDBData('GetAllGroup', $nCID, array(), $groupArray );
		//ErrorLog( $nErrorCode );

		$result = array(
			"result"=> "success", 
			"data" => $groupArray,
		);

		print_r( json_encode($result) );
	break;
	case "IPCamUpload":
		$nGID = $post['group'];
		
		$param = array(
			"ipcam_name"			=> $post['name'],
			"ipcam_rtsp_url"		=> $post['rtsp_url'],
		);

		$nErrorCode = GetDBData('IPCamUpload', $nGID, $param, $nInsertID );
		//ErrorLog( $nErrorCode );

		$param['ipcam_id'] = $nInsertID;

		$result = array(
			"result"=> "success",
			"data"=>$param,
		);

		print_r( json_encode($result) );
	break;
	case "GetIPCamInfo":
		$nGID = $post['g_id'];
		$ipcamArray = array();
		$nErrorCode = GetDBData('GetAllIpcam', $nGID, array(), $ipcamArray );
		//ErrorLog( $nErrorCode );

		$result = array(
			"result"=> "success", 
			"data" => $ipcamArray,
		);

		print_r( json_encode($result) );
	break;
	case "IPCamUpdate":
		$nIPCAMID = $post['ipcam_id'];
		$param = array(
			"ipcam_name"			=> $post['name'],
			"ipcam_rtsp_url"		=> $post['rtsp_url'],
		);
		$nErrorCode = GetDBData('IPCamUpdate', $nIPCAMID, $param, $groupArray );
		//ErrorLog( $nErrorCode );

		$result = array(
			"result"=> "success", 
			"data" => $groupArray,
		);

		print_r( json_encode($result) );
	break;
	case "IPCamDelete":
		$nIPCAMID = $post['ipcam_id'];

		$nErrorCode = GetDBData('IPCamDelete', $nIPCAMID, array(), $ipcamArray );
		//ErrorLog( $nErrorCode );

		$result = array(
			"result"=> "success", 
			"data" => $ipcamArray,
		);

		print_r( json_encode($result) );
	break;
	case "GetIPCamInfo":
		$nCID = $post['g_id'];
		$ipcamArray = array();
		$nErrorCode = GetDBData('GetAllIpcam', $nCID, array(), $ipcamArray );
		//ErrorLog( $nErrorCode );

		$result = array(
			"result"=> "success", 
			"data" => $ipcamArray,
		);

		print_r( json_encode($result) );
	break;
}

?>