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
	case "initUseComponentList":

		if( isset($post['cnc_id']) == false || empty($post['cnc_id']) == true ){
			
			$aryCNCList = array();
			$nFactoryID = (isset($post['nFID'])) ? $post['nFID'] : $_SESSION['RemoteViewer']['companyInfo']['fid'][0];
			$nErrorCode = GetDBData('CncListFromF', $nFactoryID, array(), $aryCNCList );

			$post['cnc_id'] = $aryCNCList[0]['cnc_id'];
		}
		
		//means success
		$nCNCID = $post['cnc_id']; //default

		//get function list
		$functionObj = new FunctionObj( $nCNCID );

		$initCanUseList = $functionObj->aryCheckFunctionList();
		//print_r($_SESSION['RemoteViewer']['canUseFunctionList']);

		$result = array(
			"result"=> "success", 
			"data"	=> $initCanUseList
		);

		print_r( json_encode($result) );
	break;
	case "initMyLayout":

		$param = array(
			"device"	=> $post['device'],
		);

		//my layout
		$initMyLyout = array();
		$nCID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$nErrorCode = GetDBData('GetMyLayout', $nCID, $param, $initMyLyout );

		//get layout data
		$initDefaultLayout = array();
		$nErrorCode = GetDBData('GetDefaultLayout', 0, $param, $initDefaultLayout );

		if( empty($initMyLyout) == true ){
			$initMyLyout[0] = $initDefaultLayout[0];
		}else{
			$index = count($initMyLyout);
			$initMyLyout[$index] = $initDefaultLayout[0];
		}

		$result = array(
			"result"=> "success", 
			"data" => $initMyLyout,
		);

		print_r( json_encode($result) );
	break;
	case "intiMyCustomComponent":
		//my layout
		$routineFile = array();
		$nCID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$nErrorCode = GetDBData('GetLayoutComponentFromRoutine', $nCID, array(), $routineFile );

		$result = array(
			"result"=> "success", 
			"data" => $routineFile,
		);

		print_r( json_encode($result) );
	break;
	case "initComponentNickname":
		//my layout
		$layoutComponentNickname = array();
		$nCID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$nErrorCode = GetDBData('GetDashboardItemsNicknames', $nCID, array(), $layoutComponentNickname );

		$result = array(
			"result"=> "success", 
			"data" => $layoutComponentNickname,
		);

		print_r( json_encode($result) );
	break;
	case "saveLayout":
		$tmpAry = array();
		$nCID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$param = array( 
			"device"=>$post['layoutDevice'], 
			"layoutName"=>$post['layoutName'], 
			"layoutFile"=>$post['b64Layout'] 
		);
		$nErrorCode = GetDBData('SaveLayout', $nCID, $param, $tmpAry );

		$result = array(
			"result"=> "success", 
		);

		print_r( json_encode($result) );
	break;
	case "deleteLayout":
		$tmpAry = array();
		$nCID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$param = array(
			"device"	=> $post['device'],
			"layoutName"=> $post['layoutName'],
		);
		$nErrorCode = GetDBData('DeleteLayout', $nCID, $param, $tmpAry );

		$result = array(
			"result" => "success", 
			"data" => $tmpAry,
		);

		print_r( json_encode($result) );
	break;
	case "saveLayoutComponentNickname":
		$tmpAry = array();
		$nCID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$param = array(
			"nicknames"	=> $post['b64Nicknames'],
		);
		$nErrorCode = GetDBData('SaveDashboardItemsNicknames', $nCID, $param, $tmpAry );

		$result = array(
			"result" => "success", 
			"data" => $tmpAry,
		);

		print_r( json_encode($result) );
	break;
	case "initCNCListFromFactory":
		//my layout
		$CNCList = array();
		$nFactoryID = (isset($post['nFID'])) ? $post['nFID'] : $_SESSION['RemoteViewer']['companyInfo']['fid'][0];
		$nErrorCode = GetDBData('CncListFromF', $nFactoryID, array(), $CNCList );

		$result = array(
			"result"=> "success", 
			"data" => $CNCList,
		);

		print_r( json_encode($result) );
	break;
}


?>