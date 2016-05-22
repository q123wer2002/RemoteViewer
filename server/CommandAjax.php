<?php
include_once "../include/controlSetting.php";
include_once APP_PATH.'/include/database/DBDataAPI.php';

if( isset($_POST) && isset($_POST['method']) ){
	$post = $_POST;
}else{
	echo "not defined";
	exit;
}

$method = $post['method'];

switch($method){
	case "Command":

		$uniID = GetUniID();
		$timeObj = new DateTime();
		$currenttime = $timeObj->format('Y-m-d H:i:s');

		$param = array(
			"uniID"		=>	$uniID,
			"command"	=>	$post['command'],
			"cmdParam"	=>	$post['param'],
			"webTime"	=>	$currenttime,
		);

		$nCNCID = $post['cncID'];
		$result = array();
		$nErrorCode = GetDBData('Command', $nCNCID, $param, $result );


		$result = array(
			"result"=> "success", 
			"data"	=> $param,
		);

		print_r( json_encode($result) );
	break;
	case "GetDiagnosisData":

		$diagType = GetDiagnosisIndex( $post['commandParam']['Command'] );
		$param = array(
			"uniID"		=> $post['commandParam']['uniID'],
			"type"		=> $diagType,
			"start"		=> $post['commandParam']['Start'],
			"end"		=> $post['commandParam']['End'],
		);

		$aryDiagData = array();
		$nCNCID = $post['cncID'];
		$nErrorCode = GetDBData('GetCNCVar', $nCNCID, $param, $aryDiagData );

		$result = array(
			"result"=> "success", 
			"data"	=> $aryDiagData,
		);

		print_r( json_encode($result) );
	break;
	case "GetNcFileList":

		$nCNCID = $post['cncID'];
		$result = array();
		$nErrorCode = GetDBData('GetCNCNcFileList', $nCNCID, array(), $result );

		$result = array(
			"result"=> "success", 
			"data"	=> $result,
		);

		print_r( json_encode($result) );
	break;
	case "UploadFile":
		$timeObj = new DateTime();
		$currenttime = $timeObj->format('Y-m-d H:i:s');

		$param = array(
			"name"			=>	$post['file']['name'],
			"file"			=>	$post['file']['file'],
			"upload_time"	=>	$currenttime,
		);

		$nCNCID = $post['cncID'];
		$result = array();
		$nErrorCode = GetDBData('UploadNcFile', $nCNCID, $param, $result );


		$result = array(
			"result"=> "success",
			"data" => $param,
		);

		print_r( json_encode($result) );
	break;
	case "DownloadFile":
		$timeObj = new DateTime();
		$currenttime = $timeObj->format('Y-m-d H:i:s');

		$param = array(
			"fileName"	=>	$post['fileName'],
		);

		$nCNCID = $post['cncID'];
		$fileAry = array();
		$nErrorCode = GetDBData('DownloadNcFile', $nCNCID, $param, $fileAry );


		$result = array(
			"result"=> "success",
			"data" => $fileAry,
		);

		print_r( json_encode($result) );
	break;
}

function GetDiagnosisIndex( $command )
{
	switch( $command ){
		case "Read_R":
			return 1;
		break;
		default:
			return -1;
		break;
	}
}

//preloadPage.php delete all command
function GetUniID()
{
	DeleteOldUniID();

	$uniID = CreateUniID();
	$_SESSION['companyInfo']['oldWid'] = array();
	array_push($_SESSION['companyInfo']['oldWid'], $uniID);

	return $uniID;
}
function CreateUniID()
{
	$uniID = uniqid();
	return $uniID;
}
function DeleteOldUniID()
{
	$result = array();
	GetDBData('DeleteAllOldCmdByWid', 0, array(), $result );
}

?>