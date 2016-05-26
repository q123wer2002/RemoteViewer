<?php
include_once "../include/controlSetting.php";

if( isset($_POST) && isset($_POST['method']) ){
	$post = $_POST;
}else{
	echo "not defined";
	exit;
}

$method = $post['method'];

switch($method){
	case "initDashboardData":
		//include database api, function module
		include_once APP_PATH.'/include/database/DBDataAPI.php';
		//end include

		$initDashboardObj = array();

		//get factory and group id
		$aryFnGID = array();
		$nCID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$nErrorCode = GetDBData('myFIDnGID', $nCID, array(), $aryFnGID );
		ErrorLog( $nErrorCode );

		//get cncs from group
		foreach( $aryFnGID as $key => $value ){
			$nGID = $value['gid'];
			$aryGnCNCs = array();
			$nErrorCode = GetDBData('CncListFromG', $nGID, array(), $aryGnCNCs );
			ErrorLog( $nErrorCode );

			//insert data
			$initDashboardObj[$key] = array();
			$initDashboardObj[$key]['fid'] = $value['fid'];
			$initDashboardObj[$key]['fName'] = $value['fName'];
			$initDashboardObj[$key]['gid'] = $nGID;
			$initDashboardObj[$key]['gName'] = $value['gName'];
			$initDashboardObj[$key]['cncs'] = $aryGnCNCs;
		}

		//clear first
		$param['device'] = $post['device'];

		//get layout data
		$initDefaultLayout = array();
		$nErrorCode = GetDBData('GetDefaultLayout', 0, $param, $initDefaultLayout );
		ErrorLog( $nErrorCode );

		$aryLayout = array();
		$nErrorCode = GetDBData('GetMyLayout', $nCID, $param, $aryLayout );
		ErrorLog( $nErrorCode );

		if( empty($aryLayout) == true ){
			$aryLayout[0] = $initDefaultLayout[0];
		}else{
			$index = count($aryLayout);
			$aryLayout[$index] = $initDefaultLayout[0];
		}

		$result = array(
			"result"=> "success", 
			"data"	=> $initDashboardObj,
			"layoutData" => $aryLayout,
		);

		print_r( json_encode($result) );
	break;
	case "TranslateDataSource":
		
		include_once APP_PATH.'/include/module/funModuleClass.php';

		$nCNCID = $post['cncID'];
		$funObj = new FunctionObj($nCNCID);

		$dataSource = array();
		foreach( $post['dataSource'] as $key => $value ){
			$szApiName = $funObj->GetDBAPIFromTWName($value);
			array_push( $dataSource, $szApiName );
		}

		$result = array(
			"result"=> "success", 
			"data"	=> $dataSource,
		);

		print_r( json_encode($result) );
	break;
	case "UpdatingCNCData":
		//include database api, function module
		include_once APP_PATH.'/include/database/DBDataAPI.php';
		//end include

		$cncObj = $post['cnc'];
		$nCNCID = $cncObj['nCNCID'];

		//default, status
		$cncStatus = array();
		$nErrorCode = GetDBData('cncStatus', $nCNCID, array(), $cncStatus );
		ErrorLog( $nErrorCode );
		$cncObj['cncStatus'] = $cncStatus;

		//start fetching cutomer list
		foreach( $cncObj['data'] as $key => $value ){
			$resultData = array();
			$nErrorCode = GetDBData($key, $nCNCID, array(), $resultData );
			//ErrorLog( $nErrorCode );

			$cncObj['data'][$key] = $resultData;
		}
		

		$cncObj['cncIndex'] = $post['cncIndex'];


		$result = array(
			"result"=> "success", 
			"data"	=> $cncObj,
		);

		print_r( json_encode($result) );
	break;
}

?>